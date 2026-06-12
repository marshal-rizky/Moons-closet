"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { CartItem } from "@/lib/types";

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string | null) => void;
  updateQuantity: (productId: string, size: string, color: string | null, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

function sameLine(i: CartItem, productId: string, size: string, color: string | null) {
  return i.product_id === productId && i.size === size && (i.color ?? null) === color;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "clothing-store-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return [];
      // normalize carts saved before color variants existed
      return (JSON.parse(stored) as CartItem[]).map((i) => ({ ...i, color: i.color ?? null }));
    } catch { return []; }
  });
  const [mounted] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) =>
        sameLine(i, newItem.product_id, newItem.size, newItem.color ?? null)
      );
      if (existing) {
        return prev.map((i) =>
          sameLine(i, newItem.product_id, newItem.size, newItem.color ?? null)
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((productId: string, size: string, color: string | null) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, size, color)));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, color: string | null, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, size, color);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          sameLine(i, productId, size, color) ? { ...i, quantity } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
