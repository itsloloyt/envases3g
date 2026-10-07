import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Sticker animado: la mascota de Envases 3G bailando.
// Hecho con la skill motion-design (LottieFiles): personalidad "Playful", squash & stretch con volumen,
// anticipación antes de cada salto, saltos en arco, follow-through en brazos/piernas (3 frames de retraso)
// y tres capas: primaria (cuerpo), secundaria (extremidades + sombra), ambiente (destellos e impacto).
const IW = 1124, IH = 1152;
const BEAT = 15; // 120 BPM a 30 fps
export const MASCOTA_LOOP = 12 * BEAT; // 6 s, loop perfecto

const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Coreografía tomada del video de referencia (Spider-Man): cada pose clave en "tiempos" (1 tiempo = 15 frames).
// 0-4 brazos en cruz y balanceo · 4-5.2 salto con piernas abiertas · 5.4-6.2 agachada · 6.2-7 se para y flexiona
// 7-9 mano detrás de la cabeza + cadera · 9-11 piernas abiertas rebotando · 11-12 vuelve a la cruz.
type Pose = { x: number; y: number; sx: number; sy: number; rot: number; spin: number; air: number; armL: number; armR: number; legL: number; legR: number };
type Key = [number, Partial<Pose>];
const BASE: Pose = { x: 0, y: 0, sx: 1, sy: 1, rot: 0, spin: 0, air: 0, armL: -30, armR: -30, legL: 0, legR: 0 };
const KEYS: Key[] = [
  [0, {}],
  [3.9, {}],
  [4.35, { y: 26, sx: 1.08, sy: 0.92, armL: -15, armR: -20 }], // anticipación
  [4.8, { y: -150, sx: 0.93, sy: 1.1, armL: -42, armR: -40, legL: 24, legR: -24, air: 1 }], // salto abierto
  [5.2, { y: 0, sx: 1.12, sy: 0.88, armL: -36, armR: -34, legL: 10, legR: -10 }], // aterriza
  [5.6, { y: 58, sx: 1.15, sy: 0.85, armL: 10, armR: 0, legL: 14, legR: -14 }], // agachada
  [6.1, { y: 58, sx: 1.15, sy: 0.85, armL: 10, armR: 0, legL: 14, legR: -14 }],
  [6.6, { y: -10, sx: 0.97, sy: 1.04, armL: -18, armR: -22 }], // se para (overshoot)
  [7.0, { armL: -10, armR: -18 }], // flexiona
  [7.4, { armL: 28, armR: 0 }], // mano detrás de la cabeza
  [8.9, { armL: 28, armR: 0 }],
  [9.3, { armL: -4, armR: -10, legL: 12, legR: -12, sx: 1.05, sy: 0.95 }], // piernas abiertas
  [10.9, { armL: -4, armR: -10, legL: 12, legR: -12, sx: 1.05, sy: 0.95 }],
  [11.5, { armL: -36, armR: -34, y: -14 }], // abre los brazos con overshoot
  [12, {}],
];
const inOutK = Easing.bezier(0.45, 0, 0.25, 1);
function pose(frame: number): Pose {
  const f = ((frame % MASCOTA_LOOP) + MASCOTA_LOOP) % MASCOTA_LOOP;
  const b = f / BEAT;
  let k = 0;
  while (k < KEYS.length - 2 && KEYS[k + 1][0] <= b) k++;
  const [b0, p0] = KEYS[k], [b1, p1] = KEYS[k + 1];
  const t = inOutK(Math.min(1, Math.max(0, (b - b0) / (b1 - b0))));
  const A = { ...BASE, ...p0 }, B = { ...BASE, ...p1 };
  const p = {} as Pose;
  (Object.keys(BASE) as (keyof Pose)[]).forEach((key) => { p[key] = A[key] + (B[key] - A[key]) * t; });
  // Capas de movimiento propias de cada parte (balanceo, cadera, rebote), suaves en las transiciones.
  const fade = (from: number, to: number) => Math.min(1, Math.max(0, Math.min(b - from, to - b) / 0.3));
  const sway = fade(0, 4);
  p.x += 30 * Math.sin(Math.PI * b) * sway;
  p.rot += 9 * Math.sin(Math.PI * b) * sway;
  p.y -= 14 * Math.abs(Math.sin(Math.PI * b)) * sway;
  const hip = fade(7.3, 9);
  p.x += 20 * Math.sin(Math.PI * (b - 7.3)) * hip;
  p.rot += -11 * Math.sin(Math.PI * (b - 7.3)) * hip;
  const bounce = fade(9.2, 11);
  const ph = (b * 2) % 1; // dos rebotes por tiempo
  p.y += 18 * (1 - Math.abs(Math.cos(Math.PI * ph))) * bounce;
  p.sy -= 0.05 * (1 - Math.abs(Math.cos(Math.PI * ph))) * bounce;
  p.sx += 0.05 * (1 - Math.abs(Math.cos(Math.PI * ph))) * bounce;
  return p;
}

