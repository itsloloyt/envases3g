/**
 * Cotizador de envío estimado (referencia: Encomienda Clásica de Correo Argentino, 2026).
 * Son valores ORIENTATIVOS para mostrarle al cliente: el costo final se confirma por WhatsApp.
 * Para actualizar precios, editá solo las tablas de abajo.
 */

export type ShippingMethod = "retiro" | "local" | "correo-domicilio" | "correo-sucursal";

export type ShippingQuote = {
  method: ShippingMethod;
  label: string;
  detail: string;
  price: number;
  zone?: "regional" | "nacional";
  weightKg?: number;
};

/** Envío en moto dentro de Mar del Plata / Batán. */
const LOCAL_PRICE = 4500;

/** Tarifa Encomienda Clásica a sucursal por tramo de peso (hasta X kg). */
const CORREO: { upTo: number; regional: number; nacional: number }[] = [
  { upTo: 1, regional: 19500, nacional: 26400 },
  { upTo: 5, regional: 23100, nacional: 32000 },
  { upTo: 10, regional: 31100, nacional: 45200 },
  { upTo: 15, regional: 38200, nacional: 56600 },
  { upTo: 20, regional: 45100, nacional: 65800 },
  { upTo: 25, regional: 54200, nacional: 80900 },
];
/** Recargo por entrega a domicilio respecto de sucursal. */
const HOME_DELIVERY_FACTOR = 1.29;

/** Mar del Plata y Batán. */
export const isLocalPostcode = (cp: number) => cp >= 7600 && cp <= 7612;

/**
 * Zona según el código postal (4 dígitos). Regional = provincia de Buenos Aires,
 * CABA y La Pampa (6xxx/7xxx/1xxx y Bahía Blanca 8000-8199); el resto es nacional.
 */
export function zoneFor(cp: number): "regional" | "nacional" {
  if ((cp >= 1000 && cp <= 1999) || (cp >= 6000 && cp <= 7999) || (cp >= 8000 && cp <= 8199)) return "regional";
  return "nacional";
}

/** Peso estimado de un producto (kg) a partir de su nombre: capacidad y material. */
export function estimateWeightKg(name: string, subcategory: string, quantity: number) {
  const n = name.toLowerCase();
  const litres = n.match(/(\d+(?:[.,]\d+)?)\s*(?:lts?|litros?)\b/);
  const cc = n.match(/(\d+(?:[.,]\d+)?)\s*(?:cc|ml)\b/);
  const capacity = litres ? parseFloat(litres[1].replace(",", ".")) * 1000 : cc ? parseFloat(cc[1].replace(",", ".")) : 0;
  const glass = /vidrio|cristal(?!.*pet)|gotero|frasco|vaso|botell[oó]n|copon/.test(n) && !/pet|pead|pvc|plast/.test(n);
  const accessory = ["tapas", "valvulas-y-gatillos", "varillas"].includes(subcategory);
  let grams: number;
  if (accessory) grams = 12;
  else if (/yeso/.test(n) || subcategory === "yeso") grams = 350;
  else if (/esencia|perfumina|aceite/.test(n)) grams = Math.max(capacity, 250);
  else if (capacity) grams = glass ? 60 + capacity * 0.9 : 10 + capacity * 0.08;
  else grams = glass ? 250 : 60;
  return (grams * quantity) / 1000;
}

function correoPrice(weightKg: number, zone: "regional" | "nacional") {
  // Embalaje: +8 % del peso y mínimo 300 g.
  const billable = Math.max(0.3, weightKg * 1.08);
  const row = CORREO.find((r) => billable <= r.upTo);
  if (!row) return null; // Más de 25 kg: se cotiza aparte.
  return row[zone];
}

/** Opciones de envío para un código postal y un peso. */
export function quoteShipping(postcode: string, weightKg: number): ShippingQuote[] {
  const options: ShippingQuote[] = [{ method: "retiro", label: "Retiro en el local", detail: "Moreno 4156, Mar del Plata · sin cargo", price: 0 }];
  const cp = parseInt(postcode.replace(/\D/g, "").slice(0, 4), 10);
  if (!Number.isFinite(cp) || cp < 1000 || cp > 9431) return options;
  if (isLocalPostcode(cp)) {
    options.push({ method: "local", label: "Envío en Mar del Plata", detail: "Entrega a domicilio en 24/48 h hábiles", price: LOCAL_PRICE });
    return options;
  }
  const zone = zoneFor(cp);
  const base = correoPrice(weightKg, zone);
  if (base === null) return options;
  const round = (n: number) => Math.round(n / 100) * 100;
  options.push(
    { method: "correo-sucursal", label: "Correo Argentino · a sucursal", detail: `Zona ${zone} · 3 a 6 días hábiles`, price: round(base), zone, weightKg },
    { method: "correo-domicilio", label: "Correo Argentino · a domicilio", detail: `Zona ${zone} · 3 a 6 días hábiles`, price: round(base * HOME_DELIVERY_FACTOR), zone, weightKg },
  );
  return options;
}
