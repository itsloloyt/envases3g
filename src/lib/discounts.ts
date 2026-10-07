/**
 * Descuentos vigentes. Para cambiarlos, editá solo estas tablas.
 * Se aplican según la cantidad total de unidades del pedido y la forma de pago.
 */
export const CASH_TIERS = [
  { minUnits: 200, percent: 20 },
  { minUnits: 50, percent: 15 },
  { minUnits: 20, percent: 10 },
] as const;

export const TRANSFER_TIERS = [
  { minUnits: 200, percent: 15 },
  { minUnits: 100, percent: 10 },
] as const;

export type PaymentMethod = "efectivo" | "transferencia";

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  efectivo: "Efectivo (solo retiro en el local)",
  transferencia: "Transferencia bancaria",
};

const TIERS: Record<PaymentMethod, readonly { minUnits: number; percent: number }[]> = {
  efectivo: CASH_TIERS,
  transferencia: TRANSFER_TIERS,
};

/** Porcentaje que corresponde a una cantidad de unidades según la forma de pago. */
export function percentFor(units: number, method: PaymentMethod) {
  return TIERS[method].find((t) => units >= t.minUnits)?.percent ?? 0;
}

/** Porcentaje pagando en efectivo. */
export function cashPercent(units: number) {
  return percentFor(units, "efectivo");
}

/** Próximo escalón para mostrar "te faltan X unidades para Y %". */
export function nextTier(units: number, method: PaymentMethod = "efectivo") {
  const up = [...TIERS[method]].reverse().find((t) => units < t.minUnits);
  return up ? { missing: up.minUnits - units, percent: up.percent } : null;
}

export function discountFor(subtotal: number, units: number, method: PaymentMethod) {
  const percent = percentFor(units, method);
  const amount = Math.round(subtotal * percent) / 100;
  return { percent, amount };
}

const line = (tiers: readonly { minUnits: number; percent: number }[]) =>
  tiers
    .slice()
    .reverse()
    .map((t) => `${t.percent}% desde ${t.minUnits} u.`)
    .join(" · ");

/** Texto corto para banners. */
export const DISCOUNT_HEADLINE = `Efectivo: ${line(CASH_TIERS)} — Transferencia: ${line(TRANSFER_TIERS)}`;
