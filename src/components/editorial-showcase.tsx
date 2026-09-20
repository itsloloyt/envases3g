"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { categories, currency, normalize } from "@/lib/catalog";
import photography from "@/data/product-photography.json";

type SpotlightProduct = { slug: string; name: string; category: string; image: string; price: number | null };

export function EditorialShowcase({ products }: { products: SpotlightProduct[] }) {
  const [activeSlug, setActiveSlug] = useState(products[0]?.slug || "");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => products.filter((product) =>
    (!category || product.category === category) &&
    (!search || normalize(product.name).includes(normalize(search.trim()))),
  ), [products, category, search]);
  const active = Math.max(0, filtered.findIndex((product) => product.slug === activeSlug));
  const product = filtered[active];
  const advance = (direction: number) =>
    setActiveSlug(filtered[(active + direction + filtered.length) % filtered.length].slug);

  const filters = <div className="editorial-filters">
    <label>Elegí una categoría
      <select value={category} onChange={(event) => { setCategory(event.target.value); setActiveSlug(""); }}>
        <option value="">Todo el catálogo</option>
        {categories.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}
      </select>
    </label>
    <label>O buscá un producto
      <input value={search} onChange={(event) => { setSearch(event.target.value); setActiveSlug(""); }} placeholder="Nombre, capacidad o material" type="search" />
    </label>
    <span>{filtered.length} {filtered.length === 1 ? "producto" : "productos"}</span>
  </div>;

  return (
    <section className="editorial-section container" aria-labelledby="editorial-title">
      <div className="editorial-intro">
        <span className="eyebrow">INSPIRACIÓN PARA TU PRÓXIMO PROYECTO</span>
        <h2 id="editorial-title">Un envase puede cambiarlo todo<span>.</span></h2>
        <p>Explorá algunas formas de presentar tu idea. Después elegí la capacidad, el color y el accesorio que necesitás.</p>
      </div>
      {filters}
      {product ? (
      <div className="editorial-stage">
        <div className="editorial-stage-top">
          <span className="editorial-brand">ENVASES <b>3G</b></span>
          <span className="editorial-stage-tag">SELECCIÓN 3G</span>
          <span className="editorial-number">{String(active + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}</span>
        </div>
        <div className="editorial-controls">
          <button type="button" onClick={() => advance(-1)} disabled={filtered.length < 2} aria-label="Ver producto anterior"><ArrowLeft size={19} /></button>
          <button type="button" onClick={() => advance(1)} disabled={filtered.length < 2} aria-label="Ver producto siguiente"><ArrowRight size={19} /></button>
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
            {filtered.slice(Math.max(0, active - 2), Math.max(0, active - 2) + 5).map((entry) => (
              <button
                type="button"
                key={entry.slug}
                aria-label={`Ver ${entry.name}`}
                aria-pressed={entry.slug === product.slug}
                className={entry.slug === product.slug ? "active" : ""}
                onClick={() => setActiveSlug(entry.slug)}
              />
            ))}
          </div>
        </div>
      </div>
      ) : <div className="editorial-empty" role="status">No encontramos productos con esa búsqueda. Probá otro nombre o elegí «Todo el catálogo».</div>}
    </section>
  );
}
