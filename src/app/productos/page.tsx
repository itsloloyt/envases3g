import { Suspense } from "react";
import { connection } from "next/server";
import { CatalogBrowser } from "@/components/catalog-browser";
import { getCatalog } from "@/lib/catalog-server";
export const metadata = { title: "Todos los productos" };
async function CatalogContent() {
  await connection();
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
