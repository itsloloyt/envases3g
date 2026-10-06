import { loadFont } from "@remotion/fonts";
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Explicativo sin persona, al estilo "UI animada + subtítulos grandes" (referencia de TikTok).
// Fondo gris claro, tarjetas blancas tipo app arriba, subtítulos de 2-3 palabras abajo.
const C = { bg: "#edece8", card: "#ffffff", ink: "#0f1a1c", muted: "#7a8789", line: "#e4e6e5", teal: "#22b5c1", deep: "#0a7682", sun: "#f7df2e", wa: "#25d366" };
const SANS = "Bricolage";
loadFont({ family: SANS, url: staticFile("fonts/BricolageGrotesque-Bold.ttf"), weight: "700" });
loadFont({ family: SANS, url: staticFile("fonts/BricolageGrotesque-Regular.ttf"), weight: "400" });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const f = (n: string) => staticFile(`fotos/${n}.webp`);

// Aparición con resorte, para usar en cualquier elemento.
const usePop = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 170, mass: 0.7 } });
};

const Card: React.FC<{ children: React.ReactNode; w?: number; delay?: number; style?: React.CSSProperties }> = ({ children, w = 900, delay = 0, style }) => {
  const p = usePop(delay, 16);
  return (
    <div style={{ width: w, background: C.card, borderRadius: 40, padding: 44, boxShadow: "0 30px 80px rgba(15,26,28,.10), 0 2px 6px rgba(15,26,28,.05)", opacity: p, scale: String(interpolate(p, [0, 1], [0.9, 1])), translate: `0 ${interpolate(p, [0, 1], [60, 0])}px`, fontFamily: SANS, color: C.ink, ...style }}>
      {children}
    </div>
  );
};

const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number }> = ({ children, bg = C.teal, color = "#fff", size = 30 }) => (
  <span style={{ display: "inline-block", padding: `${size * 0.35}px ${size * 0.8}px`, borderRadius: 999, background: bg, color, fontWeight: 700, fontSize: size }}>{children}</span>
);

const Photo: React.FC<{ src: string; size: number; round?: boolean; delay?: number }> = ({ src, size, round, delay = 0 }) => {
  const p = usePop(delay, 11);
  return <Img src={src} style={{ width: size, height: size, objectFit: "cover", borderRadius: round ? "50%" : 28, scale: String(p), boxShadow: "0 10px 30px rgba(0,0,0,.12)" }} />;
};

// ---------- Escenas (la parte de arriba) ----------

const S1: React.FC = () => {
  const items = [["Cosmética", "body-125-cc-ambar"], ["Velas", "tarro-370cc-blanco-con-tapa-a-presion"], ["Aromas", "esencias-para-difusor"]];
  return (
    <Card>
      <div style={{ fontSize: 34, color: C.muted, marginBottom: 30 }}>Tu emprendimiento</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {items.map(([t, s], i) => (
          <div key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <Photo src={f(s)} size={230} round delay={6 + i * 7} />
            <div style={{ fontSize: 38, fontWeight: 700 }}>{t}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const S2: React.FC = () => {
  const pin = usePop(14, 9);
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 40 }}>
      <Img src={staticFile("logo-3g.png")} style={{ width: 200, height: 200 }} />
      <div>
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2 }}>Envases 3G</div>
        <div style={{ fontSize: 34, color: C.muted, marginTop: 6 }}>Moreno 4156</div>
        <div style={{ marginTop: 18, scale: String(pin), transformOrigin: "left" }}><Pill>📍 Mar del Plata</Pill></div>
      </div>
    </Card>
  );
};

