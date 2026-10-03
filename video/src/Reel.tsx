import { loadFont } from "@remotion/fonts";
import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Estética: ver ../../marketing/ESTILO.md. Ritmo a 120 BPM (1 tiempo = 15 frames a 30 fps).
const C = { night: "#041619", teal: "#22b5c1", deep: "#0a7682", soft: "#b9e8ec", sun: "#f7df2e", white: "#ffffff" };
const SANS = "Bricolage";
const SERIF = "InstrumentSerif";
loadFont({ family: SANS, url: staticFile("fonts/BricolageGrotesque-Bold.ttf"), weight: "700" });
loadFont({ family: SANS, url: staticFile("fonts/BricolageGrotesque-Regular.ttf"), weight: "400" });
loadFont({ family: SERIF, url: staticFile("fonts/InstrumentSerif-Italic.ttf"), style: "italic" });

export const BEAT = 15;
export const HOOK = 4 * BEAT;
export const SCENE = 4 * BEAT;
export const CTA = 5 * BEAT;

export type ReelProps = {
  hook: string;
  hookSub: string;
  slides: { title: string; text: string; price: number | null; photo: string }[];
  cta: string;
  music: string;
};

export const reelDuration = (p: ReelProps) => HOOK + p.slides.length * SCENE + CTA;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const money = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");

// Texto animado palabra por palabra: cada palabra sube con resorte y se desenfoca al entrar.
// La última palabra va en serif itálica con el color de acento.
const Kinetic: React.FC<{ text: string; size: number; color: string; accent: string; delay?: number; stagger?: number; align?: "left" | "center" }> = ({ text, size, color, accent, delay = 0, stagger = 3, align = "left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", columnGap: size * 0.24, rowGap: 0, lineHeight: 0.98 }}>
      {words.map((w, i) => {
        const s = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 14, stiffness: 180, mass: 0.6 } });
        const last = i === words.length - 1 && words.length > 1 && w.length > 3;
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.12 }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: last ? SERIF : SANS,
                fontStyle: last ? "italic" : "normal",
                fontWeight: last ? 400 : 700,
                fontSize: last ? size * 1.12 : size,
                letterSpacing: last ? 0 : -size * 0.04,
                color: last ? accent : color,
                translate: `0 ${interpolate(s, [0, 1], [size * 1.1, 0])}px`,
                rotate: `${interpolate(s, [0, 1], [8, 0])}deg`,
                filter: `blur(${interpolate(s, [0, 1], [10, 0])}px)`,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Fondo: la misma foto muy desenfocada y oscurecida, con manchas de color de marca que se mueven.
const Backdrop: React.FC<{ photo: string; tint?: string }> = ({ photo, tint = C.night }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: tint }}>
      <Img src={staticFile(photo)} style={{ position: "absolute", inset: -120, width: "calc(100% + 240px)", height: "calc(100% + 240px)", objectFit: "cover", filter: "blur(70px) brightness(0.55) saturate(1.3)", scale: String(1.1 + frame * 0.001) }} />
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", background: C.teal, opacity: 0.28, filter: "blur(120px)", left: -300 + Math.sin(frame / 25) * 80, top: 200 + Math.cos(frame / 30) * 60 }} />
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: C.sun, opacity: 0.12, filter: "blur(120px)", right: -260 + Math.cos(frame / 22) * 60, bottom: 260 }} />
    </AbsoluteFill>
  );
};

