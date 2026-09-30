"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from "lucide-react";
import { cartCount, cartTotal, useCart } from "@/store/cart";
import { currency } from "@/lib/catalog";
import { waLink } from "@/lib/site";
import { WhatsAppIcon } from "./icons";
import { lockScroll } from "./SmoothScroll";
import { ease } from "./Reveal";

type Step = "cart" | "checkout" | "done";
type Receipt = { number: string; total: number; items: { name: string; variant: string; quantity: number; unitPrice: number; subtotal: number }[] };

export function CartDrawer() {
  const pathname = usePathname();
  const { items, open, setOpen, setQuantity, remove, clear } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [waHref, setWaHref] = useState("");
  const pending = useRef<{ signature: string; id: string } | null>(null);

  useEffect(() => {
    lockScroll(open);
    if (!open) {
      const t = setTimeout(() => setStep((s) => (s === "done" ? "cart" : s)), 400);
      return () => clearTimeout(t);
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get("name") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      consent: form.get("consent") === "on",
      website: String(form.get("website") ?? ""),
      lines: items.map(({ slug, variantId, quantity }) => ({ slug, variantId, quantity })),
    };
    // Mismo identificador si se reintenta el mismo pedido: evita duplicados.
    const signature = JSON.stringify(body);
    if (pending.current?.signature !== signature) pending.current = { signature, id: crypto.randomUUID() };
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, requestId: pending.current.id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "No pudimos guardar el pedido.");
      const saved = result as Receipt;
      const message =
        `Hola Envases 3G, soy ${body.name}. Mi pedido es ${saved.number}.\n\n` +
        saved.items.map((i) => `${i.quantity} × ${i.name} (${i.variant})\n${currency(i.unitPrice)} c/u — ${currency(i.subtotal)}`).join("\n\n") +
        `\n\nTotal de productos: ${currency(saved.total)}.\nTeléfono: ${body.phone}\nQuisiera coordinar el pago y la entrega.`;
      setReceipt(saved);
      setWaHref(waLink(message));
      setStep("done");
      clear();
      pending.current = null;
      try {
        localStorage.setItem("envases3g-ultimo-pedido", JSON.stringify(saved));
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar el pedido. Intentá nuevamente.");
    } finally {
      setBusy(false);
    }
  }

  if (pathname.startsWith("/administracion")) return null;
  const count = cartCount(items);
  const total = cartTotal(items);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Carrito de compras">
          <motion.button
            aria-label="Cerrar carrito"
            className="absolute inset-0 bg-night/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%", transition: { duration: 0.3, ease } }}
            transition={{ duration: 0.55, ease }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
            data-lenis-prevent
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-2">
                {step === "checkout" && (
                  <button onClick={() => setStep("cart")} className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-ink/5" aria-label="Volver al carrito">
                    <ArrowLeft className="size-5" />
                  </button>
                )}
                <h2 className="font-display text-2xl">{step === "checkout" ? "Tus datos" : step === "done" ? "¡Listo!" : "Tu pedido"}</h2>
                {step === "cart" && count > 0 && <span className="rounded-full bg-teal/12 px-2.5 py-0.5 text-xs font-medium text-teal-deep">{count} u.</span>}
              </div>
              <button onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full hover:bg-ink/5" aria-label="Cerrar">
                <X className="size-5" />
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {step === "cart" && (
                <motion.div key="cart" className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  {items.length === 0 ? (
                    <div className="grid flex-1 place-items-center px-8 text-center">
                      <div>
                        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-paper-2">
                          <ShoppingBag className="size-7 text-teal-deep" strokeWidth={1.5} />
                        </div>
                        <p className="font-display text-2xl">Tu carrito está vacío</p>
                        <p className="mt-2 text-sm text-muted">Explorá más de 400 envases, tapas y accesorios.</p>
                        <Link href="/productos" onClick={() => setOpen(false)} className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-teal-deep">
                          Ir al catálogo
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                        <AnimatePresence initial={false}>
                          {items.map((i) => (
                            <motion.li
                              key={i.slug + i.variantId}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                              className="flex gap-3 rounded-2xl border border-line/70 bg-white p-2.5"
                            >
                              <Link href={`/productos/${i.slug}`} onClick={() => setOpen(false)} className="size-20 shrink-0 overflow-hidden rounded-xl bg-photo">
                                {i.image && <img src={i.image} alt="" className="size-full object-cover" />}
                              </Link>
                              <div className="flex min-w-0 flex-1 flex-col">
                                <p className="line-clamp-2 text-sm font-medium leading-snug">{i.name}</p>
                                {i.variantName !== "Presentación única" && <p className="mt-0.5 truncate text-xs text-muted">{i.variantName}</p>}
                                <div className="mt-auto flex items-center justify-between pt-2">
                                  <div className="flex items-center rounded-full border border-line">
                                    <button onClick={() => setQuantity(i.slug, i.variantId, i.quantity - 1)} className="grid size-8 place-items-center rounded-full hover:bg-ink/5" aria-label={`Restar una unidad de ${i.name}`}>
                                      <Minus className="size-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-sm tabular-nums">{i.quantity}</span>
                                    <button onClick={() => setQuantity(i.slug, i.variantId, i.quantity + 1)} className="grid size-8 place-items-center rounded-full hover:bg-ink/5" aria-label={`Sumar una unidad de ${i.name}`}>
                                      <Plus className="size-3.5" />
                                    </button>
                                  </div>
                                  <span className="text-sm font-semibold tabular-nums">{currency(i.price * i.quantity)}</span>
                                </div>
                              </div>
                              <button onClick={() => remove(i.slug, i.variantId)} className="grid size-8 shrink-0 place-items-center self-start rounded-full text-muted hover:bg-ink/5 hover:text-ink" aria-label={`Quitar ${i.name}`}>
                                <Trash2 className="size-4" />
                              </button>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                      <div className="border-t border-line px-5 pb-5 pt-4">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-muted">Total de productos</span>
                          <span className="font-display text-3xl tabular-nums">{currency(total)}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted">El pago, los descuentos y la entrega se coordinan por WhatsApp.</p>
                        <button onClick={() => setStep("checkout")} className="mt-4 w-full rounded-full bg-ink py-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-deep">
                          Continuar pedido
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {step === "checkout" && (
                <motion.form key="checkout" onSubmit={submit} className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                  <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    <Field label="Nombre y apellido" name="name" autoComplete="name" minLength={2} maxLength={120} required disabled={busy} />
                    <Field label="Teléfono de contacto" name="phone" type="tel" autoComplete="tel" inputMode="tel" minLength={8} maxLength={30} required placeholder="Ej.: 223 123 4567" disabled={busy} />
                    <div hidden aria-hidden="true">
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-4 text-sm">
                      <input type="checkbox" name="consent" required disabled={busy} className="mt-0.5 size-4 accent-[var(--teal-deep)]" />
                      Acepto que Envases 3G guarde mis datos para gestionar este pedido.
                    </label>
                    {error && (
                      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                        {error}
                      </p>
                    )}
                  </div>
                  <div className="border-t border-line px-5 pb-5 pt-4">
                    <div className="mb-3 flex items-center gap-2 text-xs text-muted">
                      <ShieldCheck className="size-4 text-teal-deep" /> No pagás nada ahora: registramos el pedido y lo seguimos por WhatsApp.
                    </div>
                    <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-deep disabled:opacity-60">
                      {busy ? "Guardando tu pedido…" : `Confirmar pedido · ${currency(total)}`}
                    </button>
                  </div>
                </motion.form>
              )}

              {step === "done" && receipt && (
                <motion.div key="done" className="grid flex-1 place-items-center px-8 text-center" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease }}>
                  <div>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }} className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-teal text-night">
                      <Check className="size-9" strokeWidth={2.4} />
                    </motion.div>
                    <p className="font-display text-3xl">Pedido {receipt.number}</p>
                    <p className="mt-2 text-sm text-muted">Total de productos: <strong className="text-ink">{currency(receipt.total)}</strong></p>
                    <p className="mx-auto mt-3 max-w-xs text-sm text-muted">Ya lo registramos. Envianos el mensaje por WhatsApp para coordinar pago y entrega.</p>
                    <a href={waHref} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-7 py-4 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-[1.03]">
                      <WhatsAppIcon className="size-5" /> Continuar en WhatsApp
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input {...props} className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-muted/60 focus:border-teal-deep" />
    </label>
  );
}
