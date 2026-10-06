import { loadFont } from "@remotion/fonts";
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { C, clamp, Counter, foto, Grain, Kinetic, Outro, Progress, SANS, SERIF } from "./kit";

// "¿Cuánto cuesta el envase de tu crema?": un ticket que se imprime con los costos reales.
const MONO = "JetBrains";
loadFont({ family: MONO, url: staticFile("fonts/JetBrainsMono-Regular.ttf"), weight: "400" });
loadFont({ family: MONO, url: staticFile("fonts/JetBrainsMono-Bold.ttf"), weight: "700" });

const HOOK = 66, PRINT = 200, OUT = 75;
export const ticketDuration = HOOK + PRINT + OUT;
const LINES = [
  { t: "Body 125 cc ámbar", s: "envase", p: 468, at: 30 },
  { t: "+ Válvula crema premium", s: "negra", p: 1058, at: 55 },
  { t: "Pote cristal 5 cc", s: "para la muestra", p: 373, at: 80 },
];
const TOTAL = LINES.reduce((a, l) => a + l.p, 0); // 1.899

const Paper: React.FC = () => {
  const frame = useCurrentFrame();
  // El papel "sale" de la impresora.
  const h = interpolate(frame, [0, 120], [120, 1080], { ...clamp, easing: Easing.out(Easing.cubic) });
  const totalPop = spring({ frame: frame - 118, fps: 30, config: { damping: 9 } });
  return (
    <div style={{ position: "absolute", left: 150, right: 150, top: 330 }}>
      {/* Impresora */}
      <div style={{ height: 70, borderRadius: 24, background: "#1d2a2c", boxShadow: "0 20px 40px rgba(0,0,0,.35)", position: "relative", zIndex: 2 }}>
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 14, height: 10, borderRadius: 5, background: "#0b1314" }} />
      </div>
      <div style={{ margin: "-10px 26px 0", height: h, overflow: "hidden", position: "relative", filter: "drop-shadow(0 30px 40px rgba(0,0,0,.25))" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1080, background: "#fffdf7", padding: "60px 48px", fontFamily: MONO, color: C.ink, WebkitMaskImage: "linear-gradient(#000 calc(100% - 22px), transparent 0), conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) bottom/40px 22px repeat-x" }}>
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 40 }}>ENVASES 3G</div>
          <div style={{ textAlign: "center", fontSize: 26, color: C.muted, marginTop: 6 }}>Moreno 4156 · Mar del Plata</div>
          <div style={{ borderTop: "3px dashed #c9cfcf", margin: "36px 0" }} />
          {LINES.map((l) => (
            <div key={l.t} style={{ marginBottom: 34, opacity: interpolate(frame, [l.at, l.at + 6], [0, 1], clamp), translate: `0 ${interpolate(frame, [l.at, l.at + 8], [16, 0], clamp)}px` }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 34, fontWeight: 700 }}>
                <span>{l.t}</span>
                <Counter to={l.p} start={l.at + 2} dur={12} />
              </div>
              <div style={{ fontSize: 26, color: C.muted, marginTop: 4 }}>{l.s}</div>
            </div>
          ))}
          <div style={{ borderTop: "3px dashed #c9cfcf", margin: "20px 0 30px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", opacity: interpolate(frame, [105, 112], [0, 1], clamp) }}>
            <span style={{ fontSize: 40, fontWeight: 700 }}>TOTAL</span>
            <span style={{ fontSize: 92, fontWeight: 700, fontFamily: SANS, letterSpacing: -3, scale: String(interpolate(totalPop, [0, 1], [0.6, 1])), display: "inline-block", background: C.sun, padding: "0 18px", borderRadius: 14 }}>
              <Counter to={TOTAL} start={106} dur={14} />
            </span>
          </div>
          <div style={{ textAlign: "right", fontSize: 26, color: C.muted, marginTop: 10, opacity: interpolate(frame, [125, 132], [0, 1], clamp) }}>por unidad · se compra desde 1</div>
          <div style={{ textAlign: "center", fontSize: 28, marginTop: 50, letterSpacing: 4, opacity: 0.6 }}>|||| ||| | |||| || |||</div>
        </div>
      </div>
    </div>
  );
};

export const Ticket: React.FC = () => {
  const frame = useCurrentFrame();
  const sticker1 = spring({ frame: frame - HOOK - 32, fps: 30, config: { damping: 10 } });
  const sticker2 = spring({ frame: frame - HOOK - 82, fps: 30, config: { damping: 10 } });
  const msg = frame - HOOK - 150;
  return (
    <AbsoluteFill style={{ background: C.deep, fontFamily: SANS }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", right: -300, top: -200, background: C.teal, opacity: 0.45, filter: "blur(120px)" }} />
      <Sequence durationInFrames={HOOK}>
        <AbsoluteFill style={{ justifyContent: "center", padding: "0 72px" }}>
          <Kinetic text="¿Cuánto cuesta el envase de tu *crema?*" size={124} color={C.white} accent={C.sun} delay={3} stagger={4} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={HOOK} durationInFrames={PRINT} premountFor={30}>
        <Paper />
        {/* Fotos reales como stickers al costado del ticket */}
        <Img src={foto("body-125-cc-ambar")} style={{ position: "absolute", left: 30, top: 640, width: 230, height: 230, objectFit: "cover", borderRadius: "50%", border: "12px solid white", scale: String(sticker1), rotate: "-10deg", boxShadow: "0 20px 40px rgba(0,0,0,.3)" }} />
        <Img src={foto("pote-cristal-5-cc-con-tapa-a-presion")} style={{ position: "absolute", right: 30, top: 930, width: 210, height: 210, objectFit: "cover", borderRadius: "50%", border: "12px solid white", scale: String(sticker2), rotate: "9deg", boxShadow: "0 20px 40px rgba(0,0,0,.3)" }} />
        <div style={{ position: "absolute", left: 72, right: 72, top: 1500, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: C.white, opacity: interpolate(msg, [0, 10], [0, 1], clamp), translate: `0 ${interpolate(msg, [0, 10], [30, 0], clamp)}px` }}>
          Tu crema lista para vender, <span style={{ color: C.sun }}>con muestra incluida.</span>
        </div>
      </Sequence>
      <Sequence from={HOOK + PRINT} premountFor={30}>
        <Outro text="Armá tu *combo* en la web" />
      </Sequence>
      <Progress />
      <Grain />
      <Audio src={staticFile("audio/ticket.wav")} />
    </AbsoluteFill>
  );
};
