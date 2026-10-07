import React from "react";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { SANS } from "./kit";

// Historia homenaje (9:16) inspirada en el estilo "cielo estrellado + frase serif + escena de festejo".
// Sin fotos de terceros: hinchas en silueta, bandera, luces de estadio y la camiseta 10 en alto.
const W = 1080, H = 1920;
const SERIF_R = "InstrumentSerifRegular";
loadFont({ family: SERIF_R, url: staticFile("fonts/InstrumentSerif-Regular.ttf") });
const CEL = "#74acdf";

const Stars: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 420 }).map((_, i) => {
      const x = random(`sx${i}`) * W, y = random(`sy${i}`) * H * 0.75;
      const r = random(`sr${i}`) ** 3 * 2.4 + 0.4;
      return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.35 + random(`so${i}`) * 0.65} />;
    })}
    {/* algunas estrellas brillantes con destello */}
    {Array.from({ length: 10 }).map((_, i) => {
      const x = random(`bx${i}`) * W, y = random(`by${i}`) * H * 0.6;
      return <g key={i} opacity={0.9}><circle cx={x} cy={y} r={2.6} fill="#fff" /><path d={`M${x - 14} ${y} H${x + 14} M${x} ${y - 14} V${y + 14}`} stroke="#fff" strokeWidth="1" opacity=".6" /></g>;
    })}
  </svg>
);

// Bandera argentina flameando (franjas onduladas + sol).
const Flag: React.FC = () => {
  const wave = (yy: number) => `M0 ${yy} C 120 ${yy - 40}, 240 ${yy + 40}, 360 ${yy} S 600 ${yy - 40}, 700 ${yy}`;
  return (
    <svg width="760" height="520" viewBox="0 0 760 520" style={{ position: "absolute", left: -330, top: 1330, rotate: "-14deg", scale: ".8", filter: "blur(3px) drop-shadow(0 20px 30px rgba(0,0,0,.5))" }}>
      <defs>
        <clipPath id="flagClip"><path d={`${wave(60)} L700 420 C 600 460, 480 380, 360 420 S 120 460, 0 420 Z`} /></clipPath>
        <linearGradient id="fold" x1="0" x2="1"><stop offset="0" stopColor="#000" stopOpacity=".35" /><stop offset=".25" stopColor="#fff" stopOpacity=".15" /><stop offset=".5" stopColor="#000" stopOpacity=".3" /><stop offset=".75" stopColor="#fff" stopOpacity=".12" /><stop offset="1" stopColor="#000" stopOpacity=".4" /></linearGradient>
      </defs>
      <g clipPath="url(#flagClip)">
        <rect width="760" height="520" fill={CEL} />
        <rect y="180" width="760" height="130" fill="#f4f6f8" />
        <circle cx="350" cy="245" r="44" fill="#f6b40e" />
        {Array.from({ length: 16 }).map((_, i) => <rect key={i} x="347" y="182" width="6" height="22" fill="#f6b40e" transform={`rotate(${i * 22.5} 350 245)`} />)}
        <rect width="760" height="520" fill="url(#fold)" />
      </g>
      <rect x="-6" y="40" width="12" height="480" fill="#c9ccd1" />
    </svg>
  );
};

// Multitud en primer plano, desenfocada (como foto con poca profundidad de campo).
const Crowd: React.FC = () => (
  <svg width={W} height={760} style={{ position: "absolute", left: 0, bottom: -110 }}>
    <defs>
      <filter id="b1"><feGaussianBlur stdDeviation="9" /></filter>
      <filter id="b2"><feGaussianBlur stdDeviation="4" /></filter>
      <radialGradient id="screen"><stop offset="0" stopColor="#e6f2ff" stopOpacity=".9" /><stop offset="1" stopColor="#e6f2ff" stopOpacity="0" /></radialGradient>
    </defs>
    {/* fila de atrás */}
    <g filter="url(#b2)" fill="#0a0f1d">
      {Array.from({ length: 14 }).map((_, i) => { const x = i * 82 + random(`c${i}`) * 30, y = 330 + random(`cy${i}`) * 40; return <g key={i}><ellipse cx={x} cy={y} rx="34" ry="40" /><rect x={x - 60} y={y + 30} width="120" height="420" rx="50" /></g>; })}
      {[150, 470, 760, 980].map((x, i) => <rect key={i} x={x} y={150 + i * 25} width="30" height="240" rx="15" transform={`rotate(${(i % 2 ? 1 : -1) * 12} ${x} ${300})`} />)}
    </g>
    {/* fila de adelante, muy desenfocada */}
    <g filter="url(#b1)" fill="#03060c">
      {Array.from({ length: 7 }).map((_, i) => { const x = i * 170 + random(`d${i}`) * 40, y = 520 + random(`dy${i}`) * 50; return <g key={i}><ellipse cx={x} cy={y} rx="62" ry="72" /><rect x={x - 110} y={y + 50} width="220" height="300" rx="90" /></g>; })}
      {[60, 900].map((x, i) => <rect key={i} x={x} y={240} width="56" height="380" rx="28" transform={`rotate(${i ? -14 : 14} ${x} 500)`} />)}
    </g>
    {/* pantallas de celulares encendidas */}
    {[[118, 205], [445, 260], [800, 215], [1000, 300]].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="70" fill="url(#screen)" opacity=".45" />
        <rect x={x - 17} y={y - 30} width="34" height="60" rx="6" fill="#dbeaff" opacity=".9" filter="url(#b2)" />
      </g>
    ))}
  </svg>
);

