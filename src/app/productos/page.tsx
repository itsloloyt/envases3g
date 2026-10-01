import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog-server";
import { categories } from "@/lib/catalog";
import { subcategories, toCard } from "@/lib/shop";
import { CatalogClient } from "@/components/catalog/CatalogClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Catálogo de productos",
  description: "Envases de vidrio y plástico, tapas, válvulas, gatillos, esencias, varillas y difusores con precios actualizados.",
};

export default async function ProductosPage({ searchParams }: PageProps<"/productos">) {
  const sp = await searchParams;
  const products = await getCatalog();
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  // Compatibilidad con los links del sitio anterior (?categoria=).
  const rubro = one(sp.rubro) || one(sp.categoria);

  return (
    <CatalogClient
      products={products.map(toCard)}
      rubros={categories.map(({ slug, name }) => ({ slug, name }))}
      subcategories={subcategories}
      initial={{ rubro, cat: one(sp.cat), q: one(sp.q), sort: one(sp.orden) }}
    />
  );
}
