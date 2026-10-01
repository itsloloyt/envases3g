"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Link2, Minus, Plus, Share2, ShoppingBag, Sparkles, Store, Truck } from "lucide-react";
import { cover } from "@/lib/shop";
import { CASH_TIERS, cashPercent } from "@/lib/discounts";
import { rememberProduct } from "./RecentlyViewed";
import { flyToCart } from "../FlyToCart";
import { currency, type Product } from "@/lib/catalog";
import { accessoryArt, photoFor } from "@/lib/accessories";
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
  const [shown, setShown] = useState<string>(selected.src);
  const [sweep, setSweep] = useState(0);
  const [fit, setFit] = useState<{ key: number; src: string; label: string; width: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (fitTimer.current) clearTimeout(fitTimer.current);
    },
    [],
  );

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
  // Si el producto ya es una tapa o válvula, no tiene sentido animar un accesorio encima.
  const artFor = (v: typeof variant) => (["tapas", "valvulas-y-gatillos"].includes(product.subcategory) ? null : accessoryArt(v));

  function chooseVariant(id: string) {
    if (id === variantId) return;
    const v = product.variants.find((x) => x.id === id)!;
    setVariantId(id);
    setQty((q) => Math.max(q, v.minQuantity));
    const next = photoFor(product, v).src;
    const art = artFor(v);
    if (timer.current) clearTimeout(timer.current);
    if (art && !reduce) {
      // Animación de "colocado": el accesorio baja, se enrosca y aparece la foto final.
      if (fitTimer.current) clearTimeout(fitTimer.current);
      setFit({ key: Date.now(), ...art });
      timer.current = setTimeout(() => {
        setShown(next);
        setSweep((s) => s + 1);
      }, 620);
      fitTimer.current = setTimeout(() => setFit(null), 1550);
    } else {
      setShown(next);
      setSweep((s) => s + 1);
    }
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
      {/* Visor: envase solo → accesorio colocado */}
      <div className="min-w-0 lg:col-span-7">
        <div className="lg:sticky lg:top-28">
          <div ref={stage} className="relative aspect-[3/4] w-full overflow-hidden rounded-[32px] bg-photo shadow-[0_40px_80px_-50px_rgb(4_22_25/0.6)]">
            {/* Cambio de imagen: cortina de arriba hacia abajo, como si la pieza se enroscara */}
            <AnimatePresence initial={false}>
              <motion.img
                key={shown}
                src={shown}
                alt={`${product.name}${hasVariants ? ` — ${variant.name}` : ""}`}
                initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)", scale: 1.06, filter: "brightness(1.15)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1, filter: "brightness(1)", opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.75 } }}
                transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
                className="absolute inset-0 size-full object-cover"
              />
            </AnimatePresence>

            {/* Brillo que recorre el vidrio al terminar el cambio */}
            <AnimatePresence>
              {sweep > 0 && !reduce && (
                <motion.span
                  key={sweep}
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                  initial={{ x: "0%" }}
                  animate={{ x: "320%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, delay: 0.55, ease: "easeInOut" }}
                />
              )}
            </AnimatePresence>

            {/* Accesorio cayendo y enroscándose */}
            <AnimatePresence>
              {fit && (
                <motion.div key={fit.key} className="pointer-events-none absolute inset-0" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/10 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.4, times: [0, 0.2, 0.6, 1] }}
                  />
                  <motion.img
                    src={fit.src}
                    alt=""
                    style={{ width: `${fit.width}%`, left: `${50 - fit.width / 2}%` }}
                    className="absolute top-[14%] drop-shadow-[0_18px_22px_rgb(4_22_25/0.35)]"
                    initial={{ y: "-160%", rotate: -35, opacity: 0, scale: 1.15 }}
                    animate={{ y: ["-160%", "6%", "0%", "0%"], rotate: [-35, 12, 0, 0], opacity: [0, 1, 1, 0], scale: [1.15, 1, 1, 0.96] }}
                    transition={{ duration: 1.5, times: [0, 0.4, 0.55, 1], ease: "easeOut" }}
                  />
                  {[0, 0.12].map((d) => (
                    <motion.span
                      key={d}
                      className="absolute left-1/2 top-[22%] size-24 -translate-x-1/2 rounded-full border-2 border-teal"
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: [0.3, 2], opacity: [0, 0.9, 0] }}
                      transition={{ duration: 0.9, delay: 0.55 + d, ease: "easeOut" }}
                    />
                  ))}
                  <motion.span
                    className="glass absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink"
                    initial={{ y: -12, opacity: 0 }}
                    animate={{ y: [-12, 0, 0, -6], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.5, times: [0, 0.15, 0.8, 1] }}
                  >
                    <Sparkles className="size-3.5 text-teal-deep" /> Colocando {fit.label}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sin foto exacta de la combinación: el accesorio elegido queda a la vista junto al envase */}
            <AnimatePresence mode="wait">
              {!selected.exact && artFor(variant) && (
                <motion.div
                  key={variant.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: reduce ? 0 : 0.9 }}
                  className="glass absolute right-4 top-4 flex w-[26%] min-w-24 flex-col items-center gap-1 rounded-2xl p-3"
                >
                  <img src={artFor(variant)!.src} alt="" className="aspect-square w-full object-contain drop-shadow-[0_10px_12px_rgb(4_22_25/0.25)]" />
                  <span className="w-full truncate text-center text-[11px] font-semibold text-ink">+ {artFor(variant)!.label}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {hasVariants && (
              <AnimatePresence mode="wait">
                <motion.span
                  key={variant.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="glass absolute bottom-4 left-4 max-w-[80%] truncate rounded-full px-3.5 py-1.5 text-xs font-medium"
                >
                  {variant.name}
                  {!selected.exact && <span className="text-muted"> · foto de referencia</span>}
                </motion.span>
              </AnimatePresence>
            )}
          </div>
          {hasVariants && <p className="mt-3 text-center text-xs text-muted">Elegí un accesorio y miralo colocado en el envase ✦</p>}
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
                  const art = artFor(v);
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
                      {art && <img src={art.src} alt="" className="h-8 w-6 shrink-0 object-contain" loading="lazy" />}
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
