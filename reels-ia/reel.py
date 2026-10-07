#!/usr/bin/env python3
"""Genera un reel vertical en español sobre una herramienta de IA.

  python3 reel.py --tema "edición de vídeo"   # investiga + vídeo + edición
  python3 reel.py                              # herramienta nueva de la semana
  python3 reel.py --solo-guion                 # solo investigación (0 créditos)
  python3 reel.py --reusar salida/2026-10-07-x # vídeo a partir de un guion ya escrito

No publica ni programa nada: deja el reel en salida/ para revisarlo a mano.
"""
import argparse
import datetime as dt
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

from comun import (RAIZ, cargar_config, correr, creditos, generar, log, notificar,
                   abrir_carpeta, python_cmd)

ESQUEMA = {
    "type": "object",
    "properties": {
        "herramienta": {"type": "string"},
        "url": {"type": "string"},
        "resumen": {"type": "string"},
        "guion": {"type": "string"},
        "caption": {"type": "string"},
        "fuentes": {"type": "array", "items": {"type": "string"}, "minItems": 1},
        "gancho_pantalla": {"type": "string"},
        "enfasis": {"type": "array", "items": {"type": "string"}, "minItems": 3, "maxItems": 5},
    },
    "required": ["herramienta", "url", "resumen", "guion", "caption", "fuentes",
                 "gancho_pantalla", "enfasis"],
}


def slug(texto):
    t = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:40] or "herramienta"


def historial():
    ruta = RAIZ / "historial.json"
    return json.loads(ruta.read_text(encoding="utf-8")) if ruta.exists() else []


def limpiar_guion(guion, max_palabras):
    g = re.sub(r"https?://\S+|www\.\S+", "", guion)
    g = re.sub(r"[#@%&/*_<>\[\]{}|~^`\\]", " ", g)
    g = "".join(c for c in g if unicodedata.category(c)[0] in "LNPZ" or c in "¿¡")
    g = re.sub(r"\s+", " ", g).strip()
    palabras = g.split()
    if len(palabras) > max_palabras:
        log(f"Aviso: el guion tiene {len(palabras)} palabras (máx. {max_palabras}).")
    return g


def investigar(tema, cfg):
    hoy = dt.date.today()
    max_palabras = int(cfg["duracion_segundos"] * 2.3)
    if tema:
        tarea = (f"El tema es: «{tema}». Si el tema ya nombra una herramienta concreta, usa esa. "
                 "Si no, busca la herramienta de IA más relevante y reciente sobre ese tema.")
    else:
        desde = hoy - dt.timedelta(days=7)
        tarea = (f"Busca una herramienta de IA lanzada (o con una novedad importante) entre el {desde} "
                 f"y el {hoy}. Mira Product Hunt, X, blogs oficiales, TechCrunch, The Verge y Hacker News. "
                 "Elige la más útil y llamativa para el público general.")
    hechas = [h["herramienta"] for h in historial()]
    prompt = (RAIZ / "prompts" / "investigar.md").read_text(encoding="utf-8").format(
        fecha=hoy.isoformat(), tarea=tarea, historial=", ".join(hechas) or "ninguna",
        duracion=cfg["duracion_segundos"], max_palabras=max_palabras, acento=cfg["acento"])

    log("Investigando con Claude (WebSearch + WebFetch)…")
    r = correr(["claude", "-p", prompt,
                "--model", cfg["modelo_claude"],
                "--output-format", "json",
                "--json-schema", json.dumps(ESQUEMA),
                "--allowedTools", "WebSearch", "WebFetch",
                "--max-budget-usd", str(cfg["presupuesto_investigacion_usd"])],
               capture_output=True, cwd=RAIZ)
    if r.returncode != 0:
        raise SystemExit(f"La investigación falló:\n{r.stderr or r.stdout}")
    salida = json.loads(r.stdout)
    datos = salida.get("structured_output")
    if not datos:
        texto = salida.get("result", "")
        m = re.search(r"\{.*\}", texto, re.S)
        if not m:
            raise SystemExit(f"Claude no devolvió JSON:\n{texto[:1000]}")
        datos = json.loads(m.group(0))
    datos["guion"] = limpiar_guion(datos["guion"], max_palabras)
    datos["gancho_pantalla"] = datos["gancho_pantalla"].replace("\\n", "\n")
    datos["tema"] = tema or ""
    datos["fecha"] = hoy.isoformat()
    datos["coste_investigacion_usd"] = salida.get("total_cost_usd")
    return datos


def guardar_guion(datos):
    carpeta = RAIZ / "salida" / f"{datos['fecha']}-{slug(datos['herramienta'])}"
    carpeta.mkdir(parents=True, exist_ok=True)
    (carpeta / "guion.json").write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")
    fuentes = "\n".join(f"- {f}" for f in datos["fuentes"])
    (carpeta / "caption.txt").write_text(f"{datos['caption']}\n\nFuentes:\n{fuentes}\n", encoding="utf-8")
    return carpeta


def prompt_video(datos, cfg):
    return (
        f"Vertical UGC selfie video. The presenter's face is clearly visible, framed from the chest up, "
        f"looking straight into the camera and talking directly to the viewer with natural lip sync. "
        f"No voice-over, no narrator off screen, no on-screen text, no captions, no product shown. "
        f"Bright modern home office, soft natural light, subtle handheld movement, energetic but natural tone. "
        f"The presenter speaks Spanish with a native {cfg['acento']} accent and says EXACTLY this script, "
        f"word for word, nothing added or removed:\n\"{datos['guion']}\""
    )


