import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, clamp, foto, Kinetic, Outro, SANS, SERIF } from "./kit";

const OUT_EASE = Easing.bezier(0.16, 1, 0.3, 1);

// ======================= VIDRIO LÍQUIDO =======================
// Tendencia 2026 "liquid glass": paneles translúcidos con desenfoque y reflejo sobre manchas de color en movimiento.
const COLORS = [
  { name: "Ámbar", sub: "protege de la luz", price: 468, img: "body-125-cc-ambar", tint: "#c26a1b" },
  { name: "Blanco", sub: "opaco y prolijo", price: 468, img: "body-125-cc-blanco", tint: "#9fb3b6" },
  { name: "Cristal", sub: "se ve el producto", price: 435, img: "body-125-cc-cristal", tint: C.teal },
];
const G0 = 60, GS = 80;
export const liquidDuration = G0 + COLORS.length * GS + 60 + 75;

const Glass: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", borderRadius: 48, background: "linear-gradient(135deg, rgba(255,255,255,.22), rgba(4,22,25,.38))", backdropFilter: "blur(28px) saturate(1.6)", border: "2px solid rgba(255,255,255,.55)", boxShadow: "0 30px 80px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.7)", overflow: "hidden", ...style }}>
    {/* reflejo diagonal */}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,.35) 45%, transparent 60%)" }} />
    {children}
  </div>
);

const Blobs: React.FC<{ tint: string }> = ({ tint }) => {
  const frame = useCurrentFrame();
  const b = (x: number, y: number, s: number, c: string, sp: number) => (
    <div style={{ position: "absolute", left: x + Math.sin(frame / sp) * 120, top: y + Math.cos(frame / (sp * 1.3)) * 140, width: s, height: s, borderRadius: "50%", background: c, filter: "blur(110px)", opacity: .85 }} />
  );
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {b(-150, 250, 700, tint, 22)}
      {b(500, 900, 650, C.sun, 28)}
      {b(100, 1250, 600, C.teal, 18)}
      {b(600, 200, 450, "#ff7a59", 25)}
    </AbsoluteFill>
  );
};

export const Liquid: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.max(0, Math.min(COLORS.length - 1, Math.floor((frame - G0) / GS)));
  const c = COLORS[i];
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Blobs tint={frame < G0 ? C.teal : c.tint} />
      <Sequence durationInFrames={G0}>
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 72px" }}>
          <Kinetic text="El mismo envase en *3 colores*" size={136} color={C.white} accent={C.sun} delay={3} stagger={4} />
        </AbsoluteFill>
      </Sequence>
      {COLORS.map((col, k) => (
        <Sequence key={col.name} from={G0 + k * GS} durationInFrames={GS} premountFor={30}>
          <ColorScene c={col} k={k} />
        </Sequence>
      ))}
      <Sequence from={G0 + COLORS.length * GS} durationInFrames={60}>
        <AbsoluteFill>
          {COLORS.map((col, k) => {
            const p = spring({ frame: frame - (G0 + COLORS.length * GS) - k * 5, fps: 30, config: { damping: 13 } });
            return (
              <Glass key={col.name} style={{ left: 60 + k * 330, top: 520, width: 300, height: 560, scale: String(p), opacity: p, borderRadius: 36 }}>
                <Img src={foto(col.img)} style={{ position: "absolute", inset: 18, width: 264, height: 400, objectFit: "cover", borderRadius: 24 }} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", color: C.white, fontSize: 40, fontWeight: 700 }}>{col.name}</div>
              </Glass>
            );
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: 1160, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: C.white }}>Body 125 cc · rosca 20/410</div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={G0 + COLORS.length * GS + 60}><Outro text="¿Cuál elegís *vos?*" bg={C.night} ink={C.white} /></Sequence>
      {frame < G0 + COLORS.length * GS + 60 ? <div style={{ position: "absolute", top: 200, left: 72, fontWeight: 700, fontSize: 32, color: C.white }}>envases 3g</div> : null}
      <Audio src={staticFile("audio/liquid.wav")} />
    </AbsoluteFill>
  );
};

const ColorScene: React.FC<{ c: (typeof COLORS)[number]; k: number }> = ({ c, k }) => {
  const frame = useCurrentFrame();
  const photo = interpolate(frame, [0, 16], [0, 1], { ...clamp, easing: OUT_EASE });
  const glass = interpolate(frame, [8, 24], [0, 1], { ...clamp, easing: OUT_EASE });
  const out = interpolate(frame, [GS - 6, GS], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Img src={foto(c.img)} style={{ position: "absolute", left: 150, top: 330, width: 780, height: 1000, objectFit: "cover", borderRadius: 60, scale: String(1.1 - photo * 0.1), opacity: photo, boxShadow: "0 40px 100px rgba(0,0,0,.45)" }} />
      {/* Panel de vidrio que entra deslizando sobre la foto */}
      <Glass style={{ left: 90, right: 90, top: 1060, height: 360, translate: `0 ${(1 - glass) * 300}px`, opacity: glass }}>
        <div style={{ position: "absolute", left: 50, top: 44, color: C.white }}>
          <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.85 }}>0{k + 1} / 03 · Body 125 cc</div>
          <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: -5, lineHeight: 1.05 }}>{c.name}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50 }}>{c.sub}</div>
        </div>
        <div style={{ position: "absolute", right: 46, top: 50, padding: "16px 30px", borderRadius: 999, background: C.sun, color: C.night, fontSize: 52, fontWeight: 700 }}>${c.price}</div>
      </Glass>
    </AbsoluteFill>
  );
};

