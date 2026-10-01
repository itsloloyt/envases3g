"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Home, LayoutGrid, Search, ShoppingBag } from "lucide-react";
import { cartCount, useCart } from "@/store/cart";
import { waLink } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

const noop = () => () => {};

/** Barra inferior tipo app, solo en celulares. */
export function MobileNav() {
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const count = useSyncExternalStore(noop, () => true, () => false) ? cartCount(items) : 0;
  if (pathname.startsWith("/administracion")) return null;

  const base = "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors active:scale-95";
  const tab = (active: boolean) => `${base} ${active ? "text-teal-deep" : "text-ink-2"}`;

  return (
    <nav aria-label="Navegación rápida" className="fixed inset-x-3 bottom-3 z-40 lg:hidden print:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="glass flex items-stretch rounded-2xl px-1">
        <Link href="/" className={tab(pathname === "/")}>
          {pathname === "/" && <motion.span layoutId="mnav" className="absolute inset-x-2 inset-y-1 -z-10 rounded-xl bg-teal/12" />}
          <Home className="size-5" /> Inicio
        </Link>
        <button type="button" onClick={() => window.dispatchEvent(new Event("abrir-busqueda"))} className={tab(false)}>
          <Search className="size-5" /> Buscar
        </button>
        <Link href="/productos" className={tab(pathname.startsWith("/productos"))}>
          {pathname.startsWith("/productos") && <motion.span layoutId="mnav" className="absolute inset-x-2 inset-y-1 -z-10 rounded-xl bg-teal/12" />}
          <LayoutGrid className="size-5" /> Catálogo
        </Link>
        <button type="button" onClick={() => setOpen(true)} className={tab(false)} data-cart-target="mobile" aria-label={`Carrito, ${count} productos`}>
          <span className="relative">
            <ShoppingBag className="size-5" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.3 }}
                  animate={{ scale: [1.5, 1] }}
                  exit={{ scale: 0 }}
                  className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-sun px-1 text-[9px] font-bold text-ink"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          Carrito
        </button>
        <a href={waLink("Hola Envases 3G! Quería hacer una consulta.")} target="_blank" rel="noopener noreferrer" className={`${base} text-[#128C4B]`}>
          <WhatsAppIcon className="size-5" /> WhatsApp
        </a>
      </div>
    </nav>
  );
}
