"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { cartCount, useCart } from "@/store/cart";
import { Logo } from "./icons";
import { lockScroll } from "./SmoothScroll";
import { ease } from "./Reveal";

const nav = [
  { href: "/productos", label: "Productos" },
  { href: "/#rubros", label: "Rubros" },
  { href: "/#como-comprar", label: "Cómo comprar" },
  { href: "/#local", label: "El local" },
  { href: "/contacto", label: "Contacto" },
];

const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const count = useHydrated() ? cartCount(items) : 0;
  // Sobre la portada oscura del inicio el header va en claro.
  const dark = pathname === "/" && !scrolled && !menu;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => lockScroll(menu), [menu]);

  if (pathname.startsWith("/administracion")) return <AdminBar />;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full py-2 pl-2 pr-2 transition-all duration-500 ${
          scrolled || menu ? "glass" : "border border-transparent"
        } ${dark ? "text-white" : "text-ink"}`}
      >
        <Link href="/" className="group flex items-center gap-3" aria-label="Envases 3G — inicio" onClick={() => setMenu(false)}>
          <motion.span whileHover={{ rotate: -12, scale: 1.05 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="block">
            <Logo priority className="size-11 shadow-[0_6px_18px_-6px_rgb(10_118_130/0.6)] sm:size-12" />
          </motion.span>
          <span className="leading-none">
            <span className="block font-display text-[17px] font-extrabold tracking-tight">Envases 3G</span>
            <span className={`mt-1 block text-[11px] ${dark ? "text-white/65" : "text-muted"}`}>Mar del Plata</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => {
              const active = n.href === pathname || (n.href === "/productos" && pathname.startsWith("/productos"));
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className={`relative isolate rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      dark ? "text-white/80 hover:text-white" : active ? "text-ink" : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className={`absolute inset-0 -z-10 rounded-full ${dark ? "bg-white/12" : "bg-teal/12"}`}
                        transition={{ duration: 0.4, ease }}
                      />
                    )}
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/productos"
            className={`hidden rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 sm:inline-flex ${
              dark ? "bg-white text-ink hover:bg-sun" : "bg-ink text-white hover:bg-teal-deep"
            }`}
          >
            Ver catálogo
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`relative grid size-11 place-items-center rounded-full transition-colors duration-200 ${dark ? "hover:bg-white/10" : "hover:bg-ink/[0.06]"}`}
            aria-label={`Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
          >
            <ShoppingBag className="size-5" strokeWidth={1.8} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-sun px-1 text-[11px] font-bold text-ink"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            type="button"
            className={`grid size-11 place-items-center rounded-full transition-colors duration-200 lg:hidden ${dark ? "hover:bg-white/10" : "hover:bg-ink/[0.06]"}`}
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-controls="mobile-menu"
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
          >
            {menu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav
            id="mobile-menu"
            aria-label="Menú móvil"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, ease }}
            className="glass mx-auto mt-2 max-w-7xl rounded-3xl p-3 lg:hidden"
          >
            <ul>
              {nav.map((n, i) => (
                <motion.li key={n.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <Link
                    href={n.href}
                    onClick={() => setMenu(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-2xl hover:bg-teal/10"
                  >
                    {n.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/** Barra simple para el panel de administración. */
function AdminBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="/" className="flex items-center gap-3">
          <Logo className="size-9" />
          <span className="font-display text-base font-extrabold">Envases 3G · Administración</span>
        </a>
        <nav className="flex gap-1 text-sm">
          {[
            ["/administracion/pedidos", "Pedidos"],
            ["/administracion/catalogo", "Catálogo"],
            ["/administracion/importar", "Importar precios"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full px-3 py-2 hover:bg-teal/10">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
