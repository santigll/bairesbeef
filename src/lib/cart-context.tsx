"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { Unit } from "./types";

export type CartItem = {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  unit: Unit;
  price: number;
  qty: number;
  variantKey?: string;
  variantLabel?: string;
  // "Pieza entera": qty counts whole pieces instead of kg, and price is
  // already the calculated total for one piece (price per kg * approx
  // kg per piece). pieceApproxKg is kept for display/WhatsApp wording.
  pieceMode?: boolean;
  pieceApproxKg?: number;
};

export function makeLineId(
  productId: string,
  variantKey?: string,
  pieceMode?: boolean
): string {
  return [productId, variantKey, pieceMode ? "pieza" : undefined]
    .filter(Boolean)
    .join("::");
}

const STORAGE_KEY = "bb_cart_v2";
const EMPTY_CART: CartItem[] = [];

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

function persist(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota/blocked storage
  }
}

// Module-scope store shared by every useCart() consumer. It's initialized
// once when this client module loads in the browser (before first render),
// so the cart is available synchronously via useSyncExternalStore without
// needing an effect to hydrate it after mount.
let cartItems: CartItem[] = loadFromStorage();
const listeners = new Set<() => void>();

function setCart(updater: (prev: CartItem[]) => CartItem[]) {
  cartItems = updater(cartItems);
  persist(cartItems);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cartItems;
}

function getServerSnapshot() {
  return EMPTY_CART;
}

type CartContextValue = {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, "qty" | "lineId">,
    qty: number
  ) => void;
  updateQty: (lineId: string, qty: number) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback(
    (item: Omit<CartItem, "qty" | "lineId">, qty: number) => {
      const lineId = makeLineId(item.productId, item.variantKey, item.pieceMode);
      setCart((prev) => {
        const existing = prev.find((i) => i.lineId === lineId);
        if (existing) {
          return prev.map((i) =>
            i.lineId === lineId ? { ...i, qty: i.qty + qty } : i
          );
        }
        return [...prev, { ...item, lineId, qty }];
      });
    },
    []
  );

  const updateQty = useCallback((lineId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.lineId !== lineId)
        : prev.map((i) => (i.lineId === lineId ? { ...i, qty } : i))
    );
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setCart((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const clear = useCallback(() => setCart(() => []), []);

  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.price, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, updateQty, removeItem, clear, totalCount, totalPrice }),
    [items, addItem, updateQty, removeItem, clear, totalCount, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
