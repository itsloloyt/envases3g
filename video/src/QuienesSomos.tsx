import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { clamp, Grain, SANS, SERIF } from "./kit";

// "Quiénes somos" — personalidad Premium cálida (skill motion-design):
// una curva firma para entradas (0.16,1,0.3,1), salidas con aceleración, revelados por máscara,
// tres capas: texto (primaria), envases y sombras (secundaria), fondo que respira + grano (ambiente).
// Solo datos reales de .agents/product-marketing.md.
const DISPLAY = "Anton";
loadFont({ family: DISPLAY, url: staticFile("fonts/Anton-Regular.ttf") });
const IN = Easing.bezier(0.16, 1, 0.3, 1);
const EXIT = Easing.bezier(0.7, 0, 0.84, 0);
const INK = "#1a120b", CREAM = "#f1e8da", GOLD = "#d9a35b", SAND = "#e7d8c1";

const S = { hola: 0, mdp: 54, cat: 120, mix: 198, quien: 270, ase: 348, fin: 420 };
export const quienesDuration = 510;

// Revelado por máscara: el texto sube desde abajo de una línea invisible.
const Mask: React.FC<{ d: number; out?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ d, out, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [d, d + 14], [0, 1], { ...clamp, easing: IN });
  const x = out !== undefined ? interpolate(f, [out, out + 8], [0, 1], { ...clamp, easing: EXIT }) : 0;
  return (
    <div style={{ overflow: "hidden", paddingTop: 12, ...style }}>
      <div style={{ translate: `0 ${(1 - p) * 110 - x * 110}%` }}>{children}</div>
    </div>
  );
};

// Fondo ambiente: dos manchas de luz que derivan lento en sentido opuesto.
const Ambient: React.FC<{ bg: string; glow: string }> = ({ bg, glow }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 900, height: 900, left: -200 + Math.sin(f / 40) * 60, top: 300 + Math.cos(f / 50) * 50, borderRadius: "50%", background: glow, filter: "blur(160px)", opacity: 0.55 }} />
      <div style={{ position: "absolute", width: 700, height: 700, right: -220 - Math.sin(f / 45) * 50, top: 1000 - Math.cos(f / 38) * 60, borderRadius: "50%", background: glow, filter: "blur(150px)", opacity: 0.35 }} />
    </AbsoluteFill>
  );
};

const Hola: React.FC = () => {
  const f = useCurrentFrame();
  const logo = spring({ frame: f - 22, fps: 30, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ color: CREAM }}>
      <Ambient bg={INK} glow="#5a3415" />
      <div style={{ position: "absolute", left: 72, right: 72, top: 640 }}>
        <Mask d={2} out={46}><div style={{ fontFamily: SANS, fontSize: 44, letterSpacing: 8, opacity: 0.7 }}>QUIÉNES SOMOS</div></Mask>
        <Mask d={6} out={47}><div style={{ fontFamily: DISPLAY, fontSize: 230, lineHeight: 1 }}>SOMOS</div></Mask>
        <Mask d={10} out={48}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 230, lineHeight: 1, color: GOLD }}>Envases 3G</div></Mask>
      </div>
      <Img src={staticFile("logo-3g.png")} style={{ position: "absolute", left: 72, top: 1250, width: 120, height: 120, opacity: logo * interpolate(f, [46, 54], [1, 0], clamp), scale: String(0.85 + logo * 0.15) }} />
    </AbsoluteFill>
  );
};

