import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { clamp, Grain, money, SANS, SERIF } from "./kit";

// Tendencia "texto detrás del objeto": palabra gigante y el envase recortado por delante,
// cortes al ritmo, fondos en tonos tierra y grano de película. Precios del catálogo.
const DISPLAY = "Anton";
loadFont({ family: DISPLAY, url: staticFile("fonts/Anton-Regular.ttf") });
const OUT = Easing.bezier(0.16, 1, 0.3, 1);

const SCENES = [
  { word: "ÁMBAR", img: "body-125-cc-ambar", name: "Body 125 cc ámbar", price: 468, bg: "#e8d9c3", ink: "#3a1d0c", h: 860 },
  { word: "CRISTAL", img: "lyon-500-cc-cristal-studio", name: "Lyon 500 cc cristal", price: 630, bg: "#cdd6c4", ink: "#1b281c", h: 960 },
  { word: "NEGRO", img: "body-125-flip-top-negra", name: "Body 125 cc + flip top negra", price: 687, bg: "#d8d2c8", ink: "#121212", h: 980 },
  { word: "VIDRIO", img: "frasco-vidrio-amanecer-250-cc", name: "Frasco Amanecer 250 cc", price: 633, bg: "#c6d9dc", ink: "#06292e", h: 720 },
  { word: "CREMA", img: "body-125-crema-premium-negra", name: "Body 125 cc + crema premium", price: 1526, bg: "#dcbca4", ink: "#3b1a0c", h: 900 },
  { word: "XL", img: "omega-500-cc-ambar-studio", name: "Omega 500 cc ámbar", price: 933, bg: "#e7cba2", ink: "#3a2208", h: 980 },
];
const INTRO = 36, S = 40, OUTRO = 72;
export const detrasDuration = INTRO + SCENES.length * S + OUTRO;

const Word: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const f = useCurrentFrame();
  const size = text.length <= 2 ? 620 : text.length <= 5 ? 350 : text.length <= 6 ? 320 : 280;
  const drift = interpolate(f, [0, S], [24, -24]);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", translate: `${drift}px 0`, fontFamily: DISPLAY, fontSize: size, lineHeight: 1.0, color, letterSpacing: -4 }}>
      {text.split("").map((ch, i) => {
        const p = interpolate(f, [i * 1.5, i * 1.5 + 10], [0, 1], { ...clamp, easing: OUT });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", height: size * 1.25, paddingTop: size * 0.13 }}>
            <span style={{ display: "inline-block", translate: `0 ${(1 - p) * 105}%` }}>{ch}</span>
          </span>
        );
      })}
    </div>
  );
};

