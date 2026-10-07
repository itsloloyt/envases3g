"use client";
import { motion, useMotionValue, useSpring } from "motion/react";

/** El contenido se "imanta" suavemente hacia el cursor (solo con mouse). */
export function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.4 });
  return (
    <motion.div
      className="inline-block"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const b = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - b.left - b.width / 2) * strength);
        y.set((e.clientY - b.top - b.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
