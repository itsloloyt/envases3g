import { Suspense } from "react";
import { CatalogBrowser } from "@/components/catalog-browser";
import { getCatalog } from "@/lib/catalog-server";
export const metadata = { title: "Todos los productos" };
async function CatalogContent() {
  const items = await getCatalog();
  return <CatalogBrowser items={items} />;
}
export default function Catalog() {
  return (
    <main id="contenido" className="container catalog">
      <Suspense fallback={<p>Cargando catálogo…</p>}>
        <CatalogContent />
      </Suspense>
    </main>
  );
}
