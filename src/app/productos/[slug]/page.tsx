import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getCatalog } from "@/lib/catalog-server";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connection();
  const products = await getCatalog();
  const p = products.find((p) => p.slug === slug);
  return {
    title: p?.name || "Producto no encontrado",
    description: p?.description?.slice(0, 155) || p?.name,
  };
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connection();
  const products = await getCatalog();
  const p = products.find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <main id="contenido" className="container detail">
      <ProductDetail product={p} />
      <section className="section related">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SEGUÍ DÁNDOLE FORMA</span>
            <h2>También te puede inspirar.</h2>
          </div>
        </div>
        <div className="product-grid">
          {products
            .filter((x) => x.category === p.category && x.slug !== p.slug)
            .slice(0, 4)
            .map((x) => (
              <ProductCard key={x.slug} product={x} />
            ))}
        </div>
      </section>
    </main>
  );
}
