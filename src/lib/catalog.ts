import data from "@/data/products.json";
export type Variant = {
  id: string;
  name: string;
  price: number;
  available: boolean;
  minQuantity: number;
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
    image: "frasco-vidrio-amanecer-250-cc",
  },
  {
    slug: "plastico",
    name: "Plástico",
    short: "Plástico",
    text: "Versátiles por naturaleza.",
    image: "body-125-cc-ambar",
  },
  {
    slug: "esencias-y-difusores",
    name: "Esencias y difusores",
    short: "Esencias y difusores",
    text: "Aromas que cuentan historias.",
    image: "frasco-apollo-vidrio-125-ml-ambar-con-tapa-difusora",
  },
  {
    slug: "cosmetica-y-farmacia",
    name: "Cosmética y farmacia",
    short: "Cosmética y farmacia",
    text: "El cuidado está en los detalles.",
    image: "",
  },
  {
    slug: "accesorios",
    name: "Accesorios",
    short: "Accesorios",
    text: "El toque que lo completa.",
    image: "",
  },
  {
    slug: "alimentos",
    name: "Alimentos",
    short: "Alimentos",
    text: "Para conservar lo bueno.",
    image: "",
  },
  {
    slug: "combos-y-kits",
    name: "Combos y kits",
    short: "Combos y kits",
    text: "Todo listo para empezar.",
    image: "",
  },
];
export const currency = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
export const whatsapp = "https://wa.me/5492235984362";
export const categoryName = (slug: string) =>
  categories.find((c) => c.slug === slug)?.name ?? slug;
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
