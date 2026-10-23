import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { clamp, Grain, SANS, SERIF } from "./kit";

// "Tu marca empieza en el envase" — reel de marca para emprendedoras/es de cosmética, velas y aromas.
// Sin precios. Voz neural (Kokoro, ef_dora) en public/audio/marca-voz.wav, música en marca.wav.
// Regla de encuadre: texto siempre en y 300–660, productos en y 720–1440 (nunca se pisan).
const DISPLAY = "Anton";
loadFont({ family: DISPLAY, url: staticFile("fonts/Anton-Regular.ttf") });
const IN = Easing.bezier(0.16, 1, 0.3, 1);
const OUTE = Easing.bezier(0.7, 0, 0.84, 0);
const INK = "#16110c", CREAM = "#f2e9dc", GOLD = "#d9a35b", RUST = "#9a4f1d";
const s = (sec: number) => Math.round(sec * 30);
const T = { a: 0, b: 2.8, c: 6.0, d: 9.6, e: 13.0, f: 17.0, end: 22.5 };
export const marcaDuration = s(T.end);

const Line: React.FC<{ at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, out, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 12], [0, 1], { ...clamp, easing: IN });
  const x = out === undefined ? 0 : interpolate(f, [out, out + 7], [0, 1], { ...clamp, easing: OUTE });
  return (
    <div style={{ overflow: "hidden", paddingTop: 12, ...style }}>
      <div style={{ translate: `0 ${(1 - p) * 110 - x * 110}%` }}>{children}</div>
    </div>
  );
};

const Glow: React.FC<{ bg: string; glow: string }> = ({ bg, glow }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 950, height: 950, left: 65 + Math.sin(f / 45) * 70, top: 700 + Math.cos(f / 55) * 60, borderRadius: "50%", background: glow, filter: "blur(170px)", opacity: 0.5 }} />
    </AbsoluteFill>
  );
};

// Envase recortado que sube al centro con sombra de contacto.
const Hero: React.FC<{ img: string; h: number; bottom?: number; delay?: number; tilt?: number }> = ({ img, h, bottom = 1420, delay = 0, tilt = 0 }) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - delay, fps: 30, config: { damping: 16, stiffness: 120 } });
  const blur = interpolate(f - delay, [0, 6], [10, 0], clamp);
  return (
    <>
      <div style={{ position: "absolute", left: 540 - 230, width: 460, top: bottom - 34, height: 68, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(30,18,8,.4), transparent 70%)", opacity: p, scale: `${0.6 + 0.4 * p} 1` }} />
      <Img src={staticFile(`cut/${img}.png`)} style={{ position: "absolute", left: "50%", top: bottom - h, height: h, translate: `-50% ${(1 - p) * 380}px`, rotate: `${(1 - p) * tilt}deg`, filter: `blur(${blur}px) drop-shadow(0 30px 36px rgba(30,18,8,.25))`, transformOrigin: "50% 100%" }} />
    </>
  );
};

const S1: React.FC = () => (
  <AbsoluteFill style={{ color: CREAM }}>
    <Glow bg={INK} glow="#4a2c12" />
    <div style={{ position: "absolute", left: 72, right: 72, top: 700, textAlign: "center" }}>
      <Line at={s(0.4)} out={s(2.6)}><div style={{ fontFamily: DISPLAY, fontSize: 118, lineHeight: 1 }}>TENÉS LA <span style={{ fontFamily: SERIF, fontStyle: "italic", color: GOLD }}>receta</span></div></Line>
      <Line at={s(1.4)} out={s(2.62)}><div style={{ fontFamily: DISPLAY, fontSize: 118, lineHeight: 1 }}>TENÉS EL <span style={{ fontFamily: SERIF, fontStyle: "italic", color: GOLD }}>nombre</span></div></Line>
    </div>
  </AbsoluteFill>
);