// Transición: entra con zoom y desenfoque (6 frames), sale acelerando hacia la cámara (5 frames).
const useCutIn = (dur: number) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 6], [1, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const exit = interpolate(frame, [dur - 5, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return { scale: 1 + enter * 0.35 + exit * 0.25, blur: enter * 22 + exit * 18, opacity: 1 - enter * 0.4 };
};

const Brand: React.FC<{ color?: string; index?: string }> = ({ color = C.white, index }) => (
  <div style={{ position: "absolute", top: 210, left: 72, right: 72, display: "flex", justifyContent: "space-between", fontFamily: SANS, fontWeight: 700, fontSize: 34, color, letterSpacing: -0.5 }}>
    <span>envases 3g</span>
    {index ? <span style={{ fontWeight: 400, opacity: 0.85 }}>{index}</span> : null}
  </div>
);

const Hook: React.FC<{ text: string; sub: string; photo: string }> = ({ text, sub, photo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 4, fps, config: { damping: 11, stiffness: 140 } });
  const t = useCutIn(HOOK);
  return (
    <AbsoluteFill style={{ scale: String(t.scale), filter: `blur(${t.blur}px)` }}>
      <Backdrop photo={photo} />
      <Brand />
      {/* Producto como sticker circular con borde blanco, flotando */}
      <div style={{ position: "absolute", top: 380, right: 70, width: 560, height: 560, borderRadius: "50%", border: "18px solid white", overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,.45)", scale: String(interpolate(pop, [0, 1], [0.3, 1])), rotate: `${interpolate(pop, [0, 1], [-30, 8]) + Math.sin(frame / 9) * 2}deg`, translate: `0 ${Math.sin(frame / 12) * 14}px` }}>
        <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 1020 }}>
        <Kinetic text={text} size={132} color={C.white} accent={C.sun} delay={2} stagger={4} />
      </div>
      <div style={{ position: "absolute", left: 72, bottom: 470, fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.soft, opacity: interpolate(frame, [22, 30], [0, 1], clamp), translate: `${interpolate(frame, [22, 30], [-30, 0], clamp)}px 0` }}>
        {sub} →
      </div>
    </AbsoluteFill>
  );
};

