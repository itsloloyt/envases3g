import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, clamp, Counter, foto, Grain, Handle, Kinetic, Outro, Progress, SANS, SERIF } from "./kit";

// Ranking con cuenta regresiva: 5 envases por menos de $1.000 (precios reales, del más caro al más barato).
const HOOK = 66, ITEM = 57, OUT = 75;
const ITEMS = [
  { n: 5, name: "Pastillero negro 100 cc", use: "sales, cápsulas, jabón en escamas", price: 833, img: "pastillero-negro-100cc-con-tapa-a-rosca" },
  { n: 4, name: "Botella 500 cc a rosca", use: "jugos, limpieza, jabón líquido", price: 690, img: "botella-500cc-con-tapa-a-rosca" },
  { n: 3, name: "Ampolla PVC 10 cc", use: "sérums y muestras", price: 469, img: "ampolla-pvc-10-cc-con-tapa-presion" },
  { n: 2, name: "Body 125 cc ámbar", use: "cremas, tónicos y sprays", price: 468, img: "body-125-cc-ambar" },
  { n: 1, name: "Pote cristal 5 cc", use: "muestras de crema", price: 373, img: "pote-cristal-5-cc-con-tapa-a-presion" },
];
export const rankingDuration = HOOK + ITEMS.length * ITEM + OUT;

const Item: React.FC<{ it: (typeof ITEMS)[number] }> = ({ it }) => {
  const frame = useCurrentFrame();
  const slam = spring({ frame, fps: 30, config: { damping: 9, stiffness: 220, mass: 0.6 } });
  const card = spring({ frame: frame - 5, fps: 30, config: { damping: 14, stiffness: 140 } });
  const shake = frame < 10 ? Math.sin(frame * 3) * (10 - frame) * 1.6 : 0;
  const out = interpolate(frame, [ITEM - 6, ITEM], [0, 1], clamp);
  const gold = it.n === 1;
  return (
    <AbsoluteFill style={{ translate: `${shake}px ${-out * 120}px`, opacity: 1 - out, fontFamily: SANS }}>
      {/* Número gigante con contorno */}
      <div style={{ position: "absolute", left: 40, top: 320, fontSize: 620, fontWeight: 700, lineHeight: 1, letterSpacing: -40, color: "transparent", WebkitTextStroke: `6px ${gold ? C.sun : "rgba(255,255,255,.55)"}`, scale: String(interpolate(slam, [0, 1], [2.6, 1])), opacity: slam, transformOrigin: "left top" }}>
        {it.n}
      </div>
      <div style={{ position: "absolute", right: 70, top: 400, width: 600, height: 700, borderRadius: 44, overflow: "hidden", boxShadow: "0 50px 100px rgba(0,0,0,.5)", translate: `${interpolate(card, [0, 1], [700, 0])}px 0`, rotate: `${interpolate(card, [0, 1], [14, 3])}deg`, border: gold ? `8px solid ${C.sun}` : "none" }}>
        <Img src={foto(it.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 1150 }}>
        <Kinetic text={it.name} size={86} color={C.white} accent={C.sun} delay={8} stagger={3} />
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: C.soft, marginTop: 8, opacity: interpolate(frame, [16, 24], [0, 1], clamp) }}>para {it.use}</div>
        <div style={{ marginTop: 28, display: "inline-block", padding: "18px 40px", borderRadius: 999, background: C.sun, color: C.night, fontSize: 64, fontWeight: 700, scale: String(spring({ frame: frame - 12, fps: 30, config: { damping: 9 } })), rotate: "-3deg" }}>
          <Counter to={it.price} start={12} dur={16} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Ranking: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: "50%", left: -300 + Math.sin(frame / 30) * 60, top: 300, background: C.teal, opacity: 0.18, filter: "blur(140px)" }} />
      <Sequence durationInFrames={HOOK}>
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 72px" }}>
          <Kinetic text="5 envases por menos de *$1.000*" size={140} color={C.white} accent={C.sun} delay={3} stagger={4} />
          <div style={{ fontFamily: SANS, fontSize: 42, color: C.soft, marginTop: 30, opacity: interpolate(frame, [30, 40], [0, 1], clamp) }}>ideales para arrancar tu emprendimiento ↓</div>
        </AbsoluteFill>
      </Sequence>
      {ITEMS.map((it, i) => (
        <Sequence key={it.n} from={HOOK + i * ITEM} durationInFrames={ITEM} premountFor={30}>
          <Item it={it} />
        </Sequence>
      ))}
      <Handle />
      <Sequence from={HOOK + ITEMS.length * ITEM} premountFor={30}>
        <Outro text="¿Con cuál *arrancás?*" />
      </Sequence>
      <Progress />
      <Grain />
      <Audio src={staticFile("audio/ranking.wav")} />
    </AbsoluteFill>
  );
};
