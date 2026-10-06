import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, clamp, Counter, foto, Grain, Kinetic, Outro, Progress, SANS, SERIF } from "./kit";

// Día de la Madre con combos reales del catálogo: para regalar y para vender (con costo por unidad).
const ROSA = "#f4b6c2", CREMA = "#fdf1ec", VINO = "#7a1f3d";
const HOOK = 75, LABEL = 36, GIFT = 60, COMBO = 96, OUT = 75;
const REGALAR = [
  { t: "Difusor 125 ml", d: "vainilla, jazmín, bamboo, papaya…", price: 3950, img: "difusor-de-125-ml" },
  { t: "Home spray 300 ml", d: "para la casa y los ambientes", price: 4250, img: "home-spray-300-ml" },
  { t: "Kit home spray + difusor", d: "el combo completo, en su aroma favorito", price: 10300, img: "kit-home-spray-300ml-difusor-125ml", star: true },
];
const VENDER = [
  { t: "Combo difusor ambiental", d: "8 frascos de vidrio 125 ml con tapa difusora + 1 litro de esencia + 50 varillas", price: 22000, n: 8, unit: "difusor", img: "combo-difusor-ambiental" },
  { t: "Combo perfumina al agua", d: "10 envases PET 100 ml con spray + 1 litro de perfumina", price: 15000, n: 10, unit: "perfumina", img: "combo-perfumina-textil-al-agua" },
  { t: "Combo perfumina al alcohol", d: "10 envases PET 100 ml con spray + 1 litro de perfumina al alcohol", price: 19000, n: 10, unit: "perfumina", img: "combo-perfumina-textil-al-alcohol" },
];
const A = HOOK, B = A + LABEL + REGALAR.length * GIFT, END = B + LABEL + VENDER.length * COMBO;
export const diaMadreCombosDuration = END + OUT;

const Petals: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 14 }).map((_, i) => {
        const y = ((frame * (1.2 + random(`s${i}`) * 1.4) + random(`y${i}`) * 2200) % 2200) - 150;
        return <div key={i} style={{ position: "absolute", left: random(`x${i}`) * 1080 + Math.sin((frame + i * 20) / 25) * 30, top: y, fontSize: 26 + random(`z${i}`) * 26, opacity: 0.3, color: i % 3 ? ROSA : C.white }}>♥</div>;
      })}
    </AbsoluteFill>
  );
};

// Cartel de sección ("PARA REGALAR" / "PARA VENDER") que barre la pantalla.
const SectionLabel: React.FC<{ text: string; sub: string; dark?: boolean }> = ({ text, sub, dark }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [0, 8], [0, 100], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [LABEL - 6, LABEL], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: dark ? VINO : ROSA, clipPath: `inset(0 ${100 - wipe}% 0 0)`, justifyContent: "center", alignItems: "center", fontFamily: SANS, opacity: 1 - out }}>
      <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: -5, color: dark ? CREMA : VINO, lineHeight: 1 }}>{text}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 60, color: dark ? ROSA : C.night, marginTop: 18 }}>{sub}</div>
    </AbsoluteFill>
  );
};

const GiftCard: React.FC<{ g: (typeof REGALAR)[number] }> = ({ g }) => {
  const frame = useCurrentFrame();
  const card = spring({ frame, fps: 30, config: { damping: 13 } });
  const tag = spring({ frame: frame - 12, fps: 30, config: { damping: 9 } });
  const out = interpolate(frame, [GIFT - 5, GIFT], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, opacity: 1 - out, translate: `${-out * 140}px 0` }}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 300, textAlign: "center", fontSize: 36, fontWeight: 700, color: VINO, letterSpacing: 2 }}>PARA REGALAR</div>
      <div style={{ position: "absolute", left: 190, top: 380, width: 700, height: 820, borderRadius: 44, overflow: "hidden", boxShadow: "0 40px 80px rgba(122,31,61,.25)", border: g.star ? `8px solid ${VINO}` : "none", scale: String(interpolate(card, [0, 1], [0.85, 1])), rotate: `${interpolate(card, [0, 1], [6, -2])}deg`, opacity: card }}>
        <Img src={foto(g.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {g.star ? <div style={{ position: "absolute", left: 150, top: 400, padding: "14px 28px", borderRadius: 999, background: VINO, color: CREMA, fontSize: 34, fontWeight: 700, rotate: "-8deg", scale: String(tag) }}>el combo ♥</div> : null}
      <div style={{ position: "absolute", right: 150, top: 1080, padding: "18px 36px", borderRadius: 999, background: C.sun, color: C.night, fontSize: 58, fontWeight: 700, boxShadow: "0 16px 30px rgba(0,0,0,.18)", scale: String(tag), rotate: `${interpolate(tag, [0, 1], [-30, 6])}deg` }}>
        <Counter to={g.price} start={12} dur={14} />
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 1250, textAlign: "center" }}>
        <Kinetic text={g.t} size={80} color={C.night} accent={VINO} delay={6} align="center" />
        <div style={{ fontSize: 34, color: "#6b4a52", marginTop: 4, opacity: interpolate(frame, [14, 22], [0, 1], clamp) }}>{g.d}</div>
      </div>
    </AbsoluteFill>
  );
};

