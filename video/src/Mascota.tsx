import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Sticker animado: la mascota de Envases 3G bailando.
// Hecho con la skill motion-design (LottieFiles): personalidad "Playful", squash & stretch con volumen,
// anticipación antes de cada salto, saltos en arco, follow-through en brazos/piernas (3 frames de retraso)
// y tres capas: primaria (cuerpo), secundaria (extremidades + sombra), ambiente (destellos e impacto).
const IW = 1124, IH = 1152;
const BEAT = 15; // 120 BPM a 30 fps
export const MASCOTA_LOOP = 8 * BEAT; // 4 s, loop perfecto

const outBack = Easing.bezier(0.175, 0.885, 0.32, 1.275); // "Bounce settle"
const easeOut = Easing.bezier(0.05, 0.7, 0.1, 1); // MD3 Emphasized (despegue)
const easeIn = Easing.bezier(0.3, 0, 1, 1); // MD3 Accelerate (caída)
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Pose = { x: number; y: number; sx: number; sy: number; rot: number; spin: number; air: number };

// Pose del cuerpo en un frame (función pura: permite calcular el follow-through con retraso).
function pose(frame: number): Pose {
  const f = ((frame % MASCOTA_LOOP) + MASCOTA_LOOP) % MASCOTA_LOOP;
  const beat = Math.floor(f / BEAT), ph = (f % BEAT) / BEAT;
  const side = beat % 2 ? 1 : -1, prevSide = -side;
  let x = 0, y = 0, sx = 1, sy = 1, rot = 0, spin = 0, air = 0;
  if (beat < 6) {
    if (ph < 0.14) { // aterrizaje: squash con volumen
      const k = 1 - interpolate(ph, [0, 0.14], [0, 1], { ...cl, easing: outBack });
      sx = 1 + 0.14 * k; sy = 1 - 0.14 * k; x = prevSide * 26;
    } else if (ph < 0.28) { // anticipación: amague hacia abajo
      const k = Math.sin(interpolate(ph, [0.14, 0.28], [0, Math.PI], cl));
      y = 10 * k; sx = 1 + 0.05 * k; sy = 1 - 0.05 * k; x = prevSide * 26;
    } else { // en el aire, en arco de un lado al otro
      const a = interpolate(ph, [0.28, 1], [0, 1], cl);
      air = a;
      const up = a < 0.5 ? easeOut(a / 0.5) : 1 - easeIn((a - 0.5) / 0.5);
      y = -95 * up;
      x = interpolate(inOut(a), [0, 1], [prevSide * 26, side * 26]);
      const stretch = a < 0.25 ? 1 - a / 0.25 : a > 0.8 ? (a - 0.8) / 0.2 : 0;
      sx = 1 - 0.08 * stretch; sy = 1 + 0.1 * stretch;
      rot = side * 8 * Math.sin(Math.PI * a);
    }
  } else {
    const t = (f - 6 * BEAT) / (2 * BEAT);
    if (t < 0.3) { // agachada profunda (anticipación del gran salto)
      const k = interpolate(t, [0, 0.3], [0, 1], { ...cl, easing: inOut });
      y = 55 * k; sx = 1 + 0.16 * k; sy = 1 - 0.16 * k; x = -26 * (1 - k);
    } else if (t < 0.88) { // gran salto con giro completo
      const a = interpolate(t, [0.3, 0.88], [0, 1], cl);
      air = a;
      const up = a < 0.5 ? easeOut(a / 0.5) : 1 - easeIn((a - 0.5) / 0.5);
      y = 55 * (1 - Math.min(1, a * 4)) - 200 * up;
      spin = 360 * inOut(a);
      const stretch = a < 0.2 ? 1 - a / 0.2 : 0;
      sx = 1 - 0.1 * stretch; sy = 1 + 0.14 * stretch;
    } else { // aterrizaje fuerte
      const k = 1 - interpolate(t, [0.88, 1], [0, 1], { ...cl, easing: outBack });
      sx = 1 + 0.2 * k; sy = 1 - 0.2 * k; x = -26 * (1 - k);
    }
  }
  return { x, y, sx, sy, rot, spin, air };
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
  const t = (f - 6 * BEAT) / (2 * BEAT);
  const pts = [[0.12, 0.22], [0.86, 0.18], [0.07, 0.55], [0.92, 0.52], [0.25, 0.07], [0.74, 0.06]];
  const lt = (f % BEAT) / BEAT;
  const impact = t >= 0.88 && t <= 1 ? 1 - (t - 0.88) / 0.12 : f < 6 * BEAT ? Math.max(0, 1 - lt / 0.2) : 0;
  const bigHit = t >= 0.88;
  return (
    <>
      {pts.map(([px, py], i) => {
        const s = interpolate(t, [0.35 + i * 0.05, 0.5 + i * 0.05, 0.78 + i * 0.03], [0, 1, 0], { ...cl, easing: inOut });
        return <div key={i} style={{ position: "absolute", left: px * w - 14, top: py * h - 14, width: 28, height: 28, scale: String(s), rotate: `${s * 90}deg`, background: i % 2 ? "#f7df2e" : "#22b5c1", clipPath: "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)" }} />;
      })}
      {impact > 0 ? [-1, 1].map((d) => [0, 1].map((j) => (
        <div key={`${d}${j}`} style={{ position: "absolute", left: w / 2 + d * w * (0.27 + j * 0.05 + (1 - impact) * 0.05), top: h * (0.84 - j * 0.05), width: 5, height: (bigHit ? 34 : 22) * (1 - j * 0.3), borderRadius: 3, background: "#0a7682", opacity: impact * 0.75, rotate: `${d * (50 + j * 15)}deg` }} />
      ))) : null}
    </>
  );
};

export const Mascota: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const f = frame % MASCOTA_LOOP;
  const b = pose(f);
  const lag = pose(f - 3); // follow-through
  const vy = (pose(f - 1).y - pose(f - 4).y) / 3; // velocidad vertical reciente (inercia de los brazos)
  const big = f >= 6 * BEAT;
  const armL = big ? -24 * lag.air - 6 : -6 + 14 * Math.sin((2 * Math.PI * f) / (2 * BEAT)) + vy * 0.5;
  const armR = big ? 22 * lag.air : lag.rot * 1.4 - vy * 0.5;
  const legL = lag.air ? 10 * Math.sin(Math.PI * lag.air) + lag.rot * 0.6 : 0;
  const legR = lag.air ? -10 * Math.sin(Math.PI * lag.air) + lag.rot * 0.6 : 0;
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
