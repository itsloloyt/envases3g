"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";

const SCENES = [
  { src: "/lookbook/cocina.webp", n: "01", title: "Despensa", text: "Frascos y botellas de vidrio", href: "/productos?rubro=frascos-y-botellas-de-vidrio" },
  { src: "/lookbook/hogar.webp", n: "02", title: "Aromas", text: "Difusores y esencias", href: "/productos?rubro=esencias-y-difusores" },
  { src: "/lookbook/accesorios.webp", n: "03", title: "Detalles", text: "Tapas, válvulas y gatillos", href: "/productos?rubro=accesorios" },
];

/** Galería editorial: al hacer scroll la página se fija y las escenas pasan de costado. */
export function Lookbook() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const x = useTransform(p, [0, 1], ["0%", `-${((SCENES.length - 1) / (SCENES.length + 0.35)) * 100}%`]);
  const bar = useTransform(p, [0, 1], ["0%", "100%"]);

  if (reduce) {
    return (
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-20 sm:grid-cols-2 sm:px-6">
        {SCENES.map((s) => (
          <Link key={s.n} href={s.href} className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <img src={s.src} alt={s.text} className="size-full object-cover" loading="lazy" />
          </Link>
        ))}
      </section>
    );
  }

  return (
    <section ref={ref} className="relative bg-[#efe8dd]" style={{ height: `${SCENES.length * 90}vh` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-16">
        <div className="mx-auto mb-6 flex w-full max-w-7xl items-end justify-between px-4 sm:px-6">
          <h2 className="font-display text-3xl font-extrabold leading-none tracking-tight text-ink sm:text-5xl">
            Hecho para <span className="font-accent font-normal">tu mundo</span>
          </h2>
          <div className="hidden h-px w-40 overflow-hidden bg-ink/15 sm:block">
            <motion.div className="h-full bg-ink" style={{ width: bar }} />
          </div>
        </div>
        <motion.div style={{ x }} className="flex gap-4 pl-4 sm:gap-6 sm:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          {SCENES.map((s, i) => (
            <Scene key={s.n} s={s} i={i} p={p} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Scene({ s, i, p }: { s: (typeof SCENES)[number]; i: number; p: MotionValue<number> }) {
  const step = 1 / (SCENES.length - 1);
  const center = i * step;
  // La foto se mueve más lento que la tarjeta (parallax interno) y se "enfoca" al llegar al centro.
  const imgX = useTransform(p, [center - step, center + step], ["12%", "-12%"]);
  const scale = useTransform(p, [center - step, center, center + step], [1.25, 1.1, 1.25]);
  const titleY = useTransform(p, [center - step, center, center + step], ["60%", "0%", "-60%"]);
  const fade = useTransform(p, [center - step * 0.8, center, center + step * 0.8], [0.25, 1, 0.25]);

  return (
    <Link href={s.href} className="group relative block h-[68svh] w-[78vw] shrink-0 overflow-hidden rounded-[28px] sm:w-[42vw] lg:w-[34vw]">
      <motion.img src={s.src} alt={s.text} loading="lazy" style={{ x: imgX, scale }} className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      <motion.div style={{ opacity: fade }} className="absolute inset-x-0 bottom-0 overflow-hidden p-6 text-white sm:p-8">
        <p className="text-xs font-semibold tracking-[0.25em] text-white/70">{s.n}</p>
        <motion.p style={{ y: titleY }} className="font-display text-5xl font-extrabold leading-none tracking-tight sm:text-6xl">
          {s.title}
        </motion.p>
        <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
          {s.text}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </p>
      </motion.div>
    </Link>
  );
}
