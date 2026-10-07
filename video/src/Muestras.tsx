import React from "react";
import { AbsoluteFill, Img, useCurrentFrame } from "remotion";
import { C, foto, money, SANS, SERIF } from "./kit";

// Carrusel 4:5 "Kit de muestras" — cada frame es una placa. Precios y contenidos del catálogo.
type Slide = { n: string; img: string; kicker: string; title: string; price?: number; body: string };
const SLIDES: Slide[] = [
  { n: "01", img: "pote-cristal-5-cc-con-tapa-a-presion", kicker: "KIT DE MUESTRAS", title: "La muestra que regalás hoy es la *venta de mañana*", body: "Envases chicos para que tus clientas prueben antes de comprar" },
  { n: "02", img: "pote-cristal-5-cc-con-tapa-a-presion", kicker: "PARA CREMAS Y BÁLSAMOS", title: "Pote cristal *5 cc*", price: 373, body: "Tapa a presión. Entra justo una dosis para probar" },
  { n: "03", img: "ampolla-pvc-10-cc-con-tapa-presion", kicker: "PARA LÍQUIDOS Y ACEITES", title: "Ampolla PVC *10 cc*", price: 469, body: "Transparente, con tapa a presión. Se ve el producto" },
  { n: "04", img: "kit-para-viaje-por-5-unidades", kicker: "TODO EN UNO", title: "Kit para viaje *× 5*", price: 3600, body: "2 envases de 100 ml con cremera, 1 de 60 ml con spray, 1 de 30 cc con tapa, 1 pote de 30 cc y bolsa con cierre" },
];
export const MUESTRAS_SLIDES = SLIDES.length + 1;

const Rich: React.FC<{ t: string; accent: string }> = ({ t, accent }) => (
  <>{t.split("*").map((p, i) => (i % 2 ? <span key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: accent, letterSpacing: -1 }}>{p}</span> : <span key={i}>{p}</span>))}</>
);

const Dots: React.FC<{ i: number; dark?: boolean }> = ({ i, dark }) => (
  <div style={{ position: "absolute", right: 64, bottom: 60, display: "flex", gap: 10 }}>
    {Array.from({ length: MUESTRAS_SLIDES }).map((_, k) => (
      <div key={k} style={{ width: k === i ? 34 : 10, height: 10, borderRadius: 5, background: dark ? (k === i ? C.sun : "rgba(255,255,255,.35)") : k === i ? C.night : "rgba(4,22,25,.2)" }} />
    ))}
  </div>
);

export const Muestras: React.FC = () => {
  const i = useCurrentFrame();
  if (i >= SLIDES.length) {
    return (
      <AbsoluteFill style={{ background: C.night, fontFamily: SANS, color: C.white, padding: "0 72px" }}>
        <div style={{ position: "absolute", top: 70, left: 72, fontWeight: 700, fontSize: 32 }}>envases 3g</div>
        <div style={{ position: "absolute", left: 72, right: 72, top: 260 }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 4, color: C.sun }}>EL TRUCO</div>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1, marginTop: 20 }}><Rich t="Sumá una etiqueta con *tu @ y un QR*" accent={C.sun} /></div>
          <div style={{ fontSize: 40, lineHeight: 1.3, marginTop: 40, opacity: 0.85 }}>Así quien prueba la muestra sabe dónde volver a comprarte.</div>
        </div>
        <div style={{ position: "absolute", left: 72, right: 72, top: 680, display: "flex", gap: 20 }}>
          {SLIDES.slice(1).map((x) => <Img key={x.img} src={foto(x.img)} style={{ flex: 1, height: 230, objectFit: "cover", borderRadius: 24 }} />)}
        </div>
        <div style={{ position: "absolute", left: 72, right: 72, bottom: 120 }}>
          <div style={{ fontSize: 44, fontWeight: 700 }}>Comprás desde una unidad</div>
          <div style={{ display: "inline-block", marginTop: 22, padding: "24px 44px", borderRadius: 999, background: C.sun, color: C.night, fontWeight: 700, fontSize: 46 }}>WhatsApp 223 598-4362</div>
          <div style={{ fontSize: 30, marginTop: 22, opacity: 0.7 }}>Moreno 4156 · Mar del Plata · envíos</div>
        </div>
        <Dots i={i} dark />
      </AbsoluteFill>
    );
  }
  const s = SLIDES[i];
  const cover = i === 0;
  return (
    <AbsoluteFill style={{ background: "#efe9df", fontFamily: SANS, color: C.night }}>
      <Img src={foto(s.img)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: cover ? 1350 : 860, objectFit: "cover", objectPosition: "50% 62%" }} />
      <div style={{ position: "absolute", top: 70, left: 72, fontWeight: 700, fontSize: 32 }}>envases 3g</div>
      <div style={{ position: "absolute", top: 70, right: 72, fontWeight: 700, fontSize: 32, opacity: 0.6 }}>{s.n} / 0{MUESTRAS_SLIDES}</div>
      {cover ? (
        <div style={{ position: "absolute", left: 72, right: 72, top: 190 }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 4, color: C.deep }}>{s.kicker}</div>
          <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: -4.5, lineHeight: 0.98, marginTop: 18 }}><Rich t={s.title} accent={C.deep} /></div>
          <div style={{ position: "absolute", top: 870, left: 0, right: 220, fontSize: 38, lineHeight: 1.25 }}>{s.body} →</div>
        </div>
      ) : (
        <div style={{ position: "absolute", left: 0, right: 0, top: 860, bottom: 0, background: C.white, padding: "50px 72px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4, color: C.deep }}>{s.kicker}</div>
            <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3, color: C.night }}>{money(s.price!)}</div>
          </div>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3.5, lineHeight: 1, marginTop: 6 }}><Rich t={s.title} accent={C.deep} /></div>
          <div style={{ fontSize: 34, lineHeight: 1.3, marginTop: 20, maxWidth: 820, opacity: 0.8 }}>{s.body}</div>
        </div>
      )}
      <Dots i={i} />
    </AbsoluteFill>
  );
};
