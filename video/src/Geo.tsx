import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, clamp, foto, Outro, SANS, SERIF } from "./kit";

// Serie "geométrica" (estilo suizo / motion design): bloques de color planos que barren la pantalla,
// tipografía gigante en mayúsculas que aparece por máscara, fotos dentro de formas y easing marcado.
const EASE = Easing.bezier(0.85, 0, 0.15, 1);
const OUT_EASE = Easing.bezier(0.16, 1, 0.3, 1);
const P = { night: C.night, teal: C.teal, deep: C.deep, sun: C.sun, paper: "#f3f1ea", white: "#fff", coral: "#ff7a59" };

// Palabra gigante que sube desde una máscara.
const Big: React.FC<{ text: string; size: number; color: string; delay?: number; align?: "left" | "center" | "right" }> = ({ text, size, color, delay = 0, align = "left" }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ textAlign: align }}>
      {text.split("\n").map((line, i) => {
        const p = interpolate(frame, [delay + i * 4, delay + i * 4 + 14], [0, 1], { ...clamp, easing: OUT_EASE });
        return (
          <div key={i} style={{ overflow: "hidden", lineHeight: 0.9, paddingTop: size * 0.06 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: -size * 0.05, color, translate: `0 ${(1 - p) * 105}%` }}>{line}</div>
          </div>
        );
      })}
    </div>
  );
};

// Bloque de color que cruza la pantalla y tapa el corte entre escenas.
const Wipe: React.FC<{ at: number; color: string; dir?: 1 | -1 }> = ({ at, color, dir = 1 }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [at - 8, at, at + 8], [-100, 0, 100], { ...clamp, easing: EASE }) * dir;
  if (frame < at - 8 || frame > at + 8) return null;
  return <div style={{ position: "absolute", inset: 0, background: color, translate: `${x}% 0`, zIndex: 20 }} />;
};

// Foto dentro de una forma (círculo o arco) que crece con easing.
const Shape: React.FC<{ img: string; kind: "circle" | "arch"; x: number; y: number; w: number; h: number; delay?: number; bg?: string }> = ({ img, kind, x, y, w, h, delay = 0, bg = P.white }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 16], [0, 1], { ...clamp, easing: OUT_EASE });
  const radius = kind === "circle" ? "50%" : `${w / 2}px ${w / 2}px 24px 24px`;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: radius, overflow: "hidden", background: bg, clipPath: `inset(${(1 - p) * 100}% 0 0 0 round ${kind === "circle" ? w / 2 : 24}px)` }}>
      <Img src={foto(img)} style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(1.25 - p * 0.25) }} />
    </div>
  );
};

const Pill: React.FC<{ text: string; delay: number; bg: string; color: string; size?: number }> = ({ text, delay, bg, color, size = 46 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 12], [0, 1], { ...clamp, easing: OUT_EASE });
  return <div style={{ alignSelf: "flex-start", padding: `${size * 0.36}px ${size * 0.7}px`, borderRadius: 999, background: bg, color, fontFamily: SANS, fontWeight: 700, fontSize: size, translate: `${(1 - p) * -120}%`, opacity: p }}>{text}</div>;
};

const Tag: React.FC<{ text: string }> = ({ text }) => <div style={{ position: "absolute", top: 200, left: 72, fontFamily: SANS, fontWeight: 700, fontSize: 32, color: P.night, background: "rgba(255,255,255,.88)", padding: "8px 20px", borderRadius: 999, zIndex: 30 }}>{text}</div>;

// ======================= 1. VIDRIO VS PLÁSTICO =======================
export const geoVsDuration = 450;

const VsSide: React.FC<{ title: string; bg: string; ink: string; img: string; kind: "circle" | "arch"; pills: string[]; price: string; pillBg: string; pillInk: string }> = ({ title, bg, ink, img, kind, pills, price, pillBg, pillInk }) => (
  <AbsoluteFill style={{ background: bg, color: ink }}>
    <div style={{ position: "absolute", left: 72, top: 300 }}><Big text={title} size={190} color={ink} delay={4} /></div>
    <Shape img={img} kind={kind} x={540} y={540} w={470} h={kind === "circle" ? 470 : 640} delay={10} />
    <div style={{ position: "absolute", left: 72, top: 560, width: 470, display: "flex", flexDirection: "column", gap: 22 }}>
      {pills.map((t, i) => <Pill key={t} text={t} delay={22 + i * 8} bg={pillBg} color={pillInk} size={38} />)}
    </div>
    <div style={{ position: "absolute", left: 72, top: 1240 }}><Pill text={price} delay={52} bg={P.night} color={P.white} size={52} /></div>
  </AbsoluteFill>
);

