"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Minus, Plus, ShoppingBag, Sparkles, Store, Truck } from "lucide-react";
import { currency, type Product } from "@/lib/catalog";
import { accessoryArt, photoFor } from "@/lib/accessories";
import { site, waLink } from "@/lib/site";
import { useCart } from "@/store/cart";
import { WhatsAppIcon } from "../icons";
import { ease } from "../Reveal";

export function ProductView({ product, categoryName }: { product: Product; categoryName: string }) {
  const add = useCart((s) => s.add);
  const reduce = useReducedMotion();
  const firstAvailable = product.variants.find((v) => v.available) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable.id);
  const variant = product.variants.find((v) => v.id === variantId) ?? firstAvailable;
  const [qty, setQty] = useState(Math.max(1, firstAvailable.minQuantity));
  const [added, setAdded] = useState(false);

  // Galería: la foto de la opción elegida primero, después el resto de las fotos del producto.
  const selected = photoFor(product, variant);
  const gallery = [selected.src, ...product.images.filter((i) => i !== selected.src)];
  const [shown, setShown] = useState<string>(selected.src);
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
      timer.current = setTimeout(() => setShown(next), 650);
      fitTimer.current = setTimeout(() => setFit(null), 1550);
    } else {
      setShown(next);
    }
  }

  function addToCart() {
    add(
      { slug: product.slug, variantId: variant.id, name: product.name, variantName: variant.name, price: variant.price, image: photoFor(product, variant).src, minQuantity: variant.minQuantity, subcategory: product.subcategory },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Visor */}
      <div className="min-w-0 lg:col-span-7">
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {gallery.length > 1 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto sm:max-h-[680px] sm:flex-col sm:overflow-y-auto" data-lenis-prevent>
              {gallery.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setShown(src)}
                  aria-label={`Ver imagen ${i + 1}`}
                  aria-current={src === shown}
                  className={`size-16 shrink-0 overflow-hidden rounded-xl bg-photo ring-2 ring-offset-2 ring-offset-paper transition sm:size-20 ${
                    src === shown ? "ring-teal-deep" : "ring-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" className="size-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[30px] bg-photo sm:w-auto sm:flex-1">
            <AnimatePresence initial={false}>
              <motion.img
                key={shown}
                src={shown}
                alt={`${product.name}${hasVariants ? ` — ${variant.name}` : ""}`}
                initial={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                transition={{ duration: 0.7, ease }}
                className="absolute inset-0 size-full object-cover"
              />
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
                  <motion.span
                    className="absolute left-1/2 top-[22%] size-24 -translate-x-1/2 rounded-full border-2 border-teal"
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: [0.3, 1.8], opacity: [0, 0.9, 0] }}
                    transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
                  />
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
        </div>
      </div>

      {/* Información */}
      <div className="min-w-0 lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-deep">{categoryName}</p>
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
    </div>
  );
}
