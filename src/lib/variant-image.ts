import type { Product, Variant } from './catalog';
import verifiedPhotos from '@/data/variant-photography.json';
import sourcePhotos from '@/data/source-variant-photography.json';

type SourcePhoto = { src: string; shared: boolean };

/** Keep the selected presentation identical in the product gallery and cart. */
export function variantPhoto(product: Product, variant?: Variant) {
  if (!variant) return undefined;
  const verified = (verifiedPhotos as Record<string, Record<string, string>>)[product.slug]?.[variant.id];
  if (variant.image || verified) return { src: variant.image || verified, shared: false };
  return (sourcePhotos as Record<string, Record<string, SourcePhoto>>)[product.slug]?.[variant.id];
}