def asegurar_musica(cfg):
    """Genera 3 pistas instrumentales una sola vez y las reutiliza siempre."""
    carpeta = RAIZ / "musica"
    carpeta.mkdir(exist_ok=True)
    estilos = [
        "soft modern lo-fi electronic instrumental, warm synth pads, gentle beat, no vocals, tech vibe",
        "light upbeat ambient pop instrumental, plucky synths, airy, no vocals, positive tech background",
        "minimal chill house instrumental, soft kick, subtle bass, calm and modern, no vocals",
    ]
    for i, estilo in enumerate(estilos, 1):
        destino = carpeta / f"pista{i}.mp3"
        if destino.exists():
            continue
        try:
            generar("sonilo_music", {"prompt": estilo, "duration": 30},
                    (".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"), destino, timeout="10m")
            log(f"Música guardada: {destino.name}")
        except Exception as e:
            log(f"No pude generar la pista {i} (el reel irá sin ella): {e}")


def generar_video(carpeta, cfg):
    datos = json.loads((carpeta / "guion.json").read_text(encoding="utf-8"))
    if not cfg.get("avatar") or cfg["avatar"] == "PENDIENTE":
        raise SystemExit("Falta el avatar en config.json (higgsfield marketing-studio avatars list).")
    coste_estimado = cfg["duracion_segundos"] * 5
    disponibles = creditos()
    log(f"Créditos disponibles: {disponibles:.0f}. Este vídeo cuesta unos {coste_estimado} créditos.")
    if disponibles < max(cfg["creditos_minimos"], coste_estimado):
        notificar("Reel IA: faltan créditos", f"Tienes {disponibles:.0f}, necesitas ~{coste_estimado}.")
        raise SystemExit(f"PARO: créditos insuficientes ({disponibles:.0f} < {max(cfg['creditos_minimos'], coste_estimado)}).")

    asegurar_musica(cfg)
    params = {
        "prompt": prompt_video(datos, cfg),
        "avatar_ids": cfg["avatar"],
        "mode": cfg["modo"],
        "aspect_ratio": "9:16",
        "resolution": cfg["resolucion"],
        "generate_audio": "true",
        "duration": min(int(cfg["duracion_segundos"]), 15),
    }
    resultado = generar("marketing_studio_video", params, (".mp4", ".mov", ".webm"), carpeta / "bruto.mp4")
    (carpeta / "higgsfield.json").write_text(json.dumps(resultado, ensure_ascii=False, indent=2), encoding="utf-8")
    try:
        log(f"Créditos restantes: {creditos():.0f}")
    except Exception:
        pass
    log(f"Vídeo bruto guardado: {carpeta / 'bruto.mp4'}")


def apuntar_historial(carpeta):
    datos = json.loads((carpeta / "guion.json").read_text(encoding="utf-8"))
    h = [x for x in historial() if x.get("carpeta") != carpeta.name]
    h.append({"herramienta": datos["herramienta"], "url": datos["url"], "fecha": datos["fecha"],
              "tema": datos.get("tema", ""), "carpeta": carpeta.name})
    (RAIZ / "historial.json").write_text(json.dumps(h, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--tema", default="", help="tema o herramienta concreta")
    ap.add_argument("--solo-guion", action="store_true", help="solo investigar, sin gastar créditos")
    ap.add_argument("--reusar", help="carpeta de salida con un guion.json ya escrito")
    a = ap.parse_args()
    cfg = cargar_config()

    if a.reusar:
        carpeta = Path(a.reusar).resolve()
        if not (carpeta / "guion.json").exists():
            raise SystemExit(f"No hay guion.json en {carpeta}")
    else:
        datos = investigar(a.tema, cfg)
        carpeta = guardar_guion(datos)
        log(f"HERRAMIENTA: {datos['herramienta']} ({datos['url']})")
        log(f"GUION ({len(datos['guion'].split())} palabras): {datos['guion']}")
        log(f"Carpeta: {carpeta}")
        if a.solo_guion:
            log("Modo --solo-guion: no se ha gastado ningún crédito.")
            return

    generar_video(carpeta, cfg)

    log("Editando con Remotion…")
    r = subprocess.run([python_cmd(), str(RAIZ / "editar.py"), str(carpeta)])
    if r.returncode != 0:
        notificar("Reel IA: falló la edición", "El vídeo bruto está guardado. Reintenta con editar.py (gratis).")
        abrir_carpeta(carpeta)
        raise SystemExit(f"La edición falló, pero bruto.mp4 está a salvo en {carpeta}. "
                         f"Reintenta gratis con: python3 editar.py \"{carpeta}\"")

    apuntar_historial(carpeta)
    datos = json.loads((carpeta / "guion.json").read_text(encoding="utf-8"))
    notificar("Reel IA listo", f"{datos['herramienta']}: reel.mp4 listo para revisar.")
    abrir_carpeta(carpeta)
    log(f"LISTO: {carpeta / 'reel.mp4'}")


if __name__ == "__main__":
    sys.exit(main())
