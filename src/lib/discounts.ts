/**
 * Descuentos vigentes. Para cambiarlos, editá solo esta tabla.
 * Se aplican pagando en efectivo, según la cantidad total de unidades del pedido.
 */
export const CASH_TIERS = [
  { minUnits: 200, percent: 20 },
  { minUnits: 50, percent: 15 },
  { minUnits: 20, percent: 10 },
] as const;

export type PaymentMethod = "efectivo" | "transferencia";

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia / a coordinar",
};

/** Porcentaje que corresponde a una cantidad de unidades pagando en efectivo. */
export function cashPercent(units: number) {
  return CASH_TIERS.find((t) => units >= t.minUnits)?.percent ?? 0;
}

/** Próximo escalón para mostrar "te faltan X unidades para Y %". */
export function nextTier(units: number) {
  const up = [...CASH_TIERS].reverse().find((t) => units < t.minUnits);
  return up ? { missing: up.minUnits - units, percent: up.percent } : null;
}

export function discountFor(subtotal: number, units: number, method: PaymentMethod) {
  const percent = method === "efectivo" ? cashPercent(units) : 0;
  const amount = Math.round(subtotal * percent) / 100;
  return { percent, amount };
}

/** Texto corto para banners. */
export const DISCOUNT_HEADLINE = CASH_TIERS.slice()
  .reverse()
  .map((t) => `${t.percent}% OFF desde ${t.minUnits} u.`)
  .join(" · ");
