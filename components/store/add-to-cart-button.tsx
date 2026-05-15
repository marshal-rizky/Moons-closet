"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");

  const sizes = product.sizes as string[];
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (!selectedSize || outOfStock) return;
    addItem({
      product_id: product.id,
      name: product.name,
      size: selectedSize,
      quantity: 1,
      price: product.price,
      image: product.images[0] || null,
      slug: product.slug,
    });
    toast.success("Ditambahkan ke keranjang!");
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
          Ukuran
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`cursor-pointer border px-4 py-2 text-sm transition-colors ${
                selectedSize === size
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {outOfStock && (
        <p className="text-sm text-destructive">Stok habis</p>
      )}
      {!outOfStock && product.stock <= 5 && (
        <p className="text-sm text-muted-foreground">
          Sisa {product.stock} stok
        </p>
      )}

      <Button
        onClick={handleAdd}
        disabled={!selectedSize || outOfStock}
        className="w-full text-xs uppercase tracking-widest"
        size="lg"
      >
        {outOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
      </Button>
    </div>
  );
}
