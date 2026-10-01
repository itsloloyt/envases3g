"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useCart } from "@/store/cart";

type Flight = { id: number; src: string; from: DOMRect; to: { x: number; y: number }; name: string };

/** Dispara la animación: la foto del producto vuela hasta el carrito. */
export function flyToCart(src: string, from: Element | null, name: string) {
  if (!from) return;
  window.dispatchEvent(new CustomEvent("volar-al-carrito", { detail: { src, rect: from.getBoundingClientRect(), name } }));
}

export function FlyToCart() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [toast, setToast] = useState<{ id: number; name: string } | null>(null);
  const setOpen = useCart((s) => s.setOpen);

  useEffect(() => {
    const onFly = (e: Event) => {
      const { src, rect, name } = (e as CustomEvent).detail as { src: string; rect: DOMRect; name: string };
      // El destino es el ícono de carrito visible (barra inferior en celular o header en computadora).
      const targets = [...document.querySelectorAll<HTMLElement>("[data-cart-target]")].filter((el) => el.offsetParent !== null);
      const t = targets[targets.length - 1]?.getBoundingClientRect();
      const to = t ? { x: t.left + t.width / 2, y: t.top + t.height / 2 } : { x: window.innerWidth - 40, y: 40 };
      const id = Date.now();
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setFlights((f) => [...f, { id, src, from: rect, to, name }]);
      setToast({ id, name });
      setTimeout(() => setFlights((f) => f.filter((x) => x.id !== id)), 900);
      setTimeout(() => setToast((t2) => (t2?.id === id ? null : t2)), 3200);
    };
    window.addEventListener("volar-al-carrito", onFly);
    return () => window.removeEventListener("volar-al-carrito", onFly);
  }, []);

  return (
    <>
      {flights.map((f) => {
        const size = Math.min(f.from.width, 220);
        const startX = f.from.left + f.from.width / 2 - size / 2;
        const startY = f.from.top + f.from.height / 2 - size / 2;
        return (
          <motion.img
            key={f.id}
            src={f.src}
            alt=""
            className="pointer-events-none fixed left-0 top-0 z-[95] rounded-2xl object-cover shadow-2xl"
            style={{ width: size, height: size }}
            initial={{ x: startX, y: startY, scale: 1, opacity: 1, rotate: 0 }}
            animate={{
              x: [startX, (startX + f.to.x) / 2, f.to.x - size / 2],
              y: [startY, Math.min(startY, f.to.y) - 120, f.to.y - size / 2],
              scale: [1, 0.55, 0.08],
              rotate: [0, -12, 8],
              opacity: [1, 1, 0.3],
            }}
            transition={{ duration: 0.85, ease: [0.5, 0, 0.2, 1] }}
          />
        );
      })}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed inset-x-3 bottom-24 z-[85] mx-auto flex max-w-sm items-center gap-3 rounded-2xl bg-night p-3 pl-4 text-white shadow-2xl lg:bottom-6"
            role="status"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal text-night">
              <Check className="size-4" strokeWidth={3} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">
              <strong>Agregado:</strong> {toast.name}
            </span>
            <button onClick={() => { setOpen(true); setToast(null); }} className="shrink-0 rounded-full bg-sun px-3.5 py-2 text-xs font-bold text-ink">
              Ver carrito
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
