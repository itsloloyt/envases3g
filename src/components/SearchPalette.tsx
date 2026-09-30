"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import { currency, normalize } from "@/lib/catalog";
import { lockScroll } from "./SmoothScroll";
import { ease } from "./Reveal";

type Item = { s: string; n: string; c: string; i: string; p: number };
let cache: Item[] | null = null;

const SUGGESTIONS = ["gotero ámbar", "spray", "difusor", "frasco vidrio", "pote crema", "flip top"];

/** Buscador rápido: se abre con la lupa o con Ctrl/⌘ + K. */
export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(cache ?? []);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    setTimeout(() => input.current?.focus(), 50);
    if (!cache)
      fetch("/api/buscar")
        .then((r) => r.json())
        .then((data: Item[]) => {
          cache = data;
          setItems(data);
        })
        .catch(() => {});
  }, [open]);

  const terms = normalize(q).split(/\s+/).filter(Boolean);
  const results = terms.length
    ? items.filter((it) => {
        const hay = normalize(`${it.n} ${it.c}`);
        return terms.every((t) => hay.includes(t));
      }).slice(0, 8)
    : [];

  function go(slug: string) {
    onClose();
    setQ("");
    router.push(`/productos/${slug}`);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === "Enter") {
      if (results[active]) go(results[active].s);
      else if (q.trim()) {
        onClose();
        router.push(`/productos?q=${encodeURIComponent(q.trim())}`);
      }
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center px-3 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Buscar productos">
          <motion.button aria-label="Cerrar búsqueda" className="absolute inset-0 bg-night/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.35, ease }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-paper shadow-2xl ring-1 ring-black/5"
            data-lenis-prevent
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search className="size-5 shrink-0 text-teal-deep" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKey}
                placeholder="Buscá un envase, tapa o accesorio…"
                className="h-16 w-full bg-transparent text-lg outline-none placeholder:text-muted/60"
                aria-label="Buscar"
              />
              <button onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-ink/5" aria-label="Cerrar">
                <X className="size-4" />
              </button>
            </div>

            {!terms.length ? (
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Búsquedas frecuentes</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => setQ(s)} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm hover:border-teal-deep hover:text-teal-deep">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length ? (
              <ul className="max-h-[55vh] overflow-y-auto p-2">
                {results.map((r, idx) => (
                  <motion.li key={r.s} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.025 }}>
                    <button
                      onClick={() => go(r.s)}
                      onMouseEnter={() => setActive(idx)}
                      className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors ${idx === active ? "bg-teal/10" : ""}`}
                    >
                      <img src={r.i} alt="" className="size-14 shrink-0 rounded-xl bg-photo object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{r.n}</span>
                        <span className="block truncate text-xs text-muted">{r.c}</span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{currency(r.p)}</span>
                      {idx === active && <CornerDownLeft className="size-4 text-teal-deep" />}
                    </button>
                  </motion.li>
                ))}
                <li>
                  <button
                    onClick={() => {
                      onClose();
                      router.push(`/productos?q=${encodeURIComponent(q.trim())}`);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl p-3 text-sm font-semibold text-teal-deep hover:bg-teal/10"
                  >
                    Ver todos los resultados <ArrowRight className="size-4" />
                  </button>
                </li>
              </ul>
            ) : (
              <p className="p-8 text-center text-sm text-muted">{items.length ? `No encontramos “${q}”. Probá con otra palabra.` : "Cargando catálogo…"}</p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
