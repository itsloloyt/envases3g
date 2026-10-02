"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { ArrowRight } from "lucide-react";

const TEXT =
  "Somos Envases 3G. Desde Mar del Plata acompañamos a emprendedores, laboratorios y marcas con el envase justo, la tapa exacta y el accesorio que hace la diferencia.";

/** Texto grande que se "pinta" palabra por palabra al hacer scroll. */
export function ScrollText() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = TEXT.split(" ");
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <div ref={ref}>
        <p className="font-display text-[clamp(1.9rem,5.2vw,4.2rem)] font-extrabold leading-[1.08] tracking-tight">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} reduce={!!reduce} accent={/3G|justo|exacta|diferencia/.test(w)}>
              {w}
            </Word>
          ))}
        </p>
      </div>
    </section>
  );
}

function Word({ children, progress, range, reduce, accent }: { children: string; progress: MotionValue<number>; range: [number, number]; reduce: boolean; accent: boolean }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span style={reduce ? undefined : { opacity, y }} className={`mr-[0.25em] inline-block ${accent ? "text-teal-deep" : ""}`}>
      {children}
    </motion.span>
  );
}

/** Imagen que crece de tarjeta a pantalla completa mientras se hace scroll. */
export function ExpandImage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const inset = useTransform(scrollYProgress, [0, 1], ["18% 22% 18% 22%", "0% 0% 0% 0%"]);
  const radius = useTransform(scrollYProgress, [0, 1], [48, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const textY = useTransform(scrollYProgress, [0.5, 1], [60, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.55, 1], [0, 1]);
  const clip = useTransform([inset, radius] as MotionValue[], ([i, r]) => `inset(${i} round ${r}px)`);

  return (
    <section ref={ref} className="relative h-[85svh] overflow-hidden sm:h-screen">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { clipPath: clip }}>
        <motion.img src="/rubros/frascos-y-botellas-de-vidrio.webp" alt="Frascos y botellas de vidrio con reflejos de luz" className="size-full object-cover" style={reduce ? undefined : { scale }} />
        <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/20 to-transparent" />
      </motion.div>
      <motion.div style={reduce ? undefined : { y: textY, opacity: textOpacity }} className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-14 text-white sm:px-6 sm:pb-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sun">Vidrio que se luce</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold leading-[1] sm:text-6xl">
          La transparencia que tu <span className="font-accent font-normal">producto</span> merece.
        </h2>
        <Link href="/productos?rubro=frascos-y-botellas-de-vidrio" className="group mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-sun">
          Ver vidrio <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </section>
  );
}
