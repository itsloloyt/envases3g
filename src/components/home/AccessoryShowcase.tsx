"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import art from "@/data/accessory-art.json";
import { Reveal, SplitHeading, ease } from "../Reveal";

type Art = { src: string; label: string; width: number };
const library = art as Record<string, Art>;

export type ShowcaseOption = { key: string; photo: string };

/** Configurador de muestra: elegís el accesorio y se "coloca" sobre el envase. */
export function AccessoryShowcase({ slug, name, base, options }: { slug: string; name: string; base: string; options: ShowcaseOption[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  const [shown, setShown] = useState(base);
  const [fit, setFit] = useState<{ id: number; art: Art } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  // Precarga de las fotos para que el cambio sea instantáneo.
  useEffect(() => {
    options.forEach((o) => {
      const img = new Image();
      img.src = o.photo;
    });
  }, [options]);

  function choose(o: ShowcaseOption | null) {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setActive(o?.key ?? null);
    const next = o?.photo ?? base;
    const a = o && library[o.key];
    if (a && !reduce) {
      setFit({ id: Date.now(), art: a });
      timers.current.push(setTimeout(() => setShown(next), 650), setTimeout(() => setFit(null), 1550));
    } else setShown(next);
  }

  return (
    <section className="relative overflow-hidden py-24">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-10 -z-10 size-[520px] rounded-full bg-teal/15 blur-[120px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-teal/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-deep">
              <Sparkles className="size-3.5" /> Nuevo · Configurador
            </p>
          </Reveal>
          <SplitHeading text="Armá tu envase antes de comprarlo" className="mt-4 font-display text-5xl font-extrabold leading-[1] sm:text-6xl" />
          <Reveal delay={0.15}>
            <p className="mt-5 max-w-md text-lg text-ink-2">
              Elegí la válvula, la tapa o el gatillo y mirá cómo queda puesto en el envase. Disponible en cada producto con accesorios.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Elegí un accesorio">
              <Chip active={active === null} onClick={() => choose(null)}>
                Solo envase
              </Chip>
              {options.map((o) => (
                <Chip key={o.key} active={active === o.key} onClick={() => choose(o)}>
                  <img src={library[o.key].src} alt="" className="h-6 w-5 object-contain" />
                  <span className="first-letter:uppercase">{library[o.key].label}</span>
                </Chip>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.35}>
            <Link href={`/productos/${slug}`} className="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-teal-deep">
              Ver {name} y todas sus opciones <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="relative mx-auto aspect-[3/4] max-w-xl overflow-hidden rounded-[36px] bg-photo shadow-[0_40px_80px_-40px_rgb(4_22_25/0.5)]">
            <AnimatePresence initial={false}>
              <motion.img
                key={shown}
                src={shown}
                alt={`${name}${active ? ` con ${library[active].label}` : ""}`}
                initial={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                transition={{ duration: 0.7, ease }}
                className="absolute inset-0 size-full object-cover"
              />
            </AnimatePresence>
            <AnimatePresence>
              {fit && (
                <motion.div key={fit.id} className="pointer-events-none absolute inset-0" exit={{ opacity: 0 }}>
                  <motion.img
                    src={fit.art.src}
                    alt=""
                    style={{ width: `${fit.art.width}%`, left: `${50 - fit.art.width / 2}%` }}
                    className="absolute top-[12%] drop-shadow-[0_18px_22px_rgb(4_22_25/0.35)]"
                    initial={{ y: "-160%", rotate: -35, opacity: 0 }}
                    animate={{ y: ["-160%", "6%", "0%", "0%"], rotate: [-35, 12, 0, 0], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.5, times: [0, 0.4, 0.55, 1], ease: "easeOut" }}
                  />
                  <motion.span
                    className="absolute left-1/2 top-[20%] size-24 -translate-x-1/2 rounded-full border-2 border-teal"
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: [0.3, 1.8], opacity: [0, 0.9, 0] }}
                    transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="glass absolute bottom-5 left-5 rounded-full px-4 py-2 text-xs font-semibold">
              {name}
              {active && <span className="font-normal text-muted"> · {library[active].label}</span>}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative isolate flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-200 ${
        active ? "border-transparent text-white" : "border-line bg-white hover:border-teal-deep/50"
      }`}
    >
      {active && <motion.span layoutId="showcase-chip" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ duration: 0.4, ease }} />}
      {children}
    </button>
  );
}
