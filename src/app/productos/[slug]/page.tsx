import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCatalog } from "@/lib/catalog-server";
import { categoryName } from "@/lib/catalog";
import { cover, fixName, toCard } from "@/lib/shop";
import { site } from "@/lib/site";
import { ProductView } from "@/components/product/ProductView";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/productos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getCatalog()).find((x) => x.slug === slug);
  if (!p) return { title: "Producto no encontrado" };
  return {
    title: p.name,
    description: p.description?.slice(0, 155) || `${p.name} — Envases 3G. Retiro en ${site.address}, ${site.city}.`,
    openGraph: { images: [cover(p)] },
  };
}

export default async function ProductPage({ params }: PageProps<"/productos/[slug]">) {
  const { slug } = await params;
  const products = await getCatalog();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const related = products.filter((p) => p.subcategory === product.subcategory && p.slug !== product.slug).slice(0, 4);
  const prices = product.variants.map((v) => v.price);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [cover(product), ...product.images],
    description: product.description || undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "ARS",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      availability: product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="pb-24 pt-28 sm:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Migas de pan" className="mb-8 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/productos" className="hover:text-ink">
                Productos
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li>
              <Link href={`/productos?rubro=${product.category}`} className="hover:text-ink">
                {categoryName(product.category)}
              </Link>
            </li>
            {product.subcategory && (
              <>
                <ChevronRight className="size-3.5" aria-hidden />
                <li>
                  <Link href={`/productos?rubro=${product.category}&cat=${product.subcategory}`} className="hover:text-ink">
                    {fixName(product.subcategoryName)}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>

        <ProductView product={product} categoryName={fixName(product.subcategoryName) || categoryName(product.category)} />

        {related.length > 0 && (
          <section className="mt-28">
            <Reveal>
              <h2 className="font-display text-4xl font-extrabold sm:text-5xl">
                También te puede <span className="font-accent font-normal text-teal-deep">servir</span>
              </h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} p={toCard(p)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