const Mdp: React.FC = () => {
  const f = useCurrentFrame();
  const pin = spring({ frame: f - 12, fps: 30, config: { damping: 14 } });
  const ring = interpolate(f, [22, 50], [0, 1], { ...clamp, easing: IN });
  return (
    <AbsoluteFill style={{ color: INK }}>
      <Ambient bg={SAND} glow="#f5c98a" />
      <div style={{ position: "absolute", left: 72, right: 72, top: 360 }}>
        <Mask d={0} out={58}><div style={{ fontFamily: SANS, fontSize: 44, letterSpacing: 6 }}>DESDE</div></Mask>
        <Mask d={3} out={59}><div style={{ fontFamily: DISPLAY, fontSize: 250, lineHeight: 0.95 }}>MAR DEL</div></Mask>
        <Mask d={6} out={60}><div style={{ fontFamily: DISPLAY, fontSize: 250, lineHeight: 0.95 }}>PLATA</div></Mask>
      </div>
      {/* pin que cae, con onda en el piso (capa secundaria) */}
      <div style={{ position: "absolute", left: 540, top: 1180 }}>
        <div style={{ position: "absolute", left: -110 * ring, top: -30 * ring, width: 220 * ring, height: 60 * ring, borderRadius: "50%", border: `3px solid ${INK}`, opacity: 1 - ring }} />
        <div style={{ position: "absolute", left: -40, top: -40, width: 80, height: 22, borderRadius: "50%", background: "rgba(26,18,11,.25)", scale: String(pin) }} />
        <svg width="90" height="120" viewBox="0 0 24 32" style={{ position: "absolute", left: -45, top: -150, translate: `0 ${(1 - pin) * -300}px` }}>
          <path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 32 12 32s12-11.6 12-20.3C24 5.2 18.6 0 12 0z" fill={INK} />
          <circle cx="12" cy="11.5" r="4.5" fill={GOLD} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1260, textAlign: "center" }}>
        <Mask d={18} out={60}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 72 }}>Moreno 4156 · Buenos Aires</div></Mask>
      </div>
    </AbsoluteFill>
  );
};

