"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sizeError, setSizeError] = useState(false);

  const sizes = product.sizes as string[];
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (outOfStock) return;
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addItem({
      product_id: product.id,
      name: product.name,
      size: selectedSize,
      quantity: 1,
      price: product.price,
      image: product.images[0] || null,
      slug: product.slug,
    });
    toast.success("Ditambahkan ke tas");
  }

  return (
    <div className="space-y-5">
      {/* Sizes */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] tracking-[0.12em] uppercase">Ukuran</p>
          <button className="text-[11px] tracking-[0.12em] uppercase underline underline-offset-[4px] opacity-60">
            Panduan ukuran
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.map((size) => {
            const active = selectedSize === size;
            return (
              <button
                key={size}
                onClick={() => {
                  setSelectedSize(size);
                  setSizeError(false);
                }}
                className={`min-w-[44px] border px-3 py-2 text-[12px] tracking-[0.08em] uppercase ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/30 hover:border-foreground"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
        {sizeError && (
          <p className="mt-2 text-[11px] tracking-[0.08em] uppercase text-destructive">
            Pilih ukuran dulu
          </p>
        )}
      </div>

      {/* Stock notice */}
      {outOfStock && (
        <p className="text-[11px] tracking-[0.08em] uppercase text-destructive">Stok habis</p>
      )}
      {!outOfStock && product.stock <= 5 && (
        <p className="text-[11px] tracking-[0.08em] uppercase opacity-70">
          Sisa {product.stock} stok
        </p>
      )}

      {/* Add button — Zara style: white bg, thin black border, sentence case */}
      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className="w-full border border-foreground bg-background py-4 text-[12px] tracking-[0.12em] uppercase transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-foreground"
      >
        {outOfStock ? "Stok Habis" : "Tambah ke Tas"}
      </button>
    </div>
  );
}