// "10" dibujado con estrellas unidas por líneas finas (constelación).
const C10: [number, number][][] = [
  [[300, 1250], [360, 1195], [360, 1310], [360, 1425], [360, 1530]],
  [[620, 1195], [700, 1210], [760, 1290], [775, 1370], [755, 1460], [690, 1525], [610, 1530], [545, 1470], [520, 1370], [540, 1270], [620, 1195]],
];
const Constellation: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", left: 90, top: -40 }}>
    <defs>
      <radialGradient id="glow"><stop offset="0" stopColor="#fff" stopOpacity="1" /><stop offset=".25" stopColor="#cfe3ff" stopOpacity=".7" /><stop offset="1" stopColor="#9cc4ff" stopOpacity="0" /></radialGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="1.2" /></filter>
    </defs>
    {/* halo general */}
    {C10.map((pts, k) => (
      <polyline key={k} points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#d9e8ff" strokeOpacity=".55" strokeWidth="2" filter="url(#soft)" />
    ))}
    {C10.flat().map(([x, y], i) => {
      const big = i % 3 === 0;
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={big ? 30 : 20} fill="url(#glow)" />
          <circle cx={x} cy={y} r={big ? 5 : 3.5} fill="#fff" />
          {big ? <path d={`M${x - 24} ${y} H${x + 24} M${x} ${y - 24} V${y + 24}`} stroke="#fff" strokeOpacity=".7" strokeWidth="1.2" /> : null}
        </g>
      );
    })}
  </svg>
);

export const GraciasLeoStory: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #050b1c 0%, #0b1a3a 45%, #1a2f63 70%, #2a1d3d 100%)", overflow: "hidden" }}>
    {/* Vía láctea */}
    <div style={{ position: "absolute", left: -300, top: 200, width: 1700, height: 520, rotate: "-28deg", background: "radial-gradient(ellipse at center, rgba(180,200,255,.22), rgba(120,140,220,.08) 45%, rgba(0,0,0,0) 70%)", filter: "blur(30px)" }} />
    <Stars />

    {/* Luces del estadio (bokeh) */}
    {Array.from({ length: 26 }).map((_, i) => {
      const x = 380 + random(`lx${i}`) * 760, y = 1180 + random(`ly${i}`) * 260, r = 18 + random(`lr${i}`) * 46;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: "50%", background: i % 4 === 0 ? "rgba(255,210,150,.55)" : "rgba(255,245,225,.5)", filter: "blur(6px)" }} />;
    })}
    <div style={{ position: "absolute", left: 300, right: -200, top: 1230, height: 380, background: "radial-gradient(ellipse at 60% 40%, rgba(255,230,190,.45), rgba(255,230,190,0) 65%)", filter: "blur(20px)" }} />

    <Flag />

    {/* El 10 como constelación */}
    <Constellation />
    <Crowd />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 380, background: "linear-gradient(rgba(5,8,15,0), rgba(5,8,15,.85))" }} />

    {/* Marca arriba */}
    <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <Img src={staticFile("logo-3g.png")} style={{ width: 150, height: 150, filter: "drop-shadow(0 8px 20px rgba(0,0,0,.4))" }} />
    </div>

    {/* Frase */}
    <div style={{ position: "absolute", left: 80, right: 80, top: 520, textAlign: "center", color: "#fff", fontFamily: SERIF_R, textShadow: "0 4px 24px rgba(0,0,0,.45)" }}>
      <div style={{ fontSize: 104, lineHeight: 1.02, letterSpacing: -1.5 }}>Hay cosas que no entran en ningún envase.</div>
      <div style={{ fontSize: 76, lineHeight: 1.08, marginTop: 40, opacity: 0.95 }}>Lo que nos diste, lo guardamos para siempre.</div>
      <div style={{ fontSize: 96, marginTop: 50 }}>Gracias Leo. <span style={{ fontFamily: SANS }}>❤️</span></div>
    </div>
  </AbsoluteFill>
);
