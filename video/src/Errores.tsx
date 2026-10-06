import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, clamp, foto, Grain, Handle, Kinetic, Outro, Progress, SANS, SERIF } from "./kit";

// "3 errores que te hacen perder plata con tus envases": cada error con cruz roja y su solución con tilde.
const HOOK = 75, ERR = 120, OUT = 75;
const ERRORS = [
  { bad: "Guardar aceites y esencias en envase *transparente*", good: "El vidrio *ámbar* los protege de la luz", img: "frasco-vidrio-vial-veterinario-ambar-250cc", tag: "Vial ámbar 250 cc · $1.563" },
  { bad: "Comprar la tapa sin mirar la *rosca*", good: "Fijate la medida: el Body 125 usa *20/410*", img: "body-125-cc-ambar", tag: "Body 125 cc · desde $468" },
  { bad: "Comprar 1.000 unidades sin *probar*", good: "Arrancá desde *una* unidad y después escalá", img: "pote-cristal-5-cc-con-tapa-a-presion", tag: "Pote 5 cc · $373" },
];
export const erroresDuration = HOOK + ERRORS.length * ERR + OUT;

const Mark: React.FC<{ ok: boolean; delay: number }> = ({ ok, delay }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - delay, fps: 30, config: { damping: 8, stiffness: 200 } });
  return (
    <div style={{ width: 150, height: 150, borderRadius: "50%", background: ok ? C.green : C.red, display: "grid", placeItems: "center", color: "white", fontSize: 100, fontWeight: 700, fontFamily: SANS, scale: String(p), rotate: `${interpolate(p, [0, 1], [-90, 0])}deg`, boxShadow: `0 20px 50px ${ok ? "rgba(47,211,122,.45)" : "rgba(255,77,77,.45)"}` }}>
      {ok ? "✓" : "✕"}
    </div>
  );
};

const Error: React.FC<{ e: (typeof ERRORS)[number]; i: number }> = ({ e, i }) => {
  const frame = useCurrentFrame();
  const flip = 55; // momento en que pasa del error a la solución
  const wipe = interpolate(frame, [flip, flip + 10], [0, 100], clamp);
  const card = spring({ frame: frame - flip - 4, fps: 30, config: { damping: 13 } });
  const out = interpolate(frame, [ERR - 6, ERR], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, translate: `${-out * 160}px 0`, fontFamily: SANS }}>
      {/* Mitad error (oscuro) */}
      <AbsoluteFill style={{ background: C.night, padding: "330px 72px 0" }}>
        <div style={{ fontSize: 40, color: C.red, fontWeight: 700, marginBottom: 30 }}>ERROR {i + 1}</div>
        <Mark ok={false} delay={4} />
        <div style={{ marginTop: 60 }}><Kinetic text={e.bad} size={104} color={C.white} accent={C.red} delay={10} stagger={3} /></div>
      </AbsoluteFill>
      {/* Mitad solución: entra con barrido circular */}
      <AbsoluteFill style={{ background: C.paper, padding: "330px 72px 0", clipPath: `circle(${wipe * 1.5}% at 90% 20%)` }}>
        <div style={{ fontSize: 40, color: C.deep, fontWeight: 700, marginBottom: 30 }}>MEJOR ASÍ</div>
        <Mark ok delay={flip + 6} />
        {frame >= flip ? <div style={{ marginTop: 60 }}><Kinetic text={e.good} size={104} color={C.night} accent={C.deep} delay={flip + 10} stagger={3} /></div> : null}
        <div style={{ position: "absolute", left: 72, right: 72, bottom: 330, display: "flex", alignItems: "center", gap: 34, background: C.white, borderRadius: 36, padding: 26, boxShadow: "0 30px 60px rgba(4,22,25,.12)", translate: `0 ${interpolate(card, [0, 1], [400, 0])}px` }}>
          <Img src={foto(e.img)} style={{ width: 210, height: 210, objectFit: "cover", borderRadius: 24 }} />
          <div style={{ fontSize: 42, fontWeight: 700, color: C.night }}>{e.tag}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Errores: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Sequence durationInFrames={HOOK}>
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 72px", fontFamily: SANS }}>
          <div style={{ fontSize: 300, fontWeight: 700, color: C.red, lineHeight: 1, letterSpacing: -10, scale: String(spring({ frame, fps: 30, config: { damping: 8 } })), transformOrigin: "left" }}>3</div>
          <Kinetic text="errores que te hacen perder *plata* con tus envases" size={110} color={C.white} accent={C.sun} delay={8} stagger={3} />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: C.soft, marginTop: 24, opacity: interpolate(frame, [45, 55], [0, 1], clamp) }}>el 3 es el más común</div>
        </AbsoluteFill>
      </Sequence>
      {ERRORS.map((e, i) => (
        <Sequence key={i} from={HOOK + i * ERR} durationInFrames={ERR} premountFor={30}>
          <Error e={e} i={i} />
        </Sequence>
      ))}
      <Handle />
      <Sequence from={HOOK + ERRORS.length * ERR} premountFor={30}>
        <Outro text="¿Cuál *cometías?*" />
      </Sequence>
      <Progress color={C.sun} />
      <Grain opacity={0.06} />
      <Audio src={staticFile("audio/errores.wav")} />
    </AbsoluteFill>
  );
};