const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [8, 50], [0, 425], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const grid = ["heaven-100-cc-ambar-con-tapa-difusora", "acqua-200-ml-pet-cristal", "pote-cristal-5-cc-con-tapa-a-presion", "botella-bells-375cc-con-corcho", "frasco-vidrio-vial-veterinario-ambar-250cc", "pastillero-negro-100cc-con-tapa-a-rosca", "kit-para-viaje-por-5-unidades", "ampolla-pvc-10-cc-con-tapa-presion"];
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
        <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: -6, lineHeight: 1 }}>{n}</div>
        <div style={{ fontSize: 40, color: C.muted }}>productos</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 30 }}>
        {grid.map((s, i) => <Photo key={s} src={f(s)} size={190} delay={10 + i * 4} />)}
      </div>
    </Card>
  );
};

const S4: React.FC = () => {
  const rubros = [["🫙", "Vidrio"], ["🧴", "Plástico"], ["🔩", "Tapas"], ["💨", "Válvulas"], ["💧", "Goteros"], ["🌿", "Esencias"], ["🎁", "Kits"]];
  return (
    <Card>
      <div style={{ fontSize: 34, color: C.muted, marginBottom: 26 }}>7 rubros · todo en un lugar</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        {rubros.map(([e, t], i) => {
          const Chip = () => {
            const p = usePop(6 + i * 5, 10);
            return <div style={{ scale: String(p), padding: "22px 30px", borderRadius: 26, background: i % 2 ? "#f3f6f6" : "#e7f7f8", border: `2px solid ${C.line}`, fontSize: 40, fontWeight: 700 }}>{e} {t}</div>;
          };
          return <Chip key={t} />;
        })}
      </div>
    </Card>
  );
};

const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const tap = interpolate(frame, [26, 30, 34], [1, 0.85, 1], clamp);
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 36 }}>
      <Photo src={f("tarro-370cc-blanco-con-tapa-a-presion")} size={260} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 44, fontWeight: 700 }}>Tarro 370 cc</div>
        <div style={{ fontSize: 34, color: C.muted, margin: "8px 0 26px" }}>Mínimo de compra</div>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, border: `3px solid ${C.line}`, display: "grid", placeItems: "center", fontSize: 50, color: C.muted }}>–</div>
          <div style={{ fontSize: 90, fontWeight: 700 }}>1</div>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: C.teal, color: "#fff", display: "grid", placeItems: "center", fontSize: 50, scale: String(tap) }}>+</div>
        </div>
      </div>
    </Card>
  );
};

const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const opts: [string, number][] = [["Solo envase", 468], ["Spray blanco", 811], ["Crema premium", 1526]];
  const sel = frame < 40 ? 0 : frame < 75 ? 1 : 2;
  const bump = spring({ frame: frame - [0, 40, 75][sel], fps: 30, config: { damping: 9 } });
  return (
    <Card>
      <div style={{ display: "flex", gap: 34, alignItems: "center" }}>
        <Photo src={f("body-125-cc-ambar")} size={250} />
        <div>
          <div style={{ fontSize: 46, fontWeight: 700 }}>Body 125 cc ámbar</div>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -3, color: C.deep, scale: String(interpolate(bump, [0, 1], [0.85, 1])), transformOrigin: "left" }}>${opts[sel][1].toLocaleString("es-AR")}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 30 }}>
        {opts.map(([t], i) => (
          <div key={t} style={{ padding: "22px 28px", borderRadius: 22, fontSize: 38, fontWeight: 700, border: `3px solid ${i === sel ? C.teal : C.line}`, background: i === sel ? "#e7f7f8" : "#fff", display: "flex", justifyContent: "space-between" }}>
            <span>{t}</span><span style={{ color: i === sel ? C.teal : "transparent" }}>✓</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const S7: React.FC = () => {
  const tag = usePop(14, 8);
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 40, position: "relative" }}>
      <Photo src={f("pote-cristal-5-cc-con-tapa-a-presion")} size={330} />
      <div>
        <div style={{ fontSize: 44, fontWeight: 700 }}>Pote 5 cc</div>
        <div style={{ fontSize: 34, color: C.muted, marginTop: 6 }}>ideal para muestras</div>
        <div style={{ marginTop: 26, scale: String(tag), rotate: `${interpolate(tag, [0, 1], [-30, -5])}deg`, transformOrigin: "left" }}><Pill bg={C.sun} color={C.ink} size={56}>$373</Pill></div>
      </div>
    </Card>
  );
};

