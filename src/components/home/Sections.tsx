"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Package, Phone, ShoppingBag, Store } from "lucide-react";
import type { Card } from "@/lib/shop";
import { site, waLink } from "@/lib/site";
import { ProductCard } from "../ProductCard";
import { RubroMedia } from "./RubroMedia";
import { Reveal, SplitHeading, ease } from "../Reveal";
import { InstagramIcon, WhatsAppIcon } from "../icons";

/* ───────────────────────── Marquesina ───────────────────────── */
export function Marquee() {
  const words = ["Vidrio", "PET", "PEAD", "Goteros", "Válvulas", "Gatillos", "Tapas", "Esencias", "Difusores", "Varillas", "Potes", "Latas", "Yeso", "Velas"];
  const row = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-line bg-paper-2 py-5" aria-hidden>
      <div className="marquee flex w-max gap-10 whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-3xl font-extrabold italic text-ink/80 sm:text-4xl">
            {w}
            <span className="size-2 rounded-full bg-teal" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Cifras ───────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [inView, to, reduce]);
  return (
    <span ref={ref} className="tabular-nums">
      {v}
      {suffix}
    </span>
  );
}

export function Stats({ products, categories }: { products: number; categories: number }) {
  const stats = [
    { value: products, suffix: "+", label: "productos en catálogo" },
    { value: categories, suffix: "", label: "categorías especializadas" },
    { value: 7, suffix: "", label: "rubros: cosmética, alimentos, aromas y más" },
    { value: 1, suffix: "", label: "local en Mar del Plata, con atención directa" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="border-t border-ink/15 pt-5">
            <p className="font-display text-5xl font-extrabold sm:text-6xl">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-2 max-w-[16rem] text-sm text-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Rubros (bento) ───────────────────────── */
export type Rubro = { slug: string; name: string; count: number; image: string | null; blurb: string; video?: string };

export function Rubros({ rubros }: { rubros: Rubro[] }) {
  const spans = ["md:col-span-4 md:row-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-4", "md:col-span-4"];
  return (
    <section id="rubros" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-deep">Rubros</p>
          </Reveal>
          <SplitHeading text="Un envase para cada idea" className="mt-3 font-display text-5xl font-extrabold leading-[1] sm:text-6xl" />
        </div>
        <Reveal delay={0.1}>
          <p className="max-w-sm text-ink-2">Desde un gotero de 10 cc hasta un bidón de 2 litros. Elegí tu rubro y encontrá el envase, la tapa y el accesorio justo.</p>
        </Reveal>
      </div>
      <div className="grid auto-rows-[190px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:gap-4 md:grid-cols-8">
        {rubros.map((r, i) => (
          <Reveal key={r.slug} delay={(i % 4) * 0.06} className={`${i === 0 ? "col-span-2 row-span-2" : "col-span-1"} ${spans[i] ?? "md:col-span-2"}`}>
            <Link
              href={`/productos?rubro=${r.slug}`}
              className="group relative flex size-full flex-col justify-end overflow-hidden rounded-[22px] bg-photo p-4 sm:rounded-[26px] sm:p-5"
            >
              <RubroMedia image={r.image} video={r.video} />
              <div className="absolute inset-0 bg-gradient-to-t from-night/75 via-night/10 to-transparent" />
              <div className="relative flex items-end justify-between gap-2 text-white">
                <div>
                  <p className="text-xs text-white/75">{r.count} productos</p>
                  <h3 className={`font-display leading-tight ${i === 0 ? "text-4xl sm:text-5xl" : "text-xl sm:text-2xl"}`}>{r.name}</h3>
                  {i === 0 && <p className="mt-2 max-w-xs text-sm text-white/80">{r.blurb}</p>}
                </div>
                <span className="glass-dark hidden size-11 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-45 sm:grid">
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Destacados (carrusel) ───────────────────────── */
export function Featured({ products }: { products: Card[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section className="py-20">
      <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-6 px-4 sm:px-6">
        <div>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-deep">Selección</p>
          </Reveal>
          <SplitHeading text="Los más elegidos" className="mt-3 font-display text-5xl font-extrabold sm:text-6xl" />
        </div>
        <div className="hidden gap-2 sm:flex">
          {[-1, 1].map((d) => (
            <button
              key={d}
              onClick={() => scroll(d as 1 | -1)}
              className="grid size-12 place-items-center rounded-full border border-line transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-white"
              aria-label={d < 0 ? "Anteriores" : "Siguientes"}
            >
              <ArrowRight className={`size-5 ${d < 0 ? "rotate-180" : ""}`} />
            </button>
          ))}
        </div>
      </div>
      <div
        ref={rail}
        data-lenis-prevent-horizontal
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 sm:px-6 scroll-px-4 sm:scroll-px-6 lg:px-[max(1.5rem,calc((100vw_-_80rem)/2_+_1.5rem))] lg:scroll-px-[max(1.5rem,calc((100vw_-_80rem)/2_+_1.5rem))]"
      >
        {products.map((p) => (
          <div key={p.slug} className="w-[68vw] shrink-0 snap-start sm:w-[300px]">
            <ProductCard p={p} />
          </div>
        ))}
        <Link
          href="/productos"
          className="flex aspect-[3/4] w-[68vw] shrink-0 snap-start flex-col items-center justify-center gap-4 rounded-[22px] border border-dashed border-ink/25 text-center transition-colors hover:border-ink hover:bg-white sm:w-[300px]"
        >
          <span className="grid size-14 place-items-center rounded-full bg-ink text-white">
            <ArrowRight className="size-6" />
          </span>
          <span className="font-display text-2xl font-extrabold">Ver todo el catálogo</span>
        </Link>
      </div>
    </section>
  );
}

/* ───────────────────────── Cómo comprar ───────────────────────── */
export function HowToBuy() {
  const steps = [
    { Icon: ShoppingBag, title: "Elegí tus productos", text: "Navegá el catálogo, filtrá por rubro y sumá al carrito con la variante que necesites." },
    { Icon: MessageCircle, title: "Confirmá por WhatsApp", text: "Enviás el pedido armado y te confirmamos stock, total y precio por cantidad." },
    { Icon: Store, title: "Retirá o recibí", text: `Pasás por ${site.address} o coordinamos el envío. Pagás en efectivo o transferencia.` },
  ];
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="como-comprar" className="scroll-mt-24 relative overflow-hidden bg-night py-24 text-white">
      <div aria-hidden className="absolute -right-32 top-0 size-[520px] rounded-full bg-teal/30 blur-[140px]" />
      <div aria-hidden className="absolute -left-32 bottom-0 size-[420px] rounded-full bg-teal-deep/40 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-sun">Cómo comprar</p>
        </Reveal>
        <SplitHeading text="Simple, rápido y sin vueltas." className="mt-3 max-w-2xl font-display text-5xl font-extrabold leading-[1] sm:text-6xl" />
        <div ref={ref} className="relative mt-16">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-white/15 md:block">
            <motion.div style={{ width }} className="h-full bg-gradient-to-r from-teal to-sun" />
          </div>
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map(({ Icon, title, text }, i) => (
              <motion.li
                key={title}
                className="relative"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease, delay: i * 0.12 }}
              >
                  <span className="glass-dark relative grid size-14 place-items-center rounded-2xl bg-night">
                    <Icon className="size-6 text-sun" strokeWidth={1.6} />
                  </span>
                  <p className="mt-6 font-mono text-xs text-white/50">Paso 0{i + 1}</p>
                  <h3 className="mt-1 font-display text-3xl font-extrabold">{title}</h3>
                  <p className="mt-3 max-w-xs text-white/70">{text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Mayorista ───────────────────────── */
export function Wholesale() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-deep via-[#07565f] to-night px-6 py-14 text-white sm:px-14 sm:py-20">
        <div aria-hidden className="absolute -right-20 -top-20 size-80 rounded-full border border-white/15" />
        <div aria-hidden className="absolute -right-6 -top-6 size-52 rounded-full border border-white/15" />
        <div className="relative grid items-center gap-10 md:grid-cols-5">
          <div className="md:col-span-3">
            <Package className="size-10 text-white/80" strokeWidth={1.4} />
            <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl">¿Comprás por cantidad? Tenemos precio mayorista.</h2>
            <p className="mt-4 max-w-lg text-white/80">
              Emprendimientos, laboratorios, perfumerías, gastronomía y fábricas de velas y aromas. Escribinos con tu lista y te pasamos una cotización.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:col-span-2 md:items-end">
            <a
              href={waLink("Hola! Quiero consultar precios mayoristas.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-paper px-7 py-4 text-sm font-semibold text-ink transition-transform duration-200 hover:scale-[1.03]"
            >
              <WhatsAppIcon className="size-5 text-[#1da851]" /> Pedir cotización
            </a>
            <Link href="/contacto" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-4 text-sm font-medium hover:bg-white/10">
              Enviar consulta por formulario
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ───────────────────────── Local / Ubicación ───────────────────────── */
const noop = () => () => {};
function isOpenNow() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const d = now.getDay();
  const h = now.getHours() + now.getMinutes() / 60;
  return (d >= 1 && d <= 5 && h >= 9 && h < 15) || (d === 6 && h >= 9 && h < 13);
}

export function Location() {
  const openNow = useSyncExternalStore(noop, isOpenNow, () => null);

  return (
    <section id="local" className="scroll-mt-24 mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-5">
        <Reveal className="flex flex-col rounded-[28px] bg-paper-2 p-7 sm:p-10 lg:col-span-2">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-deep">El local</p>
          <h2 className="mt-3 font-display text-5xl font-extrabold leading-[1]">Vení a conocernos</h2>
          <p className="mt-4 text-ink-2">Mirá los envases en persona, probá tapas y válvulas, y llevate asesoramiento para tu producto.</p>

          <ul className="mt-8 space-y-5 text-sm">
            <li className="flex gap-4">
              <MapPin className="mt-0.5 size-5 shrink-0 text-teal-deep" />
              <span>
                <span className="block font-medium">{site.address}</span>
                <span className="text-muted">{site.city}</span>
              </span>
            </li>
            <li className="flex gap-4">
              <Clock className="mt-0.5 size-5 shrink-0 text-teal-deep" />
              <span className="flex-1">
                {openNow !== null && (
                  <span className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${openNow ? "bg-teal/15 text-teal-deep" : "bg-ink/5 text-muted"}`}>
                    <span className={`size-1.5 rounded-full ${openNow ? "bg-teal" : "bg-muted"}`} /> {openNow ? "Abierto ahora" : "Cerrado ahora"}
                  </span>
                )}
                {site.hours.map((h) => (
                  <span key={h.days} className="flex justify-between gap-4 py-0.5">
                    <span className="text-muted">{h.days}</span>
                    <span className="tabular-nums">{h.time}</span>
                  </span>
                ))}
              </span>
            </li>
            <li className="flex gap-4">
              <Phone className="mt-0.5 size-5 shrink-0 text-teal-deep" />
              <a href={`tel:${site.phone}`} className="hover:underline">{site.phoneDisplay}</a>
            </li>
            <li className="flex gap-4">
              <Mail className="mt-0.5 size-5 shrink-0 text-teal-deep" />
              <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a>
            </li>
            <li className="flex gap-4">
              <InstagramIcon className="mt-0.5 size-5 shrink-0 text-teal-deep" />
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">{site.instagramHandle}</a>
            </li>
          </ul>

          <div className="mt-auto flex flex-wrap gap-2 pt-8">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.mapsQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-white hover:bg-teal-deep"
            >
              Cómo llegar <ArrowUpRight className="size-4" />
            </a>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3.5 text-sm font-medium hover:border-ink">
              <WhatsAppIcon className="size-4" /> WhatsApp
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="relative min-h-[420px] overflow-hidden rounded-[28px] bg-photo lg:col-span-3">
          <iframe
            title={`Mapa: ${site.address}, ${site.city}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapsQuery)}&z=16&output=embed`}
            className="absolute inset-0 size-full grayscale-[0.6] contrast-[1.05]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.4 }}
            className="glass pointer-events-none absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl p-3 sm:right-auto"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-teal text-white">
              <Store className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Envases 3G</span>
              <span className="block text-xs text-ink-2">
                {site.address} · {site.city}
              </span>
            </span>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
