import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, clamp, foto, Grain, Handle, Kinetic, Outro, Progress, SANS, SERIF } from "./kit";

// Tutorial con lista: "Armá tu difusor de varillas". Cada paso suma al total (precios reales).
const HOOK = 66, STEP = 72, RESULT = 66, OUT = 75;
const STEPS = [
  { t: "El frasco", d: "Heaven 100 cc ámbar con tapa difusora", price: 622, img: "heaven-100-cc-ambar-con-tapa-difusora", tip: "el ámbar cuida la esencia de la luz" },
  { t: "La esencia", d: "Esencia para difusor · vainilla · 250 cc", price: 4600, img: "esencias-para-difusor", tip: "te alcanza para recargar" },
  { t: "Las varillas", d: "6 varillas de ratán 28 cm × $215", price: 1290, img: "varilla-de-ratan-natural-grandes-28cm-x-4-mm-para-difusor-aromatico", tip: "dalas vuelta cada semana" },
];

export const difusorDuration = HOOK + STEPS.length * STEP + RESULT + OUT;

// Lista fija abajo: se van tildando los pasos y sube el total.
const Checklist: React.FC = () => {
  const frame = useCurrentFrame();
  // Los frames son relativos a la secuencia (empieza en HOOK).
  const done = (i: number) => frame >= i * STEP + 40;
  const total = STEPS.reduce((a, st, i) => a + st.price * interpolate(frame, [i * STEP + 40, i * STEP + 54], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }), 0);
  const show = interpolate(frame, [0, 10], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1110, background: C.white, borderRadius: 36, padding: "28px 36px", boxShadow: "0 30px 60px rgba(4,22,25,.18)", fontFamily: SANS, opacity: show, translate: `0 ${(1 - show) * 200}px` }}>
      {STEPS.map((s, i) => (
        <div key={s.t} style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36, fontWeight: 700, color: done(i) ? C.ink : C.muted, padding: "8px 0" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, border: `3px solid ${done(i) ? C.green : "#cfd6d6"}`, background: done(i) ? C.green : "transparent", color: "#fff", display: "grid", placeItems: "center", fontSize: 30 }}>{done(i) ? "✓" : ""}</div>
          <span style={{ flex: 1, textDecoration: done(i) ? "line-through" : "none", textDecorationColor: C.green }}>{s.t}</span>
          <span style={{ fontWeight: 400 }}>${s.price.toLocaleString("es-AR")}</span>
        </div>
      ))}
      <div style={{ borderTop: "3px dashed #dfe5e5", marginTop: 12, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 36, fontWeight: 700 }}>Total</span>
        <span style={{ fontSize: 64, fontWeight: 700, color: C.deep, letterSpacing: -2 }}>${Math.round(total).toLocaleString("es-AR")}</span>
      </div>
    </div>
  );
};

const Step: React.FC<{ s: (typeof STEPS)[number]; i: number }> = ({ s, i }) => {
  const frame = useCurrentFrame();
  const img = spring({ frame: frame - 4, fps: 30, config: { damping: 13 } });
  const out = interpolate(frame, [STEP - 6, STEP], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, opacity: 1 - out, translate: `${-out * 120}px 0` }}>
      <div style={{ position: "absolute", left: 72, top: 300, display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 84, height: 84, borderRadius: "50%", background: C.sun, color: C.night, fontSize: 48, fontWeight: 700, display: "grid", placeItems: "center", scale: String(spring({ frame, fps: 30, config: { damping: 9 } })) }}>{i + 1}</div>
        <div style={{ fontSize: 34, color: C.soft, fontWeight: 700 }}>PASO {i + 1} DE 3</div>
      </div>
      <div style={{ position: "absolute", left: 72, top: 420, width: 520 }}>
        <Kinetic text={s.t} size={104} color={C.white} accent={C.sun} delay={4} />
        <div style={{ fontSize: 38, color: "#e6f4f5", marginTop: 14, lineHeight: 1.25, opacity: interpolate(frame, [12, 20], [0, 1], clamp) }}>{s.d}</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: C.sun, marginTop: 22, opacity: interpolate(frame, [22, 30], [0, 1], clamp) }}>tip: {s.tip}</div>
      </div>
      <Img src={foto(s.img)} style={{ position: "absolute", right: 60, top: 420, width: 400, height: 560, objectFit: "cover", borderRadius: 36, boxShadow: "0 40px 80px rgba(0,0,0,.4)", rotate: `${interpolate(img, [0, 1], [12, 4])}deg`, translate: `${interpolate(img, [0, 1], [500, 0])}px 0` }} />
    </AbsoluteFill>
  );
};

const Result: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = spring({ frame: frame - 6, fps: 30, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 330 }}>
        <Kinetic text="Tu difusor por menos de *$6.600*" size={110} color={C.white} accent={C.sun} delay={2} stagger={4} />
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 700, display: "flex", gap: 20, justifyContent: "center" }}>
        {STEPS.map((s, i) => (
          <Img key={s.img} src={foto(s.img)} style={{ width: 290, height: 380, objectFit: "cover", borderRadius: 28, boxShadow: "0 30px 60px rgba(0,0,0,.35)", scale: String(spring({ frame: frame - 8 - i * 5, fps: 30, config: { damping: 11 } })), rotate: `${(i - 1) * 5}deg` }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: C.soft, opacity: interpolate(frame, [20, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }), scale: String(0.9 + pop * 0.1) }}>y te sobra esencia para recargarlo</div>
    </AbsoluteFill>
  );
};

export const Difusor: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.deep}, ${C.night})` }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", right: -350, top: 200 + Math.sin(frame / 30) * 40, background: C.teal, opacity: 0.25, filter: "blur(130px)" }} />
      <Sequence durationInFrames={HOOK}>
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 72px", fontFamily: SANS }}>
          <div style={{ fontSize: 40, color: C.sun, fontWeight: 700, marginBottom: 24, opacity: interpolate(frame, [0, 8], [0, 1], clamp) }}>TUTORIAL · 3 PASOS</div>
          <Kinetic text="Armá tu difusor de *varillas*" size={136} color={C.white} accent={C.sun} delay={4} stagger={4} />
        </AbsoluteFill>
      </Sequence>
      {STEPS.map((s, i) => (
        <Sequence key={s.t} from={HOOK + i * STEP} durationInFrames={STEP} premountFor={30}>
          <Step s={s} i={i} />
        </Sequence>
      ))}
      <Sequence from={HOOK} durationInFrames={STEPS.length * STEP} premountFor={30}>
        <Checklist />
      </Sequence>
      <Sequence from={HOOK + STEPS.length * STEP} durationInFrames={RESULT} premountFor={30}>
        <Result />
      </Sequence>
      <Handle />
      <Sequence from={HOOK + STEPS.length * STEP + RESULT} premountFor={30}>
        <Outro text="Encontrá todo en la *web*" />
      </Sequence>
      <Progress />
      <Grain />
      <Audio src={staticFile("audio/difusor.wav")} />
    </AbsoluteFill>
  );
};
