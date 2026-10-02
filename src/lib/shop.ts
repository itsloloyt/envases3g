import { accessoryPhoto } from "./accessories";
import originalCovers from "@/data/original-covers.json";
import aiCovers from "@/data/ai-covers.json";
import subcategoryList from "@/data/subcategories.json";
import { categories, type Product } from "./catalog";

export type Subcategory = { category: string; slug: string; name: string };
export const subcategories = subcategoryList as Subcategory[];

/**
 * Portada del producto: foto de estudio generada con Higgsfield a partir de la foto original
 * de envases3g.com.ar; si todavía no existe, la foto original.
 */
export function cover(p: Pick<Product, "slug" | "image">) {
  return (aiCovers as Record<string, string>)[p.slug] ?? originalCover(p);
}

/** Foto original publicada en envases3g.com.ar. */
export function originalCover(p: Pick<Product, "slug" | "image">) {
  return (originalCovers as Record<string, string>)[p.slug] ?? p.image;
}

/** Datos mínimos para listar productos en el cliente. */
export type Card = {
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  subcategoryName: string;
  price: number;
  maxPrice: number;
  available: boolean;
  image: string;
  image2: string | null;
  variantCount: number;
  /** Fotos reales de los accesorios que se pueden elegir (sin repetir). */
  accessories: string[];
  variantId: string;
  variantName: string;
  minQuantity: number;
};

export function toCard(p: Product): Card {
  const prices = p.variants.map((v) => v.price);
  const min = Math.min(...prices);
  const first = p.variants.find((v) => v.available) ?? p.variants[0];
  const img = cover(p);
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    subcategoryName: fixName(p.subcategoryName),
    price: min,
    maxPrice: Math.max(...prices),
    available: p.available,
    image: img,
    image2: p.images.find((i) => i !== img) ?? null,
    variantCount: p.variants.length,
    accessories: ["tapas", "valvulas-y-gatillos"].includes(p.subcategory) ? [] : [...new Set(p.variants.map((v) => accessoryPhoto(v)).filter((x): x is string => !!x))],
    variantId: first.id,
    variantName: first.name,
    minQuantity: first.minQuantity,
  };
}

const FIX: Record<string, string> = {
  "Botellas y Bidones PET y PEAD": "Botellas y bidones PET y PEAD",
  "Envases para vela": "Envases para velas",
  "Valvulas y Gatillos": "Válvulas y gatillos",
  "Deco Hogar": "Deco hogar",
  "Envases de Plastico": "Envases de plástico",
  "Envases de Vidrio": "Envases de vidrio",
  "Goteros y Colirios": "Goteros y colirios",
  "Potes y Tubos plásticos": "Potes y tubos plásticos",
  "Potes y Tubos de vidrio": "Potes y tubos de vidrio",
  "Perfumería y Belleza": "Perfumería y belleza",
  "Frascos y Botellas": "Frascos y botellas",
  "Vasos - Tapones - Botellas": "Vasos, tapones y botellas",
  "Especieros y Vertedores": "Especieros y vertedores",
};
export const fixName = (s: string) => FIX[s] ?? s;

export const rubros = categories;
export const rubroName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