export const GeoVs: React.FC = () => {
  const frame = useCurrentFrame();
  const vs = spring({ frame: frame - 20, fps: 30, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: P.night, color: P.white }}>
      <Sequence durationInFrames={60}>
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 960, background: P.teal, translate: `0 ${interpolate(frame, [0, 14], [-100, 0], { ...clamp, easing: OUT_EASE })}%` }} />
          <div style={{ position: "absolute", left: 72, top: 560 }}><Big text="VIDRIO" size={210} color={P.night} delay={6} /></div>
          <div style={{ position: "absolute", left: 72, right: 72, top: 1110 }}><Big text="PLÁSTICO" size={170} color={P.white} delay={12} /></div>
          <div style={{ position: "absolute", left: 540 - 120, top: 960 - 120, width: 240, height: 240, borderRadius: "50%", background: P.sun, display: "grid", placeItems: "center", fontFamily: SANS, fontWeight: 700, fontSize: 110, color: P.night, scale: String(vs), rotate: `${(1 - vs) * -180}deg` }}>vs</div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={60} durationInFrames={120}>
        <VsSide title={"VIDRIO"} bg={P.paper} ink={P.night} img="botella-agropecuario-500-ml-vidrio-ambar-con-tapon" kind="arch" pills={["No absorbe olores", "Ideal aceites y perfumes", "Se ve premium"]} price="500 ml · $2.574" pillBg={P.teal} pillInk={P.white} />
      </Sequence>
      <Sequence from={180} durationInFrames={120}>
        <VsSide title={"PLÁSTICO"} bg={P.sun} ink={P.night} img="botella-500cc-con-tapa-a-rosca" kind="circle" pills={["Liviano", "No se rompe en el envío", "Más económico"]} price="500 ml · $690" pillBg={P.night} pillInk={P.sun} />
      </Sequence>
      <Sequence from={300} durationInFrames={75}>
        <Verdict />
      </Sequence>
      <Sequence from={375}><Outro text="¿Vos cuál *usás?*" bg={P.night} ink={P.white} /></Sequence>
      <Wipe at={60} color={P.sun} />
      <Wipe at={180} color={P.teal} dir={-1} />
      <Wipe at={300} color={P.night} />
      <Wipe at={375} color={P.sun} dir={-1} />
      <Tag text="envases 3g" />
      <Audio src={staticFile("audio/geovs.wav")} />
    </AbsoluteFill>
  );
};

const Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: EASE });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: `${50 * split}%`, background: P.teal }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: `${50 * split}%`, background: P.sun }} />
      <div style={{ position: "absolute", left: 72, top: 420 }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: P.night, opacity: interpolate(frame, [10, 18], [0, 1], clamp) }}>¿querés que se vea premium?</div>
        <Big text="VIDRIO" size={190} color={P.white} delay={16} />
      </div>
      <div style={{ position: "absolute", left: 72, top: 1010 }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: P.night, opacity: interpolate(frame, [24, 32], [0, 1], clamp) }}>¿vendés con envío?</div>
        <Big text="PLÁSTICO" size={170} color={P.night} delay={30} />
      </div>
    </AbsoluteFill>
  );
};

// ======================= 2. 43 AROMAS =======================
const AROMAS: [string, string][] = [["Vainilla", "#f3d7a6"], ["Flores blancas", "#f6eef4"], ["Coco", "#fff6e8"], ["Jazmín", "#f9f3c8"], ["Campos de lavanda", "#b7a6e0"], ["Limón caramelo", "#f7df2e"], ["Cherry", "#e0435b"], ["Sándalo Brasil", "#a5734b"], ["Bamboo", "#8fc28a"], ["Frutos rojos", "#b8264a"], ["Té verde cedrón", "#9fcf7e"], ["Rosas", "#f28fa8"], ["Papaya", "#ff9a5a"], ["Uva", "#7b4f9e"], ["Pomelo", "#ff7f6e"], ["Flor de cerezo", "#f6b6c8"]];
export const geoAromasDuration = 450;