const RUBROS = ["Vidrio", "Plástico", "Accesorios", "Cosmética y farmacia", "Esencias y difusores", "Alimentos", "Combos y kits"];
const Cat: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [4, 34], [0, 425], { ...clamp, easing: Easing.bezier(0.2, 0, 0, 1) }));
  return (
    <AbsoluteFill style={{ color: CREAM }}>
      <Ambient bg={INK} glow="#3d2a14" />
      <div style={{ position: "absolute", left: 72, right: 72, top: 330 }}>
        <Mask d={0} out={70}><div style={{ fontFamily: DISPLAY, fontSize: 330, lineHeight: 0.9, color: GOLD, fontVariantNumeric: "tabular-nums" }}>+{n}</div></Mask>
        <Mask d={6} out={71}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 96, lineHeight: 1 }}>productos en 7 rubros</div></Mask>
      </div>
      {/* lista que entra en cascada (stagger 3 f = 100 ms) */}
      <div style={{ position: "absolute", left: 72, right: 72, top: 820, display: "flex", flexWrap: "wrap", gap: 18 }}>
        {RUBROS.map((r, i) => {
          const p = interpolate(f, [18 + i * 3, 30 + i * 3], [0, 1], { ...clamp, easing: IN });
          const x = interpolate(f, [68, 76], [0, 1], { ...clamp, easing: EXIT });
          return <div key={r} style={{ padding: "18px 32px", borderRadius: 999, border: `2px solid rgba(241,232,218,.5)`, fontFamily: SANS, fontSize: 44, opacity: p * (1 - x), translate: `0 ${(1 - p) * 40 - x * 30}px` }}>{r}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// Cinta de envases recortados que se desliza (secundaria) con palabras grandes por encima.
const MIX = ["lyon-500-cc-cristal-studio", "body-125-cc-ambar", "frasco-vidrio-amanecer-250-cc", "body-125-flip-top-negra", "omega-500-cc-ambar-studio", "body-125-crema-premium-negra"];
const Mix: React.FC = () => {
  const f = useCurrentFrame();
  const slide = interpolate(f, [0, 72], [200, -700]);
  return (
    <AbsoluteFill style={{ color: INK }}>
      <Ambient bg={CREAM} glow="#f0c78c" />
      <div style={{ position: "absolute", left: 72, right: 72, top: 300 }}>
        <Mask d={0} out={64}><div style={{ fontFamily: DISPLAY, fontSize: 128, lineHeight: 0.95 }}>VIDRIO, PLÁSTICO,</div></Mask>
        <Mask d={4} out={65}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 140, lineHeight: 0.95, color: "#9a4f1d" }}>tapas, válvulas</div></Mask>
        <Mask d={8} out={66}><div style={{ fontFamily: DISPLAY, fontSize: 128, lineHeight: 0.95 }}>Y ESENCIAS</div></Mask>
      </div>
      <div style={{ position: "absolute", left: 0, top: 880, height: 520, display: "flex", alignItems: "flex-end", gap: 60, translate: `${slide}px 0`, opacity: interpolate(f, [0, 8, 64, 72], [0, 1, 1, 0], clamp) }}>
        {[...MIX, ...MIX].map((m, i) => <Img key={i} src={staticFile(`cut/${m}.png`)} style={{ height: m.includes("amanecer") ? 300 : 480, filter: "drop-shadow(0 24px 20px rgba(60,35,15,.25))" }} />)}
      </div>
    </AbsoluteFill>
  );
};

const Quien: React.FC = () => {
  const f = useCurrentFrame();
  const card = (d: number) => interpolate(f, [d, d + 14], [0, 1], { ...clamp, easing: IN });
  const x = interpolate(f, [70, 78], [0, 1], { ...clamp, easing: EXIT });
  const Card: React.FC<{ d: number; k: string; t: string; s: string; dark?: boolean }> = ({ d, k, t, s, dark }) => (
    <div style={{ flex: 1, padding: "44px 40px", borderRadius: 40, background: dark ? INK : "rgba(255,255,255,.6)", color: dark ? CREAM : INK, translate: `0 ${(1 - card(d)) * 80 - x * 60}px`, opacity: card(d) * (1 - x), boxShadow: "0 30px 60px rgba(60,35,15,.15)" }}>
      <div style={{ fontFamily: SANS, fontSize: 32, letterSpacing: 4, color: dark ? GOLD : "#9a4f1d", fontWeight: 700 }}>{k}</div>
      <div style={{ fontFamily: DISPLAY, fontSize: 96, lineHeight: 1, marginTop: 14 }}>{t}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 52, lineHeight: 1.1, marginTop: 16 }}>{s}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ color: INK }}>
      <Ambient bg={SAND} glow="#f5c98a" />
      <div style={{ position: "absolute", left: 72, right: 72, top: 330 }}>
        <Mask d={0} out={70}><div style={{ fontFamily: SANS, fontSize: 44, letterSpacing: 6 }}>PARA</div></Mask>
        <Mask d={3} out={71}><div style={{ fontFamily: DISPLAY, fontSize: 138, lineHeight: 0.95 }}>EMPRENDEDORES</div></Mask>
        <Mask d={6} out={72}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 150, lineHeight: 0.95, color: "#9a4f1d" }}>y marcas</div></Mask>
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 900, display: "flex", gap: 24 }}>
        <Card d={14} k="MINORISTA" t="1 unidad" s="para arrancar" />
        <Card d={20} k="MAYORISTA" t="volumen" s="precio por cantidad" dark />
      </div>
    </AbsoluteFill>
  );
};

