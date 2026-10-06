import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, Counter, Grain, Handle, Kinetic, Outro, Progress, SANS, SERIF } from "./kit";

// "1 envase, 6 terminaciones": el Body 125 cc ámbar recortado y las tapas reales del catálogo
// que caen y se enroscan sobre el pico. Precios reales de cada variante.
const HOOK = 60, STEP = 45, OUT = 75;
const VARIANTS: { name: string; price: number; cap?: string; w: number; bg: string }[] = [
  { name: "Solo envase", price: 468, w: 0, bg: "#0a7682" },
  { name: "Tapa ciega blanca", price: 618, cap: "tapa-blanca", w: 215, bg: "#1b8f9a" },
  { name: "Flip Top negra", price: 687, cap: "fliptop-negra", w: 225, bg: "#22b5c1" },
  { name: "Spray blanco", price: 811, cap: "spray-blanca", w: 205, bg: "#2a6f8f" },
  { name: "Crema premium negra", price: 1526, cap: "crema-negra", w: 300, bg: "#041619" },
  { name: "Spray oro brillo", price: 1589, cap: "spray-oro", w: 215, bg: "#3b2a12" },
];
export const combinacionesDuration = HOOK + VARIANTS.length * STEP + OUT;

// Botella: 1000 px de alto; el pico ocupa ~16 % de la altura y ~44 % del ancho.
const BOTTLE_H = 820, BOTTLE_TOP = 830, NECK_BOTTOM = BOTTLE_TOP + BOTTLE_H * 0.15;

const Cap: React.FC<{ v: (typeof VARIANTS)[number] }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 11, stiffness: 160, mass: 0.8 } });
  // Al caer gira como si se enroscara.
  const twist = interpolate(frame, [6, 18], [1, 0], clamp);
  if (!v.cap) return null;
  return (
    <Img
      src={staticFile(`accesorios/${v.cap}.webp`)}
      style={{ position: "absolute", left: "50%", top: NECK_BOTTOM, width: v.w * (BOTTLE_H / 980), translate: `-50% calc(-100% + ${interpolate(drop, [0, 1], [-900, 0])}px)`, rotate: `${Math.sin(twist * 12) * twist * 6}deg`, filter: "drop-shadow(0 18px 24px rgba(0,0,0,.35))" }}
    />
  );
};

const Step: React.FC<{ v: (typeof VARIANTS)[number]; prev: number; i: number }> = ({ v, prev, i }) => {
  const frame = useCurrentFrame();
  const label = spring({ frame: frame - 6, fps: 30, config: { damping: 14 } });
  return (
    <AbsoluteFill>
      <Cap v={v} />
      <div style={{ position: "absolute", left: 72, top: 340, fontFamily: SANS, color: C.white }}>
        <div style={{ fontSize: 34, opacity: 0.75 }}>{String(i + 1).padStart(2, "0")} / 06</div>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, marginTop: 8, translate: `${interpolate(label, [0, 1], [-60, 0])}px 0`, opacity: label }}>{v.name}</div>
        <Counter from={prev || v.price} to={v.price} start={4} dur={14} style={{ display: "inline-block", marginTop: 14, fontSize: 132, fontWeight: 700, letterSpacing: -5, color: C.sun }} />
      </div>
    </AbsoluteFill>
  );
};

export const Combinaciones: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.max(0, Math.min(VARIANTS.length - 1, Math.floor((frame - HOOK) / STEP)));
  const current = frame < HOOK ? VARIANTS[0] : VARIANTS[idx];
  const prevBg = VARIANTS[Math.max(0, idx - 1)].bg;
  const t = interpolate((frame - HOOK) % STEP, [0, 10], [0, 1], clamp);
  const bottleIn = spring({ frame: frame - 4, fps: 30, config: { damping: 15 } });
  // Golpe suave de la botella cuando aterriza cada tapa.
  const land = frame >= HOOK ? Math.exp(-Math.max(0, ((frame - HOOK) % STEP) - 8) / 4) * (((frame - HOOK) % STEP) > 8 ? 1 : 0) : 0;
  return (
    <AbsoluteFill style={{ background: frame < HOOK ? C.night : `color-mix(in srgb, ${current.bg} ${t * 100}%, ${prevBg})`, fontFamily: SANS }}>
      <div style={{ position: "absolute", width: 1100, height: 1100, borderRadius: "50%", left: -10, top: 650, background: "radial-gradient(circle, rgba(255,255,255,.22), rgba(255,255,255,0) 65%)" }} />
      {/* Sombra en el piso */}
      <div style={{ position: "absolute", left: "50%", top: BOTTLE_TOP + BOTTLE_H - 30, width: 460, height: 70, translate: "-50% 0", borderRadius: "50%", background: "rgba(0,0,0,.35)", filter: "blur(22px)" }} />
      <Img src={staticFile("recortes/body.png")} style={{ position: "absolute", left: "50%", top: BOTTLE_TOP, height: BOTTLE_H, translate: `-50% ${interpolate(bottleIn, [0, 1], [500, 0]) + land * 10}px`, scale: String(1 - land * 0.015) }} />
      {VARIANTS.map((v, i) => (
        <Sequence key={v.name} from={HOOK + i * STEP} durationInFrames={i === VARIANTS.length - 1 ? STEP : STEP + 0} premountFor={30}>
          <Step v={v} i={i} prev={i ? VARIANTS[i - 1].price : 0} />
        </Sequence>
      ))}
      <Sequence durationInFrames={HOOK}>
        <div style={{ position: "absolute", left: 72, right: 72, top: 340 }}>
          <Kinetic text="1 envase. 6 *terminaciones.*" size={128} color={C.white} accent={C.sun} delay={4} stagger={5} />
          <div style={{ marginTop: 20, fontFamily: SERIF, fontStyle: "italic", fontSize: 54, color: C.soft, opacity: interpolate(frame, [26, 36], [0, 1], clamp) }}>Body 125 cc ámbar</div>
        </div>
      </Sequence>
      <Handle />
      <Sequence from={HOOK + VARIANTS.length * STEP} premountFor={30}>
        <Outro text="Combiná el tuyo en la *web*" />
      </Sequence>
      <Progress />
      <Grain />
      <Audio src={staticFile("audio/combinaciones.wav")} />
    </AbsoluteFill>
  );
};
