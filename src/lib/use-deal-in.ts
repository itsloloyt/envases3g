"use client";
import { useEffect, type RefObject } from "react";

/**
 * Las tarjetas entran como un mazo que se reparte: vienen desde la derecha,
 * giradas, y se acomodan con un rebote elástico (Animate Plus).
 */
export function useDealIn(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = [...el.children] as HTMLElement[];
    cards.forEach((c) => (c.style.opacity = "0"));
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const { default: animate } = await import("animateplus");
        animate({
          elements: cards,
          easing: "out-elastic 1 .55",
          duration: 1500,
          delay: (i: number) => i * 70,
          opacity: [0, 1],
          transform: ["translate(180px, 40px) rotate(9deg) scale(.86)", "translate(0px, 0px) rotate(0deg) scale(1)"],
        }).then(() => cards.forEach((c) => (c.style.transform = "")));
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}