const Bubble: React.FC<{ me?: boolean; delay: number; children: React.ReactNode }> = ({ me, delay, children }) => {
  const p = usePop(delay, 13);
  return (
    <div style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: 640, padding: "22px 30px", borderRadius: 32, background: me ? "#d9fdd3" : "#f1f3f3", fontSize: 36, lineHeight: 1.25, scale: String(p), transformOrigin: me ? "right" : "left", opacity: p }}>{children}</div>
  );
};

const S8: React.FC = () => (
  <Card>
    <div style={{ display: "flex", alignItems: "center", gap: 20, paddingBottom: 24, borderBottom: `2px solid ${C.line}`, marginBottom: 26 }}>
      <Img src={staticFile("logo-3g.png")} style={{ width: 80, height: 80 }} />
      <div><div style={{ fontSize: 38, fontWeight: 700 }}>Envases 3G</div><div style={{ fontSize: 28, color: C.wa }}>en línea</div></div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Bubble me delay={6}>Hola! Quiero 10 Body 125 con spray 🙌</Bubble>
      <Bubble delay={30}>¡Hola! Te armo el pedido: 10 × $811</Bubble>
      <Bubble delay={52}>¿Retirás en Moreno 4156 o te lo enviamos? 📦</Bubble>
    </div>
  </Card>
);

const S9: React.FC = () => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [10, 50], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 46, fontWeight: 700 }}>Presupuesto mayorista</div>
        <Pill bg={C.ink}>Pymes</Pill>
      </div>
      {["Envase", "Tapa o válvula", "Cantidad"].map((t, i) => (
        <div key={t} style={{ marginTop: 26 }}>
          <div style={{ fontSize: 32, color: C.muted, marginBottom: 10 }}>{t}</div>
          <div style={{ height: 22, borderRadius: 11, background: "#eef1f1" }}><div style={{ height: "100%", borderRadius: 11, width: `${interpolate(fill, [i * 0.2, 0.6 + i * 0.2], [0, 100], clamp)}%`, background: C.teal }} /></div>
        </div>
      ))}
    </Card>
  );
};

const S10: React.FC = () => {
  const frame = useCurrentFrame();
  const word = "ENVASES";
  const typed = word.slice(0, Math.max(0, Math.floor((frame - 18) / 4)));
  const send = usePop(18 + word.length * 4 + 4, 10);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, fontFamily: SANS }}>
      <div style={{ scale: String(usePop(0, 9)) }}><Img src={staticFile("logo-3g.png")} style={{ width: 220, height: 220 }} /></div>
      <div style={{ fontSize: 64, fontWeight: 700, color: C.ink }}>Comentá</div>
      <Card w={880} delay={6} style={{ padding: 28, display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: "#d8dcdc" }} />
        <div style={{ flex: 1, fontSize: 44, fontWeight: 700, letterSpacing: 1 }}>{typed}<span style={{ opacity: frame % 16 < 8 ? 1 : 0, color: C.teal }}>|</span></div>
        <div style={{ fontSize: 34, fontWeight: 700, color: "#3897f0", scale: String(interpolate(send, [0, 1], [1, 1.15])), opacity: typed.length === word.length ? 1 : 0.35 }}>Publicar</div>
      </Card>
    </div>
  );
};