// ======================= BENTO =======================
// Tendencia "bento grid": mosaico de tarjetas que se arma y luego resalta cada una al ritmo.
const TILES = [
  { x: 0, y: 0, w: 2, h: 2, kind: "photo", img: "heaven-100-cc-ambar-con-tapa-difusora" },
  { x: 2, y: 0, w: 1, h: 1, kind: "stat", big: "425", small: "productos", bg: C.sun, ink: C.night },
  { x: 2, y: 1, w: 1, h: 1, kind: "stat", big: "7", small: "rubros", bg: C.teal, ink: C.white },
  { x: 0, y: 2, w: 1, h: 1, kind: "stat", big: "desde 1", small: "unidad", bg: C.white, ink: C.night },
  { x: 1, y: 2, w: 2, h: 1, kind: "stat", big: "$373", small: "pote 5 cc para muestras", bg: C.night, ink: C.sun },
  { x: 0, y: 3, w: 2, h: 1, kind: "stat", big: "Minorista\ny mayorista", small: "", bg: "#ff7a59", ink: C.night },
  { x: 2, y: 3, w: 1, h: 1, kind: "photo", img: "pote-cristal-5-cc-con-tapa-a-presion" },
  { x: 0, y: 4, w: 3, h: 1, kind: "stat", big: "Moreno 4156 · Mar del Plata", small: "retirás o te lo enviamos", bg: C.deep, ink: C.white },
] as const;
const BX = 60, BY = 300, CELL = 312, ROWH = 224, GAP = 16;
export const bentoDuration = 80 + TILES.length * 18 + 30 + 75;

export const Bento: React.FC = () => {
  const frame = useCurrentFrame();
  const build = 40; // a partir de acá entran las tarjetas
  const hlStart = 80;
  const hl = Math.floor((frame - hlStart) / 18);
  return (
    <AbsoluteFill style={{ background: "#e9ece9", fontFamily: SANS }}>
      <Sequence durationInFrames={hlStart + TILES.length * 18 + 30}>
        <AbsoluteFill>
          {TILES.map((t, k) => {
            const p = spring({ frame: frame - build - k * 3, fps: 30, config: { damping: 14 } });
            const active = hl === k;
            const lift = active ? spring({ frame: frame - hlStart - k * 18, fps: 30, config: { damping: 10 } }) : 0;
            const W = t.w * CELL + (t.w - 1) * GAP, H = t.h * ROWH + (t.h - 1) * GAP;
            return (
              <div key={k} style={{ position: "absolute", left: BX + t.x * (CELL + GAP), top: BY + t.y * (ROWH + GAP), width: W, height: H, borderRadius: 34, overflow: "hidden", background: t.kind === "stat" ? t.bg : "#fff", boxShadow: active ? "0 30px 60px rgba(4,22,25,.28)" : "0 8px 20px rgba(4,22,25,.08)", scale: String(interpolate(p, [0, 1], [0.6, 1]) * (1 + lift * 0.05)), opacity: p, zIndex: active ? 5 : 1, filter: hl >= 0 && hl < TILES.length && !active ? "saturate(.6) brightness(.92)" : "none" }}>
                {t.kind === "photo" ? (
                  <Img src={foto(t.img)} style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(1 + lift * 0.08) }} />
                ) : (
                  <div style={{ position: "absolute", left: 30, right: 24, bottom: 26, color: t.ink }}>
                    <div style={{ fontSize: t.big.length > 12 ? 52 : t.big.length > 6 ? 70 : 110, fontWeight: 700, letterSpacing: -3, lineHeight: 0.95, whiteSpace: "pre-line" }}>{t.big}</div>
                    {t.small ? <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 36, marginTop: 6 }}>{t.small}</div> : null}
                  </div>
                )}
              </div>
            );
          })}
          {/* Título antes del mosaico */}
          <div style={{ position: "absolute", left: 72, right: 72, top: 820, opacity: interpolate(frame, [build - 4, build + 6], [1, 0], clamp) }}>
            <Kinetic text="Envases 3G en *10 segundos*" size={130} color={C.night} accent={C.deep} delay={0} stagger={3} />
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={hlStart + TILES.length * 18 + 30}><Outro text="Guardá este post y *escribinos*" /></Sequence>
      {frame < hlStart + TILES.length * 18 + 30 ? <div style={{ position: "absolute", top: 200, left: 72, fontWeight: 700, fontSize: 32, color: C.night, zIndex: 10 }}>envases 3g</div> : null}
      <Audio src={staticFile("audio/bento.wav")} />
    </AbsoluteFill>
  );
};
