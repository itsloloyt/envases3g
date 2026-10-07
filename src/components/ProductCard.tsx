"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { currency } from "@/lib/catalog";
import type { Card } from "@/lib/shop";
import { useCart } from "@/store/cart";
import { flyToCart } from "./FlyToCart";

export function ProductCard({ p, priority = false }: { p: Card; priority?: boolean }) {
  const add = useCart((s) => s.add);
  const single = p.variantCount === 1;
  const reduce = useReducedMotion();
  const frame = useRef<HTMLAnchorElement>(null);
  const shown = useInView(frame, { once: true, margin: "0px 0px -40px 0px" });
  // Inclinación 3D suave que sigue al mouse.
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 200, damping: 20 });
  const glare = useMotionTemplate`radial-gradient(circle at ${useTransform(mx, (v) => v * 100)}% ${useTransform(my, (v) => v * 100)}%, rgb(255 255 255 / 0.35), transparent 55%)`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col"
    >
      <motion.div
        style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const b = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - b.left) / b.width);
          my.set((e.clientY - b.top) / b.height);
        }}
        onPointerLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
      >
      <Link
        ref={frame}
        href={`/productos/${p.slug}`}
        className="relative block aspect-[3/4] overflow-hidden rounded-[24px] bg-photo transition-[box-shadow,transform] duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_50px_-26px_rgb(4_22_25/0.55)]"
      >
        {/* Revelado tipo cortina al entrar en pantalla */}
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
          animate={shown ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.img
            src={p.image}
            alt={p.name}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            initial={reduce ? false : { scale: 1.25 }}
            animate={shown ? { scale: 1 } : undefined}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 size-full object-cover"
          />
          <img src={p.image} alt="" aria-hidden className="absolute inset-0 size-full object-cover opacity-0 transition duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06] group-hover:opacity-100" />
        </motion.div>
        {!reduce && <motion.span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />}
        {!p.available ? (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">Sin stock</span>
        ) : (
          p.variantCount > 1 && <span className="glass absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold text-ink">{p.variantCount} opciones</span>
        )}
        <span className="absolute bottom-3 right-3 grid size-10 translate-y-2 place-items-center rounded-full bg-sun text-ink opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </Link>
      </motion.div>
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
          {p.accessories.length > 0 && (
            <div className="mt-2 flex items-center gap-1" aria-label={`${p.accessories.length} accesorios disponibles`}>
              {p.accessories.slice(0, 4).map((src, i) => (
                <img key={src} src={src} alt="" loading="lazy" style={{ transitionDelay: `${i * 40}ms` }} className="size-7 rounded-full border border-white bg-white object-contain p-0.5 shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5" />
              ))}
              {p.accessories.length > 4 && <span className="ml-0.5 text-[11px] font-medium text-muted">+{p.accessories.length - 4}</span>}
            </div>
          )}
        </div>
        {single && p.available && (
          <button
            type="button"
            onClick={(e) => {
              flyToCart(p.image, e.currentTarget.closest("article")?.querySelector("img") ?? null, p.name);
              add({ slug: p.slug, variantId: p.variantId, name: p.name, variantName: p.variantName, price: p.price, image: p.image, minQuantity: p.minQuantity, subcategory: p.subcategory }, p.minQuantity);
            }}
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
