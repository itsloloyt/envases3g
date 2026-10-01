"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { currency } from "@/lib/catalog";
import type { Card } from "@/lib/shop";
import { site } from "@/lib/site";
import { ease } from "../Reveal";

const layout = [
  { className: "left-[2%] top-[16%] w-[40%] -rotate-6", depth: 30, delay: 0.55 },
  { className: "right-[0%] top-[4%] w-[38%] rotate-[5deg]", depth: 55, delay: 0.7 },
  { className: "left-[20%] bottom-[0%] w-[35%] rotate-3", depth: 80, delay: 0.85 },
  { className: "right-[5%] bottom-[10%] w-[29%] -rotate-[4deg]", depth: 45, delay: 1 },
];

export function Hero({ products, total }: { products: Card[]; total: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const logoRotate = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const logoTilt = useTransform(sy, [-0.5, 0.5], [12, -12]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-night pt-28 text-white sm:pt-32"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      {/* Fondo: cáusticas de luz turquesa que se mueven lento, como agua a través del vidrio */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -right-40 -top-32 size-[720px] rounded-full bg-teal/35 blur-[130px]"
          animate={reduce ? undefined : { scale: [1, 1.15, 1], x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -left-48 top-1/2 size-[560px] rounded-full bg-teal-deep/40 blur-[120px]"
          animate={reduce ? undefined : { scale: [1.1, 1, 1.1], y: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/3 size-[300px] rounded-full bg-sun/15 blur-[110px]"
          animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_40%_40%,black_10%,transparent_65%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:pb-28">
        <motion.div style={reduce ? undefined : { y: yText, opacity: fade }} className="lg:col-span-6">
          <h1 className="font-display text-[clamp(2.9rem,7.6vw,6.6rem)] font-extrabold leading-[0.92]">
            {["Envases", "que", "hacen"].map((w, i) => (
              <Word key={w} delay={0.1 + i * 0.07}>
                {w}
              </Word>
            ))}
            <br className="hidden sm:block" />
            <Word delay={0.34}>brillar</Word>
            <Word delay={0.41}>tu</Word>
            <span className="inline-block">
              <motion.span className="shine inline-block pb-[0.12em] pr-3 font-accent text-[1.1em] leading-[1]" initial={{ y: 24, opacity: 0, filter: "blur(10px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.9, ease, delay: 0.5 }}>
                producto.
              </motion.span>
            </span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.6 }} className="mt-6 max-w-md text-lg leading-relaxed text-white/65">
            Vidrio, plástico y accesorios. Por unidad o por mayor.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.75 }} className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/productos" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-teal py-4 pl-7 pr-5 text-sm font-bold text-night transition-colors duration-200 hover:bg-sun">
              Explorar {total} productos
              <span className="grid size-7 place-items-center rounded-full bg-night/15 transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="size-4" />
              </span>
            </Link>
            <a href="#local" className="inline-flex items-center gap-2 px-3 py-4 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white">
              <MapPin className="size-4 text-sun" /> {site.address}
            </a>
          </motion.div>
        </motion.div>

        <div className="relative aspect-square w-full [perspective:1200px] lg:col-span-6 lg:aspect-[5/5.2]">
          {/* Logo en 3D detrás de los productos */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.6, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.4, ease, delay: 0.2 }}
            className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2"
          >
            <motion.img
              src="/brand/logo-3g.webp"
              alt=""
              className="w-full rounded-full shadow-[0_0_120px_20px_rgb(34_181_193/0.45)]"
              style={reduce ? undefined : { rotateY: logoRotate, rotateX: logoTilt }}
            />
            <motion.span
              className="absolute -inset-6 rounded-full border border-teal/30"
              animate={reduce ? undefined : { scale: [1, 1.25], opacity: [0.6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.div>
          {products.slice(0, 4).map((p, i) => (
            <FloatingCard key={p.slug} p={p} i={i} sx={sx} sy={sy} reduce={!!reduce} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Word({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="inline-block">
      <motion.span className="inline-block pr-[0.22em]" initial={{ y: 24, opacity: 0, filter: "blur(10px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.9, ease, delay }}>
        {children}
      </motion.span>
    </span>
  );
}

function FloatingCard({ p, i, sx, sy, reduce }: { p: Card; i: number; sx: MotionValue<number>; sy: MotionValue<number>; reduce: boolean }) {
  const l = layout[i];
  const x = useTransform(sx, (v) => v * l.depth);
  const y = useTransform(sy, (v) => v * l.depth);
  return (
    <motion.div className={`absolute ${l.className}`} style={reduce ? undefined : { x, y }}>
      <motion.div initial={{ opacity: 0, y: 80, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.1, ease, delay: l.delay }}>
        <motion.div animate={reduce ? undefined : { y: [0, -12, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}>
          <Link
            href={`/productos/${p.slug}`}
            className="group block rounded-[26px] bg-white/10 p-1.5 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] ring-1 ring-white/20 backdrop-blur-md transition hover:ring-teal"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-photo">
              <img src={p.image} alt={p.name} className="size-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="glass absolute inset-x-2 bottom-2 rounded-2xl px-3 py-2 text-ink">
                <p className="truncate text-[12px] font-semibold">{p.name}</p>
                <p className="text-[12px] tabular-nums text-ink-2">{currency(p.price)}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
