import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, clamp, Handle, Kinetic, Outro, Progress, SANS, SERIF } from "./kit";

// "¿Qué tapa va con este frasco?" — cómo leer la rosca 20/410 (dato del catálogo: Body 125 cc, "Rosca 20/410 mm").
// Cámara sobre la foto real: plano entero → zoom al pico → cota de 20 mm → espiral 410.
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const T = { hook: 0, bottle: 60, mm: 150, finish: 240, fits: 330, web: 450, outro: 525 };
export const roscaDuration = 600;

// Pico de la foto (px de la imagen de 1254×1254): x 537–705, y 185–318.
const NECK = { x0: 537, x1: 705, y0: 185, y1: 318 };

const Camera: React.FC = () => {
  const f = useCurrentFrame() + T.bottle; // corre dentro de una Sequence que arranca en T.bottle
  // escala y punto de la foto que queda en el punto de pantalla (540, cy)
  const s = interpolate(f, [T.bottle, T.bottle + 1, T.mm - 8, T.mm + 14, T.fits - 10, T.fits], [1.25, 1.25, 1.35, 4.4, 4.6, 4.6], { ...clamp, easing: IO });
  const fx = interpolate(f, [T.mm - 8, T.mm + 14], [620, 621], { ...clamp, easing: IO });
  const fy = interpolate(f, [T.mm - 8, T.mm + 14], [600, 252], { ...clamp, easing: IO });
  const cy = interpolate(f, [T.mm - 8, T.mm + 14], [1000, 860], { ...clamp, easing: IO });
  const enter = interpolate(f, [T.bottle, T.bottle + 14], [0, 1], { ...clamp, easing: OUT });
  return (
    <AbsoluteFill style={{ background: "#ece3d6", opacity: enter }}>
      <Img src={staticFile("fotos/body-125-ambar-hd.png")} style={{ position: "absolute", width: 1254, height: 1254, left: 540 - fx * s, top: cy - fy * s, scale: String(s), transformOrigin: "0 0" }} />
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ kicker: string; text: string; from: number; dark?: boolean }> = ({ kicker, text, from, dark }) => {
  const f = useCurrentFrame() - from;
  const p = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: OUT });
  return (
    <div style={{ position: "absolute", left: 72, right: 72, top: 1290, translate: `0 ${(1 - p) * 60}px`, opacity: p, padding: "36px 44px", borderRadius: 40, background: dark ? C.night : "rgba(255,255,255,.92)", color: dark ? C.white : C.night, boxShadow: "0 30px 60px rgba(4,22,25,.18)" }}>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 4, color: dark ? C.sun : C.deep }}>{kicker}</div>
      <div style={{ fontSize: 58, fontWeight: 700, letterSpacing: -2, lineHeight: 1.08, marginTop: 8 }}>{text}</div>
    </div>
  );
};

// Cota de diámetro sobre el pico, en coordenadas de pantalla con la cámara en 4.4–4.6×.
const Dimension: React.FC = () => {
  const f = useCurrentFrame() - 16;
  const w = (NECK.x1 - NECK.x0) * 4.5;
  const grow = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: OUT });
  const label = spring({ frame: f - 10, fps: 30, config: { damping: 12 } });
  const y = 860 + (NECK.y0 - 252) * 4.5 - 70;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g stroke={C.white} strokeWidth="6" strokeLinecap="round" opacity={grow}>
          <line x1={540 - (w / 2) * grow} y1={y} x2={540 + (w / 2) * grow} y2={y} />
          <line x1={540 - w / 2} y1={y - 30} x2={540 - w / 2} y2={y + 30} opacity={grow} />
          <line x1={540 + w / 2} y1={y - 30} x2={540 + w / 2} y2={y + 30} opacity={grow} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 190, textAlign: "center", scale: String(label), opacity: label }}>
        <span style={{ display: "inline-block", padding: "14px 40px", borderRadius: 999, background: C.sun, color: C.night, fontSize: 96, fontWeight: 700, letterSpacing: -3 }}>20 mm</span>
      </div>
    </>
  );
};

