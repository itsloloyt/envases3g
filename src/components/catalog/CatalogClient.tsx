"use client";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import type { Card, Subcategory } from "@/lib/shop";
import { fixName } from "@/lib/shop";
import { ProductCard } from "../ProductCard";
import { SplitHeading, ease } from "../Reveal";

const PAGE = 24;
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const SORTS = [
  { value: "", label: "Relevancia" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
  { value: "nombre", label: "Nombre A–Z" },
];

type Initial = { rubro: string; cat: string; q: string; sort: string };

type Rubro = { slug: string; name: string };

export function CatalogClient({ products, rubros: roots, subcategories, initial }: { products: Card[]; rubros: Rubro[]; subcategories: Subcategory[]; initial: Initial }) {
  const [rubro, setRubro] = useState(initial.rubro);
  const [cat, setCat] = useState(initial.cat);
  const [q, setQ] = useState(initial.q);
  const [sort, setSort] = useState(initial.sort);
  const [onlyStock, setOnlyStock] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const dq = useDeferredValue(q);

  const rubroCat = roots.find((c) => c.slug === rubro);
  const subs = rubroCat ? subcategories.filter((c) => c.category === rubroCat.slug && products.some((p) => p.category === c.category && p.subcategory === c.slug)) : [];
  const subCat = subs.find((c) => c.slug === cat);
  const countByRoot = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of products) m[p.category] = (m[p.category] ?? 0) + 1;
    return m;
  }, [products]);

  // Mantener la URL sincronizada sin volver a pedir la página al servidor.
  useEffect(() => {
    const sp = new URLSearchParams();
    if (rubro) sp.set("rubro", rubro);
    if (cat) sp.set("cat", cat);
    if (dq) sp.set("q", dq);
    if (sort) sp.set("orden", sort);
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [rubro, cat, dq, sort]);

  const rubroId = rubroCat?.slug;
  const subId = subCat?.slug;
  // Con ~400 productos filtrar en cada render es barato; no hace falta memoizar.
  const filtered = (() => {
    const terms = norm(dq).split(/\s+/).filter(Boolean);
    const list = products.filter((p) => {
      if (rubroId && p.category !== rubroId) return false;
      if (subId && p.subcategory !== subId) return false;
      if (onlyStock && !p.available) return false;
      if (terms.length) {
        const hay = norm(`${p.name} ${p.subcategoryName}`);
        return terms.every((t) => hay.includes(t));
      }
      return true;
    });
    if (sort === "precio-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "precio-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "nombre") list.sort((a, b) => a.name.localeCompare(b.name, "es"));
    else list.sort((a, b) => Number(b.available) - Number(a.available));
    return list;
  })();

  const visible = filtered.slice(0, limit);
  const reset = () => {
    setRubro("");
    setCat("");
    setQ("");
    setSort("");
    setOnlyStock(false);
  };
  const selectRubro = (slug: string) => {
    setRubro(slug === rubro ? "" : slug);
    setCat("");
    setLimit(PAGE);
  };

  return (
    <div className="relative overflow-x-clip pb-24 pt-32">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-20 -z-10 size-[520px] rounded-full bg-teal/20 blur-[120px]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-deep">Catálogo</p>
            <SplitHeading as="h1" text={rubroCat ? rubroCat.name : "Todos los productos"} className="mt-3 font-display text-5xl font-extrabold leading-[1] sm:text-7xl" />
          </div>
          <label className="glass flex w-full items-center gap-3 rounded-full px-5 py-1 transition-shadow focus-within:ring-2 focus-within:ring-teal/40 lg:max-w-md">
            <Search className="size-5 shrink-0 text-muted" />
            <span className="sr-only">Buscar productos</span>
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(PAGE);
              }}
              placeholder="Buscar: gotero, 250 cc, ámbar, rosca 24…"
              className="h-12 w-full bg-transparent text-base outline-none placeholder:text-muted/70 focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none"
            />
            {q && (
              <button onClick={() => setQ("")} className="grid size-9 place-items-center rounded-full hover:bg-ink/5" aria-label="Borrar búsqueda">
                <X className="size-4" />
              </button>
            )}
          </label>
        </div>

        {/* Rubros */}
        <div className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="toolbar" aria-label="Filtrar por rubro" data-lenis-prevent-horizontal>
          <Chip active={!rubro} onClick={() => selectRubro("")}>
            Todos <span className="opacity-60">{products.length}</span>
          </Chip>
          {roots.map((r) => (
            <Chip key={r.slug} active={rubro === r.slug} onClick={() => selectRubro(r.slug)}>
              {r.name} <span className="opacity-60">{countByRoot[r.slug] ?? 0}</span>
            </Chip>
          ))}
        </div>

        {/* Subcategorías */}
        <AnimatePresence initial={false}>
          {subs.length > 0 && (
            <motion.div
              key={rubro}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease }}
              className="overflow-hidden"
            >
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pt-3 sm:mx-0 sm:flex-wrap sm:px-0" data-lenis-prevent-horizontal>
                {subs.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => {
                      setCat(cat === s.slug ? "" : s.slug);
                      setLimit(PAGE);
                    }}
                    aria-pressed={cat === s.slug}
                    className={`min-h-10 shrink-0 rounded-full border px-4 text-sm transition-colors duration-200 ${
                      cat === s.slug ? "border-teal-deep bg-teal/10 text-teal-deep" : "border-line text-ink-2 hover:border-ink/40"
                    }`}
                  >
                    {fixName(s.name)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de resultados */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="text-sm text-muted" aria-live="polite">
            <span className="font-semibold text-ink">{filtered.length}</span> {filtered.length === 1 ? "producto" : "productos"}
            {subCat && <> en {fixName(subCat.name)}</>}
          </p>
          <div className="flex items-center gap-2">
            <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-line px-4 text-sm">
              <input type="checkbox" checked={onlyStock} onChange={(e) => setOnlyStock(e.target.checked)} className="size-4 accent-[var(--teal-deep)]" />
              Con stock
            </label>
            <label className="relative flex min-h-10 items-center rounded-full border border-line pl-4 pr-9 text-sm">
              <SlidersHorizontal className="mr-2 size-4 text-muted" />
              <span className="sr-only">Ordenar por</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none bg-transparent py-2 outline-none">
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 size-4 text-muted" />
            </label>
          </div>
        </div>

        {/* Grilla */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl">No encontramos productos</p>
            <p className="mt-2 text-muted">Probá con otra palabra o quitá los filtros.</p>
            <button onClick={reset} className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-teal-deep">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <motion.div layout className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {visible.map((p, i) => (
                <ProductCard key={p.slug} p={p} priority={i < 8} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {filtered.length > limit && (
          <div className="mt-14 flex flex-col items-center gap-3">
            <p className="text-sm text-muted">
              Mostrando {visible.length} de {filtered.length}
            </p>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-ink transition-all duration-500" style={{ width: `${(visible.length / filtered.length) * 100}%` }} />
            </div>
            <button onClick={() => setLimit((l) => l + PAGE)} className="mt-2 rounded-full border border-ink px-8 py-3.5 text-sm font-medium transition-colors duration-200 hover:bg-ink hover:text-white">
              Cargar más productos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`relative isolate min-h-11 shrink-0 rounded-full px-5 text-sm font-medium transition-colors duration-200 ${active ? "text-white" : "text-ink-2 hover:bg-ink/[0.05]"}`}
    >
      {active && <motion.span layoutId="rubro-chip" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ duration: 0.45, ease }} />}
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  );
}
