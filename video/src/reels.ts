import type { ReelProps } from "./Reel";

// Datos reales del catálogo (precios de Supabase al 03/10/2026).
export const aromas: ReelProps = {
  hook: "Tu casa con olor a algo rico",
  hookSub: "4 aromas que vuelan",
  music: "audio/aromas.wav",
  cta: "¿Cuál es tu aroma?",
  slides: [
    { title: "Perfumina al agua", text: "Medio litro · vainilla coco, marina, uva, loto", price: 3800, photo: "fotos/perfumina-textil-al-agua-x-12-litro.webp" },
    { title: "Aceite premium puro", text: "Para difusores, velas, jabones y sahumerios", price: 1130, photo: "fotos/aceite-aromatico-premium-puro.webp" },
    { title: "Esencia para difusor", text: "Vainilla, flores blancas o coco · 250 o 500 cc", price: 4600, photo: "fotos/esencias-para-difusor.webp" },
    { title: "Perfumina al alcohol", text: "Campos de lavanda, coco lima, magnolia limón", price: 6000, photo: "fotos/perfumina-textil-al-alcohol-por-12-litro.webp" },
  ],
};

export const ideas: ReelProps = {
  hook: "4 botellas, mil ideas",
  hookSub: "mirá la última",
  music: "audio/ideas.wav",
  cta: "Mandanos tu idea",
  slides: [
    { title: "Aceite para regalar", text: "Botella cilíndrica ámbar 500 ml con tapa a rosca", price: 1470, photo: "fotos/botella-de-vidrio-cilindrica-de-500-ml-ambar-con-tapa-a-rosca.webp" },
    { title: "Limonada de heladera", text: "Botella 500 cc con tapa a rosca", price: 690, photo: "fotos/botella-500cc-con-tapa-a-rosca.webp" },
    { title: "Vinagre de hierbas", text: "Agropecuario 500 ml ámbar con tapón", price: 2574, photo: "fotos/botella-agropecuario-500-ml-vidrio-ambar-con-tapon.webp" },
    { title: "Jabón de cocina", text: "Agropecuario 500 ml cristal con tapón", price: 2882, photo: "fotos/botella-agropecuario-500-ml-vidrio-cristal-con-tapon.webp" },
  ],
};
