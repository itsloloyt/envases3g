import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, clamp, Counter, foto, Grain, Kinetic, Outro, Progress, SANS, SERIF } from "./kit";

// Día de la Madre (Argentina: domingo 18 de octubre). 3 regalos para armar con productos reales.
const ROSA = "#f4b6c2", CREMA = "#fdf1ec", VINO = "#7a1f3d";
const HOOK = 75, GIFT = 90, OUT = 75;
const GIFTS = [
  { t: "Un difusor *hecho por vos*", d: "Frasco Heaven ámbar + esencia 250 cc + 6 varillas", price: 6512, from: true, img: "heaven-100-cc-ambar-con-tapa-difusora" },
  { t: "Su perfumina *favorita*", d: "Medio litro · vainilla coco, marina, loto, uva", price: 3800, from: false, img: "perfumina-textil-al-agua-x-12-litro" },
  { t: "Para la mamá *viajera*", d: "Kit de 5 envases + bolsa hermética", price: 3600, from: false, img: "kit-para-viaje-por-5-unidades" },
];
export const diaMadreDuration = HOOK + GIFTS.length * GIFT + OUT;

// Pétalos/corazones que caen de fondo.
const Petals: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 16 }).map((_, i) => {
        const x = random(`x${i}`) * 1080, speed = 1.2 + random(`s${i}`) * 1.6, size = 26 + random(`z${i}`) * 30;
        const y = ((frame * speed + random(`y${i}`) * 2200) % 2200) - 150;
        return <div key={i} style={{ position: "absolute", left: x + Math.sin((frame + i * 20) / 25) * 30, top: y, fontSize: size, opacity: 0.35, rotate: `${frame * (i % 2 ? 1 : -1)}deg`, color: i % 3 ? ROSA : C.white }}>♥</div>;
      })}
    </AbsoluteFill>
  );
};

// Caja de regalo: la tapa se levanta y sale la foto del producto.
const GiftBox: React.FC<{ img: string }> = ({ img }) => {
  const frame = useCurrentFrame();
  const box = spring({ frame, fps: 30, config: { damping: 12 } });
  const lid = interpolate(frame, [12, 24], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const rise = spring({ frame: frame - 18, fps: 30, config: { damping: 13, stiffness: 120 } });
  const W = 520, X = (1080 - W) / 2, TOP = 980;
  return (
    <div style={{ position: "absolute", inset: 0, scale: String(interpolate(box, [0, 1], [0.6, 1])), opacity: box }}>
      {/* Foto que sube desde la caja (recortada al borde superior de la caja) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: TOP + 10, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: X + 40, top: TOP - 560 * rise + 40, width: W - 80, height: 560, borderRadius: 32, overflow: "hidden", boxShadow: "0 30px 60px rgba(122,31,61,.25)", rotate: `${interpolate(rise, [0, 1], [0, -3])}deg`, opacity: interpolate(frame, [16, 20], [0, 1], clamp) }}>
        <Img src={foto(img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      </div>
      {/* Cuerpo de la caja */}
      <div style={{ position: "absolute", left: X, top: TOP, width: W, height: 300, background: VINO, borderRadius: "0 0 28px 28px", boxShadow: "0 40px 80px rgba(122,31,61,.35)" }}>
        <div style={{ position: "absolute", left: W / 2 - 34, top: 0, width: 68, height: "100%", background: ROSA }} />
      </div>
      {/* Tapa */}
      <div style={{ position: "absolute", left: X - 24, top: TOP - 70, width: W + 48, height: 90, background: "#8f2748", borderRadius: 22, translate: `${lid * 700}px ${-lid * 700}px`, rotate: `${lid * 40}deg`, opacity: 1 - interpolate(frame, [20, 26], [0, 1], clamp), boxShadow: "0 20px 40px rgba(122,31,61,.3)" }}>
        <div style={{ position: "absolute", left: (W + 48) / 2 - 34, top: 0, width: 68, height: "100%", background: ROSA }} />
        <div style={{ position: "absolute", left: (W + 48) / 2 - 90, top: -70, fontSize: 120, lineHeight: 1, color: ROSA }}>🎀</div>
      </div>
    </div>
  );
};

const Gift: React.FC<{ g: (typeof GIFTS)[number]; i: number }> = ({ g, i }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [GIFT - 6, GIFT], [0, 1], clamp);
  const tag = spring({ frame: frame - 34, fps: 30, config: { damping: 9 } });
  return (
    <AbsoluteFill style={{ fontFamily: SANS, opacity: 1 - out, translate: `0 ${-out * 100}px` }}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 300, textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: VINO, letterSpacing: 2 }}>REGALO {i + 1} DE 3</div>
      </div>
      <GiftBox img={g.img} />
      <div style={{ position: "absolute", left: 72, right: 72, top: 1290, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Kinetic text={g.t} size={84} color={C.night} accent={VINO} delay={24} stagger={3} align="center" />
        <div style={{ fontSize: 34, color: "#6b4a52", marginTop: 6, opacity: interpolate(frame, [34, 42], [0, 1], clamp) }}>{g.d}</div>
      </div>
      <div style={{ position: "absolute", right: 90, top: 900, padding: "18px 34px", borderRadius: 999, background: C.sun, color: C.night, fontSize: 50, fontWeight: 700, boxShadow: "0 16px 30px rgba(0,0,0,.18)", scale: String(tag), rotate: `${interpolate(tag, [0, 1], [-30, 8])}deg` }}>
        {g.from ? "desde " : ""}<Counter to={g.price} start={34} dur={14} />
      </div>
    </AbsoluteFill>
  );
};

export const DiaMadre: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${CREMA}, #f9dfe3)` }}>
      <Petals />
      <Sequence durationInFrames={HOOK}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 72px", textAlign: "center", fontFamily: SANS }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 72, color: VINO, opacity: interpolate(frame, [0, 10], [0, 1], clamp), translate: `0 ${interpolate(frame, [0, 10], [20, 0], clamp)}px` }}>Día de la Madre</div>
          <div style={{ marginTop: 10, padding: "10px 28px", borderRadius: 999, background: VINO, color: CREMA, fontSize: 36, fontWeight: 700, scale: String(spring({ frame: frame - 8, fps: 30, config: { damping: 10 } })) }}>domingo 18 de octubre</div>
          <div style={{ marginTop: 50 }}>
            <Kinetic text="3 regalos que podés *armar vos*" size={130} color={C.night} accent={VINO} delay={14} stagger={4} align="center" />
          </div>
        </AbsoluteFill>
      </Sequence>
      {GIFTS.map((g, i) => (
        <Sequence key={i} from={HOOK + i * GIFT} durationInFrames={GIFT} premountFor={30}>
          <Gift g={g} i={i} />
        </Sequence>
      ))}
      <div style={{ position: "absolute", top: 200, left: 72, fontFamily: SANS, fontWeight: 700, fontSize: 36, color: VINO }}>envases 3g</div>
      <Sequence from={HOOK + GIFTS.length * GIFT} premountFor={30}>
        <Outro text="Regalale algo *hecho por vos*" bg={VINO} ink={CREMA} />
      </Sequence>
      <Progress color={VINO} track="rgba(122,31,61,.15)" />
      <Grain opacity={0.05} />
      <Audio src={staticFile("audio/diamadre.wav")} volume={0.8} />
    </AbsoluteFill>
  );
};
