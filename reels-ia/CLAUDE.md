# Reels de herramientas de IA

Este proyecto genera, solo cuando el usuario lo pide, un reel vertical en español sobre una herramienta de IA. **Nunca publica ni programa nada**: no crees tareas programadas, cron, despertadores ni publicaciones. El reel queda en `salida/` para que el usuario lo revise y lo suba a mano.

## Cuando el usuario diga "vamos a hacer un vídeo con IA sobre X" (o `/reel X`)
Pedir el vídeo YA es la autorización para gastar créditos de Higgsfield (≈5 créditos/s en 720p → ≈75 por reel de 15 s). No vuelvas a pedir permiso.

1. Comando de Python: `python3` en Mac/Linux; en Windows `python` o `py`.
2. Lanza en segundo plano (run_in_background) desde esta carpeta:
   `python3 reel.py --tema "X"` (sin tema: `python3 reel.py` busca una herramienta de esta semana).
3. En cuanto el log muestre `HERRAMIENTA:`, dile al usuario qué herramienta se ha elegido y el guion.
4. Al terminar, dale: la ruta de `reel.mp4`, el caption (`caption.txt`) y las fuentes (`guion.json`). Recuérdale los créditos gastados (aparecen en el log).
5. Si falla SOLO la edición (existe `bruto.mp4`), reintenta con `python3 editar.py "salida/<carpeta>"` — es gratis. Nunca relances `reel.py` completo para arreglar una edición: gastaría créditos otra vez.
6. Si el log dice `PARO: créditos insuficientes`, avisa al usuario y no hagas nada más.

## Otros comandos
- `python3 reel.py --solo-guion --tema "X"` → solo investiga (0 créditos, ~0,2-1 $ de Claude).
- `python3 reel.py --reusar "salida/<carpeta>"` → genera el vídeo de un guion ya escrito.
- `python3 editar.py "salida/<carpeta>"` → vuelve a editar gratis.

## Ficheros
- `config.json`: avatar, acento, duración, resolución, modo, modelo de Claude, presupuesto y créditos mínimos.
- `prompts/investigar.md`: prompt de investigación (editable).
- `editor/`: plantilla Remotion (`src/Reel.tsx`). `musica/`: 3 pistas generadas una sola vez.
- `historial.json`: herramientas ya tratadas (no se repiten).