// ---------- Guion: cada escena con su texto. *palabra* = resaltada ----------
const SCRIPT: { dur: number; text: string; Scene: React.FC }[] = [
  { dur: 75, text: "¿Tenés un emprendimiento de *cosmética*, velas o aromas?", Scene: S1 },
  { dur: 75, text: "En *Envases 3G*, en Mar del Plata,", Scene: S2 },
  { dur: 90, text: "tenemos más de *400* envases y productos:", Scene: S3 },
  { dur: 90, text: "vidrio, plástico, tapas, válvulas, goteros y *esencias*.", Scene: S4 },
  { dur: 75, text: "Y no hace falta comprar por mayor: arrancás desde *una* unidad.", Scene: S5 },
  { dur: 120, text: "Elegís el frasco, le sumás la tapa o el spray y ves el *precio* al instante.", Scene: S6 },
  { dur: 75, text: "Un pote para muestras sale *$373*.", Scene: S7 },
  { dur: 105, text: "Armás el pedido y lo cerrás por *WhatsApp*.", Scene: S8 },
  { dur: 75, text: "¿Necesitás cantidad? Te hacemos el presupuesto *mayorista*.", Scene: S9 },
  { dur: 105, text: "Comentá *ENVASES* y te mando el catálogo completo.", Scene: S10 },
];
export const explainerDuration = SCRIPT.reduce((s, x) => s + x.dur, 0);

// Subtítulos: bloques de 2-3 palabras repartidos en la escena; cada bloque entra con un rebote.
const Captions: React.FC<{ text: string; dur: number }> = ({ text, dur }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  const chunks: string[][] = [];
  for (let i = 0; i < words.length; ) { const n = words.length - i === 4 ? 2 : Math.min(3, words.length - i); chunks.push(words.slice(i, i + n)); i += n; }
  const per = (dur - 6) / chunks.length;
  const idx = Math.min(chunks.length - 1, Math.floor(Math.max(0, frame - 3) / per));
  const local = frame - 3 - idx * per;
  const s = spring({ frame: local, fps: 30, config: { damping: 12, stiffness: 220, mass: 0.5 } });
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1290, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 22, fontFamily: SANS, fontWeight: 700, fontSize: 104, letterSpacing: -2.5, lineHeight: 1.1, scale: String(interpolate(s, [0, 1], [0.8, 1])), opacity: interpolate(s, [0, 1], [0, 1]) }}>
      {chunks[idx].map((w, i) => {
        const hl = w.includes("*");
        const clean = w.replace(/\*/g, "");
        return hl ? <span key={i} style={{ background: C.sun, padding: "0 18px", borderRadius: 18, rotate: "-2deg", display: "inline-block" }}>{clean}</span> : <span key={i} style={{ color: C.ink }}>{clean}</span>;
      })}
    </div>
  );
};

export const Explainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  let from = 0;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Puntos suaves de fondo, como en la referencia */}
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(#d9d8d3 2px, transparent 2px)", backgroundSize: "44px 44px", opacity: 0.6, translate: `0 ${-frame * 0.4}px` }} />
      {SCRIPT.map(({ dur, text, Scene }, i) => {
        const start = from;
        from += dur;
        return (
          <Sequence key={i} from={start} durationInFrames={dur} premountFor={30}>
            <SceneWrap dur={dur}><Scene /></SceneWrap>
            <Captions text={text} dur={dur} />
          </Sequence>
        );
      })}
      <div style={{ position: "absolute", top: 120, left: 60, right: 60, height: 8, borderRadius: 4, background: "rgba(15,26,28,.08)" }}>
        <div style={{ width: `${(frame / (durationInFrames - 1)) * 100}%`, height: "100%", borderRadius: 4, background: C.teal }} />
      </div>
      <Audio src={staticFile("audio/explicativo.wav")} volume={0.55} />
    </AbsoluteFill>
  );
};

// Entrada y salida de cada escena: sube y se achica al salir.
const SceneWrap: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [dur - 6, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 330, opacity: 1 - out, translate: `0 ${-out * 80}px`, scale: String(1 - out * 0.06) }}>
      {children}
    </AbsoluteFill>
  );
};
