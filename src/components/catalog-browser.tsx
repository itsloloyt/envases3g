"use client";
import { useState, useMemo, useDeferredValue } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, SlidersHorizontal, ArrowRight } from "lucide-react";
import {
  products as fallbackProducts,
  Product,
  categories,
  normalize,
  categoryName,
} from "@/lib/catalog";
import { ProductCard } from "./product-card";
export function CatalogBrowser({
  items = fallbackProducts,
}: {
  items?: Product[];
}) {
  const products = items;
  const params = useSearchParams();
  const router = useRouter();
  const cat = params.get("categoria") || "";
  const sub = params.get("subcategoria") || "";
  const [query, setQuery] = useState(params.get("q") || "");
  const deferred = useDeferredValue(query);
  const [sort, setSort] = useState("name");
  const [limit, setLimit] = useState(24);
  const [stock, setStock] = useState(false);
  const [filters, setFilters] = useState(false);
  const subcats = Array.from(
    new Map(
      products
        .filter((p) => p.category === cat && p.subcategory)
        .map((p) => [p.subcategory, p.subcategoryName]),
    ).entries(),
  );
  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (!cat || p.category === cat) &&
            (!sub || p.subcategory === sub) &&
            (!stock || p.available) &&
            normalize(
              p.name +
                " " +
                p.description +
                " " +
                categoryName(p.category) +
                " " +
                p.subcategoryName,
            ).includes(normalize(deferred)),
        )
        .sort((a, b) =>
          sort === "price-up"
            ? (a.price ?? Infinity) - (b.price ?? Infinity)
            : sort === "price-down"
              ? (b.price ?? 0) - (a.price ?? 0)
              : a.name.localeCompare(b.name, "es"),
        ),
    [cat, sub, stock, deferred, sort, products],
  );
  function category(slug: string, subcategory = "") {
    setLimit(24);
    router.push(
      "/productos" +
        (slug
          ? "?categoria=" +
            slug +
            (subcategory ? "&subcategoria=" + subcategory : "")
          : ""),
      { scroll: false },
    );
  }
  return (
    <>
      <div className="catalog-title">
        <span className="eyebrow">ENCONTRÁ EL TUYO</span>
        <h1>{cat ? categoryName(cat) : "Todo empieza con un envase."}</h1>
        <p>
          Explorá formas, materiales y posibilidades para tu próxima creación.
        </p>
      </div>
      <div className="catalog-toolbar">
        <label className="search-field" id="busqueda">
          <Search size={20} />
          <input
            aria-label="Buscar en el catálogo"
            placeholder="Buscá por producto, capacidad o material…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(24);
            }}
          />
          {query && (
            <button aria-label="Limpiar búsqueda" onClick={() => setQuery("")}>
              <X size={18} />
            </button>
          )}
        </label>
        <button
          className="filter-mobile button"
          onClick={() => setFilters(!filters)}
        >
          <SlidersHorizontal size={17} /> Filtros
        </button>
        <select
          aria-label="Ordenar productos"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="name">Nombre: A–Z</option>
          <option value="price-up">Menor precio</option>
          <option value="price-down">Mayor precio</option>
        </select>
      </div>
      <div className="catalog-layout">
        <aside className={"filters " + (filters ? "visible" : "")}>
          <h2>Categorías</h2>
          <button
            className={!cat ? "selected" : ""}
            onClick={() => category("")}
          >
            Todos los productos <span>{products.length}</span>
          </button>
          {categories.map((c) => (
            <div key={c.slug}>
              <button
                className={cat === c.slug ? "selected" : ""}
                onClick={() => category(c.slug)}
              >
                {c.name}
                <span>
                  {products.filter((p) => p.category === c.slug).length}
                </span>
              </button>
              {cat === c.slug && (
                <div className="subcategories">
                  {subcats.map(([slug, name]) => (
                    <button
                      key={slug}
                      className={sub === slug ? "selected" : ""}
                      onClick={() => category(cat, sub === slug ? "" : slug)}
                    >
                      {name || slug.replaceAll("-", " ")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="stock-filter">
            <label>
              <input
                type="checkbox"
                checked={stock}
                onChange={(e) => {
                  setStock(e.target.checked);
                  setLimit(24);
                }}
              />{" "}
              Con disponibilidad publicada
            </label>
          </div>
          <div className="help-card">
            <span>¿No sabés cuál elegir?</span>
            <p>Te ayudamos a encontrar el envase para tu idea.</p>
            <a href="/contacto">
              Consultanos <ArrowRight size={16} />
            </a>
          </div>
        </aside>
        <div>
          <div className="result-summary" aria-live="polite">
            <span>
              {filtered.length} productos {query && "para “" + query + "”"}
            </span>
            {(cat || query || stock) && (
              <button
                onClick={() => {
                  setQuery("");
                  setStock(false);
                  category("");
                }}
              >
                Limpiar filtros <X size={13} />
              </button>
            )}
          </div>
          <div className="catalog-product-grid">
            {filtered.slice(0, limit).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          {!filtered.length && (
            <div className="empty">
              <Search size={35} />
              <h2>No encontramos ese envase.</h2>
              <p>Probá con otra palabra o quitá algunos filtros.</p>
              <button
                className="button primary"
                onClick={() => {
                  setQuery("");
                  setStock(false);
                  category("");
                }}
              >
                Ver todos los productos
              </button>
            </div>
          )}
          {filtered.length > limit && (
            <div className="load-more">
              <p>
                Viendo {Math.min(limit, filtered.length)} de {filtered.length}{" "}
                productos
              </p>
              <button
                className="button outline"
                onClick={() => setLimit(limit + 24)}
              >
                Ver más productos <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