export const GeoAromas: React.FC = () => {
  const frame = useCurrentFrame();
  // Ruleta: cambia de aroma cada 6 frames y frena al final.
  const t = frame - 70;
  const steps = t < 0 ? 0 : Math.floor(Math.sqrt(t * 9));
  const idx = steps % AROMAS.length;
  const settled = t > 110;
  const [name, color] = settled ? AROMAS[0] : AROMAS[idx];
  const dark = ["#b8264a", "#7b4f9e", "#a5734b", "#e0435b"].includes(color);
  return (
    <AbsoluteFill style={{ background: P.night, color: P.white }}>
      {/* Escena 1: "43 aromas" */}
      <Sequence durationInFrames={70}>
        <AbsoluteFill style={{ background: P.sun }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: "absolute", left: 540 - (300 + i * 180), top: 900 - (300 + i * 180), width: (300 + i * 180) * 2, height: (300 + i * 180) * 2, borderRadius: "50%", border: `4px solid ${P.night}`, opacity: 0.12, scale: String(interpolate(frame, [i * 4, i * 4 + 20], [0.4, 1], { ...clamp, easing: OUT_EASE })) }} />
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, top: 470 }}><Big text="43" size={520} color={P.night} delay={2} align="center" /></div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1000 }}><Big text="AROMAS" size={170} color={P.night} delay={10} align="center" /></div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: P.night, opacity: interpolate(frame, [24, 34], [0, 1], clamp) }}>de esencia para difusor</div>
        </AbsoluteFill>
      </Sequence>
      {/* Escena 2: ruleta de aromas */}
      <Sequence from={70} durationInFrames={190}>
        <AbsoluteFill style={{ background: color }}>
          <div style={{ position: "absolute", left: 140, top: 380, width: 800, height: 800, borderRadius: "50%", background: dark ? "rgba(255,255,255,.12)" : "rgba(4,22,25,.08)", scale: String(1 + (settled ? 0 : Math.sin(frame) * 0.02)) }} />
          <div style={{ position: "absolute", left: 72, right: 72, top: 640, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: name.length > 12 ? 120 : 160, letterSpacing: -6, lineHeight: 0.95, color: dark ? P.white : P.night }}>{name.toUpperCase()}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 60, color: dark ? P.white : P.night, opacity: settled ? 1 : 0.6 }}>{settled ? "el clásico que nunca falla" : "¿cuál te toca?"}</div>
          <div style={{ position: "absolute", left: 72, top: 300, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: dark ? P.white : P.night }}>{settled ? "1" : String(idx + 1)} / 43</div>
        </AbsoluteFill>
      </Sequence>
      {/* Escena 3: producto + precios */}
      <Sequence from={260} durationInFrames={115}>
        <AbsoluteFill style={{ background: P.paper, color: P.night }}>
          <Shape img="esencias-para-difusor" kind="circle" x={190} y={330} w={700} h={700} delay={4} bg={P.paper} />
          <div style={{ position: "absolute", left: 72, right: 72, top: 1070 }}><Big text={"ESENCIA PARA\nDIFUSOR"} size={110} color={P.night} delay={10} /></div>
          <div style={{ position: "absolute", left: 72, top: 1330, display: "flex", gap: 20 }}>
            <Pill text="250 cc · $4.600" delay={26} bg={P.teal} color={P.white} size={42} />
            <Pill text="500 cc · $8.600" delay={34} bg={P.night} color={P.sun} size={42} />
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={375}><Outro text="¿Cuál es el *tuyo?*" bg={P.sun} ink={P.night} /></Sequence>
      <Wipe at={70} color={P.night} />
      <Wipe at={260} color={P.teal} dir={-1} />
      <Wipe at={375} color={P.night} />
      <Tag text="envases 3g" />
      <Audio src={staticFile("audio/geoaromas.wav")} />
    </AbsoluteFill>
  );
};

