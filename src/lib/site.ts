export const site = {
  name: "Envases 3G",
  description:
    "Envases de vidrio y plástico, tapas, válvulas, gatillos, esencias, varillas y difusores. Venta minorista y mayorista en Mar del Plata.",
  address: "Moreno 4156",
  city: "Mar del Plata, Buenos Aires",
  mapsQuery: "Moreno 4156, Mar del Plata, Buenos Aires, Argentina",
  phoneDisplay: "(0223) 598-4362",
  phone: "+5492235984362",
  whatsapp: "5492235984362",
  email: "envases3g@gmail.com",
  instagram: "https://www.instagram.com/envases3gmdq",
  instagramHandle: "@envases3gmdq",
  facebook: "https://www.facebook.com/envases3g",
  // Horarios publicados en directorios comerciales; confirmar con el local.
  hours: [
    { days: "Lunes a viernes", time: "9:00 – 15:00" },
    { days: "Sábados", time: "9:00 – 13:00" },
    { days: "Domingos", time: "Cerrado" },
  ],
};

export const waLink = (text?: string) => `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