const Product: React.FC<{ s: ReelProps["slides"][number]; index: string }> = ({ s, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = useCutIn(SCENE);
  // Golpe de zoom en cada tiempo de la música.
  const beatPulse = Math.exp(-((frame % BEAT) / 4)) * 0.025;
  const card = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const tag = spring({ frame: frame - 12, fps, config: { damping: 9, stiffness: 160 } });
  const count = s.price ? interpolate(frame, [12, 28], [0, s.price], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  return (
    <AbsoluteFill style={{ scale: String(t.scale + beatPulse), filter: `blur(${t.blur}px)` }}>
      <Backdrop photo={s.photo} />
      <Brand index={index} />
      {/* Foto nítida en tarjeta flotante con leve giro 3D */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 300, height: 1140, borderRadius: 56, overflow: "hidden", boxShadow: "0 60px 120px rgba(0,0,0,.5)", transform: `perspective(1800px) rotateY(${interpolate(frame, [0, SCENE], [7, -5])}deg) rotateX(${interpolate(frame, [0, SCENE], [3, -2])}deg)`, translate: `0 ${interpolate(card, [0, 1], [180, 0])}px`, scale: String(interpolate(frame, [0, SCENE], [1.0, 1.04])) }}>
        <Img src={staticFile(s.photo)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.06) saturate(1.08)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,22,25,0) 55%, rgba(4,22,25,.55) 100%)" }} />
      </div>
      {s.price ? (
        <div style={{ position: "absolute", right: 60, top: 1180, padding: "22px 40px", borderRadius: 999, background: C.sun, color: C.night, fontFamily: SANS, fontWeight: 700, fontSize: 52, letterSpacing: -1, boxShadow: "0 20px 50px rgba(0,0,0,.35)", scale: String(interpolate(tag, [0, 1], [0, 1])), rotate: `${interpolate(tag, [0, 1], [-40, -7])}deg` }}>
          desde {money(count)}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 72, right: 72, top: 1300 }}>
        <Kinetic text={s.title} size={104} color={C.white} accent={C.sun} delay={4} stagger={3} />
        <div style={{ marginTop: 18, fontFamily: SANS, fontSize: 38, color: "#e6f4f5", opacity: interpolate(frame, [16, 24], [0, 1], clamp), translate: `0 ${interpolate(frame, [16, 24], [20, 0], clamp)}px` }}>{s.text}</div>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<{ text: string; photo: string }> = ({ text, photo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = interpolate(frame, [0, 7], [1, 0], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const chip = spring({ frame: frame - 14, fps, config: { damping: 12 } });
  const logo = spring({ frame: frame - 20, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: C.teal, clipPath: `circle(${interpolate(enter, [0, 1], [150, 0])}% at 50% 50%)` }}>
      <Brand color={C.night} />
      <div style={{ position: "absolute", left: 72, right: 72, top: 600 }}>
        <Kinetic text={text} size={128} color={C.night} accent={C.white} delay={3} stagger={4} />
      </div>
      <div style={{ position: "absolute", left: 72, top: 1010, display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ fontFamily: SANS, fontSize: 40, color: C.night, opacity: interpolate(frame, [12, 20], [0, 1], clamp) }}>Moreno 4156 · Mar del Plata · envíos</div>
        <div style={{ alignSelf: "flex-start", padding: "26px 46px", borderRadius: 999, background: C.night, color: C.white, fontFamily: SANS, fontWeight: 700, fontSize: 50, translate: `${interpolate(chip, [0, 1], [-700, 0])}px 0` }}>WhatsApp 223 598-4362</div>
      </div>
      <div style={{ position: "absolute", right: 70, top: 1220, width: 330, height: 330, borderRadius: "50%", border: "16px solid white", overflow: "hidden", rotate: `${-10 + Math.sin(frame / 10) * 3}deg`, scale: String(logo) }}>
        <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <Img src={staticFile("logo-3g.png")} style={{ position: "absolute", left: 72, bottom: 420, height: 130, scale: String(logo) }} />
      <div style={{ position: "absolute", right: 72, bottom: 450, fontFamily: SANS, fontWeight: 700, fontSize: 36, color: C.night, opacity: interpolate(frame, [30, 38], [0, 1], clamp) }}>guardalo para después ↗</div>
    </AbsoluteFill>
  );
};

// Capas finales: destello en cada corte, barra de progreso, viñeta y grano de película.
const Overlays: React.FC<{ cuts: number[] }> = ({ cuts }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const flash = Math.max(0, ...cuts.map((c) => interpolate(frame, [c, c + 4], [0.55, 0], clamp) * (frame >= c ? 1 : 0)));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "white", opacity: flash, mixBlendMode: "overlay" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.35) 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.09, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(random(frame) * 1000)} /></filter>
          <rect width="100%" height="100%" filter="url(#g)" />
        </svg>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 150, left: 72, right: 72, height: 6, borderRadius: 3, background: "rgba(255,255,255,.25)" }}>
        <div style={{ width: `${(frame / (durationInFrames - 1)) * 100}%`, height: "100%", borderRadius: 3, background: C.sun }} />
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = (p) => {
  const { fps } = useVideoConfig();
  const cuts = [HOOK, ...p.slides.map((_, i) => HOOK + (i + 1) * SCENE)];
  const total = String(p.slides.length + 2).padStart(2, "0");
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Sequence durationInFrames={HOOK} premountFor={fps}>
        <Hook text={p.hook} sub={p.hookSub} photo={p.slides[0].photo} />
      </Sequence>
      {p.slides.map((s, i) => (
        <Sequence key={i} from={HOOK + i * SCENE} durationInFrames={SCENE} premountFor={fps}>
          <Product s={s} index={`${String(i + 2).padStart(2, "0")}/${total}`} />
        </Sequence>
      ))}
      <Sequence from={HOOK + p.slides.length * SCENE} durationInFrames={CTA} premountFor={fps}>
        <Cta text={p.cta} photo={p.slides[1]?.photo ?? p.slides[0].photo} />
      </Sequence>
      <Overlays cuts={cuts} />
      <Audio src={staticFile(p.music)} />
    </AbsoluteFill>
  );
};