type Part = { clip: string; origin: [number, number]; z: number };
const PARTS: Record<string, Part> = {
  legL: { clip: "polygon(180px 700px, 575px 700px, 575px 1152px, 180px 1152px)", origin: [400, 790], z: 1 },
  legR: { clip: "polygon(585px 700px, 1000px 700px, 1000px 1152px, 585px 1152px)", origin: [740, 790], z: 1 },
  armL: { clip: "polygon(0px 150px, 300px 150px, 300px 700px, 0px 700px)", origin: [222, 540], z: 1 },
  armR: { clip: "polygon(900px 360px, 1124px 360px, 1124px 840px, 900px 840px)", origin: [990, 470], z: 1 },
  body: { clip: "circle(452px at 597px 470px)", origin: [597, 470], z: 2 },
};
const NO_BODY = 'path(evenodd, "M0 0 H1124 V1152 H0 Z M597 18 a452 452 0 1 0 0.1 0 Z")';

const Layer: React.FC<{ name: keyof typeof PARTS; rot: number }> = ({ name, rot }) => {
  const p = PARTS[name];
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: IW, height: IH, clipPath: p.clip, transformOrigin: `${p.origin[0]}px ${p.origin[1]}px`, rotate: `${rot}deg`, zIndex: p.z }}>
      <Img src={staticFile("mascota.png")} style={{ position: "absolute", left: 0, top: 0, width: IW, height: IH, clipPath: name === "body" ? undefined : NO_BODY }} />
    </div>
  );
};

// Capa ambiente: destellos en el gran salto y líneas de impacto al aterrizar.
const Ambient: React.FC<{ f: number; w: number; h: number }> = ({ f, w, h }) => {
  const b = f / BEAT;
  const pts = [[0.12, 0.22], [0.86, 0.18], [0.07, 0.5], [0.92, 0.48], [0.25, 0.07], [0.74, 0.06]];
  const impact = b >= 5.2 && b < 5.6 ? 1 - (b - 5.2) / 0.4 : 0;
  return (
    <>
      {pts.map(([px, py], i) => {
        const s = interpolate(b, [4.4 + i * 0.04, 4.75 + i * 0.04, 5.3 + i * 0.03], [0, 1, 0], { ...cl, easing: inOut });
        return <div key={i} style={{ position: "absolute", left: px * w - 14, top: py * h - 14, width: 28, height: 28, scale: String(s), rotate: `${s * 90}deg`, background: i % 2 ? "#f7df2e" : "#22b5c1", clipPath: "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)" }} />;
      })}
      {impact > 0 ? [-1, 1].map((d) => [0, 1].map((j) => (
        <div key={`${d}${j}`} style={{ position: "absolute", left: w / 2 + d * w * (0.27 + j * 0.05 + (1 - impact) * 0.05), top: h * (0.84 - j * 0.05), width: 5, height: 32 * (1 - j * 0.3), borderRadius: 3, background: "#0a7682", opacity: impact * 0.8, rotate: `${d * (50 + j * 15)}deg` }} />
      ))) : null}
    </>
  );
};

export const Mascota: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const f = frame % MASCOTA_LOOP;
  const b = pose(f);
  const lag = pose(f - 2); // follow-through: brazos y piernas llegan 2 frames después
  const armL = lag.armL, armR = lag.armR, legL = lag.legL, legR = lag.legR;
  const scale = (Math.min(width, height) * 0.66) / IH;
  const lift = Math.max(0, -b.y);
  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <div style={{ position: "absolute", top: height * 0.86, left: width / 2 + b.x * scale, width: width * 0.46 * (1 - lift / 520) * b.sx, height: height * 0.045, translate: "-50% 0", borderRadius: "50%", background: "rgba(4,22,25,.22)", opacity: 1 - lift / 400, filter: "blur(5px)" }} />
      <Ambient f={f} w={width} h={height} />
      <div style={{ position: "absolute", width: IW, height: IH, left: (width - IW * scale) / 2 + b.x * scale, top: height * 0.2 + b.y * scale, scale: String(scale), transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 100%", scale: `${b.sx} ${b.sy}`, rotate: `${b.rot}deg` }}>
          <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 45%", rotate: `${b.spin}deg` }}>
            <Layer name="legL" rot={legL} />
            <Layer name="legR" rot={legR} />
            <Layer name="armL" rot={armL} />
            <Layer name="armR" rot={armR} />
            <Layer name="body" rot={0} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