const S2: React.FC = () => (
  <AbsoluteFill style={{ color: INK }}>
    <Glow bg="#ece2d3" glow="#f2c98f" />
    <div style={{ position: "absolute", left: 72, right: 72, top: 300, textAlign: "center" }}>
      <Line at={s(0.2)} out={s(3.0)}><div style={{ fontFamily: DISPLAY, fontSize: 132, lineHeight: 1 }}>TE FALTA EL ENVASE</div></Line>
      <Line at={s(1.0)} out={s(3.02)}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 92, lineHeight: 1.05, color: RUST }}>que lo haga ver profesional</div></Line>
    </div>
    <Hero img="body-125-cc-ambar" h={680} delay={4} tilt={-6} />
  </AbsoluteFill>
);

const WORDS = [
  { word: "ÁMBAR", img: "omega-500-cc-ambar-studio", h: 780, bg: "#e8d6bd", ink: "#3a1d0c", at: 0, dur: 1.1 },
  { word: "CRISTAL", img: "lyon-500-cc-cristal-studio", h: 780, bg: "#d0d8c8", ink: "#1b281c", at: 1.1, dur: 0.8 },
  { word: "PLÁSTICO", img: "body-125-flip-top-negra", h: 760, bg: "#ddd3c6", ink: "#151515", at: 1.9, dur: 1.7 },
];
const S3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {WORDS.map((w) => (
        <Sequence key={w.word} from={s(w.at)} durationInFrames={s(w.dur)}>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${w.bg}, color-mix(in srgb, ${w.bg} 82%, #000))` }}>
            <WordBehind text={w.word} color={w.ink} />
            <Hero img={w.img} h={w.h} bottom={1440} delay={1} />
            <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f - s(w.at), [0, 4], [0.5, 0], clamp) }} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
const WordBehind: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const f = useCurrentFrame();
  const size = text.length <= 5 ? 320 : text.length <= 7 ? 290 : 245;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", fontFamily: DISPLAY, fontSize: size, lineHeight: 1, color, letterSpacing: -4, translate: `${interpolate(f, [0, 50], [18, -18])}px 0` }}>
      {text.split("").map((ch, i) => {
        const p = interpolate(f, [i * 1.2, i * 1.2 + 9], [0, 1], { ...clamp, easing: IN });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", height: size * 1.25, paddingTop: size * 0.13 }}>
            <span style={{ display: "inline-block", translate: `0 ${(1 - p) * 105}%` }}>{ch}</span>
          </span>
        );
      })}
    </div>
  );
};

