"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useMotionEnabled } from "@/lib/motion-context";
import { GOLD, ease } from "@/lib/motion";
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
  const motionEnabled = useMotionEnabled();
  const [burst, setBurst] = useState(0);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selectedSize && sizeStock(selectedSize) <= 0) setSelectedSize("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant]);

  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => setBurst(0), 600);
    return () => clearTimeout(t);
  }, [burst]);

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
    if (motionEnabled) setBurst(Date.now());
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
      <div className="relative">
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex w-full items-center justify-center gap-2 border border-foreground bg-background py-4 text-[12px] tracking-[0.12em] uppercase transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-foreground"
        >
          {!outOfStock && <ShoppingBag className="h-4 w-4" />}
          {outOfStock ? "Stok Habis" : "Tambah ke Tas"}
        </button>
        <AnimatePresence>
          {motionEnabled && burst > 0 && <StarBurst key={burst} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StarBurst() {
  // 6 gold stars radiate from the button center, then fade. Transform/opacity only.
  const stars = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    return { x: Math.cos(angle) * 46, y: Math.sin(angle) * 46 };
  });
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: GOLD }}
          initial={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: s.x, y: s.y, scale: 0.4 }}
          transition={{ duration: 0.5, ease: ease.standard }}
        />
      ))}
    </div>
  );
}
