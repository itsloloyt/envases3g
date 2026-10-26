import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { clamp, SANS, SERIF } from "./kit";

// Comercial de marca (sin precios). Estudio de producto:
// - recortes limpios de public/clean (sin sombras de la foto original, ajustados al envase),
// - un único piso en y = FLOOR para todas las escenas, con sombra de contacto calculada del ancho real de cada envase,
// - texto siempre en la franja y 300–640, productos entre y 760 y FLOOR. Nada se pisa.
const DISPLAY = "Anton";
loadFont({ family: DISPLAY, url: staticFile("fonts/Anton-Regular.ttf") });
const IN = Easing.bezier(0.16, 1, 0.3, 1);
const INK = "#1a130d", CREAM = "#f3ebdf", GOLD = "#d6a15a", RUST = "#8f4a1c";
const FLOOR = 1400;
const s = (sec: number) => Math.round(sec * 30);
const T = [0, 3.4, 6.8, 10.2, 13.6, 17.0, 22.0];
export const comercialDuration = s(T[6]);

// Proporción ancho/alto de cada recorte limpio.
const AR: Record<string, number> = {
  "body-125-cc-ambar": 370 / 855,
  "body-125-flip-top-negra": 372 / 904,
  "home-spray-300-ml": 175 / 407,
  "lyon-500-cc-cristal-studio": 408 / 1078,
  "omega-500-cc-ambar-studio": 446 / 1123,
  "frasco-vidrio-amanecer-250-cc": 641 / 750,
};

// Envase apoyado en el piso, centrado en x. La sombra nace del mismo ancho del envase.
const Product: React.FC<{ img: string; h: number; x: number; delay?: number; floor?: number }> = ({ img, h, x, delay = 0, floor = FLOOR }) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - delay, fps: 30, config: { damping: 200, stiffness: 90 } });
  const w = h * AR[img];
  const lift = (1 - p) * 90;
  return (
    <>
      <div style={{ position: "absolute", left: x - w * 0.62, width: w * 1.24, top: floor - 16, height: 32, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(40,24,10,.38) 0%, rgba(40,24,10,.16) 45%, rgba(40,24,10,0) 72%)", opacity: p }} />
      <Img src={staticFile(`clean/${img}.png`)} style={{ position: "absolute", left: x - w / 2, top: floor - h - lift, width: w, height: h, opacity: p }} />
    </>
  );
};

// Fondo de estudio: pared cálida con luz desde arriba y piso apenas más claro.
const Studio: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const f = useCurrentFrame();
  const wall = dark ? "radial-gradient(ellipse 70% 55% at 50% 40%, #3b2a1a 0%, #1a130d 70%)" : "radial-gradient(ellipse 70% 55% at 50% 38%, #f6efe4 0%, #e6dacb 75%)";
  const floor = dark ? "linear-gradient(180deg, #231910 0%, #140e09 100%)" : "linear-gradient(180deg, #ece2d4 0%, #dccfbe 100%)";
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: wall }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR - 60, bottom: 0, background: floor }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR - 60, height: 120, background: dark ? "linear-gradient(180deg, rgba(26,19,13,1), rgba(26,19,13,0))" : "linear-gradient(180deg, rgba(230,218,203,1), rgba(230,218,203,0))" }} />
      {/* haz de luz que respira (capa ambiente) */}
      <div style={{ position: "absolute", left: 540 - 420, top: 380, width: 840, height: 900, borderRadius: "50%", background: dark ? "rgba(255,206,140,.10)" : "rgba(255,255,255,.35)", filter: "blur(120px)", opacity: 0.8 + Math.sin(f / 20) * 0.2 }} />
    </AbsoluteFill>
  );
};

const Line: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 14], [0, 1], { ...clamp, easing: IN });
  return (
    <div style={{ overflow: "hidden", paddingTop: 14, ...style }}>
      <div style={{ translate: `0 ${(1 - p) * 110}%` }}>{children}</div>
    </div>
  );
};
const Title: React.FC<{ a: string; b: string; dark?: boolean; size?: number }> = ({ a, b, dark, size = 128 }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: 300, textAlign: "center", color: dark ? CREAM : INK }}>
    <Line at={4}><div style={{ fontFamily: DISPLAY, fontSize: size, lineHeight: 1 }}>{a}</div></Line>
    <Line at={12}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: size * 0.78, lineHeight: 1.08, color: dark ? GOLD : RUST }}>{b}</div></Line>
  </div>
);

