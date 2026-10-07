import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { clamp, Grain, money, SANS, SERIF } from "./kit";

// Estética stop-motion: los envases caen de a uno a 12 cuadros por segundo (movimiento "a saltos"),
// con un leve temblor por cuadro como si se movieran a mano. Al final cuelgan etiquetas con el precio real.
const DISPLAY = "Anton";
loadFont({ family: DISPLAY, url: staticFile("fonts/Anton-Regular.ttf") });

// Alturas a escala real aproximada (25 px por cm); el ancho sale de la proporción del recorte.
const RAW = [
  { img: "lyon-500-cc-cristal-studio", cm: 21, ar: 755 / 1245, price: 630 },
  { img: "body-125-cc-ambar", cm: 13, ar: 767 / 869, price: 468 },
  { img: "frasco-vidrio-amanecer-250-cc", cm: 9, ar: 945 / 1042, price: 633 },
  { img: "body-125-flip-top-negra", cm: 15, ar: 380 / 915, price: 687 },
  { img: "omega-500-cc-ambar-studio", cm: 20, ar: 782 / 1275, price: 933 },
];
const GAPX = 18;
const PX = Math.min(25, (1010 - GAPX * (RAW.length - 1)) / RAW.reduce((a, r) => a + r.cm * r.ar, 0));
const ITEMS = RAW.map((r) => ({ ...r, h: r.cm * PX, w: r.cm * PX * r.ar }));
const TOTAL = ITEMS.reduce((acc, it) => acc + it.w, 0) + GAPX * (ITEMS.length - 1);
const XS = ITEMS.map((_, k) => (1080 - TOTAL) / 2 + ITEMS.slice(0, k).reduce((acc, it) => acc + it.w + GAPX, 0));
const DROP0 = 24, GAP = 14, TAGS = DROP0 + ITEMS.length * GAP + 8;
export const stopMotionDuration = 240;
const FLOOR = 1160;

// 12 fps: redondea el tiempo a pasos de 2.5 cuadros.
const step = (f: number) => Math.floor(f / 2.5) * 2.5;

export const StopMotion: React.FC = () => {
  const raw = useCurrentFrame();
  const f = step(raw);
  const title = interpolate(f, [2, 12], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const count = ITEMS.filter((_, k) => f >= DROP0 + k * GAP + 5).length;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 70%, #f6efe4 0%, #eadfce 60%, #d9cab4 100%)", fontFamily: SANS, color: "#2a1a0e" }}>
      {/* título */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: title, translate: `0 ${(1 - title) * 30}px` }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 170, lineHeight: 0.95, letterSpacing: -2 }}>ARMÁ TU</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 180, lineHeight: 0.95, color: "#a5541f" }}>línea</div>
      </div>
      {/* contador */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontSize: 34, letterSpacing: 6, fontWeight: 700, opacity: count ? 1 : 0 }}>
        {String(count).padStart(2, "0")} / 0{ITEMS.length}
      </div>
      {/* sombra del piso */}
      <div style={{ position: "absolute", left: 60, right: 60, top: FLOOR - 10, height: 40, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(60,35,15,.22), transparent 70%)" }} />
      {ITEMS.map((it, k) => {
        const t0 = DROP0 + k * GAP;
        const t = f - t0;
        if (t < 0) return null;
        // caída en 3 pasos + aplastamiento al tocar el piso + rebote
        const y = t < 2.5 ? -900 : t < 5 ? -380 : t < 7.5 ? 0 : t < 10 ? -26 : 0;
        const sq = t >= 5 && t < 7.5 ? [1.08, 0.92] : t >= 7.5 && t < 10 ? [0.97, 1.04] : [1, 1];
        const jit = (random(`r${k}-${f}`) - 0.5) * 2.4;
        const tagT = f - TAGS - k * 5;
        const tag = tagT < 0 ? 0 : tagT < 2.5 ? 0.5 : 1;
        const swing = tagT >= 0 ? Math.sin((tagT / 2.5) * 0.9) * 10 * Math.exp(-tagT / 30) : 0;
        return (
          <div key={it.img} style={{ position: "absolute", left: XS[k], width: it.w, top: FLOOR - it.h, height: it.h }}>
            <Img src={staticFile(`cut/${it.img}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 100%", translate: `0 ${y}px`, scale: `${sq[0]} ${sq[1]}`, rotate: `${jit}deg`, transformOrigin: "50% 100%", filter: "drop-shadow(0 18px 14px rgba(60,35,15,.25))" }} />
            {/* etiqueta colgante */}
            <div style={{ position: "absolute", left: "50%", top: it.h + 30, transformOrigin: "50% 0", rotate: `${swing}deg`, translate: `-50% ${(1 - tag) * -60}px`, opacity: tag }}>
              <div style={{ width: 2, height: 30 + (k % 2) * 60, margin: "0 auto", background: "#6b4a2e" }} />
              <div style={{ padding: "16px 14px 14px", borderRadius: 14, background: k % 2 ? "#2a1a0e" : "#fffaf2", color: k % 2 ? "#f6efe4" : "#2a1a0e", fontWeight: 700, fontSize: 34, whiteSpace: "nowrap", boxShadow: "0 8px 16px rgba(60,35,15,.2)", position: "relative" }}>
                <div style={{ position: "absolute", top: 5, left: "50%", width: 8, height: 8, marginLeft: -4, borderRadius: 4, background: k % 2 ? "#f6efe4" : "#2a1a0e", opacity: 0.5 }} />
                {money(it.price)}
              </div>
            </div>
          </div>
        );
      })}
      {/* pie */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", opacity: f >= 170 ? 1 : 0 }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 60, color: "#a5541f" }}>comprás desde una unidad</div>
        <div style={{ fontSize: 30, marginTop: 10 }}>envases 3g · precios en la web · link en bio</div>
      </div>
      <div style={{ position: "absolute", top: 210, left: 64, fontWeight: 700, fontSize: 30 }}>envases 3g</div>
      <Grain opacity={0.08} />
      <Audio src={staticFile("audio/stopmotion.wav")} />
    </AbsoluteFill>
  );
};
