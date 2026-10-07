"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { Check, MessageCircle, PackageCheck, Printer, Store, Truck } from "lucide-react";
import { currency } from "@/lib/catalog";
import { readOrder, type SavedOrder } from "@/lib/orders";
import { site, waLink } from "@/lib/site";
import { WhatsAppIcon } from "./icons";
import { ease } from "./Reveal";

const noop = () => () => {};

export function OrderView({ number }: { number: string }) {
  // El pedido se lee de este navegador; en el servidor se muestra el estado de carga.
  const order = useSyncExternalStore(noop, () => readOrderCached(number), () => undefined);
  const reduce = useReducedMotion();

  if (order === undefined) return <div className="min-h-[70dvh]" />;
  if (order === null) return <NotFound number={number} />;

  const date = new Date(order.createdAt).toLocaleString("es-AR", { dateStyle: "long", timeStyle: "short" });
  const pickup = order.shipping.method === "retiro";

  return (
    <div className="relative overflow-x-clip pb-24 pt-28 sm:pt-32 print:pt-6">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-0 -z-10 size-[520px] rounded-full bg-teal/20 blur-[120px] print:hidden" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Encabezado */}
        <div className="flex flex-col items-center text-center">
          <motion.span
            initial={reduce ? false : { scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.1 }}
            className="relative grid size-20 place-items-center rounded-full bg-teal text-night shadow-[0_20px_40px_-15px_rgb(34_181_193/0.7)]"
          >
            <Check className="size-10" strokeWidth={2.6} />
            {!reduce &&
              Array.from({ length: 10 }).map((_, i) => (
                <motion.span
                  key={i}
                  className={`absolute size-2 rounded-full ${i % 2 ? "bg-sun" : "bg-teal"}`}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: Math.cos((i / 10) * Math.PI * 2) * 70, y: Math.sin((i / 10) * Math.PI * 2) * 70, opacity: 0 }}
                  transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
                />
              ))}
          </motion.span>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease }} className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-teal-deep">
            Pedido registrado
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6, ease }} className="mt-2 font-display text-5xl font-extrabold sm:text-6xl">
            Orden {order.number}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-3 text-muted">
            {order.customer.name} · {date}
          </motion.p>
        </div>

        {/* Próximo paso */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease }}
          className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl bg-night p-6 text-white sm:flex-row sm:p-7 print:hidden"
        >
          <div>
            <p className="font-display text-xl font-extrabold">Último paso: confirmalo por WhatsApp</p>
            <p className="mt-1 text-sm text-white/70">Te respondemos con disponibilidad, forma de pago y {pickup ? "horario de retiro" : "fecha de envío"}.</p>
          </div>
          <a href={order.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.03]">
            <WhatsAppIcon className="size-5" /> Enviar pedido
          </a>
        </motion.div>

        {/* Detalle */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease }}
          className="mt-6 overflow-hidden rounded-3xl border border-line bg-white"
          aria-label="Detalle del pedido"
        >
          <ul className="divide-y divide-line">
            {order.items.map((it, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.06, duration: 0.4, ease }}
                className="flex items-center gap-4 p-4 sm:p-5"
              >
                <div className="size-16 shrink-0 overflow-hidden rounded-2xl bg-photo sm:size-20">{it.image && <img src={it.image} alt="" className="size-full object-cover" />}</div>
                <div className="min-w-0 flex-1">
                  {it.slug ? (
                    <Link href={`/productos/${it.slug}`} className="font-medium hover:text-teal-deep">
                      {it.name}
                    </Link>
                  ) : (
                    <p className="font-medium">{it.name}</p>
                  )}
                  {it.variant !== "Presentación única" && (
                    <p className="mt-0.5 inline-flex rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-medium text-teal-deep">Con {it.variant.toLowerCase()}</p>
                  )}
                  <p className="mt-1 text-sm text-muted">
                    {it.quantity} × {currency(it.unitPrice)}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">{currency(it.subtotal)}</p>
              </motion.li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-line bg-paper-2/60 p-5 text-sm sm:p-6">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal productos</dt>
              <dd className="tabular-nums">{currency(order.subtotal)}</dd>
            </div>
            {order.discount && (
              <div className="flex justify-between font-semibold text-teal-deep">
                <dt>{order.discount.label}</dt>
                <dd className="tabular-nums">-{currency(order.discount.amount)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted">
                {order.shipping.label}
                <span className="block text-xs">{order.shipping.detail}</span>
              </dt>
              <dd className="tabular-nums">{order.shipping.price ? currency(order.shipping.price) : order.shipping.method === "envio" ? "A coordinar" : "Sin cargo"}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-3xl font-extrabold tabular-nums">{currency(order.total)}</dd>
            </div>
            {order.shipping.price > 0 && <p className="text-xs text-muted">El costo de envío es estimado y se confirma al despachar.</p>}
          </dl>
        </motion.section>

        {/* Entrega y seguimiento */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-line bg-white p-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              {pickup ? <Store className="size-4 text-teal-deep" /> : <Truck className="size-4 text-teal-deep" />} Entrega
            </p>
            <p className="mt-2 text-sm text-ink-2">
              {pickup ? `${site.address}, ${site.city}` : [order.customer.address, order.customer.postcode && `CP ${order.customer.postcode}`].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1 text-xs text-muted">Contacto: {order.customer.phone}</p>
            {order.payment && <p className="mt-1 text-xs text-muted">Pago: {order.payment}</p>}
          </div>
          <ol className="rounded-3xl border border-line bg-white p-5 text-sm">
            {[
              { Icon: Check, text: "Pedido registrado", done: true },
              { Icon: MessageCircle, text: "Confirmación por WhatsApp", done: false },
              { Icon: PackageCheck, text: pickup ? "Listo para retirar" : "Despachado", done: false },
            ].map(({ Icon, text, done }, i) => (
              <li key={text} className="flex items-center gap-3 py-1.5">
                <span className={`grid size-7 place-items-center rounded-full ${done ? "bg-teal text-night" : "bg-paper-2 text-muted"}`}>
                  <Icon className="size-3.5" />
                </span>
                <span className={done ? "font-medium" : "text-muted"}>
                  {i + 1}. {text}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium hover:border-ink">
            <Printer className="size-4" /> Imprimir / guardar PDF
          </button>
          <Link href="/productos" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-teal-deep">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}

let cache: { number: string; value: SavedOrder | null } | null = null;
function readOrderCached(number: string) {
  // useSyncExternalStore necesita la misma referencia entre lecturas.
  if (!cache || cache.number !== number) cache = { number, value: readOrder(number) };
  return cache.value;
}

function NotFound({ number }: { number: string }) {
  return (
    <div className="grid min-h-[75dvh] place-items-center px-4 pt-24 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-deep">Pedido</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold">Orden {number}</h1>
        <p className="mx-auto mt-3 max-w-sm text-muted">No encontramos el detalle en este dispositivo. Si hiciste el pedido desde otro, escribinos y te lo confirmamos.</p>
        <a href={waLink(`Hola! Quería consultar por mi pedido ${number}.`)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white">
          <WhatsAppIcon className="size-5" /> Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