// Combo para vender: foto + qué trae + cuenta precio ÷ unidades = costo por unidad.
const ComboCard: React.FC<{ c: (typeof VENDER)[number] }> = ({ c }) => {
  const frame = useCurrentFrame();
  const card = spring({ frame, fps: 30, config: { damping: 14 } });
  const eq = interpolate(frame, [34, 44], [0, 1], clamp);
  const unit = spring({ frame: frame - 50, fps: 30, config: { damping: 8 } });
  const out = interpolate(frame, [COMBO - 6, COMBO], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, opacity: 1 - out, translate: `${-out * 140}px 0` }}>
      <div style={{ position: "absolute", left: 72, top: 300, fontSize: 36, fontWeight: 700, color: ROSA, letterSpacing: 2 }}>PARA VENDER</div>
      <div style={{ position: "absolute", left: 72, top: 370, width: 936, display: "flex", gap: 36, alignItems: "center", translate: `0 ${interpolate(card, [0, 1], [160, 0])}px`, opacity: card }}>
        <Img src={foto(c.img)} style={{ width: 400, height: 500, objectFit: "cover", borderRadius: 36, boxShadow: "0 30px 60px rgba(0,0,0,.35)" }} />
        <div style={{ flex: 1 }}>
          <Kinetic text={c.t} size={70} color={CREMA} accent={ROSA} delay={4} />
          <div style={{ fontSize: 32, lineHeight: 1.3, color: "#f3d9de", marginTop: 14, opacity: interpolate(frame, [12, 20], [0, 1], clamp) }}>{c.d}</div>
        </div>
      </div>
      {/* Cuenta: precio ÷ unidades */}
      <div style={{ position: "absolute", left: 72, right: 72, top: 960, display: "flex", alignItems: "center", justifyContent: "center", gap: 26, fontSize: 70, fontWeight: 700, color: CREMA, opacity: eq, translate: `0 ${(1 - eq) * 40}px` }}>
        <span>${c.price.toLocaleString("es-AR")}</span>
        <span style={{ color: ROSA }}>÷</span>
        <span>{c.n}</span>
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 1110, display: "flex", flexDirection: "column", alignItems: "center", scale: String(unit) }}>
        <div style={{ padding: "18px 46px", borderRadius: 999, background: C.sun, color: C.night, fontSize: 104, fontWeight: 700, letterSpacing: -3, rotate: "-3deg", boxShadow: "0 20px 40px rgba(0,0,0,.3)" }}>
          ${Math.round(c.price / c.n).toLocaleString("es-AR")}
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 54, color: CREMA, marginTop: 18 }}>te sale cada {c.unit}</div>
      </div>
    </AbsoluteFill>
  );
};

export const DiaMadreCombos: React.FC = () => {
  const frame = useCurrentFrame();
  const dark = frame >= B && frame < END;
  return (
    <AbsoluteFill style={{ background: dark ? `linear-gradient(180deg, #5c1730, ${VINO})` : `linear-gradient(180deg, ${CREMA}, #f9dfe3)` }}>
      <Petals />
      <Sequence durationInFrames={HOOK}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 72px", textAlign: "center", fontFamily: SANS }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 76, color: VINO, opacity: interpolate(frame, [0, 10], [0, 1], clamp) }}>Día de la Madre</div>
          <div style={{ marginTop: 10, padding: "10px 28px", borderRadius: 999, background: VINO, color: CREMA, fontSize: 36, fontWeight: 700, scale: String(spring({ frame: frame - 8, fps: 30, config: { damping: 10 } })) }}>domingo 18 de octubre</div>
          <div style={{ marginTop: 50 }}><Kinetic text="¿Lo regalás o lo *vendés?*" size={140} color={C.night} accent={VINO} delay={14} stagger={4} align="center" /></div>
          <div style={{ marginTop: 26, fontSize: 40, color: "#6b4a52", opacity: interpolate(frame, [40, 50], [0, 1], clamp) }}>difusores y perfuminas para las dos</div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={A} durationInFrames={LABEL}><SectionLabel text="REGALAR" sub="listos para mamá" /></Sequence>
      {REGALAR.map((g, i) => (
        <Sequence key={g.t} from={A + LABEL + i * GIFT} durationInFrames={GIFT} premountFor={30}><GiftCard g={g} /></Sequence>
      ))}
      <Sequence from={B} durationInFrames={LABEL}><SectionLabel text="VENDER" sub="combos para emprender" dark /></Sequence>
      {VENDER.map((c, i) => (
        <Sequence key={c.t} from={B + LABEL + i * COMBO} durationInFrames={COMBO} premountFor={30}><ComboCard c={c} /></Sequence>
      ))}
      <div style={{ position: "absolute", top: 200, left: 72, fontFamily: SANS, fontWeight: 700, fontSize: 36, color: dark ? CREMA : VINO }}>envases 3g</div>
      <Sequence from={END} premountFor={30}>
        <Outro text="Pedí tu combo *antes del domingo*" bg={VINO} ink={CREMA} />
      </Sequence>
      <Progress color={dark ? ROSA : VINO} track="rgba(122,31,61,.15)" />
      <Grain opacity={0.05} />
      <Audio src={staticFile("audio/diamadrecombos.wav")} volume={0.8} />
    </AbsoluteFill>
  );
};
