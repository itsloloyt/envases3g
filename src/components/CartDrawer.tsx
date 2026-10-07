"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { cartCount, cartTotal, useCart } from "@/store/cart";
import { currency } from "@/lib/catalog";
import { site, waLink } from "@/lib/site";
import { saveOrder } from "@/lib/orders";
import { discountFor, nextTier, PAYMENT_LABEL, type PaymentMethod } from "@/lib/discounts";
import { lockScroll } from "./SmoothScroll";
import { ease } from "./Reveal";

type Step = "cart" | "checkout";
type Receipt = { number: string; total: number; items: { name: string; variant: string; quantity: number; unitPrice: number; subtotal: number }[] };

type Delivery = "retiro" | "envio";
const DELIVERY: Record<Delivery, { label: string; detail: string }> = {
  retiro: { label: "Retiro en el local", detail: `${site.address}, Mar del Plata · sin cargo` },
  envio: { label: "Envío", detail: "Costo según peso y tamaño: lo coordinamos por WhatsApp" },
};

export function CartDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { items, open, setOpen, setQuantity, remove, clear } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [postcode, setPostcode] = useState("");
  const [method, setMethod] = useState<Delivery>("retiro");
  const [chosenPayment, setPayment] = useState<PaymentMethod>("efectivo");
  // Efectivo solo se puede retirando en el local; los envíos se pagan por transferencia.
  const payment: PaymentMethod = method === "envio" ? "transferencia" : chosenPayment;
  const pending = useRef<{ signature: string; id: string } | null>(null);

  const shipping = DELIVERY[method];

  useEffect(() => {
    lockScroll(open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
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
    const address = String(form.get("address") ?? "").trim();
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
      const units = saved.items.reduce((n, i) => n + i.quantity, 0);
      const disc = discountFor(saved.total, units, payment);
      const total = saved.total - disc.amount;
      const delivery =
        method === "retiro"
          ? `Retiro en el local (${site.address})`
          : `Envío — costo a coordinar${address ? ` — ${address}` : ""}${postcode ? ` — CP ${postcode}` : ""}`;
      const message =
        `Hola Envases 3G, soy ${body.name}. Mi pedido es ${saved.number}.\n\n` +
        saved.items.map((i) => `${i.quantity} × ${i.name} (${i.variant})\n${currency(i.unitPrice)} c/u — ${currency(i.subtotal)}`).join("\n\n") +
        `\n\nProductos: ${currency(saved.total)}${disc.amount ? `\nDescuento ${disc.percent}% pagando por ${payment}: -${currency(disc.amount)}` : ""}\nEntrega: ${delivery}\nPago: ${PAYMENT_LABEL[payment]}\nTotal: ${currency(total)}\nTeléfono: ${body.phone}`;
      const lineFor = (name: string, variant: string) => items.find((i) => i.name === name && i.variantName === variant);
      saveOrder({
        number: saved.number,
        createdAt: new Date().toISOString(),
        customer: { name: body.name, phone: body.phone, postcode: postcode || undefined, address: address || undefined },
        items: saved.items.map((i) => ({ ...i, image: lineFor(i.name, i.variant)?.image ?? null, slug: lineFor(i.name, i.variant)?.slug })),
        subtotal: saved.total,
        discount: disc.amount ? { percent: disc.percent, amount: disc.amount, label: `${disc.percent}% OFF pagando por ${payment}` } : undefined,
        payment: PAYMENT_LABEL[payment],
        shipping: { method, label: shipping.label, detail: shipping.detail, price: 0 },
        total,
        whatsapp: waLink(message),
      });
      clear();
      pending.current = null;
      setOpen(false);
      setStep("cart");
      router.push(`/pedido/${encodeURIComponent(saved.number)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar el pedido. Intentá nuevamente.");
    } finally {
      setBusy(false);
    }
  }

  if (pathname.startsWith("/administracion")) return null;
  const count = cartCount(items);
  const total = cartTotal(items);
  const disc = discountFor(total, count, payment);
  const cashDisc = discountFor(total, count, "efectivo");
  const next = nextTier(count);

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
                <h2 className="font-display text-2xl">{step === "checkout" ? "Datos y envío" : "Tu pedido"}</h2>
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
                        {cashDisc.amount > 0 && (
                          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 flex items-center justify-between rounded-xl bg-sun/40 px-3 py-2 text-sm font-semibold">
                            <span>Pagando en efectivo ({cashDisc.percent}% OFF)</span>
                            <span className="tabular-nums">{currency(total - cashDisc.amount)}</span>
                          </motion.p>
                        )}
                        {next && (
                          <div className="mt-3">
                            <p className="text-xs text-muted">
                              Sumá <strong className="text-ink">{next.missing} u.</strong> más y obtenés <strong className="text-teal-deep">{next.percent}% OFF</strong> pagando en efectivo (retiro en el local)
                            </p>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                              <motion.div className="h-full rounded-full bg-gradient-to-r from-teal to-sun" initial={false} animate={{ width: `${Math.min(100, (count / (count + next.missing)) * 100)}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
                            </div>
                          </div>
                        )}
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
                    <fieldset className="rounded-2xl border border-line bg-white p-4">
                      <legend className="flex items-center gap-2 px-1 text-sm font-semibold">
                        <Truck className="size-4 text-teal-deep" /> Entrega
                      </legend>
                      <div className="space-y-2" role="radiogroup" aria-label="Forma de entrega">
                        {(Object.keys(DELIVERY) as Delivery[]).map((m) => (
                          <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${method === m ? "border-teal-deep bg-teal/5" : "border-line hover:border-ink/30"}`}>
                            <input type="radio" name="shipping" checked={method === m} onChange={() => setMethod(m)} className="size-4 accent-[var(--teal-deep)]" />
                            <span className="flex-1">
                              <span className="block font-medium">{DELIVERY[m].label}</span>
                              <span className="block text-xs text-muted">{DELIVERY[m].detail}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                      {method === "envio" && (
                        <div className="mt-3 grid grid-cols-[1fr_7rem] gap-2">
                          <input name="address" required autoComplete="street-address" placeholder="Calle, número, ciudad" className="w-full rounded-xl border border-line px-3 py-2.5 text-base outline-none focus:border-teal-deep" />
                          <input value={postcode} onChange={(e) => setPostcode(e.target.value.replace(/D/g, "").slice(0, 4))} required inputMode="numeric" autoComplete="postal-code" placeholder="CP" className="w-full rounded-xl border border-line px-3 py-2.5 text-base outline-none focus:border-teal-deep" />
                        </div>
                      )}
                    </fieldset>
                    <fieldset className="rounded-2xl border border-line bg-white p-4">
                      <legend className="px-1 text-sm font-semibold">Forma de pago</legend>
                      <div className="grid grid-cols-2 gap-2">
                        {(["efectivo", "transferencia"] as const).map((m) => {
                          const d = discountFor(total, count, m);
                          const off = m === "efectivo" && method === "envio";
                          return (
                            <label key={m} className={`rounded-xl border p-3 text-sm transition-colors ${off ? "cursor-not-allowed opacity-45" : "cursor-pointer"} ${payment === m ? "border-teal-deep bg-teal/5" : "border-line hover:border-ink/30"}`}>
                              <input type="radio" name="payment" className="sr-only" disabled={off} checked={payment === m} onChange={() => setPayment(m)} />
                              <span className="block font-medium">{m === "efectivo" ? "Efectivo" : "Transferencia"}</span>
                              <span className={`block text-xs ${d.percent && !off ? "font-semibold text-teal-deep" : "text-muted"}`}>
                                {off ? "Solo retirando en el local" : d.percent ? `${d.percent}% OFF aplicado` : m === "efectivo" ? "10% OFF desde 20 u." : "10% OFF desde 100 u."}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                    <div className="space-y-1.5 rounded-2xl bg-paper-2 p-4 text-sm">
                      <p className="flex justify-between"><span className="text-muted">Productos</span><span className="tabular-nums">{currency(total)}</span></p>
                      {disc.amount > 0 && <p className="flex justify-between font-semibold text-teal-deep"><span>Descuento {disc.percent}% {payment}</span><span className="tabular-nums">-{currency(disc.amount)}</span></p>}
                      <p className="flex justify-between"><span className="text-muted">Entrega</span><span>{method === "retiro" ? "Retiro sin cargo" : "Envío a coordinar"}</span></p>
                      <p className="flex justify-between border-t border-line pt-2 font-semibold"><span>Total</span><span className="tabular-nums">{currency(total - disc.amount)}</span></p>
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
                      <ShieldCheck className="size-4 text-teal-deep" /> No pagás nada ahora: registramos tu orden y la confirmamos por WhatsApp.
                    </div>
                    <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-deep disabled:opacity-60">
                      {busy ? "Guardando tu pedido…" : `Confirmar pedido · ${currency(total - disc.amount)}`}
                    </button>
                  </div>
                </motion.form>
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
