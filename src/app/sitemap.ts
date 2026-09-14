import type { MetadataRoute } from "next";
import { products } from "@/lib/catalog";
export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://envases3g.vercel.app";
  return [
    { url: base, priority: 1 },
    { url: base + "/productos", priority: 0.9 },
    { url: base + "/contacto", priority: 0.7 },
    ...products.map((p) => ({
      url: base + "/productos/" + p.slug,
      priority: 0.6,
    })),
  ];
}
