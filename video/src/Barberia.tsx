import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { clamp, Grain, money, SANS, SERIF } from "./kit";

// Reel para barberías y peluquerías: "¿Necesitás atomizadores?".
// Toma de apertura generada con Higgsfield (barbero rociando) + voz en off (Higgsfield, voz "Juan").
// Los textos van sincronizados con la voz (tiempos medidos con whisper). Precios del catálogo.
// public/barber/hook.mp4 y public/barber/voz.wav se generan aparte (no se versionan).
const DISPLAY = "Anton";
loadFont({ family: DISPLAY, url: staticFile("fonts/Anton-Regular.ttf") });
const IN = Easing.bezier(0.16, 1, 0.3, 1);
const GOLD = "#e0a85a", INK = "#120d09", CREAM = "#f3eadc";
const s = (sec: number) => Math.round(sec * 30);
export const barberiaDuration = s(20.5);

// Palabra que entra desde abajo por máscara al momento en que la voz la dice.
const Word: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 7], [0, 1], { ...clamp, easing: IN });
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingTop: 10 }}>
      <span style={{ display: "inline-block", translate: `0 ${(1 - p) * 110}%`, ...style }}>{children}</span>
    </span>
  );
};

// Escenario: el atomizador recortado, centrado abajo, con una nube de rocío que sale del pico.
// El texto vive siempre arriba (y 300–640) y el envase abajo (y 780–1420): nunca se pisan.
const BOT = { h: 660, top: 760 };
const K = BOT.h / 414; // recorte de 182×414, pico en (175, 95)
const NOZ = { x: 540 - (182 * K) / 2 + 175 * K, y: BOT.top + 95 * K };
const Mist: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 40) return null;
  return (
    <>
      {Array.from({ length: 70 }).map((_, i) => {
        const r1 = random(`m${i}`), r2 = random(`n${i}`), r3 = random(`o${i}`);
        const t = Math.max(0, f - r3 * 6);
        const d = interpolate(t, [0, 30], [0, 260 + r1 * 340], { ...clamp, easing: IN });
        const ang = (-18 + (r2 - 0.5) * 44) * (Math.PI / 180);
        const o = interpolate(t, [0, 3, 30], [0, 0.85, 0], clamp);
        const sz = 6 + r1 * 22 + t * 0.9;
        return <div key={i} style={{ position: "absolute", left: NOZ.x + Math.cos(ang) * d, top: NOZ.y + Math.sin(ang) * d, width: sz, height: sz, marginLeft: -sz / 2, marginTop: -sz / 2, borderRadius: "50%", background: "rgba(243,234,220,.9)", filter: `blur(${3 + t * 0.25}px)`, opacity: o * 0.7 }} />;
      })}
    </>
  );
};
const Stage: React.FC<{ mist: number[] }> = ({ mist }) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - 2, fps: 30, config: { damping: 18 } });
  const kick = mist.reduce((acc, m) => acc + interpolate(f - m, [0, 2, 8], [0, 1, 0], clamp), 0);
  return (
    <>
      <div style={{ position: "absolute", left: 540 - 220, width: 440, top: BOT.top + BOT.h - 40, height: 80, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,.55), transparent 70%)", opacity: p }} />
      <Img src={staticFile("cut/home-spray-clean.png")} style={{ position: "absolute", left: "50%", top: BOT.top, height: BOT.h, translate: `-50% ${(1 - p) * 160 + kick * 6}px`, opacity: p, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.45))" }} />
      {mist.map((m) => <Mist key={m} at={m} />)}
    </>
  );
};
const Swap: React.FC<{ out: number; children: React.ReactNode }> = ({ out, children }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [out, out + 6], [0, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.84, 0) });
  return <div style={{ position: "absolute", left: 64, right: 64, top: 300, textAlign: "center", opacity: 1 - x, translate: `0 ${-x * 40}px` }}>{children}</div>;
};
const BG = `radial-gradient(ellipse at 50% 62%, #3a2817 0%, ${INK} 65%)`;

const Hook: React.FC = () => (
  <AbsoluteFill style={{ background: BG, color: CREAM }}>
    <Stage mist={[s(2.55), s(3.2)]} />
    <Swap out={s(2.0)}>
      <div style={{ fontFamily: DISPLAY, fontSize: 130, lineHeight: 1 }}><Word at={0}>¿TENÉS</Word> <Word at={s(0.7)}>BARBERÍA</Word></div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", color: GOLD, fontSize: 120, lineHeight: 1.05 }}><Word at={s(1.2)}>o peluquería?</Word></div>
    </Swap>
    <Swap out={999}>
      <div style={{ fontFamily: SANS, fontSize: 60, fontWeight: 700 }}><Word at={s(2.1)}>Necesitás</Word></div>
      <div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1, color: GOLD }}><Word at={s(2.55)}>ATOMIZADORES</Word></div>
    </Swap>
  </AbsoluteFill>
);

