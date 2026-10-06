#!/bin/bash
# Control de encuadre: renderiza cuadros clave y les dibuja las zonas seguras
# (rojo: recorte 4:5 del feed de Instagram; amarillo: zona que tapa la interfaz de TikTok abajo).
# Uso: scripts/qa.sh <Composicion> <frame1,frame2,...> <salida.jpg>
set -e
B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
T=$(mktemp -d); i=0; ins=""; fil=""
for f in ${2//,/ }; do
  npx remotion still "$1" "$T/$i.png" --frame=$f --browser-executable=$B >/dev/null 2>&1
  ins="$ins -i $T/$i.png"; fil="$fil[$i]drawbox=y=285:h=1350:w=iw:color=red@0.8:t=4,drawbox=y=1500:h=420:w=iw:color=yellow@0.25:t=fill,scale=270:-1[v$i];"; i=$((i+1))
done
ffmpeg -v error -y $ins -filter_complex "$fil$(for j in $(seq 0 $((i-1))); do printf "[v$j]"; done)hstack=$i" "$3"
