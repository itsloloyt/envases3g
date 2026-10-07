#!/usr/bin/env python3
"""Edita bruto.mp4 con la plantilla fija de Remotion y deja reel.mp4 (no gasta créditos).

  python3 editar.py salida/2026-10-07-herramienta
"""
import difflib
import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path
from urllib.parse import urlparse

from comun import RAIZ, ES_WINDOWS, cargar_config, ejecutable, historial_len, log

EDITOR = RAIZ / "editor"
PUBLIC = EDITOR / "public"
FPS = 30


def ff(*args):
    r = subprocess.run([ejecutable("ffmpeg"), "-hide_banner", "-y", *map(str, args)],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError(f"ffmpeg falló:\n{r.stderr[-1500:]}")
    return r.stderr


def duracion(ruta):
    r = subprocess.run([ejecutable("ffprobe"), "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", str(ruta)], capture_output=True, text=True)
    return float(r.stdout.strip())


# ---------- 1. Cortar pausas ----------
def cortar_pausas(entrada, salida, umbral="-32dB", minimo=0.35, margen=0.08):
    total = duracion(entrada)
    log_sd = ff("-i", entrada, "-af", f"silencedetect=noise={umbral}:d={minimo}", "-f", "null", "-")
    inicios = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log_sd)]
    finales = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log_sd)]
    silencios = list(zip(inicios, finales + [total] * (len(inicios) - len(finales))))
    tramos, cursor = [], 0.0
    for s, e in silencios:
        if s - cursor > 0.05:
            tramos.append((max(0, cursor - (margen if cursor else 0)), min(total, s + margen)))
        cursor = e
    if total - cursor > 0.05:
        tramos.append((max(0, cursor - margen), total))
    tramos = [t for t in tramos if t[1] - t[0] > 0.1] or [(0, total)]
    log(f"Pausas: {len(silencios)} detectadas; me quedo con {len(tramos)} tramos.")
    partes, cadena = [], ""
    for i, (a, b) in enumerate(tramos):
        partes.append(f"[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS[v{i}];"
                      f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS[a{i}];")
        cadena += f"[v{i}][a{i}]"
    filtro = "".join(partes) + f"{cadena}concat=n={len(tramos)}:v=1:a=1[v][a]"
    ff("-i", entrada, "-filter_complex", filtro, "-map", "[v]", "-map", "[a]", "-r", FPS,
       "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p",
       "-c:a", "aac", "-b:a", "192k", "-ar", "48000", salida)


# ---------- 2. Transcribir y alinear con el guion ----------
def norm(p):
    p = unicodedata.normalize("NFD", p.lower())
    return re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in p if unicodedata.category(c) != "Mn"))


def transcribir(video):
    from faster_whisper import WhisperModel
    log("Transcribiendo con faster-whisper…")
    modelo = WhisperModel("small", device="cpu", compute_type="int8")
    segs, _ = modelo.transcribe(str(video), language="es", word_timestamps=True, vad_filter=False)
    return [{"w": w.word.strip(), "start": w.start, "end": w.end} for s in segs for w in (s.words or [])]


def alinear(whisper, guion, total):
    """Usa las palabras exactas del guion con los tiempos de whisper (difflib)."""
    script = guion.split()
    if not whisper:
        # Respaldo: tiempos proporcionales a la longitud de cada palabra
        pesos = [len(w) + 2 for w in script]
        escala, t, res = total / sum(pesos), 0.0, []
        for w, p in zip(script, pesos):
            res.append({"w": w, "start": round(t, 3), "end": round(t + p * escala, 3)})
            t += p * escala
        return res
    a = [norm(w["w"]) for w in whisper]
    b = [norm(w) for w in script]
    res = [None] * len(script)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(j2 - j1):
                res[j1 + k] = (whisper[i1 + k]["start"], whisper[i1 + k]["end"])
        elif op == "replace":
            ini, fin = whisper[i1]["start"], whisper[i2 - 1]["end"]
            paso = (fin - ini) / (j2 - j1)
            for k in range(j2 - j1):
                res[j1 + k] = (ini + k * paso, ini + (k + 1) * paso)
    # Palabras del guion que whisper no oyó: interpolar entre vecinas
    for j in range(len(res)):
        if res[j] is None:
            prev = next((res[k][1] for k in range(j - 1, -1, -1) if res[k]), 0.0)
            sig_k = next((k for k in range(j + 1, len(res)) if res[k]), None)
            sig = res[sig_k][0] if sig_k is not None else min(total, prev + 0.35 * (len(res) - j))
            huecos = (sig_k if sig_k is not None else len(res)) - j
            paso = max(0.12, (sig - prev) / max(1, huecos))
            res[j] = (prev, prev + paso)
    return [{"w": w, "start": round(s, 3), "end": round(max(e, s + 0.08), 3)} for w, (s, e) in zip(script, res)]


# ---------- 3. Captura de la web ----------
SELECTOR_BOTON = "a, button, [role=button], input[type=submit]"
PALABRAS_BOTON = re.compile(r"(try|start|get|sign up|join|download|free|empez|prueb|probar|comenz|descarg|regist|create|launch|open|use)", re.I)