// Chat de WhatsApp ilustrativo: muestra el tipo de consulta, no es un testimonio.
const Ase: React.FC = () => {
  const f = useCurrentFrame();
  const b1 = spring({ frame: f - 14, fps: 30, config: { damping: 18 } });
  const typing = f >= 30 && f < 44;
  const b2 = spring({ frame: f - 44, fps: 30, config: { damping: 18 } });
  const x = interpolate(f, [64, 72], [0, 1], { ...clamp, easing: EXIT });
  const bubble: React.CSSProperties = { maxWidth: 760, padding: "28px 36px", borderRadius: 36, fontFamily: SANS, fontSize: 46, lineHeight: 1.2 };
  return (
    <AbsoluteFill style={{ color: CREAM }}>
      <Ambient bg="#0f2a24" glow="#1f6b55" />
      <div style={{ position: "absolute", left: 72, right: 72, top: 330 }}>
        <Mask d={0} out={64}><div style={{ fontFamily: DISPLAY, fontSize: 140, lineHeight: 0.95 }}>TE ASESORAMOS</div></Mask>
        <Mask d={4} out={65}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 140, lineHeight: 0.95, color: "#7ee0b4" }}>por WhatsApp</div></Mask>
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 820, display: "flex", flexDirection: "column", gap: 26, opacity: 1 - x, translate: `0 ${-x * 40}px` }}>
        <div style={{ ...bubble, alignSelf: "flex-end", background: "#d9fdd3", color: "#0f2a24", borderBottomRightRadius: 8, scale: String(b1), opacity: b1, transformOrigin: "right bottom" }}>¿Qué tapa le va a este frasco?</div>
        {typing ? (
          <div style={{ ...bubble, alignSelf: "flex-start", background: CREAM, color: INK, display: "flex", gap: 12 }}>
            {[0, 1, 2].map((i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: INK, opacity: 0.35 + 0.65 * Math.abs(Math.sin((f + i * 4) / 5)) }} />)}
          </div>
        ) : null}
        <div style={{ ...bubble, alignSelf: "flex-start", background: CREAM, color: INK, borderBottomLeftRadius: 8, scale: String(b2), opacity: b2, transformOrigin: "left bottom" }}>Mandanos foto y te pasamos las opciones que van 👌</div>
      </div>
    </AbsoluteFill>
  );
};

const Fin: React.FC = () => {
  const f = useCurrentFrame();
  const logo = spring({ frame: f - 4, fps: 30, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ color: CREAM, fontFamily: SANS }}>
      <Ambient bg={INK} glow="#5a3415" />
      <Img src={staticFile("logo-3g.png")} style={{ position: "absolute", left: 540 - 110, top: 360, width: 220, height: 220, scale: String(0.8 + logo * 0.2), opacity: logo }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center" }}>
        <Mask d={8}><div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1 }}>ENVASES 3G</div></Mask>
        <Mask d={12}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 84, color: GOLD }}>todo para tu emprendimiento</div></Mask>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1010, textAlign: "center", opacity: interpolate(f, [20, 32], [0, 1], { ...clamp, easing: IN }), translate: `0 ${interpolate(f, [20, 32], [20, 0], { ...clamp, easing: IN })}px` }}>
        <div style={{ fontSize: 40 }}>Moreno 4156 · Mar del Plata · envíos</div>
        <div style={{ fontSize: 36, marginTop: 14, opacity: 0.75 }}>Lun a vie 9–15 h · Sáb 9–13 h</div>
        <div style={{ display: "inline-block", marginTop: 36, padding: "24px 48px", borderRadius: 999, background: GOLD, color: INK, fontWeight: 700, fontSize: 48 }}>WhatsApp 223 598-4362</div>
        <div style={{ fontSize: 36, marginTop: 26, fontWeight: 700 }}>@envases3gmdq</div>
      </div>
    </AbsoluteFill>
  );
};

export const QuienesSomos: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Sequence durationInFrames={S.mdp}><Hola /></Sequence>
    <Sequence from={S.mdp} durationInFrames={S.cat - S.mdp}><Mdp /></Sequence>
    <Sequence from={S.cat} durationInFrames={S.mix - S.cat}><Cat /></Sequence>
    <Sequence from={S.mix} durationInFrames={S.quien - S.mix} premountFor={20}><Mix /></Sequence>
    <Sequence from={S.quien} durationInFrames={S.ase - S.quien}><Quien /></Sequence>
    <Sequence from={S.ase} durationInFrames={S.fin - S.ase}><Ase /></Sequence>
    <Sequence from={S.fin}><Fin /></Sequence>
    <Grain opacity={0.07} />
    <Audio src={staticFile("audio/quienes.wav")} />
  </AbsoluteFill>
);
