"use client";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

export type CartLine = {
  variantId: string;
  productName: string;
  productSlug: string;
  image: string | null;
  descriptor: string;
  unitPriceKobo: number; // display only - server recomputes at checkout
  quantity: number;
};

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotalKobo: number;
  add: (line: CartLine) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  ready: boolean;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "nicki-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed.slice(0, 50));
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
  }, [lines, ready]);

  const add = useCallback((line: CartLine) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.variantId === line.variantId);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: Math.min(20, next[i].quantity + line.quantity) };
        return next;
      }
      return [...prev, line];
    });
  }, []);
  const setQty = useCallback((id: string, qty: number) =>
    setLines((p) => p.map((l) => (l.variantId === id ? { ...l, quantity: Math.max(1, Math.min(20, qty)) } : l))), []);
  const remove = useCallback((id: string) => setLines((p) => p.filter((l) => l.variantId !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(() => ({
    lines, ready, add, setQty, remove, clear,
    count: lines.reduce((s, l) => s + l.quantity, 0),
    subtotalKobo: lines.reduce((s, l) => s + l.unitPriceKobo * l.quantity, 0),
  }), [lines, ready, add, setQty, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
};