// ======================= 3. RUBROS (manifiesto) =======================
const RUBROS = [
  { w: "COSMÉTICA", n: 109, bg: P.teal, ink: P.white, img: "body-125-cc-ambar" },
  { w: "PLÁSTICO", n: 94, bg: P.sun, ink: P.night, img: "botella-500cc-con-tapa-a-rosca" },
  { w: "ESENCIAS", n: 69, bg: P.night, ink: P.sun, img: "esencias-para-difusor" },
  { w: "ACCESORIOS", n: 67, bg: P.paper, ink: P.night, img: "kit-para-viaje-por-5-unidades" },
  { w: "VIDRIO", n: 36, bg: P.coral, ink: P.night, img: "frasco-vidrio-vial-veterinario-ambar-250cc" },
  { w: "ALIMENTOS", n: 31, bg: P.deep, ink: P.white, img: "tarro-370cc-blanco-con-tapa-a-presion" },
];
const R0 = 66, RS = 36;
export const geoRubrosDuration = R0 + RUBROS.length * RS + 75 + 75;

export const GeoRubros: React.FC = () => {
  const frame = useCurrentFrame();
  const end = R0 + RUBROS.length * RS;
  return (
    <AbsoluteFill style={{ background: P.night }}>
      <Sequence durationInFrames={R0}>
        <AbsoluteFill style={{ background: P.night }}>
          <div style={{ position: "absolute", left: 72, top: 520 }}><Big text={"TODO\nPARA TU\nEMPREN-\nDIMIENTO"} size={170} color={P.white} delay={4} /></div>
          <div style={{ position: "absolute", right: 72, top: 400, width: 150, height: 150, borderRadius: "50%", background: P.sun, scale: String(spring({ frame: frame - 16, fps: 30, config: { damping: 10 } })) }} />
        </AbsoluteFill>
      </Sequence>
      {RUBROS.map((r, i) => (
        <Sequence key={r.w} from={R0 + i * RS} durationInFrames={RS}>
          <Rubro r={r} />
        </Sequence>
      ))}
      <Sequence from={end} durationInFrames={75}>
        <AbsoluteFill style={{ background: P.sun }}>
          <div style={{ position: "absolute", left: 72, top: 560 }}><Big text={"+400\nPRODUCTOS"} size={156} color={P.night} delay={4} /></div>
          <div style={{ position: "absolute", left: 72, top: 1000, fontFamily: SERIF, fontStyle: "italic", fontSize: 76, color: P.night, opacity: interpolate(frame - end, [16, 26], [0, 1], clamp) }}>un solo lugar · Mar del Plata</div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={end + 75}><Outro text="Mirá el catálogo *completo*" bg={P.night} ink={P.white} /></Sequence>
      {RUBROS.map((r, i) => <Wipe key={r.w} at={R0 + i * RS} color={RUBROS[(i + 1) % RUBROS.length].bg} dir={i % 2 ? -1 : 1} />)}
      <Wipe at={end} color={P.night} />
      <Tag text="envases 3g" />
      <Audio src={staticFile("audio/georubros.wav")} />
    </AbsoluteFill>
  );
};

const Rubro: React.FC<{ r: (typeof RUBROS)[number] }> = ({ r }) => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [4, 20], [0, r.n], { ...clamp, easing: OUT_EASE }));
  return (
    <AbsoluteFill style={{ background: r.bg }}>
      <Shape img={r.img} kind="arch" x={540} y={330} w={440} h={600} delay={2} />
      <div style={{ position: "absolute", left: 72, top: 360, fontFamily: SANS, fontWeight: 700, fontSize: 220, letterSpacing: -10, color: r.ink, lineHeight: 1 }}>{n}</div>
      <div style={{ position: "absolute", left: 72, top: 600, fontFamily: SERIF, fontStyle: "italic", fontSize: 54, color: r.ink }}>productos</div>
      <div style={{ position: "absolute", left: 60, right: 40, top: 1030 }}><Big text={r.w} size={r.w.length > 8 ? 136 : 176} color={r.ink} delay={3} /></div>
    </AbsoluteFill>
  );
};
