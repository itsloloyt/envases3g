import os
for k in ["TOGETHER_API_KEY","SENTRY_DSN","OPENAI_MODEL_NAME","OPENAI_API_KEY"]: os.environ.setdefault(k,"x")
# Corre ReelsMaker (steinathan/reelsmaker) con: guion propio, voz local Piper y clips propios.
# OpenAI, Pexels, TikTok TTS y ElevenLabs no están disponibles en este entorno, así que se reemplazan.
import asyncio, os, sys, types, wave, subprocess, hashlib
from unittest.mock import MagicMock
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "rm"))
for mod in ["langchain", "langchain.output_parsers", "langchain.prompts", "langchain_community", "langchain_community.cache",
            "langchain_core", "langchain_core.globals", "langchain_core.output_parsers", "langchain_openai",
            "together", "elevenlabs", "elevenlabs.client", "spacy", "httpx", "requests"]:
    sys.modules[mod] = MagicMock()
os.chdir(os.path.join(HERE, "rm"))

import srt_equalizer.srt_equalizer as _se, os as _os
_se.validate_file_path=lambda f,must_exist=False:_os.path.abspath(f)
import re, app.utils.strings as _st
_st.split_by_dot_or_newline=lambda t,n=80:[x.strip() for x in re.split(r'(?<=[.?!])\s+',t) if x.strip()]
from app.reels_maker import ReelsMaker, ReelsMakerConfig
import app.reels_maker as _rmm; _rmm.split_by_dot_or_newline=_st.split_by_dot_or_newline
import app.reels_maker as rmmod
from app.video_gen import VideoGeneratorConfig

VOICE = os.path.join(HERE, "tts", "es-carlfm-x-low.onnx")

async def piper_speech(self, text: str) -> str:
    out = os.path.join(self.base if hasattr(self, "base") else HERE, hashlib.sha1(text.encode()).hexdigest()[:12] + ".wav")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    spoken = text.replace("3G", "tres G").replace("$", "")
    subprocess.run([sys.executable, "-m", "piper", "-m", VOICE, "-f", out, "--length-scale", "0.92"], input=spoken.encode(), check=True, capture_output=True)
    return out

async def local_resource(dir, url, *a, **k):
    return url  # la música ya es un archivo local

rmmod.download_resource = local_resource
import app.synth_gen as sg
sg.SynthGenerator.synth_speech = piper_speech

SCRIPT = """¿Arrancás tu emprendimiento de cosmética, velas o aromas?
En Envases 3G, en Mar del Plata, tenés más de cuatrocientos productos.
Vidrio, plástico, tapas, válvulas y esencias.
Y no hace falta comprar por mayor: comprás desde una unidad.
Un pote para muestras sale trescientos setenta y tres pesos.
Mirá los precios en la web y pedí por WhatsApp.
Envases 3G. Todo para tu emprendimiento."""

async def main():
    cfg = ReelsMakerConfig(
        job_id="envases3g_reel",
        script=SCRIPT,
        video_paths=[os.path.join(HERE, "broll", f"clip{i}.mp4") for i in range(1, 9)],
        background_audio_url=os.path.join(HERE, "reel-musica.mp3"),
        video_gen_config=VideoGeneratorConfig(
            font_name="Bricolage Grotesque", fontsize=80, text_color="#ffffff", stroke_color="#041619", stroke_width=3,
            subtitles_position="center,center", watermark_type="image", watermark_path_or_text=os.path.join(HERE, "logo-wm.png"),
        ),
    )
    r = await ReelsMaker(cfg).start()
    print("VIDEO", r.video_file_path)

asyncio.run(main())
