"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Plus } from "lucide-react";
import { currency } from "@/lib/catalog";
import type { Card } from "@/lib/shop";
import { useCart } from "@/store/cart";

export function ProductCard({ p, priority = false }: { p: Card; priority?: boolean }) {
  const add = useCart((s) => s.add);
  const single = p.variantCount === 1;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col"
    >
      <Link
        href={`/productos/${p.slug}`}
        className="relative block aspect-[3/4] overflow-hidden rounded-[24px] bg-photo transition-[box-shadow,transform] duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_50px_-26px_rgb(4_22_25/0.55)]"
      >
        <img
          src={p.image}
          alt={p.name}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 size-full object-cover transition duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
        />
        {p.image2 && (
          <img src={p.image2} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover opacity-0 transition duration-700 group-hover:opacity-100" />
        )}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 transition duration-700 group-hover:via-white/15" />
        {!p.available ? (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">Sin stock</span>
        ) : (
          p.variantCount > 1 && <span className="glass absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold text-ink">{p.variantCount} opciones</span>
        )}
        <span className="absolute bottom-3 right-3 grid size-10 translate-y-2 place-items-center rounded-full bg-sun text-ink opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </Link>
      <div className="flex items-start justify-between gap-3 px-1 pt-3.5">
        <div className="min-w-0">
          <p className="mb-1 truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-deep">{p.subcategoryName}</p>
          <h3 className="line-clamp-2 text-[15px] font-medium leading-snug">
            <Link href={`/productos/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {p.name}
            </Link>
          </h3>
          <p className="mt-1.5 text-[15px] tabular-nums">
            {p.maxPrice !== p.price && <span className="text-muted">desde </span>}
            <span className="font-semibold">{currency(p.price)}</span>
          </p>
        </div>
        {single && p.available && (
          <button
            type="button"
            onClick={() =>
              add({ slug: p.slug, variantId: p.variantId, name: p.name, variantName: p.variantName, price: p.price, image: p.image, minQuantity: p.minQuantity, subcategory: p.subcategory }, p.minQuantity)
            }
            className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full border border-line bg-white transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-white active:scale-95"
            aria-label={`Agregar ${p.name} al carrito`}
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>
    </motion.article>
  );
}
