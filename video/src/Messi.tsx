import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SANS, SERIF } from "./kit";

// Placa homenaje "Gracias, 10" (sin fotos ni marcas de terceros): rayas celestes, camiseta con el 10 y la mascota.
const CELESTE = "#75aadb", BLANCO = "#ffffff", AZUL = "#0b2a4a", ORO = "#e8b923";

const Star: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <svg style={{ position: "absolute", left: x, top: y }} width={s} height={s} viewBox="0 0 24 24"><path d="M12 1.5l3.1 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.3l-6.4 3.6 1.5-7.1L1.7 8.9l7.2-.8z" fill={ORO} stroke="#b88a0e" strokeWidth=".8" /></svg>
);

export const GraciasDiez: React.FC = () => (
  <AbsoluteFill style={{ background: BLANCO, fontFamily: SANS, overflow: "hidden" }}>
    {/* Rayas verticales celestes y blancas */}
    <AbsoluteFill style={{ background: `repeating-linear-gradient(90deg, ${CELESTE} 0 120px, ${BLANCO} 120px 240px)`, opacity: 0.9 }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,.0) 30%, rgba(11,42,74,.35) 100%)" }} />
    {/* Sol de mayo sutil detrás de la camiseta */}
    <div style={{ position: "absolute", left: 540 - 380, top: 210, width: 760, height: 760, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,185,35,.55), rgba(232,185,35,0) 65%)" }} />

    {/* Camiseta de espaldas */}
    <svg style={{ position: "absolute", left: 190, top: 250, filter: "drop-shadow(0 30px 40px rgba(11,42,74,.35))" }} width="700" height="760" viewBox="0 0 700 760">
      <defs>
        <clipPath id="shirt"><path d="M210 20 Q350 70 490 20 L640 90 L700 260 L590 300 L560 230 L560 740 Q350 770 140 740 L140 230 L110 300 L0 260 L60 90 Z" /></clipPath>
      </defs>
      <g clipPath="url(#shirt)">
        <rect width="700" height="760" fill={BLANCO} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={175 + i * 100} y="0" width="50" height="760" fill={CELESTE} />)}
        <rect x="0" y="0" width="140" height="760" fill={CELESTE} opacity=".25" />
        <rect x="560" y="0" width="140" height="760" fill={CELESTE} opacity=".25" />
      </g>
      <path d="M210 20 Q350 70 490 20 L640 90 L700 260 L590 300 L560 230 L560 740 Q350 770 140 740 L140 230 L110 300 L0 260 L60 90 Z" fill="none" stroke={AZUL} strokeWidth="5" />
      <path d="M210 20 Q350 70 490 20" fill="none" stroke={AZUL} strokeWidth="14" />
      <text x="350" y="205" textAnchor="middle" fontFamily="Bricolage" fontWeight="700" fontSize="84" letterSpacing="6" fill={AZUL}>GRACIAS</text>
      <text x="350" y="600" textAnchor="middle" fontFamily="Bricolage" fontWeight="700" fontSize="400" letterSpacing="-20" fill={AZUL} stroke={BLANCO} strokeWidth="10" paintOrder="stroke">10</text>
    </svg>

    <Star x={420} y={150} s={70} />
    <Star x={505} y={120} s={80} />
    <Star x={600} y={150} s={70} />

    {/* Mascota con el pulgar arriba */}
    <Img src={staticFile("mascota.png")} style={{ position: "absolute", left: 650, top: 830, width: 380, filter: "drop-shadow(0 20px 30px rgba(11,42,74,.35))", rotate: "-6deg" }} />

    {/* Texto inferior */}
    <div style={{ position: "absolute", left: 60, right: 430, top: 1050, color: AZUL }}>
      <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 0.95, textShadow: "0 2px 0 #fff" }}>Gracias por tanto.</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, marginTop: 14, color: AZUL, background: "rgba(255,255,255,.85)", display: "inline-block", padding: "2px 16px", borderRadius: 12 }}>Envases 3G · Mar del Plata</div>
    </div>
  </AbsoluteFill>
);
