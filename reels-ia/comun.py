"""Utilidades compartidas por reel.py y editar.py (Mac, Windows y Linux)."""
import json
import os
import platform
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
SISTEMA = platform.system()  # "Darwin", "Windows" o "Linux"
ES_WINDOWS = SISTEMA == "Windows"


def cargar_config():
    return json.loads((RAIZ / "config.json").read_text(encoding="utf-8"))


def log(msg):
    print(f"[reel] {msg}", flush=True)


def ejecutable(nombre):
    """Ruta del ejecutable; en Windows npm instala .cmd que subprocess no encuentra sin extensión."""
    ruta = shutil.which(nombre) or (shutil.which(nombre + ".cmd") if ES_WINDOWS else None)
    if not ruta:
        raise SystemExit(f"No encuentro '{nombre}'. Revisa la instalación (ver LEEME.md).")
    return ruta


def correr(args, **kw):
    args = [ejecutable(args[0])] + [str(a) for a in args[1:]]
    return subprocess.run(args, text=True, encoding="utf-8", errors="replace", **kw)


def hf_json(*args, check=True):
    """Ejecuta el CLI de Higgsfield con --json y devuelve el JSON."""
    r = correr(["higgsfield", *args, "--json"], capture_output=True)
    if r.returncode != 0:
        if check:
            raise RuntimeError(f"higgsfield {' '.join(args[:2])} falló:\n{r.stderr or r.stdout}")
        return None
    texto = r.stdout.strip()
    try:
        return json.loads(texto)
    except json.JSONDecodeError:
        # Algunas órdenes imprimen progreso antes del JSON final
        inicio = min([i for i in (texto.find("{"), texto.find("[")) if i >= 0], default=-1)
        return json.loads(texto[inicio:]) if inicio >= 0 else {"raw": texto}


def buscar_clave(obj, claves):
    """Busca recursivamente el primer valor cuyo nombre esté en `claves`."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in claves and v not in (None, ""):
                return v
        for v in obj.values():
            r = buscar_clave(v, claves)
            if r is not None:
                return r
    elif isinstance(obj, list):
        for v in obj:
            r = buscar_clave(v, claves)
            if r is not None:
                return r
    return None


def buscar_urls(obj, extensiones):
    urls = []
    if isinstance(obj, dict):
        for v in obj.values():
            urls += buscar_urls(v, extensiones)
    elif isinstance(obj, list):
        for v in obj:
            urls += buscar_urls(v, extensiones)
    elif isinstance(obj, str) and obj.startswith("http") and obj.split("?")[0].lower().endswith(extensiones):
        urls.append(obj)
    return urls


def creditos():
    datos = hf_json("account", "status")
    valor = buscar_clave(datos, {"credits", "credits_balance", "available_credits", "balance"})
    try:
        return float(valor)
    except (TypeError, ValueError):
        raise RuntimeError(f"No sé leer los créditos de: {datos}")


def descargar(url, destino):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=300) as r, open(destino, "wb") as f:
        shutil.copyfileobj(r, f)


def generar(modelo, params, extensiones, destino, timeout="25m"):
    """Lanza un trabajo de Higgsfield, espera y descarga el resultado."""
    args = ["generate", "create", modelo]
    for k, v in params.items():
        args += [f"--{k}", v]
    args += ["--wait", "--wait-timeout", timeout, "--wait-interval", "10s"]
    log(f"Higgsfield: {modelo}…")
    datos = hf_json(*args)
    urls = buscar_urls(datos, extensiones)
    if not urls:
        estado = buscar_clave(datos, {"status", "error", "message"})
        raise RuntimeError(f"El trabajo de {modelo} no devolvió archivo (estado: {estado}). Respuesta: {json.dumps(datos)[:800]}")
    descargar(urls[0], destino)
    return datos


def notificar(titulo, mensaje):
    try:
        if SISTEMA == "Darwin":
            m, t = mensaje.replace('"', "'"), titulo.replace('"', "'")
            subprocess.run(["osascript", "-e", f'display notification "{m}" with title "{t}" sound name "Glass"'])
        elif ES_WINDOWS:
            m, t = mensaje.replace("'", "''"), titulo.replace("'", "''")
            ps = (
                "Add-Type -AssemblyName System.Windows.Forms;"
                "$n=New-Object System.Windows.Forms.NotifyIcon;"
                "$n.Icon=[System.Drawing.SystemIcons]::Information;$n.Visible=$true;"
                f"$n.ShowBalloonTip(10000,'{t}','{m}',[System.Windows.Forms.ToolTipIcon]::Info);"
                "Start-Sleep -Seconds 6;$n.Dispose()"
            )
            subprocess.run(["powershell", "-NoProfile", "-Command", ps])
        elif shutil.which("notify-send"):
            subprocess.run(["notify-send", titulo, mensaje])
    except Exception as e:  # la notificación nunca debe romper el flujo
        log(f"(no pude notificar: {e})")


def abrir_carpeta(ruta):
    try:
        if SISTEMA == "Darwin":
            subprocess.run(["open", str(ruta)])
        elif ES_WINDOWS:
            os.startfile(str(ruta))  # type: ignore[attr-defined]
        elif shutil.which("xdg-open") and os.environ.get("DISPLAY"):
            subprocess.run(["xdg-open", str(ruta)])
    except Exception as e:
        log(f"(no pude abrir la carpeta: {e})")


def python_cmd():
    return sys.executable


def historial_len():
    ruta = RAIZ / "historial.json"
    return len(json.loads(ruta.read_text(encoding="utf-8"))) if ruta.exists() else 0
