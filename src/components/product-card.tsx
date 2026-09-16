import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Product, currency, categoryName } from "@/lib/catalog";
import photography from "@/data/product-photography.json";
export function ProductCard({ product: p }: { product: Product }) {
  return (
    <article className="product-card">
      <Link className="product-image" href={"/productos/" + p.slug}>
        <Image
          src={(photography as Record<string,string>)[p.slug] || p.image}
          alt={p.name}
          fill
          sizes="(max-width: 600px) 46vw, (max-width: 1000px) 30vw, 23vw"
        />
        <span className="product-arrow">
          <ArrowUpRight size={20} />
        </span>
        {!p.available && (
          <span className="stock-tag">Consultar disponibilidad</span>
        )}
      </Link>
      <div className="product-copy">
        <span className="eyebrow">{categoryName(p.category)}</span>
        <Link href={"/productos/" + p.slug}>
          <h3>{p.name}</h3>
        </Link>
        <div className="price-line">
          <strong>
            {p.price != null ? currency(p.price) : "Consultar precio"}
          </strong>
          <span>
            {p.variants.length > 1
              ? "Desde · " + p.variants.length + " opciones"
              : "Por unidad"}
          </span>
        </div>
      </div>
    </article>
  );
}
