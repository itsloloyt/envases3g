import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, clamp, foto, Grain, Handle, Kinetic, Outro, Progress, SANS } from "./kit";

// "Cómo comprar en 3 pasos": celular con la web y el WhatsApp; texto a la izquierda.
const HOOK = 66, STEP = 96, OUT = 75;
export const comoComprarDuration = HOOK + 3 * STEP + OUT;
const PH = { left: 530, top: 400, w: 490, h: 1040 };
const GRID = ["body-125-cc-ambar", "tarro-370cc-blanco-con-tapa-a-presion", "pote-cristal-5-cc-con-tapa-a-presion", "heaven-100-cc-ambar-con-tapa-difusora", "botella-bells-375cc-con-corcho", "pastillero-negro-100cc-con-tapa-a-rosca", "acqua-200-ml-pet-cristal", "frasco-vidrio-vial-veterinario-ambar-250cc"];
const PRICES = [468, 868, 373, 0, 3225, 833, 0, 1563];

// Dedo que toca: círculo que se achica.
const Tap: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 6, at + 14], [0, 1, 0], clamp);
  return <div style={{ position: "absolute", left: x - 40, top: y - 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(34,181,193,.35)", border: "4px solid rgba(34,181,193,.9)", scale: String(0.6 + p * 0.5), opacity: p }} />;
};

const Catalog: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [10, 50], [0, -330], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <div style={{ position: "absolute", inset: 0, background: "#f6fbfb" }}>
      <div style={{ height: 150, background: C.teal, padding: "60px 24px 0", color: "#fff", fontWeight: 700, fontSize: 30 }}>Envases 3G</div>
      <div style={{ margin: "-26px 20px 0", height: 56, borderRadius: 28, background: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,.08)", padding: "14px 22px", fontSize: 22, color: C.muted }}>🔍 Buscar envases…</div>
      <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, translate: `0 ${scroll}px` }}>
        {GRID.map((g, i) => (
          <div key={g} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,.06)", outline: i === 0 && frame > 62 ? `4px solid ${C.teal}` : "none" }}>
            <Img src={foto(g)} style={{ width: "100%", height: 170, objectFit: "cover" }} />
            <div style={{ padding: "8px 12px 12px", fontSize: 18, fontWeight: 700 }}>{PRICES[i] ? `$${PRICES[i].toLocaleString("es-AR")}` : "Ver precio"}</div>
          </div>
        ))}
      </div>
      <Tap x={120} y={360 - 330 + 230} at={60} />
    </div>
  );
};

const ProductScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const opts: [string, number][] = [["Solo envase", 468], ["Spray blanco", 811], ["Crema premium", 1526]];
  const sel = frame < 34 ? 0 : 1;
  const added = frame > 68;
  const badge = spring({ frame: frame - 70, fps: 30, config: { damping: 8 } });
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff" }}>
      <Img src={foto("body-125-cc-ambar")} style={{ width: "100%", height: 420, objectFit: "cover" }} />
      <div style={{ position: "absolute", right: 20, top: 60, width: 64, height: 64, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", fontSize: 30, boxShadow: "0 6px 16px rgba(0,0,0,.15)" }}>
        🛒{added ? <span style={{ position: "absolute", right: -4, top: -4, width: 28, height: 28, borderRadius: "50%", background: C.red, color: "#fff", fontSize: 16, fontWeight: 700, display: "grid", placeItems: "center", scale: String(badge) }}>1</span> : null}
      </div>
      <div style={{ padding: "24px" }}>
        <div style={{ fontSize: 30, fontWeight: 700 }}>Body 125 cc ámbar</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: C.deep, marginTop: 4 }}>${opts[sel][1].toLocaleString("es-AR")}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
          {opts.map(([t], i) => (
            <div key={t} style={{ padding: "14px 18px", borderRadius: 14, fontSize: 22, fontWeight: 700, border: `3px solid ${i === sel ? C.teal : "#e4e6e5"}`, background: i === sel ? "#e7f7f8" : "#fff" }}>{t}</div>
          ))}
        </div>
        <div style={{ marginTop: 22, height: 74, borderRadius: 37, background: added ? C.green : C.night, color: "#fff", display: "grid", placeItems: "center", fontSize: 24, fontWeight: 700, scale: String(interpolate(frame, [62, 66, 70], [1, 0.94, 1], clamp)) }}>{added ? "✓ Agregado" : "Agregar al pedido"}</div>
      </div>
      <Tap x={150} y={700} at={28} />
      <Tap x={245} y={900} at={60} />
    </div>
  );
};

