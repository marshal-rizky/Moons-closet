"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { effectiveSizes, effectiveStock, variantSizeStock } from "@/lib/variants";
import type { Product, ProductVariant } from "@/lib/types";

export function AddToCartButton({
  product,
  selectedVariant,
}: {
  product: Product;
  selectedVariant: ProductVariant | null;
}) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sizeError, setSizeError] = useState(false);

  const sizes = effectiveSizes(product, selectedVariant);
  const totalStock = effectiveStock(product, selectedVariant);
  const outOfStock = totalStock <= 0;

  // stock for a given size: per-size for variants, shared pool for legacy
  function sizeStock(size: string): number {
    return selectedVariant ? variantSizeStock(selectedVariant, size) : product.stock;
  }

  // when the color changes, drop a selected size that the new color lacks
  useEffect(() => {
    if (selectedSize && sizeStock(selectedSize) <= 0) setSelectedSize("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant]);

  const selectedSizeStock = selectedSize ? sizeStock(selectedSize) : 0;

  function handleAdd() {
    if (outOfStock) return;
    if (!selectedSize || selectedSizeStock <= 0) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addItem({
      product_id: product.id,
      name: product.name,
      size: selectedSize,
      color: selectedVariant?.color ?? null,
      quantity: 1,
      price: product.price,
      image: (selectedVariant ? selectedVariant.images[0] : product.images[0]) || null,
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
            const soldOut = sizeStock(size) <= 0;
            return (
              <button
                key={size}
                disabled={soldOut}
                onClick={() => {
                  setSelectedSize(size);
                  setSizeError(false);
                }}
                className={`min-w-[44px] border px-3 py-2 text-[12px] tracking-[0.08em] uppercase ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/30 hover:border-foreground"
                } ${soldOut ? "cursor-not-allowed text-foreground/30 line-through hover:border-foreground/30" : ""}`}
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
      {!outOfStock && selectedSize && selectedSizeStock > 0 && selectedSizeStock <= 5 && (
        <p className="text-[11px] tracking-[0.08em] uppercase opacity-70">
          Sisa {selectedSizeStock} stok
        </p>
      )}

      {/* Add button — Zara style: white bg, thin black border, sentence case */}
      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className="flex w-full items-center justify-center gap-2 border border-foreground bg-background py-4 text-[12px] tracking-[0.12em] uppercase transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-foreground"
      >
        {!outOfStock && <ShoppingBag className="h-4 w-4" />}
        {outOfStock ? "Stok Habis" : "Tambah ke Tas"}
      </button>
    </div>
  );
}