def capturar_web(url, destino):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
        opciones = {"proxy": {"server": proxy}} if proxy else {}
        try:
            nav = p.chromium.launch(**opciones)
        except Exception:
            # Navegador de Playwright sin instalar: probamos Chrome/Chromium del sistema
            ruta = next((r for r in [os.environ.get("REEL_CHROMIUM"), shutil.which("chromium"),
                                     shutil.which("google-chrome"), "/opt/pw-browsers/chromium"] if r and Path(r).exists()), None)
            nav = p.chromium.launch(executable_path=ruta, **opciones) if ruta else p.chromium.launch(channel="chrome", **opciones)
        pag = nav.new_page(viewport={"width": 540, "height": 900}, device_scale_factor=2, locale="es-ES",
                           user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36")
        pag.goto(url, wait_until="domcontentloaded", timeout=45000)
        pag.wait_for_timeout(3500)
        # Cerrar banners de cookies habituales
        for texto in ["Aceptar todo", "Aceptar", "Accept all", "Accept", "Agree", "Got it", "OK"]:
            try:
                b = pag.get_by_role("button", name=texto, exact=False).first
                if b.is_visible(timeout=300):
                    b.click(timeout=1000)
                    pag.wait_for_timeout(600)
                    break
            except Exception:
                pass
        alto = 1500
        pag.evaluate("window.scrollTo(0, 0)")
        pag.set_viewport_size({"width": 540, "height": alto})
        pag.wait_for_timeout(800)
        boton = pag.evaluate(f"""() => {{
          const re = new RegExp({json.dumps(PALABRAS_BOTON.pattern)}, 'i');
          let mejor = null, punt = -1;
          for (const el of document.querySelectorAll({json.dumps(SELECTOR_BOTON)})) {{
            const r = el.getBoundingClientRect(); const st = getComputedStyle(el);
            if (r.width < 60 || r.height < 28 || r.top < 40 || r.bottom > {alto} || st.visibility === 'hidden' || st.opacity === '0') continue;
            const txt = (el.innerText || el.value || '').trim();
            if (!txt || txt.length > 40) continue;
            const bg = st.backgroundColor; const relleno = bg && !bg.includes('rgba(0, 0, 0, 0)') && bg !== 'transparent';
            let s = (re.test(txt) ? 50 : 0) + (relleno ? 30 : 0) + Math.min(20, r.width * r.height / 2000) - r.top / 100;
            if (s > punt) {{ punt = s; mejor = {{x: r.left, y: r.top, w: r.width, h: r.height, txt}}; }}
          }}
          return mejor;
        }}""")
        pag.screenshot(path=str(destino))
        nav.close()
    if boton:
        log(f"Botón principal: «{boton['txt']}»")
        return {"x": boton["x"] / 540, "y": boton["y"] / alto, "w": boton["w"] / 540, "h": boton["h"] / alto}
    return None


# ---------- 4. Escenas, música, clic ----------
def frases(palabras):
    grupos, actual = [], []
    for w in palabras:
        actual.append(w)
        if re.search(r"[.!?…]$", w["w"]):
            grupos.append(actual)
            actual = []
    if actual:
        grupos.append(actual)
    return grupos


def elegir_musica(destino_dir):
    pistas = sorted((RAIZ / "musica").glob("pista*.*"))
    if not pistas:
        log("No hay pistas en musica/ (se generan en el primer reel); va sin música.")
        return None
    pista = pistas[historial_len() % len(pistas)]
    shutil.copy(pista, destino_dir / f"musica{pista.suffix}")
    return f"musica{pista.suffix}"


def generar_clic(destino):
    ff("-f", "lavfi", "-i", "sine=frequency=2600:duration=0.05", "-af",
       "afade=t=out:st=0.005:d=0.045,highpass=f=1200,volume=0.8", "-ar", "48000", destino)


def recortar(texto, n):
    if len(texto) <= n:
        return texto
    corte = texto[:n].rsplit(" ", 1)[0].rstrip(",;:")
    return corte + "…"


def normalizar(entrada, salida, objetivo=-14):
    """loudnorm en dos pasadas: mide y luego corrige (más exacto en clips cortos)."""
    log_m = ff("-i", entrada, "-af", f"loudnorm=I={objetivo}:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-")
    m = json.loads(log_m[log_m.rfind("{"):log_m.rfind("}") + 1])
    filtro = (f"loudnorm=I={objetivo}:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
              f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    ff("-i", entrada, "-c:v", "copy", "-af", filtro, "-ar", "48000", "-c:a", "aac", "-b:a", "192k",
       "-movflags", "+faststart", salida)


# ---------- 5. QA y render ----------
def hacer_qa(reel, tiempos, destino):
    tmp = destino.parent / "_qa"
    tmp.mkdir(exist_ok=True)
    for i, t in enumerate(tiempos):
        ff("-ss", f"{t:.2f}", "-i", reel, "-frames:v", "1", "-vf", "scale=360:-1", tmp / f"{i:02d}.jpg")
    n = len(tiempos)
    ff("-framerate", 1, "-i", tmp / "%02d.jpg", "-vf", f"tile={n}x1:padding=8:color=black", "-frames:v", 1, destino)
    shutil.rmtree(tmp, ignore_errors=True)


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    carpeta = Path(sys.argv[1]).resolve()
    bruto = carpeta / "bruto.mp4"
    if not bruto.exists():
        raise SystemExit(f"No existe {bruto}")
    cfg = cargar_config()
    datos = json.loads((carpeta / "guion.json").read_text(encoding="utf-8"))

    # Carpeta de trabajo dentro de public/ (Remotion solo sirve desde ahí)
    for viejo in PUBLIC.glob("trabajo-*"):
        shutil.rmtree(viejo, ignore_errors=True)
    trabajo = PUBLIC / f"trabajo-{carpeta.name}"
    trabajo.mkdir(parents=True)
    rel = trabajo.name

    cortar_pausas(bruto, trabajo / "video.mp4")
    total = duracion(trabajo / "video.mp4")
    try:
        oidas = transcribir(trabajo / "video.mp4")
    except Exception as e:
        log(f"AVISO: faster-whisper falló ({e.__class__.__name__}); reparto los tiempos del guion a ojo.")
        oidas = []
    palabras = alinear(oidas, datos["guion"], total)
    (carpeta / "subtitulos.json").write_text(json.dumps(palabras, ensure_ascii=False, indent=1), encoding="utf-8")

    web = None
    try:
        log(f"Capturando {datos['url']} …")
        boton = capturar_web(datos["url"], trabajo / "web.png")
        from struct import unpack
        with open(trabajo / "web.png", "rb") as f:
            cab = f.read(24)
        ancho, alto = unpack(">II", cab[16:24])
        web = {"img": f"{rel}/web.png", "ancho": ancho, "alto": alto, "boton": boton}
    except Exception as e:
        log(f"La captura falló ({e.__class__.__name__}: {str(e)[:120]}); uso rótulo con el nombre.")

    fr = frases(palabras)
    escenas = [{"start": 0 if i == 0 else g[0]["start"], "end": g[-1]["end"] if i < len(fr) - 1 else total}
               for i, g in enumerate(fr)]
    for i in range(len(escenas) - 1):
        escenas[i]["end"] = escenas[i + 1]["start"]
    cta = fr[-1] if len(fr) > 1 else palabras[-4:]
    cta_inicio = max(cta[0]["start"], total - 4.0) if len(fr) > 1 else max(0, total - 2.5)
    gancho_fin = min(3.2, max(2.4, fr[0][-1]["end"] if fr else 3.0))
    dominio = urlparse(datos["url"]).netloc.replace("www.", "")
    clic = None
    try:
        generar_clic(trabajo / "clic.wav")
        clic = f"{rel}/clic.wav"
    except Exception as e:
        log(f"Sin clic: {e}")
    musica = elegir_musica(trabajo)

    props = {
        "duracion": round(total, 3),
        "video": f"{rel}/video.mp4",
        "herramienta": datos["herramienta"],
        "descripcion": recortar(datos.get("resumen", "").split(". ")[0], 95),
        "dominio": dominio,
        "web": web,
        "gancho": datos["gancho_pantalla"].replace("\\n", "\n"),
        "ganchoFin": round(gancho_fin, 3),
        "palabras": palabras,
        "enfasis": datos.get("enfasis", []),
        "escenas": escenas,
        "ctaInicio": round(cta_inicio, 3),
        "ctaTexto": " ".join(w["w"] for w in cta).strip(),
        "musica": f"{rel}/{musica}" if musica else None,
        "volumenMusica": cfg.get("volumen_musica", 0.12),
        "clic": clic,
    }
    ruta_props = trabajo / "props.json"
    ruta_props.write_text(json.dumps(props, ensure_ascii=False), encoding="utf-8")
    shutil.copy(ruta_props, carpeta / "props.json")

    if not (EDITOR / "node_modules").exists():
        log("Instalando dependencias de Remotion (solo la primera vez)…")
        subprocess.run([ejecutable("npm"), "install", "--no-audit", "--no-fund"], cwd=EDITOR, check=True)
    log("Renderizando con Remotion…")
    sin_norm = trabajo / "render.mp4"
    r = subprocess.run([ejecutable("npx"), "remotion", "render", "src/index.ts", "Reel", str(sin_norm),
                        f"--props={ruta_props}", "--codec=h264", "--crf=18", "--audio-codec=aac",
                        "--log=error"], cwd=EDITOR, shell=False)
    if r.returncode != 0:
        raise SystemExit("Remotion no pudo renderizar.")

    log("Normalizando audio a -14 LUFS…")
    normalizar(sin_norm, carpeta / "reel.mp4")

    tiempos = [1.0] + [min(total - 0.3, (e["start"] + e["end"]) / 2) for e in escenas[1:-1]] + [min(total - 0.3, cta_inicio + 1.2)]
    hacer_qa(carpeta / "reel.mp4", tiempos, carpeta / "qa.jpg")
    shutil.rmtree(trabajo, ignore_errors=True)
    log(f"Reel editado: {carpeta / 'reel.mp4'} ({total:.1f} s)")


if __name__ == "__main__":
    main()