// Transición: cada escena entra con fundido corto y un leve acercamiento.
const Scene: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, 8, len - 6, len], [0, 1, 1, 0], clamp);
  const zoom = interpolate(f, [0, len], [1.0, 1.035]);
  return <AbsoluteFill style={{ opacity: fade, scale: String(zoom) }}>{children}</AbsoluteFill>;
};

const S1 = () => (
  <>
    <Studio dark />
    <Title dark a="TU PRODUCTO" b="merece verse bien" />
    <Product img="omega-500-cc-ambar-studio" h={600} x={540} delay={2} />
  </>
);
const S2 = () => (
  <>
    <Studio />
    <Title a="VIDRIO Y PLÁSTICO" b="para cada idea" size={118} />
    <Product img="frasco-vidrio-amanecer-250-cc" h={300} x={250} delay={8} />
    <Product img="lyon-500-cc-cristal-studio" h={600} x={540} delay={2} />
    <Product img="body-125-cc-ambar" h={420} x={830} delay={14} />
  </>
);
const S3 = () => (
  <>
    <Studio />
    <Title a="CADA ENVASE" b="con su tapa justa" />
    <Product img="body-125-cc-ambar" h={500} x={330} delay={2} />
    <Product img="body-125-flip-top-negra" h={530} x={750} delay={12} />
  </>
);
const S4 = () => (
  <>
    <Studio />
    <Title a="COSMÉTICA, AROMAS" b="y limpieza" size={118} />
    {[
      { img: "body-125-cc-ambar", h: 350, x: 145 },
      { img: "lyon-500-cc-cristal-studio", h: 480, x: 337 },
      { img: "omega-500-cc-ambar-studio", h: 500, x: 540 },
      { img: "home-spray-300-ml", h: 440, x: 745 },
      { img: "body-125-flip-top-negra", h: 370, x: 940 },
    ].map((p, i) => <Product key={p.img} {...p} delay={2 + i * 4} />)}
  </>
);
const S5 = () => (
  <>
    <Studio dark />
    <Title dark a="MINORISTA Y MAYORISTA" b="en Mar del Plata" size={104} />
    <Product img="home-spray-300-ml" h={520} x={380} delay={2} />
    <Product img="omega-500-cc-ambar-studio" h={600} x={700} delay={8} />
  </>
);
const S6 = () => {
  const f = useCurrentFrame();
  const logo = spring({ frame: f - 2, fps: 30, config: { damping: 200 } });
  const cta = spring({ frame: f - s(1.6), fps: 30, config: { damping: 200 } });
  return (
    <>
      <Studio dark />
      <Img src={staticFile("logo-3g.png")} style={{ position: "absolute", left: 540 - 115, top: 360, width: 230, height: 230, opacity: logo, scale: String(0.9 + 0.1 * logo) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center", color: CREAM }}>
        <Line at={6}><div style={{ fontFamily: DISPLAY, fontSize: 160, lineHeight: 1 }}>ENVASES 3G</div></Line>
        <Line at={14}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 86, color: GOLD }}>todo para tu emprendimiento</div></Line>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center", color: CREAM, fontFamily: SANS, opacity: cta, translate: `0 ${(1 - cta) * 24}px` }}>
        <div style={{ display: "inline-block", padding: "26px 52px", borderRadius: 999, background: GOLD, color: INK, fontWeight: 700, fontSize: 52 }}>WhatsApp 223 598-4362</div>
        <div style={{ fontSize: 36, marginTop: 28, opacity: 0.8 }}>Moreno 4156 · Mar del Plata · envíos</div>
        <div style={{ fontSize: 36, marginTop: 10, fontWeight: 700 }}>@envases3gmdq</div>
      </div>
    </>
  );
};

const SCENES = [S1, S2, S3, S4, S5, S6];
export const Comercial: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    {SCENES.map((Sc, i) => {
      const len = s(T[i + 1]) - s(T[i]);
      return (
        <Sequence key={i} from={s(T[i])} durationInFrames={len} premountFor={15}>
          <Scene len={i === SCENES.length - 1 ? len + 10 : len}><Sc /></Scene>
        </Sequence>
      );
    })}
    <Audio src={staticFile("audio/comercial.wav")} volume={0.18} />
    <Audio src={staticFile("audio/comercial-voz.wav")} />
  </AbsoluteFill>
);