// Espiral de la rosca resaltada: líneas diagonales que recorren los filetes.
const Threads: React.FC = () => {
  const f = useCurrentFrame() - 8;
  const label = spring({ frame: f - 8, fps: 30, config: { damping: 12 } });
  const x0 = 540 - ((NECK.x1 - NECK.x0) * 4.6) / 2, x1 = 540 + ((NECK.x1 - NECK.x0) * 4.6) / 2;
  const ys = [215, 262, 300].map((yy) => 860 + (yy - 252) * 4.6);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {ys.map((y, i) => {
          const d = interpolate(f, [i * 5, i * 5 + 16], [0, 1], { ...clamp, easing: OUT });
          return <path key={i} d={`M${x0} ${y + 26} L${x1} ${y - 26}`} stroke={C.sun} strokeWidth="10" strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - d} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", scale: String(label), opacity: label }}>
        <span style={{ display: "inline-block", padding: "14px 40px", borderRadius: 999, background: C.night, color: C.sun, fontSize: 96, fontWeight: 700, letterSpacing: -3 }}>/410</span>
      </div>
    </>
  );
};

const CAPS = [
  { img: "tapa-blanca", name: "Tapa ciega" },
  { img: "fliptop-negra", name: "Flip top" },
  { img: "spray-blanca", name: "Válvula spray" },
  { img: "crema-negra", name: "Válvula crema" },
  { img: "spray-oro", name: "Spray oro" },
];

const Fits: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.paper, fontFamily: SANS }}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 290 }}>
        <Kinetic text="Si dice *20/410*, entran todas estas" size={92} color={C.night} accent={C.deep} delay={2} stagger={3} />
      </div>
      {[...CAPS, null].map((c, i) => {
        const p = spring({ frame: f - 14 - i * 5, fps: 30, config: { damping: 14 } });
        const col = i % 2, row = Math.floor(i / 2);
        const style: React.CSSProperties = { position: "absolute", left: 72 + col * 476, top: 560 + row * 320, width: 460, height: 310, borderRadius: 36, scale: String(interpolate(p, [0, 1], [0.7, 1])), opacity: p, overflow: "hidden" };
        if (!c) {
          return (
            <div key="no" style={{ ...style, background: C.night, color: C.white, padding: "34px 36px" }}>
              <div style={{ fontSize: 34, fontWeight: 700, color: C.red, letterSpacing: 2 }}>✕ NO ENTRA</div>
              <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, marginTop: 14 }}>Una tapa rosca 24</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 40, marginTop: 10, opacity: 0.85 }}>gira en falso</div>
            </div>
          );
        }
        return (
          <div key={c.img} style={{ ...style, background: C.white, boxShadow: "0 10px 30px rgba(4,22,25,.08)" }}>
            <Img src={staticFile(`accesorios/${c.img}.webp`)} style={{ position: "absolute", left: 30, top: 30, width: 200, height: 250, objectFit: "contain" }} />
            <div style={{ position: "absolute", left: 250, right: 24, top: 70, color: C.night }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: C.deep }}>✓ R20</div>
              <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.05, marginTop: 8 }}>{c.name}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Web: React.FC = () => {
  const f = useCurrentFrame();
  const card = spring({ frame: f - 4, fps: 30, config: { damping: 14 } });
  const hl = interpolate(f, [22, 34], [0, 1], { ...clamp, easing: OUT });
  return (
    <AbsoluteFill style={{ background: C.teal, fontFamily: SANS }}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 300 }}>
        <Kinetic text="En la web cada envase dice *su rosca*" size={100} color={C.night} accent={C.white} delay={0} stagger={3} />
      </div>
      <div style={{ position: "absolute", left: 110, right: 110, top: 760, borderRadius: 40, background: C.white, padding: 36, scale: String(interpolate(card, [0, 1], [0.8, 1])), opacity: card, boxShadow: "0 40px 80px rgba(4,22,25,.25)" }}>
        <Img src={staticFile("fotos/body-125-cc-ambar.webp")} style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 26 }} />
        <div style={{ fontSize: 50, fontWeight: 700, color: C.night, marginTop: 26, letterSpacing: -1.5 }}>Body 125 cc Ámbar</div>
        <div style={{ position: "relative", display: "inline-block", fontSize: 40, color: C.night, marginTop: 10 }}>
          <div style={{ position: "absolute", left: -10, right: -10, top: 4, bottom: 0, background: C.sun, borderRadius: 10, transformOrigin: "left", scale: `${hl} 1` }} />
          <span style={{ position: "relative" }}>Rosca 20/410 mm</span>
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.deep, marginTop: 14 }}>$468</div>
      </div>
    </AbsoluteFill>
  );
};

export const Rosca: React.FC = () => {
  const f = useCurrentFrame();
  const dark = f < T.bottle;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, background: C.night }}>
      <Sequence durationInFrames={T.bottle}>
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 72px" }}>
          <Kinetic text="¿Compraste una tapa que *no cierra?*" size={132} color={C.white} accent={C.sun} delay={3} stagger={4} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={T.bottle} durationInFrames={T.fits - T.bottle}>
        <Camera />
      </Sequence>
      <Sequence from={T.bottle} durationInFrames={T.mm - T.bottle}><Caption kicker="BODY 125 CC" text="Todo está en el pico del envase" from={6} /></Sequence>
      <Sequence from={T.mm} durationInFrames={T.finish - T.mm}><Dimension /><Caption kicker="EL PRIMER NÚMERO" text="20 = el diámetro de la rosca, en milímetros" from={20} dark /></Sequence>
      <Sequence from={T.finish} durationInFrames={T.fits - T.finish}><Threads /><Caption kicker="EL SEGUNDO NÚMERO" text="410 = el tipo de rosca. Tiene que coincidir" from={6} dark /></Sequence>
      <Sequence from={T.fits} durationInFrames={T.web - T.fits}><Fits /></Sequence>
      <Sequence from={T.web} durationInFrames={T.outro - T.web}><Web /></Sequence>
      <Sequence from={T.outro}><Outro text="¿Dudas? *Mandanos foto*" bg={C.night} ink={C.white} /></Sequence>
      {f < T.outro ? <><Handle color={dark ? C.white : C.night} /><Progress color={C.sun} track={dark ? "rgba(255,255,255,.25)" : "rgba(4,22,25,.18)"} /></> : null}
      <Audio src={staticFile("audio/rosca.wav")} />
    </AbsoluteFill>
  );
};
