"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ArrowUpRight,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product, Variant, currency, whatsapp, products } from "@/lib/catalog";
import { CheckoutForm } from "./checkout-form";
type Line = { key: string; slug: string; variantId: string; quantity: number };
type Shop = {
  lines: Line[];
  add: (p: Product, v: Variant, q: number) => void;
  open: () => void;
};
const Context = createContext<Shop | null>(null);
export const useShop = () => useContext(Context)!;
export function ShopProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [catalog, setCatalog] = useState<Product[]>(products);
  const [ready, setReady] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("envases3g-pedido") || "[]",
      );
      if (Array.isArray(saved))
        setLines(
          saved.filter(
            (l) =>
              typeof l.slug === "string" &&
              Number.isInteger(l.quantity) &&
              l.quantity > 0 &&
              l.quantity <= 9999 &&
              products.some(
                (p) =>
                  p.slug === l.slug &&
                  p.variants.some((v) => v.id === l.variantId),
              ),
          ),
        );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try { localStorage.setItem("envases3g-pedido", JSON.stringify(lines)); } catch { /* The current order still works if browser storage is unavailable. */ }
    }
  }, [lines, ready]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalogo", { signal: controller.signal, cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((items: Product[] | null) => {
        if (Array.isArray(items) && items.length) setCatalog(items);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const resolved = lines.flatMap((l) => {
    const p = catalog.find((p) => p.slug === l.slug);
    const v = p?.variants.find((v) => v.id === l.variantId);
    return p && v ? [{ ...l, p, v }] : [];
  });
  const total = resolved.reduce((sum, l) => sum + Math.round(l.v.price * 100) * l.quantity, 0) / 100;
  const message =
    "Hola Envases 3G, quisiera consultar este pedido:\n\n" +
    resolved
      .map(
        (l) =>
          `${l.quantity} × ${l.p.name} (${l.v.name}) — ${currency(l.v.price * l.quantity)}`,
      )
      .join("\n") +
    `\n\nTotal de referencia: ${currency(total)}. ¿Me confirman disponibilidad, precio final y entrega?`;
  function add(p: Product, v: Variant, q: number) {
    setLines((old) => {
      const key = p.slug + ":" + v.id;
      const found = old.find((l) => l.key === key);
      return found
        ? old.map((l) =>
            l.key === key
              ? { ...l, quantity: Math.min(9999, l.quantity + q) }
              : l,
          )
        : [...old, { key, slug: p.slug, variantId: v.id, quantity: q }];
    });
    dialog.current?.showModal();
  }
  function change(key: string, delta: number, min: number) {
    setLines((old) =>
      old.map((l) =>
        l.key === key
          ? {
              ...l,
              quantity: Math.max(min, Math.min(9999, l.quantity + delta)),
            }
          : l,
      ),
    );
  }
  return (
    <Context.Provider
      value={{ lines, add, open: () => dialog.current?.showModal() }}
    >
      {children}
      <dialog
        className="cart-dialog"
        ref={dialog}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="cart-inner">
          <div className="cart-title">
            <h2>
              Tu pedido <span>({lines.length})</span>
            </h2>
            <button
              className="icon-button"
              aria-label="Cerrar pedido"
              onClick={() => dialog.current?.close()}
            >
              <X />
            </button>
          </div>
          {resolved.length ? (
            <>
              <p className="muted">
                Elegí tus envases. Coordinamos el resto juntos.
              </p>
              <div className="cart-lines">
                {resolved.map((l) => (
                  <article className="cart-line" key={l.key}>
                    <Image
                      src={l.p.image}
                      alt={l.p.name}
                      width={90}
                      height={110}
                    />
                    <div>
                      <Link
                        href={"/productos/" + l.slug}
                        onClick={() => dialog.current?.close()}
                      >
                        {l.p.name}
                      </Link>
                      <small>{l.v.name}</small>
                      <strong>{currency(l.v.price * l.quantity)}</strong>
                      <div className="quantity small">
                        <button
                          aria-label={"Restar " + l.p.name}
                          onClick={() => change(l.key, -1, l.v.minQuantity)}
                          disabled={l.quantity <= l.v.minQuantity}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{l.quantity}</span>
                        <button
                          aria-label={"Sumar " + l.p.name}
                          onClick={() => change(l.key, 1, l.v.minQuantity)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="icon-button"
                      aria-label={"Quitar " + l.p.name}
                      onClick={() =>
                        setLines((old) => old.filter((x) => x.key !== l.key))
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                ))}
              </div>
              <div className="cart-total">
                <span>Total de productos</span>
                <strong>{currency(total)}</strong>
              </div>
              <p className="fine">
                Precios del catálogo original. Confirmá stock, precio final y
                costo de entrega con el equipo antes de comprar.
              </p>
              <CheckoutForm key={JSON.stringify(lines)} lines={lines}/>
            </>
          ) : (
            <div className="empty">
              <ShoppingBag size={40} />
              <h3>Tu próxima idea empieza acá.</h3>
              <p>Agregá productos para armar tu pedido.</p>
              <Link
                className="button primary"
                href="/productos"
                onClick={() => dialog.current?.close()}
              >
                Explorar productos
              </Link>
            </div>
          )}
        </div>
      </dialog>
    </Context.Provider>
  );
}
