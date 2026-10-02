"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { Check, Link2, Minus, Plus, Share2, ShoppingBag, Store, Truck } from "lucide-react";
import { cover } from "@/lib/shop";
import { CASH_TIERS, cashPercent } from "@/lib/discounts";
import { rememberProduct } from "./RecentlyViewed";
import { flyToCart } from "../FlyToCart";
import { currency, type Product } from "@/lib/catalog";
import { accessoryPhoto, photoFor } from "@/lib/accessories";
import { site, waLink } from "@/lib/site";
import { useCart } from "@/store/cart";
import { WhatsAppIcon } from "../icons";
import { ease } from "../Reveal";

export function ProductView({ product, categoryName }: { product: Product; categoryName: string }) {
  const add = useCart((s) => s.add);
  const reduce = useReducedMotion();
  const bare = product.variants.find((v) => /solo envase|sin tapa|sin accesorio/i.test(v.name));
  const firstAvailable = bare ?? product.variants.find((v) => v.available) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable.id);
  const variant = product.variants.find((v) => v.id === variantId) ?? firstAvailable;
  const [qty, setQty] = useState(Math.max(1, firstAvailable.minQuantity));
  const [added, setAdded] = useState(false);

  // Una sola imagen: arranca con el envase solo y cambia cuando se elige un accesorio.
  const selected = photoFor(product, variant);
  const shown = selected.src;

  const [shared, setShared] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rememberProduct({ slug: product.slug, name: product.name, image: cover(product), price: Math.min(...product.variants.map((v) => v.price)) });
  }, [product]);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, text: `${product.name} — Envases 3G`, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* El usuario canceló. */
    }
  }

  const hasVariants = product.variants.length > 1;
  // Si el producto ya es una tapa o válvula no se muestra un accesorio aparte.
  const isAccessory = ["tapas", "valvulas-y-gatillos"].includes(product.subcategory);
  const accFor = (v: typeof variant) => (isAccessory ? null : accessoryPhoto(v));

  function chooseVariant(id: string) {
    if (id === variantId) return;
    const v = product.variants.find((x) => x.id === id)!;
    setVariantId(id);
    setQty((q) => Math.max(q, v.minQuantity));
  }

  function addToCart() {
    flyToCart(shown, stage.current, product.name);
    add(
      { slug: product.slug, variantId: variant.id, name: product.name, variantName: variant.name, price: variant.price, image: photoFor(product, variant).src, minQuantity: variant.minQuantity, subcategory: product.subcategory },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Visor: foto del envase; al elegir un accesorio cambia con un fundido suave */}
      <div className="min-w-0 lg:col-span-7">
        <div className="lg:sticky lg:top-28">
          <div ref={stage} className="relative aspect-[3/4] w-full overflow-hidden rounded-[32px] bg-[#efe8dd]">
            <AnimatePresence initial={false}>
              <motion.img
                key={shown}
                src={shown}
                alt={`${product.name}${hasVariants ? ` — ${variant.name}` : ""}`}
                initial={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease }}
                className="absolute inset-0 size-full object-cover"
              />
            </AnimatePresence>

            {/* Sin foto de la combinación: foto real del accesorio elegido, junto al envase */}
            <AnimatePresence mode="wait">
              {!selected.exact && accFor(variant) && (
                <motion.figure
                  key={variant.id}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.5, ease }}
                  className="absolute right-4 top-4 w-[30%] min-w-28 overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-20px_rgb(4_22_25/0.35)]"
                >
                  <img src={accFor(variant)!} alt={variant.name} className="aspect-square w-full object-contain p-2" />
                  <figcaption className="border-t border-line px-2.5 py-1.5 text-[11px] font-medium leading-tight text-ink">+ {variant.name}</figcaption>
                </motion.figure>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className="min-w-0 lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">{categoryName}</p>
            <button onClick={share} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium transition-colors hover:border-teal-deep hover:text-teal-deep" aria-label="Compartir producto">
              {shared ? <Link2 className="size-3.5" /> : <Share2 className="size-3.5" />} {shared ? "¡Link copiado!" : "Compartir"}
            </button>
          </div>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] sm:text-5xl">{product.name}</h1>

          <div className="mt-6 flex items-baseline gap-3">
            <AnimatePresence mode="wait">
              <motion.span
                key={variant.price}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="font-display text-4xl font-extrabold tabular-nums"
              >
                {currency(variant.price)}
              </motion.span>
            </AnimatePresence>
            <span className="text-sm text-muted">por unidad</span>
          </div>
          <p className={`mt-2 inline-flex items-center gap-1.5 text-sm ${variant.available ? "text-teal-deep" : "text-muted"}`}>
            <span className={`size-2 rounded-full ${variant.available ? "bg-teal" : "bg-muted"}`} />
            {variant.available ? "Disponible" : "Sin stock — consultanos"}
            {variant.minQuantity > 1 && <span className="text-muted"> · mínimo {variant.minQuantity} u.</span>}
          </p>

          {hasVariants && (
            <fieldset className="mt-8">
              <legend className="mb-3 text-sm font-semibold">
                Elegí tu accesorio: <span className="font-normal text-muted">{variant.name}</span>
              </legend>
              <div
                className={`grid grid-cols-2 gap-2 ${product.variants.length > 8 ? "max-h-[320px] overflow-y-auto p-0.5 pr-1.5 [mask-image:linear-gradient(to_bottom,black_85%,transparent)]" : ""}`}
                data-lenis-prevent
              >
                {product.variants.map((v) => {
                  const active = v.id === variant.id;
                  const acc = accFor(v);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => chooseVariant(v.id)}
                      onPointerEnter={() => {
                        new Image().src = photoFor(product, v).src;
                      }}
                      aria-pressed={active}
                      className={`relative flex min-h-14 items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left text-sm transition-colors duration-200 ${
                        active ? "border-transparent bg-white" : "border-line hover:border-teal-deep/50"
                      } ${v.available ? "" : "opacity-50"}`}
                    >
                      {acc && <img src={acc} alt="" className="size-9 shrink-0 rounded-lg bg-white object-contain p-0.5" loading="lazy" />}
                      <span className="min-w-0">
                        <span className="block leading-tight">{v.name}</span>
                        <span className="mt-0.5 block text-xs tabular-nums text-muted">
                          {currency(v.price)}
                          {!v.available && " · sin stock"}
                        </span>
                      </span>
                      {active && <motion.span layoutId="variant-ring" className="absolute inset-0 rounded-2xl ring-2 ring-teal-deep" transition={{ duration: 0.3, ease }} />}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="mt-8 flex gap-3">
            <div className="flex items-center rounded-full border border-line bg-white">
              <button onClick={() => setQty((q) => Math.max(variant.minQuantity, q - 1))} className="grid size-12 place-items-center rounded-full hover:bg-ink/5" aria-label="Restar cantidad">
                <Minus className="size-4" />
              </button>
              <label className="sr-only" htmlFor="qty">
                Cantidad
              </label>
              <input
                id="qty"
                inputMode="numeric"
                value={qty}
                onChange={(e) => {
                  const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
                  setQty(Number.isFinite(n) ? Math.min(Math.max(variant.minQuantity, n), 9999) : variant.minQuantity);
                }}
                className="w-14 bg-transparent text-center text-base tabular-nums outline-none"
              />
              <button onClick={() => setQty((q) => Math.min(9999, q + 1))} className="grid size-12 place-items-center rounded-full hover:bg-ink/5" aria-label="Sumar cantidad">
                <Plus className="size-4" />
              </button>
            </div>
            <button
              onClick={addToCart}
              disabled={!variant.available}
              className="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-ink py-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span key="ok" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="flex items-center gap-2">
                    <Check className="size-4" /> Agregado
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="flex items-center gap-2">
                    <ShoppingBag className="size-4" /> Agregar · {currency(variant.price * qty)}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Descuentos vigentes por cantidad (pagando en efectivo) */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex items-center justify-between gap-3 bg-sun/35 px-4 py-2.5">
              <p className="text-sm font-semibold">Descuentos pagando en efectivo</p>
              <AnimatePresence mode="wait">
                {cashPercent(qty) > 0 && (
                  <motion.span key={cashPercent(qty)} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="rounded-full bg-night px-2.5 py-0.5 text-xs font-bold text-sun">
                    {cashPercent(qty)}% aplicado
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="grid grid-cols-3 divide-x divide-line text-center">
              {[...CASH_TIERS].reverse().map((t) => {
                const on = cashPercent(qty) === t.percent;
                return (
                  <button key={t.minUnits} type="button" onClick={() => setQty(Math.max(qty, t.minUnits))} className={`px-2 py-3 transition-colors ${on ? "bg-teal/10" : "hover:bg-paper-2"}`}>
                    <span className="block text-xs text-muted">desde {t.minUnits} u.</span>
                    <span className={`block font-display text-xl font-extrabold ${on ? "text-teal-deep" : ""}`}>{t.percent}% OFF</span>
                    <span className="block text-xs tabular-nums text-muted">{currency(variant.price * (1 - t.percent / 100))} c/u</span>
                  </button>
                );
              })}
            </div>
            {cashPercent(qty) > 0 && (
              <p className="border-t border-line px-4 py-2 text-sm">
                Total en efectivo: <strong className="tabular-nums">{currency(variant.price * qty * (1 - cashPercent(qty) / 100))}</strong>{" "}
                <span className="text-muted line-through tabular-nums">{currency(variant.price * qty)}</span>
              </p>
            )}
          </div>

          <a
            href={waLink(`Hola! Quería consultar por: ${product.name}${hasVariants ? ` (${variant.name})` : ""}. ¿Tienen stock para ${qty} ${qty === 1 ? "unidad" : "unidades"}?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-line py-4 text-sm font-medium transition-colors duration-200 hover:border-[#25D366] hover:text-[#128C4B]"
          >
            <WhatsAppIcon className="size-4" /> Consultar por WhatsApp
          </a>

          {product.description && (
            <div className="mt-10 border-t border-line pt-6">
              <h2 className="text-sm font-semibold">Detalles</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-2">{product.description}</p>
            </div>
          )}

          <ul className="mt-8 grid gap-3 border-t border-line pt-6 text-sm">
            <li className="flex items-center gap-3">
              <Store className="size-5 text-teal-deep" strokeWidth={1.6} /> Retiro en {site.address}, {site.city}
            </li>
            <li className="flex items-center gap-3">
              <Truck className="size-5 text-teal-deep" strokeWidth={1.6} /> Envíos a coordinar
            </li>
            <li className="flex items-center gap-3">
              <ShoppingBag className="size-5 text-teal-deep" strokeWidth={1.6} /> Precio mayorista por cantidad — consultanos
            </li>
          </ul>
        </div>
      </div>
      {/* Barra de compra fija en celular */}
      <div className="fixed inset-x-3 bottom-[84px] z-30 lg:hidden">
        <div className="glass flex items-center gap-3 rounded-2xl p-2 pl-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{hasVariants ? variant.name : product.name}</p>
            <p className="font-display text-lg font-extrabold tabular-nums leading-tight">{currency(variant.price * qty)}</p>
          </div>
          <motion.button whileTap={{ scale: 0.94 }} onClick={addToCart} disabled={!variant.available} className="flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
            {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />} {added ? "Agregado" : "Agregar"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