const Scene: React.FC<{ s: (typeof SCENES)[number]; i: number }> = ({ s, i }) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - 3, fps: 30, config: { damping: 15, stiffness: 140 } });
  const blur = interpolate(f, [3, 9], [14, 0], clamp);
  const push = interpolate(f, [0, S], [1, 1.06]);
  const flash = interpolate(f, [0, 4], [0.55, 0], clamp);
  const meta = interpolate(f, [10, 20], [0, 1], { ...clamp, easing: OUT });
  const bottom = 1430;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, ${s.bg} 0%, ${s.bg} 45%, color-mix(in srgb, ${s.bg} 80%, #000) 100%)`, overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: String(push) }}>
        <Word text={s.word} color={s.ink} />
        {/* sombra de contacto */}
        <div style={{ position: "absolute", left: 540 - 260, width: 520, top: bottom - 30, height: 60, borderRadius: "50%", background: `radial-gradient(ellipse, color-mix(in srgb, ${s.ink} 45%, transparent), transparent 70%)`, opacity: p, scale: `${0.6 + p * 0.4} 1` }} />
        <Img
          src={staticFile(`cut/${s.img}.png`)}
          style={{ position: "absolute", left: "50%", top: bottom - s.h, height: s.h, translate: `-50% ${(1 - p) * 420}px`, rotate: `${(1 - p) * (i % 2 ? 8 : -8)}deg`, filter: `blur(${blur}px) drop-shadow(0 30px 40px rgba(0,0,0,.18))`, transformOrigin: "50% 100%" }}
        />
      </AbsoluteFill>
      {/* datos */}
      <div style={{ position: "absolute", left: 64, right: 64, top: 1452, display: "flex", justifyContent: "space-between", alignItems: "center", color: s.ink, fontFamily: SANS, opacity: meta, translate: `0 ${(1 - meta) * 20}px` }}>
        <div style={{ fontSize: 34, maxWidth: 640, lineHeight: 1.15 }}><span style={{ fontWeight: 700 }}>0{i + 1}</span>&nbsp;&nbsp;{s.name}</div>
        <div style={{ padding: "12px 28px", borderRadius: 999, border: `3px solid ${s.ink}`, fontWeight: 700, fontSize: 40 }}>{money(s.price)}</div>
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [2, 12], [0, 1], { ...clamp, easing: OUT });
  const b = interpolate(f, [8, 18], [0, 1], { ...clamp, easing: OUT });
  return (
    <AbsoluteFill style={{ background: "#14110e", justifyContent: "center", alignItems: "center", color: "#efe6d8" }}>
      <div style={{ overflow: "hidden" }}><div style={{ fontFamily: DISPLAY, fontSize: 210, lineHeight: 1, translate: `0 ${(1 - a) * 100}%` }}>ENVASES QUE</div></div>
      <div style={{ overflow: "hidden" }}><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 200, lineHeight: 1.05, translate: `0 ${(1 - b) * 100}%`, color: "#e3b26b" }}>venden solos</div></div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: OUT });
  return (
    <AbsoluteFill style={{ background: "#14110e", color: "#efe6d8", fontFamily: SANS }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center" }}>
        <div style={{ overflow: "hidden" }}><div style={{ fontFamily: DISPLAY, fontSize: 170, lineHeight: 1, translate: `0 ${(1 - t) * 100}%` }}>¿CUÁL ES EL TUYO?</div></div>
      </div>
      {/* fila de envases */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 640, height: 520, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6 }}>
        {SCENES.map((s, k) => {
          const p = spring({ frame: f - 6 - k * 3, fps: 30, config: { damping: 13 } });
          return <Img key={s.img} src={staticFile(`cut/${s.img}.png`)} style={{ height: s.h * 0.5, maxWidth: 150, objectFit: "contain", translate: `0 ${(1 - p) * 300}px`, opacity: p }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1230, textAlign: "center", opacity: interpolate(f, [22, 32], [0, 1], clamp) }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: "#e3b26b" }}>precios en la web · link en bio</div>
        <div style={{ fontSize: 34, marginTop: 18, opacity: 0.75 }}>envases 3g · Moreno 4156 · Mar del Plata</div>
      </div>
    </AbsoluteFill>
  );
};

export const Detras: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#14110e" }}>
      <Sequence durationInFrames={INTRO}><Intro /></Sequence>
      {SCENES.map((s, i) => (
        <Sequence key={s.img} from={INTRO + i * S} durationInFrames={S} premountFor={20}><Scene s={s} i={i} /></Sequence>
      ))}
      <Sequence from={INTRO + SCENES.length * S}><Outro /></Sequence>
      {f >= INTRO && f < INTRO + SCENES.length * S ? (
        <div style={{ position: "absolute", top: 210, left: 64, right: 64, display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 30, color: SCENES[Math.floor((f - INTRO) / S)].ink }}>
          <span style={{ fontWeight: 700 }}>envases 3g</span><span>vidrio & pet · 2026</span>
        </div>
      ) : null}
      <Grain opacity={0.07} />
      <Audio src={staticFile("audio/detras.wav")} />
    </AbsoluteFill>
  );
};
