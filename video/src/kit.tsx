import { loadFont } from "@remotion/fonts";
import React from "react";
import { Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Piezas compartidas por los videos: colores de marca, fuentes y animaciones de texto.
export const C = { night: "#041619", teal: "#22b5c1", deep: "#0a7682", soft: "#b9e8ec", sun: "#f7df2e", white: "#ffffff", paper: "#f6fbfb", red: "#ff4d4d", green: "#2fd37a", bg: "#edece8", ink: "#0f1a1c", muted: "#7a8789" };
export const SANS = "Bricolage";
export const SERIF = "InstrumentSerif";
loadFont({ family: SANS, url: staticFile("fonts/BricolageGrotesque-Bold.ttf"), weight: "700" });
loadFont({ family: SANS, url: staticFile("fonts/BricolageGrotesque-Regular.ttf"), weight: "400" });
loadFont({ family: SERIF, url: staticFile("fonts/InstrumentSerif-Italic.ttf"), style: "italic" });

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const money = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");
export const foto = (s: string) => staticFile(`fotos/${s}.webp`);

export const usePop = (delay = 0, damping = 13, stiffness = 170) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness, mass: 0.7 } });
};

// Texto palabra por palabra; *palabra* va en serif itálica con color de acento.
export const Kinetic: React.FC<{ text: string; size: number; color: string; accent: string; delay?: number; stagger?: number; align?: "left" | "center" }> = ({ text, size, color, accent, delay = 0, stagger = 3, align = "left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", columnGap: size * 0.24, lineHeight: 0.98, alignItems: "baseline" }}>
      {text.split(" ").map((w, i) => {
        const s = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 14, stiffness: 180, mass: 0.6 } });
        const acc = w.startsWith("*");
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.14 }}>
            <span style={{ display: "inline-block", fontFamily: acc ? SERIF : SANS, fontStyle: acc ? "italic" : "normal", fontWeight: acc ? 400 : 700, fontSize: acc ? size * 1.12 : size, letterSpacing: acc ? 0 : -size * 0.04, color: acc ? accent : color, translate: `0 ${interpolate(s, [0, 1], [size * 1.1, 0])}px`, rotate: `${interpolate(s, [0, 1], [8, 0])}deg`, filter: `blur(${interpolate(s, [0, 1], [10, 0])}px)` }}>
              {w.replace(/\*/g, "")}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Número que cuenta hasta su valor.
export const Counter: React.FC<{ to: number; from?: number; start?: number; dur?: number; style?: React.CSSProperties; prefix?: string }> = ({ to, from = 0, start = 0, dur = 18, style, prefix = "$" }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [start, start + dur], [from, to], { ...clamp, easing: Easing.out(Easing.cubic) });
  return <span style={style}>{prefix}{Math.round(v).toLocaleString("es-AR")}</span>;
};

// Grano de película + viñeta, para que no se vea "plano".
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.08 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 50} /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
};

export const Progress: React.FC<{ color?: string; track?: string }> = ({ color = C.sun, track = "rgba(255,255,255,.25)" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 150, left: 72, right: 72, height: 6, borderRadius: 3, background: track }}>
      <div style={{ width: `${(frame / (durationInFrames - 1)) * 100}%`, height: "100%", borderRadius: 3, background: color }} />
    </div>
  );
};

export const Handle: React.FC<{ color?: string }> = ({ color = C.white }) => (
  <div style={{ position: "absolute", top: 200, left: 72, fontFamily: SANS, fontWeight: 700, fontSize: 36, color, zIndex: 5 }}>envases 3g</div>
);

// Cierre común: contacto y llamado a la acción.
export const Outro: React.FC<{ text: string; bg?: string; ink?: string }> = ({ text, bg = C.teal, ink = C.night }) => {
  const frame = useCurrentFrame();
  const chip = usePop(14, 12);
  const enter = interpolate(frame, [0, 8], [0, 150], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, clipPath: `circle(${enter}% at 50% 50%)`, fontFamily: SANS }}>
      <Handle color={ink} />
      <div style={{ position: "absolute", left: 72, right: 72, top: 700 }}>
        <Kinetic text={text} size={124} color={ink} accent={ink === C.white ? C.sun : C.white} delay={3} stagger={4} />
      </div>
      <div style={{ position: "absolute", left: 72, top: 1120, display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ fontSize: 40, color: ink, opacity: interpolate(frame, [12, 20], [0, 1], clamp) }}>Moreno 4156 · Mar del Plata · envíos</div>
        <div style={{ alignSelf: "flex-start", padding: "26px 46px", borderRadius: 999, background: ink, color: bg, fontWeight: 700, fontSize: 50, scale: String(interpolate(chip, [0, 1], [0.6, 1])), opacity: chip, transformOrigin: "left center" }}>WhatsApp 223 598-4362</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: ink, opacity: interpolate(frame, [28, 36], [0, 1], clamp) }}>guardalo para después ↗</div>
      </div>
    </div>
  );
};
