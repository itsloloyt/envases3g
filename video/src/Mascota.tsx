import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Sticker animado: la mascota de Envases 3G bailando (pasos inspirados en el video de referencia).
// La imagen original (1124×1152) se divide en capas con clip-path y cada una gira sobre su "articulación".
const IW = 1124, IH = 1152;
const BEAT = 15; // 120 BPM a 30 fps
export const MASCOTA_LOOP = 8 * BEAT; // 4 s, loop perfecto

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
  const isBody = name === "body";
  // Brazos y piernas: rectángulo de la parte, sin el disco del cuerpo (la unión queda tapada por el disco).
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: IW, height: IH, clipPath: p.clip, transformOrigin: `${p.origin[0]}px ${p.origin[1]}px`, rotate: `${rot}deg`, zIndex: p.z }}>
      <Img src={staticFile("mascota.png")} style={{ position: "absolute", left: 0, top: 0, width: IW, height: IH, clipPath: isBody ? undefined : NO_BODY }} />
    </div>
  );
};

export const Mascota: React.FC = () => {
  const f = useCurrentFrame() % MASCOTA_LOOP;
  const { width, height } = useVideoConfig();
  const beat = f / BEAT; // 0..8
  const ph = beat % 1; // fase dentro del tiempo
  const side = Math.floor(beat) % 2 ? 1 : -1; // alterna izquierda / derecha
  const crouchJump = beat >= 6; // últimos 2 tiempos: se agacha y salta girando (como en el video)

  // Salto en cada tiempo + aplastado al aterrizar.
  const hop = Math.sin(Math.PI * ph);
  const land = ph < 0.18 ? 1 - ph / 0.18 : 0;
  let y = -hop * 70, sx = 1 + land * 0.08, sy = 1 - land * 0.1, rot = side * 7 * Math.sin(Math.PI * ph), spin = 0;
  if (crouchJump) {
    const t = (beat - 6) / 2; // 0..1
    if (t < 0.35) { const c = Math.sin((t / 0.35) * Math.PI / 2); y = c * 60; sy = 1 - c * 0.18; sx = 1 + c * 0.12; rot = 0; }
    else { const j = (t - 0.35) / 0.65; y = 60 - Math.sin(j * Math.PI) * 70 - j * 60; sy = 1 + Math.sin(j * Math.PI) * 0.08; sx = 1; rot = 0; spin = j * 360; }
  }

  // Brazos: el del pulgar saluda; el otro se abre (pasos "brazos abiertos" del video).
  const armL = crouchJump ? -22 : -6 + 14 * Math.sin(2 * Math.PI * beat / 2);
  const armR = crouchJump ? 20 : side * 12 * Math.sin(Math.PI * ph);
  // Piernas: patadita alternada.
  const legL = crouchJump ? 10 : side < 0 ? 11 * Math.sin(Math.PI * ph) : -4;
  const legR = crouchJump ? -10 : side > 0 ? -11 * Math.sin(Math.PI * ph) : 4;

  const scale = (Math.min(width, height) * 0.68) / IH;
  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      {/* Sombra en el piso */}
      <div style={{ position: "absolute", bottom: height * 0.03, left: "50%", width: width * 0.5 * (1 - Math.max(0, -y) / 600), height: height * 0.05, translate: "-50% 0", borderRadius: "50%", background: "rgba(0,0,0,.18)", filter: "blur(6px)" }} />
      <div style={{ position: "absolute", width: IW, height: IH, left: (width - IW * scale) / 2, top: height * 0.17 + y * scale, scale: String(scale), transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 100%", scale: `${sx} ${sy}`, rotate: `${rot}deg` }}>
          <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 45%", rotate: `${spin}deg` }}>
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
