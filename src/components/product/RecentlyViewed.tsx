"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { currency } from "@/lib/catalog";

type Seen = { slug: string; name: string; image: string; price: number };
const KEY = "envases3g-vistos";

/** Guarda el producto actual en "vistos recientemente". */
export function rememberProduct(item: Seen) {
  try {
    const list = (JSON.parse(localStorage.getItem(KEY) || "[]") as Seen[]).filter((s) => s.slug !== item.slug);
    localStorage.setItem(KEY, JSON.stringify([item, ...list].slice(0, 12)));
  } catch {
    /* Sin almacenamiento no se muestran recientes. */
  }
}

export function RecentlyViewed({ exclude }: { exclude: string }) {
  const [items, setItems] = useState<Seen[]>([]);

  useEffect(() => {
    try {
      const list = (JSON.parse(localStorage.getItem(KEY) || "[]") as Seen[]).filter((s) => s.slug !== exclude);
      // Lectura única del almacenamiento del navegador al montar.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(list.slice(0, 6));
    } catch {}
  }, [exclude]);

  if (!items.length) return null;
  return (
    <section className="mt-24">
      <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
        Vistos <span className="font-accent font-normal text-teal-deep">recientemente</span>
      </h2>
      <div className="no-scrollbar -mx-4 mt-8 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0" data-lenis-prevent-horizontal>
        {items.map((it, i) => (
          <motion.div key={it.slug} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="w-40 shrink-0 sm:w-48">
            <Link href={`/productos/${it.slug}`} className="group block">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-photo">
                <img src={it.image} alt={it.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug">{it.name}</p>
              <p className="text-sm tabular-nums text-muted">desde {currency(it.price)}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
