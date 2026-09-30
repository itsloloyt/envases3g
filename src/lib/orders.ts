"use client";
import type { ShippingQuote } from "./shipping";

/** Pedido tal como lo ve el cliente en /pedido/[numero] (se guarda en este navegador). */
export type SavedOrder = {
  number: string;
  createdAt: string;
  customer: { name: string; phone: string; postcode?: string; address?: string };
  items: { name: string; variant: string; quantity: number; unitPrice: number; subtotal: number; image: string | null; slug?: string }[];
  subtotal: number;
  shipping: Pick<ShippingQuote, "method" | "label" | "detail" | "price">;
  total: number;
  whatsapp: string;
};

const KEY = "envases3g-pedidos";

export function saveOrder(order: SavedOrder) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, SavedOrder>;
    all[order.number] = order;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* Sin almacenamiento el pedido igual quedó registrado en el servidor. */
  }
}

export function readOrder(number: string): SavedOrder | null {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, SavedOrder>;
    return all[number] ?? null;
  } catch {
    return null;
  }
}
