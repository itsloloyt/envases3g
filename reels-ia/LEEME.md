# Reels de herramientas de IA

Genera, cuando tú lo pides, un reel vertical (1080×1920) en español sobre una herramienta de IA: investiga con Claude, graba al presentador con Higgsfield y lo edita con una plantilla fija de Remotion. **No publica ni programa nada**: el resultado queda en `salida/` para que lo revises y lo subas a mano.

## Instalación (una vez)
```bash
python3 instalar.py          # Windows: python instalar.py  (o py instalar.py)
higgsfield auth login
higgsfield account status    # créditos
higgsfield marketing-studio avatars list
```
Copia el id del avatar elegido en `config.json` → `avatar`, y pon el acento (`España`, `México`, `Argentina`…).

## Uso diario
En Claude Code, dentro de esta carpeta:
- «vamos a hacer un vídeo con IA sobre edición de vídeo», o
- `/reel edición de vídeo` (sin tema → una herramienta lanzada esta semana).

A mano:
| Comando | Qué hace | Coste |
|---|---|---|
| `python3 reel.py --tema "X"` | Todo: investigación + vídeo + edición | ~0,3 $ + ~75 créditos |
| `python3 reel.py` | Igual, con una herramienta de los últimos 7 días | ~0,3 $ + ~75 créditos |
| `python3 reel.py --solo-guion --tema "X"` | Solo investiga y escribe el guion | ~0,2-1 $, 0 créditos |
| `python3 reel.py --reusar salida/CARPETA` | Genera el vídeo de un guion ya escrito | ~75 créditos |
| `python3 editar.py salida/CARPETA` | Vuelve a editar (p. ej. tras cambiar la plantilla) | gratis |

En Windows cambia `python3` por `python` o `py`.

## Qué deja en `salida/AAAA-MM-DD-herramienta/`
`reel.mp4` (final), `bruto.mp4` (vídeo de Higgsfield), `caption.txt` (texto + hashtags + fuentes), `guion.json` (guion, fuentes, gancho, énfasis), `qa.jpg` (un fotograma por escena). Al terminar te llega una notificación del sistema y se abre la carpeta.

## Ajustes (`config.json`)
| Clave | Para qué |
|---|---|
| `avatar` | id del presentador (Marketing Studio) |
| `acento` | variante del español del guion y la voz |
| `duracion_segundos` | 15 máximo (más largo puede fallar sin motivo) |
| `resolucion` | `720p` (≈5 créditos/s) |
| `modo` | `ugc` |
| `modelo_claude` | modelo de la investigación (`sonnet`) |
| `presupuesto_investigacion_usd` | tope de gasto de Claude por investigación |
| `creditos_minimos` | si hay menos, se para antes de generar |
| `volumen_musica` | 0.12 = 12 % |

El prompt de investigación está en `prompts/investigar.md`; el diseño en `editor/src/Reel.tsx` (prueba cambios con `cd editor && npx remotion studio`).

## Costes
- **Higgsfield**: en 720p unos **5 créditos por segundo → ~75 créditos por reel de 15 s**. El script mira tus créditos antes de generar y se para si no llegan.
- **Música**: la primera vez genera 3 pistas con `sonilo_music` (coste pequeño, una sola vez); después las reutiliza rotando.
- **Claude**: la investigación usa Sonnet con tope de 1 $ (suele costar 0,2-0,4 $).
- **Edición**: gratis (local).

## Si algo falla
- La edición falló → `bruto.mp4` está a salvo: `python3 editar.py salida/CARPETA`.
- La web no se pudo capturar → sale un rótulo con el nombre y qué hace.
- faster-whisper no descarga el modelo → los subtítulos se reparten a partir del guion (menos precisos).
