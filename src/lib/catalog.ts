import data from "@/data/products.json";
export type Variant = {
  id: string;
  name: string;
  price: number;
  available: boolean;
  minQuantity: number;
  image?: string;
};
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  subcategoryName: string;
  description: string;
  price: number | null;
  available: boolean;
  image: string;
  images: string[];
  variants: Variant[];
  sourceUrl: string;
};
export const products = data as Product[];
export const categories = [
  {
    slug: "frascos-y-botellas-de-vidrio",
    name: "Frascos y botellas de vidrio",
    short: "Vidrio",
    text: "Transparencia que inspira.",
    image: "https://d22fxaf9t8d39k.cloudfront.net/897b04014cf6b09178f1f0dccee95a4bad79556968c4192e43f5cbf47d8b039599432.jpg",
  },
  {
    slug: "plastico",
    name: "Plástico",
    short: "Plástico",
    text: "Versátiles por naturaleza.",
    image: "https://d22fxaf9t8d39k.cloudfront.net/5e004f7e55e9b35da8bfb0b8a849690e263c454775ea82983a4286fd5df47ef599432.jpg",
  },
  {
    slug: "esencias-y-difusores",
    name: "Esencias y difusores",
    short: "Esencias y difusores",
    text: "Aromas que cuentan historias.",
    image: "https://d22fxaf9t8d39k.cloudfront.net/ccf9acb35c3670b9e98f38aa39b96d86ae8c855cea49e316ed266b0ababf78e399432.jpg",
  },
  {
    slug: "cosmetica-y-farmacia",
    name: "Cosmética y farmacia",
    short: "Cosmética y farmacia",
    text: "El cuidado está en los detalles.",
    image: "https://d22fxaf9t8d39k.cloudfront.net/f8d61115a65805ff9f3c7bf218ca554ce1045f49e4466d03c1a173ce642f751e99432.jpg",
  },
  {
    slug: "accesorios",
    name: "Accesorios",
    short: "Accesorios",
    text: "El toque que lo completa.",
    image: "https://d22fxaf9t8d39k.cloudfront.net/e8a11b4e4f1cd7033353f40b019a31dae3eb58b1bddd2ac39f2a244ecc356e5d99432.jpg",
  },
  {
    slug: "alimentos",
    name: "Alimentos",
    short: "Alimentos",
    text: "Para conservar lo bueno.",
    image: "https://d22fxaf9t8d39k.cloudfront.net/82586d4dba1f87201d11130c04a34cf15a36259adb4ee089e8fb2a8614df09f299432.jpg",
  },
  {
    slug: "combos-y-kits",
    name: "Combos y kits",
    short: "Combos y kits",
    text: "Todo listo para empezar.",
    image: "/images/hero-general.svg",
  },
];
export const currency = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
export const whatsapp = "https://wa.me/5492235984362";
export const categoryName = (slug: string) =>
  categories.find((c) => c.slug === slug)?.name ?? slug;
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
