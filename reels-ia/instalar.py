#!/usr/bin/env python3
"""Comprueba e instala lo necesario (Mac con Homebrew, Windows con winget).

  python3 instalar.py     (en Windows: python instalar.py  o  py instalar.py)
"""
import platform
import shutil
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
SO = platform.system()


def hay(cmd):
    return shutil.which(cmd) or (SO == "Windows" and shutil.which(cmd + ".cmd"))


def correr(args, **kw):
    print("  $", " ".join(args))
    if SO == "Windows" and shutil.which(args[0] + ".cmd"):
        args = [shutil.which(args[0] + ".cmd")] + args[1:]
    return subprocess.run(args, **kw).returncode == 0


def instalar_sistema(nombre, brew, winget):
    if SO == "Darwin":
        if not hay("brew"):
            print("  Falta Homebrew: instálalo desde https://brew.sh y repite.")
            return
        correr(["brew", "install", brew])
    elif SO == "Windows":
        correr(["winget", "install", "-e", "--id", winget, "--accept-source-agreements", "--accept-package-agreements"])
        print("  (Cierra y abre la terminal para que Windows vea el programa nuevo.)")
    else:
        correr(["sudo", "apt-get", "install", "-y", brew])


print(f"Sistema: {SO}")
for cmd, brew, winget in [("ffmpeg", "ffmpeg", "Gyan.FFmpeg"), ("node", "node", "OpenJS.NodeJS.LTS")]:
    print(f"- {cmd}: {'OK' if hay(cmd) else 'falta, instalando…'}")
    if not hay(cmd):
        instalar_sistema(cmd, brew, winget)

print(f"- Python: {sys.version.split()[0]} ({sys.executable})")
correr([sys.executable, "-m", "pip", "install", "--upgrade", "faster-whisper", "playwright"])
correr([sys.executable, "-m", "playwright", "install", "chromium"])

if not hay("higgsfield"):
    print("- Higgsfield CLI: falta, instalando…")
    correr(["npm", "install", "-g", "@higgsfield/cli"])
print("- Higgsfield:", end=" ")
correr(["higgsfield", "--version"])

print("- Remotion (editor/):")
correr(["npm", "install", "--no-audit", "--no-fund"], cwd=RAIZ / "editor")

print("\nÚltimos pasos manuales:")
print("  1. higgsfield auth login")
print("  2. higgsfield account status            (créditos)")
print("  3. higgsfield marketing-studio avatars list   → copia el id en config.json > avatar")
print("  4. claude  (Claude Code debe estar instalado y con sesión iniciada)")
