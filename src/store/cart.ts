"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  slug: string;
  variantId: string;
  name: string;
  variantName: string;
  price: number;
  image: string | null;
  quantity: number;
  minQuantity: number;
  /** Para estimar el peso del envío. */
  subcategory?: string;
};

type CartState = {
  items: CartItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (slug: string, variantId: string, quantity: number) => void;
  remove: (slug: string, variantId: string) => void;
  clear: () => void;
};

const same = (i: CartItem, slug: string, variantId: string) => i.slug === slug && i.variantId === variantId;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (item, quantity = 1) =>
        set((s) => {
          const found = s.items.find((i) => same(i, item.slug, item.variantId));
          const items = found
            ? s.items.map((i) => (same(i, item.slug, item.variantId) ? { ...i, quantity: Math.min(9999, i.quantity + quantity) } : i))
            : [...s.items, { ...item, quantity: Math.max(item.minQuantity, quantity) }];
          return { items };
        }),
      setQuantity: (slug, variantId, quantity) =>
        set((s) => ({
          items: s.items.flatMap((i) => {
            if (!same(i, slug, variantId)) return [i];
            if (quantity < i.minQuantity) return [];
            return [{ ...i, quantity: Math.min(9999, quantity) }];
          }),
        })),
      remove: (slug, variantId) => set((s) => ({ items: s.items.filter((i) => !same(i, slug, variantId)) })),
      clear: () => set({ items: [] }),
    }),
    { name: "envases3g-carrito", storage: createJSONStorage(() => localStorage), partialize: (s) => ({ items: s.items }) },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartTotal = (items: CartItem[]) => items.reduce((n, i) => n + Math.round(i.price * 100) * i.quantity, 0) / 100;
