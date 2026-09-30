"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Banknote, BadgePercent, Handshake, Store, Truck } from "lucide-react";
import { CASH_TIERS } from "@/lib/discounts";
import { Reveal, SplitHeading, ease } from "../Reveal";

/** Descuentos vigentes + medios de pago (renovación de la info de la tienda original). */
export function Discounts() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const tiers = [...CASH_TIERS].reverse();

  return (
    <section id="descuentos" className="scroll-mt-24 relative overflow-hidden bg-night py-24 text-white">
      <div aria-hidden className="caustics pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-sun px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-night">
              <BadgePercent className="size-3.5" /> Descuentos vigentes
            </p>
          </Reveal>
          <SplitHeading text="Más llevás, menos pagás." className="mt-4 font-display text-5xl font-extrabold leading-[1] sm:text-6xl" />
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-lg text-white/70">Pagando en efectivo, el descuento se aplica solo en el carrito según la cantidad de unidades de tu pedido.</p>
          </Reveal>

          <div ref={ref} className="mt-10 grid gap-3 sm:grid-cols-3">
            {tiers.map((t, i) => (
              <motion.div
                key={t.minUnits}
                initial={reduce ? false : { opacity: 0, y: 30, rotateX: -25 }}
                animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : undefined}
                transition={{ duration: 0.7, ease, delay: i * 0.12 }}
                className="glass-dark group relative overflow-hidden rounded-3xl p-6 [transform-perspective:800px]"
              >
                <motion.span
                  aria-hidden
                  className="absolute -right-6 -top-6 size-24 rounded-full bg-teal/30 blur-2xl"
                  animate={reduce ? undefined : { scale: [1, 1.3, 1] }}
                  transition={{ duration: 4 + i, repeat: Infinity }}
                />
                <p className="text-sm text-white/60">desde {t.minUnits} unidades</p>
                <p className="mt-2 font-display text-6xl font-extrabold tracking-tight">
                  <span className="shine">{t.percent}%</span>
                </p>
                <p className="mt-1 text-sm font-semibold text-sun">OFF en efectivo</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 grid gap-3 text-sm sm:grid-cols-2">
            {[
              { Icon: Banknote, title: "Efectivo", text: "Abonás en el local o al recibir. Con descuento por cantidad." },
              { Icon: Handshake, title: "Transferencia / a acordar", text: "Coordinamos el pago por WhatsApp." },
              { Icon: Store, title: "Retiro sin cargo", text: "Moreno 4156, Mar del Plata." },
              { Icon: Truck, title: "Envíos a todo el país", text: "Correo Argentino a sucursal o domicilio." },
            ].map(({ Icon, title, text }, i) => (
              <Reveal key={title} delay={0.1 + i * 0.06} className="flex gap-3 rounded-2xl border border-white/10 p-4">
                <Icon className="mt-0.5 size-5 shrink-0 text-teal" />
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="text-white/60">{text}</span>
                </span>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <Link href="/productos" className="mt-10 inline-flex rounded-full bg-teal px-7 py-4 text-sm font-bold text-night transition-colors hover:bg-sun">
              Armar mi pedido
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="lg:col-span-5">
          <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-[36px] ring-1 ring-white/15 shadow-[0_40px_100px_-30px_rgb(34_181_193/0.5)]">
            <video src="/video/omega-ambar.mp4" poster="/ia/omega-200-cc-ambar/crema-oro.webp" autoPlay muted loop playsInline preload="metadata" className="size-full object-cover" aria-label="Video del envase Omega 200 ámbar con válvula dorada" />
            <span className="glass absolute bottom-4 left-4 rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink">Omega 200 ámbar · válvula cremera dorada</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