const ACC = [
  { img: "accesorios/gotero.webp", name: "Goteros", h: 380, at: 0.3 },
  { img: "accesorios/spray-oro.webp", name: "Válvulas", h: 330, at: 0.9 },
  { img: "accesorios/tapa-blanca.webp", name: "Tapas", h: 200, at: 1.6 },
  { img: "cut/heaven-100-cc-ambar-con-tapa-difusora.png", name: "Difusores", h: 420, at: 2.0 },
];
const S4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ color: INK }}>
      <Glow bg="#efe6d8" glow="#f2c98f" />
      <div style={{ position: "absolute", left: 72, right: 72, top: 320, textAlign: "center" }}>
        <Line at={0}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 84, color: RUST }}>y todo lo que va arriba</div></Line>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 720, height: 600, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        {ACC.map((a, k) => {
          const p = spring({ frame: f - s(a.at), fps: 30, config: { damping: 13 } });
          return (
            <div key={a.name} style={{ width: 235, display: "flex", flexDirection: "column", alignItems: "center", gap: 28, opacity: p, translate: `0 ${(1 - p) * 120}px` }}>
              <Img src={staticFile(a.img)} style={{ height: a.h, maxWidth: 220, objectFit: "contain", filter: "drop-shadow(0 24px 24px rgba(60,35,15,.3))" }} />
              <div style={{ fontFamily: SANS, fontSize: 40, fontWeight: 700 }}>{a.name}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Fila que crece a saltos (12 fps): de una unidad a una línea completa.
const LINE = [
  { img: "body-125-cc-ambar", h: 400 },
  { img: "heaven-100-cc-ambar-con-tapa-difusora", h: 380 },
  { img: "omega-500-cc-ambar-studio", h: 560 },
  { img: "body-125-flip-top-negra", h: 460 },
  { img: "frasco-vidrio-amanecer-250-cc", h: 300 },
];
const S5: React.FC = () => {
  const raw = useCurrentFrame();
  const f = Math.floor(raw / 2.5) * 2.5;
  return (
    <AbsoluteFill style={{ color: INK }}>
      <Glow bg="#ece2d3" glow="#f2c98f" />
      <div style={{ position: "absolute", left: 72, right: 72, top: 300, textAlign: "center" }}>
        <Line at={s(0.3)}><div style={{ fontFamily: DISPLAY, fontSize: 112, lineHeight: 1 }}>EMPEZÁS CON POCAS UNIDADES</div></Line>
        <Line at={s(1.8)}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 100, lineHeight: 1.05, color: RUST }}>y crecés a tu ritmo</div></Line>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 760, height: 640, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 18 }}>
        {LINE.map((b, k) => {
          const t = f - s(0.4 + k * 0.55);
          if (t < 0) return null;
          const y = t < 2.5 ? -260 : t < 5 ? 0 : t < 7.5 ? -14 : 0;
          return <Img key={b.img} src={staticFile(`cut/${b.img}.png`)} style={{ height: b.h, maxWidth: 200, objectFit: "contain", objectPosition: "50% 100%", translate: `0 ${y}px`, filter: "drop-shadow(0 18px 14px rgba(60,35,15,.25))" }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1385, height: 40, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(60,35,15,.22), transparent 70%)" }} />
    </AbsoluteFill>
  );
};

const S6: React.FC = () => {
  const f = useCurrentFrame();
  const logo = spring({ frame: f - 2, fps: 30, config: { damping: 200 } });
  const cta = spring({ frame: f - s(3.0), fps: 30, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ color: CREAM, fontFamily: SANS }}>
      <Glow bg={INK} glow="#4a2c12" />
      <Img src={staticFile("logo-3g.png")} style={{ position: "absolute", left: 540 - 110, top: 330, width: 220, height: 220, opacity: logo, scale: String(0.85 + 0.15 * logo) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 610, textAlign: "center" }}>
        <Line at={s(0.3)}><div style={{ fontFamily: DISPLAY, fontSize: 160, lineHeight: 1 }}>ENVASES 3G</div></Line>
        <Line at={s(1.0)}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 92, color: GOLD }}>tu marca empieza acá</div></Line>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "26px 50px", borderRadius: 999, background: GOLD, color: INK, fontWeight: 700, fontSize: 52, scale: String(cta), opacity: cta }}>WhatsApp 223 598-4362</div>
        <div style={{ fontSize: 36, marginTop: 30, opacity: interpolate(f, [s(3.4), s(4)], [0, 0.8], clamp) }}>Moreno 4156 · Mar del Plata · envíos</div>
        <div style={{ fontSize: 36, marginTop: 12, fontWeight: 700, opacity: interpolate(f, [s(3.6), s(4.2)], [0, 1], clamp) }}>@envases3gmdq</div>
      </div>
    </AbsoluteFill>
  );
};

export const Marca: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Sequence durationInFrames={s(T.b)}><S1 /></Sequence>
    <Sequence from={s(T.b)} durationInFrames={s(T.c - T.b)}><S2 /></Sequence>
    <Sequence from={s(T.c)} durationInFrames={s(T.d - T.c)} premountFor={20}><S3 /></Sequence>
    <Sequence from={s(T.d)} durationInFrames={s(T.e - T.d)}><S4 /></Sequence>
    <Sequence from={s(T.e)} durationInFrames={s(T.f - T.e)}><S5 /></Sequence>
    <Sequence from={s(T.f)}><S6 /></Sequence>
    <Grain opacity={0.06} />
    <Audio src={staticFile("audio/marca.wav")} volume={0.2} />
    <Audio src={staticFile("audio/marca-voz.wav")} />
  </AbsoluteFill>
);
