"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Product, currency } from "@/lib/catalog";
import photography from "@/data/product-photography.json";

export function EditorialShowcase({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const product = products[active];
  if (!product) return null;

  const advance = (direction: number) =>
    setActive((current) => (current + direction + products.length) % products.length);

  return (
    <section className="editorial-section container" aria-labelledby="editorial-title">
      <div className="editorial-intro">
        <span className="eyebrow">INSPIRACIÓN PARA TU PRÓXIMO PROYECTO</span>
        <h2 id="editorial-title">Un envase puede cambiarlo todo<span>.</span></h2>
        <p>Explorá algunas formas de presentar tu idea. Después elegí la capacidad, el color y el accesorio que necesitás.</p>
      </div>
      <div className="editorial-stage">
        <div className="editorial-stage-top">
          <span className="editorial-brand">ENVASES <b>3G</b></span>
          <span className="editorial-stage-tag">SELECCIÓN 3G</span>
          <span className="editorial-number">{String(active + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}</span>
        </div>
        <div className="editorial-controls">
          <button type="button" onClick={() => advance(-1)} aria-label="Ver producto anterior"><ArrowLeft size={19} /></button>
          <button type="button" onClick={() => advance(1)} aria-label="Ver producto siguiente"><ArrowRight size={19} /></button>
        </div>
        <div className="editorial-copy" key={product.slug + "-copy"}>
          <span className="editorial-overline">TU IDEA, EN PRIMER PLANO</span>
          <h3>{product.name}</h3>
          <p>Elegí el detalle que hace única tu presentación.</p>
          <Link href={`/productos/${product.slug}`} className="editorial-cta">Ver opciones <ArrowUpRight size={18} /></Link>
        </div>
        <div className="editorial-image" key={product.slug}>
          <Image
            src={(photography as Record<string, string>)[product.slug] || product.image}
            alt={product.name}
            fill
            sizes="(max-width: 760px) 74vw, 36vw"
          />
        </div>
        <div className="editorial-price">
          <span>DESDE</span>
          <strong>{product.price === null ? "Consultar" : currency(product.price)}</strong>
          <small>por unidad · consultá disponibilidad</small>
        </div>
        <div className="editorial-footer">
          <span>UN ENVASE. INFINITAS POSIBILIDADES.</span>
          <div className="editorial-dots" role="group" aria-label="Elegir producto destacado">
            {products.map((entry, index) => (
              <button
                type="button"
                key={entry.slug}
                aria-label={`Ver ${entry.name}`}
                aria-pressed={index === active}
                className={index === active ? "active" : ""}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
