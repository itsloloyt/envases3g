import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SANS, SERIF } from "./kit";

// Homenaje editorial: "Hay cosas que no entran en ningún envase."
// Referencias: piezas de marcas para la despedida (tipografía sobria, un solo objeto, mucho aire).
const NOCHE = "#0a1624", CELESTE = "#8cc0ea", ORO = "#d9b45a", CREMA = "#f3efe6";

export const GraciasDiez: React.FC = () => (
  <AbsoluteFill style={{ background: NOCHE, fontFamily: SANS, overflow: "hidden" }}>
    {/* Rayas celestes muy sutiles, como textura */}
    <AbsoluteFill style={{ background: `repeating-linear-gradient(90deg, rgba(140,192,234,.07) 0 90px, transparent 90px 180px)` }} />
    {/* Haz de luz cenital sobre el frasco */}
    <div style={{ position: "absolute", left: 540 - 420, top: -200, width: 840, height: 1300, background: "radial-gradient(ellipse 50% 60% at 50% 40%, rgba(255,240,210,.20), rgba(255,240,210,0) 70%)" }} />
    <div style={{ position: "absolute", left: 540 - 330, top: 980, width: 660, height: 120, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,230,190,.28), rgba(255,230,190,0) 70%)" }} />

    {/* Frasco de vidrio ámbar dibujado en vectores (nítido a cualquier tamaño) */}
    <svg style={{ position: "absolute", left: 540 - 170, top: 430, filter: "drop-shadow(0 40px 50px rgba(0,0,0,.6))" }} width="340" height="680" viewBox="0 0 340 680">
      <defs>
        <linearGradient id="amber" x1="0" x2="1">
          <stop offset="0" stopColor="#2a1206" /><stop offset=".18" stopColor="#6b3410" /><stop offset=".42" stopColor="#a8571c" />
          <stop offset=".6" stopColor="#7a3c12" /><stop offset=".85" stopColor="#3d1a07" /><stop offset="1" stopColor="#1c0b03" />
        </linearGradient>
        <linearGradient id="cap" x1="0" x2="1">
          <stop offset="0" stopColor="#0d0d0f" /><stop offset=".35" stopColor="#3a3b40" /><stop offset=".5" stopColor="#5a5b61" /><stop offset=".7" stopColor="#25262a" /><stop offset="1" stopColor="#0a0a0b" />
        </linearGradient>
        <linearGradient id="labelShade" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".5" /><stop offset=".2" stopColor="#000" stopOpacity="0" /><stop offset=".42" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".62" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".55" />
        </linearGradient>
        <pattern id="stripes" width="44" height="10" patternUnits="userSpaceOnUse"><rect width="22" height="10" fill="#f3efe6" /><rect x="22" width="22" height="10" fill="#8cc0ea" /></pattern>
        <clipPath id="bodyClip"><path d="M120 120 L120 150 Q40 175 30 250 L30 640 Q30 665 60 668 L280 668 Q310 665 310 640 L310 250 Q300 175 220 150 L220 120 Z" /></clipPath>
      </defs>
      {/* tapa */}
      <rect x="104" y="20" width="132" height="104" rx="12" fill="url(#cap)" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => <rect key={i} x={110 + i * 11.5} y="26" width="3" height="92" fill="rgba(255,255,255,.07)" />)}
      {/* cuerpo */}
      <path d="M120 120 L120 150 Q40 175 30 250 L30 640 Q30 665 60 668 L280 668 Q310 665 310 640 L310 250 Q300 175 220 150 L220 120 Z" fill="url(#amber)" />
      <g clipPath="url(#bodyClip)">
        {/* etiqueta */}
        <rect x="30" y="330" width="280" height="230" fill="url(#stripes)" />
        <rect x="30" y="330" width="280" height="230" fill="none" stroke="#d9b45a" strokeWidth="3" />
        <text x="170" y="500" textAnchor="middle" fontFamily="InstrumentSerif" fontStyle="italic" fontSize="190" fill="#0a1624">10</text>
        <rect x="30" y="330" width="280" height="230" fill="url(#labelShade)" />
        {/* brillos del vidrio */}
        <rect x="62" y="190" width="18" height="440" rx="9" fill="#fff" opacity=".18" />
        <rect x="88" y="200" width="6" height="400" rx="3" fill="#fff" opacity=".12" />
        <rect x="268" y="230" width="10" height="380" rx="5" fill="#fff" opacity=".08" />
        <ellipse cx="170" cy="668" rx="140" ry="16" fill="#000" opacity=".35" />
      </g>
    </svg>
    {/* reflejo en el piso */}
    <div style={{ position: "absolute", left: 540 - 200, top: 1095, width: 400, height: 40, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,.6), rgba(0,0,0,0) 70%)" }} />

    {/* Tres estrellas finas */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center", gap: 26 }}>
      {[0, 1, 2].map((i) => (
        <svg key={i} width="34" height="34" viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" fill="none" stroke={ORO} strokeWidth="1.3" /></svg>
      ))}
    </div>

    {/* Titular */}
    <div style={{ position: "absolute", left: 90, right: 90, top: 140, textAlign: "center", color: CREMA }}>
      <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>Hay cosas que</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 92, lineHeight: 1.05, color: CELESTE }}>no entran en ningún envase.</div>
    </div>

    {/* Cierre */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1165, textAlign: "center", color: CREMA }}>
      <div style={{ width: 60, height: 2, background: ORO, margin: "0 auto 26px" }} />
      <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: 10 }}>GRACIAS, CAPITÁN</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, color: "rgba(243,239,230,.7)", fontSize: 26, letterSpacing: 2 }}>
      <Img src={staticFile("logo-3g.png")} style={{ width: 44, height: 44 }} />
      ENVASES 3G · MAR DEL PLATA
    </div>
  </AbsoluteFill>
);