const ITEMS = [
  { img: "accesorios/gatillo-negra.webp", name: "Gatillo trigger", sub: "negro · rosca 28", price: 747, at: 3.86 },
  { img: "accesorios/gatillo-blanca.webp", name: "Gatillo trigger", sub: "natural · rosca 28", price: 747, at: 4.3 },
  { img: "accesorios/spray-negra.webp", name: "Válvula spray", sub: "rosca 20", price: 343, at: 5.08 },
  { img: "cut/body-125-cc-ambar.png", name: "Botellas", sub: "Body 125 cc ámbar", price: 468, at: 6.12 },
];
const Grid: React.FC = () => {
  const f = useCurrentFrame() + s(3.8);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #2a1d12, ${INK} 70%)`, fontFamily: SANS, color: CREAM }}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 290, fontFamily: DISPLAY, fontSize: 112, lineHeight: 1 }}>
        <Word at={s(3.86) - s(3.8)}>ARMÁ LOS TUYOS</Word>
      </div>
      {ITEMS.map((it, k) => {
        const p = spring({ frame: f - s(it.at), fps: 30, config: { damping: 14 } });
        const col = k % 2, row = Math.floor(k / 2);
        return (
          <div key={it.img} style={{ position: "absolute", left: 64 + col * 486, top: 470 + row * 500, width: 466, height: 480, borderRadius: 40, background: "rgba(243,234,220,.07)", border: "2px solid rgba(243,234,220,.14)", scale: String(interpolate(p, [0, 1], [0.75, 1])), opacity: p, overflow: "hidden" }}>
            <Img src={staticFile(it.img)} style={{ position: "absolute", left: 0, right: 0, top: 30, margin: "0 auto", height: 260, width: "100%", objectFit: "contain", filter: "drop-shadow(0 20px 24px rgba(0,0,0,.5))" }} />
            <div style={{ position: "absolute", left: 32, right: 32, bottom: 30 }}>
              <div style={{ fontSize: 40, fontWeight: 700 }}>{it.name}</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 36, opacity: 0.8 }}>{it.sub}</div>
              <div style={{ position: "absolute", right: 0, bottom: 4, padding: "8px 20px", borderRadius: 999, background: GOLD, color: INK, fontWeight: 700, fontSize: 36 }}>{money(it.price)}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Price: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [s(0.8), s(1.7)], [0, 747], { ...clamp, easing: Easing.bezier(0.2, 0, 0, 1) }));
  const prod = spring({ frame: f - 2, fps: 30, config: { damping: 15 } });
  return (
    <AbsoluteFill style={{ background: GOLD, color: INK, fontFamily: SANS, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: DISPLAY, fontSize: 150, lineHeight: 1 }}>
        <Word at={0}>EL GATILLO</Word>
      </div>
      <Img src={staticFile("accesorios/gatillo-negra.webp")} style={{ position: "absolute", left: "50%", top: 520, height: 520, translate: `-50% ${(1 - prod) * 400}px`, rotate: `${(1 - prod) * -18}deg`, filter: "drop-shadow(0 40px 40px rgba(18,13,9,.35))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080, textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 70 }}><Word at={s(0.62)}>desde</Word></div>
        <div style={{ fontFamily: DISPLAY, fontSize: 260, lineHeight: 0.95, fontVariantNumeric: "tabular-nums" }}>{f >= s(0.8) ? money(n) : ""}</div>
      </div>
    </AbsoluteFill>
  );
};

const Pro: React.FC = () => (
  <AbsoluteFill style={{ background: BG, color: CREAM }}>
    <Stage mist={[s(0.1), s(0.75)]} />
    <Swap out={s(1.6)}>
      <div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1 }}><Word at={0}>RELLENÁS.</Word> <Word at={s(0.73)}>ROCIÁS.</Word></div>
    </Swap>
    <Swap out={999}>
      <div style={{ fontFamily: SANS, fontSize: 60, fontWeight: 700 }}><Word at={s(1.77)}>Tu puesto se ve</Word></div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 130, lineHeight: 1.05, color: GOLD }}><Word at={s(2.43)}>más profesional</Word></div>
    </Swap>
  </AbsoluteFill>
);

const Fin: React.FC = () => {
  const f = useCurrentFrame();
  const logo = spring({ frame: f - 2, fps: 30, config: { damping: 200 } });
  const cta = spring({ frame: f - s(3.2), fps: 30, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, #2a1d12, ${INK} 70%)`, color: CREAM, fontFamily: SANS }}>
      <Img src={staticFile("logo-3g.png")} style={{ position: "absolute", left: 540 - 105, top: 340, width: 210, height: 210, opacity: logo, scale: String(0.8 + logo * 0.2) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 160, lineHeight: 1 }}><Word at={0}>ENVASES 3G</Word></div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 80, color: GOLD }}><Word at={s(1.3)}>en Mar del Plata</Word></div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "28px 52px", borderRadius: 999, background: GOLD, color: INK, fontWeight: 700, fontSize: 54, scale: String(cta), opacity: cta }}>WhatsApp 223 598-4362</div>
        <div style={{ fontSize: 38, marginTop: 30, opacity: interpolate(f, [s(3.4), s(3.9)], [0, 0.8], clamp) }}>Moreno 4156 · envíos · @envases3gmdq</div>
      </div>
    </AbsoluteFill>
  );
};

export const Barberia: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Sequence durationInFrames={s(3.8)}><Hook /></Sequence>
    <Sequence from={s(3.8)} durationInFrames={s(8.15) - s(3.8)}><Grid /></Sequence>
    <Sequence from={s(8.15)} durationInFrames={s(10.95) - s(8.15)}><Price /></Sequence>
    <Sequence from={s(10.95)} durationInFrames={s(14.8) - s(10.95)} premountFor={30}><Pro /></Sequence>
    <Sequence from={s(14.8)}><Fin /></Sequence>
    <Grain opacity={0.06} />
    <Audio src={staticFile("audio/barberia.wav")} volume={0.22} />
    <Audio src={staticFile("barber/voz.wav")} />
  </AbsoluteFill>
);