const Bubble: React.FC<{ me?: boolean; at: number; children: React.ReactNode }> = ({ me, at, children }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - at, fps: 30, config: { damping: 13 } });
  return <div style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: 360, padding: "14px 18px", borderRadius: 20, background: me ? "#d9fdd3" : "#fff", fontSize: 21, lineHeight: 1.3, boxShadow: "0 2px 4px rgba(0,0,0,.06)", scale: String(p), opacity: p, transformOrigin: me ? "right" : "left" }}>{children}</div>;
};

const Chat: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "#efe7de" }}>
    <div style={{ height: 150, background: "#075e54", padding: "64px 20px 0", display: "flex", alignItems: "center", gap: 14, color: "#fff" }}>
      <Img src={staticFile("logo-3g.png")} style={{ width: 54, height: 54 }} />
      <div><div style={{ fontSize: 24, fontWeight: 700 }}>Envases 3G</div><div style={{ fontSize: 16, opacity: 0.8 }}>en línea</div></div>
    </div>
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <Bubble me at={8}><b>Mi pedido</b><br />10 × Body 125 cc ámbar + spray blanco<br /><b>Total: $8.110</b></Bubble>
      <Bubble at={36}>¡Hola! Recibimos tu pedido 🙌</Bubble>
      <Bubble at={54}>¿Retirás por Moreno 4156 o te lo enviamos?</Bubble>
      <Bubble me at={74}>¡Envío porfa! 📦</Bubble>
    </div>
  </div>
);

const STEPS = [
  { t: "Elegí en el *catálogo*", d: "Más de 400 productos con precio publicado", Screen: Catalog },
  { t: "Armá tu *combinación*", d: "Envase + tapa, spray o válvula", Screen: ProductScreen },
  { t: "Cerrá por *WhatsApp*", d: "Retirás en el local o te lo enviamos", Screen: Chat },
];

export const ComoComprar: React.FC = () => {
  const frame = useCurrentFrame();
  const phone = spring({ frame: frame - HOOK + 6, fps: 30, config: { damping: 15 } });
  const idx = Math.max(0, Math.min(2, Math.floor((frame - HOOK) / STEP)));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${C.teal}, ${C.deep})`, fontFamily: SANS }}>
      <Sequence durationInFrames={HOOK}>
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 72px" }}>
          <Kinetic text="Cómo comprar en Envases 3G en 3 *pasos*" size={130} color={C.white} accent={C.sun} delay={3} stagger={4} />
        </AbsoluteFill>
      </Sequence>
      {/* Celular */}
      <div style={{ position: "absolute", left: PH.left, top: PH.top, width: PH.w, height: PH.h, borderRadius: 64, background: "#0b1314", padding: 14, boxShadow: "0 60px 120px rgba(0,0,0,.45)", translate: `${interpolate(phone, [0, 1], [700, 0])}px 0`, rotate: `${interpolate(phone, [0, 1], [10, 0])}deg` }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 52, overflow: "hidden", background: "#fff" }}>
          {STEPS.map(({ Screen }, i) => (
            <Sequence key={i} from={HOOK + i * STEP} durationInFrames={STEP} layout="none">
              <div style={{ position: "absolute", inset: 0 }}><Screen /></div>
            </Sequence>
          ))}
          <div style={{ position: "absolute", top: 14, left: "50%", translate: "-50% 0", width: 130, height: 34, borderRadius: 17, background: "#0b1314" }} />
        </div>
      </div>
      {/* Texto del paso */}
      {STEPS.map((s, i) => (
        <Sequence key={s.t} from={HOOK + i * STEP} durationInFrames={STEP} premountFor={30}>
          <div style={{ position: "absolute", left: 72, top: 560, width: 420 }}>
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: C.sun, color: C.night, fontSize: 56, fontWeight: 700, display: "grid", placeItems: "center", marginBottom: 30 }}>{i + 1}</div>
            <Kinetic text={s.t} size={78} color={C.white} accent={C.sun} delay={4} />
            <div style={{ fontSize: 34, color: "#e6f4f5", marginTop: 16, lineHeight: 1.3 }}>{s.d}</div>
          </div>
        </Sequence>
      ))}
      {/* Puntos de progreso de los pasos */}
      {frame >= HOOK && frame < HOOK + 3 * STEP ? (
        <div style={{ position: "absolute", left: 72, top: 1300, display: "flex", gap: 14 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: i === idx ? 70 : 22, height: 22, borderRadius: 11, background: i === idx ? C.sun : "rgba(255,255,255,.4)" }} />)}
        </div>
      ) : null}
      <Handle />
      <Sequence from={HOOK + 3 * STEP} premountFor={30}>
        <Outro text="Hacé tu pedido *hoy*" bg={C.night} ink={C.white} />
      </Sequence>
      <Progress />
      <Grain />
      <Audio src={staticFile("audio/comocomprar.wav")} />
    </AbsoluteFill>
  );
};
