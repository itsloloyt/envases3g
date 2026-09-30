import art from "@/data/accessory-art.json";
import aiPhotos from "@/data/ai-variant-photos.json";
import { normalize, type Product, type Variant } from "./catalog";
import { variantPhoto } from "./variant-image";
import { cover } from "./shop";

type Art = { src: string; label: string; width: number };
const library = art as Record<string, Art>;

/**
 * Traduce el nombre de una variante ("Spray Oro pico negro", "Flip Top natural"…)
 * a una pieza de la biblioteca de accesorios recortados.
 */
export function accessoryKey(name: string): string | null {
  const n = normalize(name);
  const color = /\boro\b/.test(n) ? "oro" : /plata/.test(n) ? "plata" : /aluminio/.test(n) ? "aluminio" : /negr/.test(n) ? "negra" : /blanc/.test(n) ? "blanca" : /natural|transparente/.test(n) ? "natural" : null;
  const family = /gatillo/.test(n)
    ? "gatillo"
    : /spray|pulverizador/.test(n)
      ? "spray"
      : /crema|dosificador/.test(n)
        ? "crema"
        : /flip ?top/.test(n)
          ? "fliptop"
          : /disk ?top|disc ?top/.test(n)
            ? "disktop"
            : /difusora/.test(n)
              ? "difusora"
              : /gotero|pipeta|gota/.test(n)
                ? "gotero"
                : /tapa|ciega/.test(n)
                  ? "tapa"
                  : null;
  if (!family) return null;
  const candidates = [color && `${family}-${color}`, family].filter(Boolean) as string[];
  return candidates.find((k) => library[k]) ?? null;
}

export function accessoryArt(variant?: Variant): Art | null {
  if (!variant) return null;
  const key = accessoryKey(variant.name);
  return key ? library[key] : null;
}

/** Foto que corresponde a la opción elegida: IA > estudio > foto original de la variante > portada. */
export function photoFor(product: Product, variant?: Variant) {
  const ai = variant && (aiPhotos as Record<string, Record<string, string>>)[product.slug]?.[variant.id];
  if (ai) return { src: ai, exact: true };
  const photo = variantPhoto(product, variant);
  if (photo && !photo.shared) return { src: photo.src, exact: true };
  return { src: cover(product), exact: false };
}
