"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/store/placeholder-image";
import type { Product } from "@/lib/types";

export function ProductList({ products, categories }: { products: Product[]; categories: string[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk\u2026"
          className="h-10 w-full rounded-sm border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-foreground"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={!category ? "default" : "outline"}
          size="sm"
          onClick={() => setCategory("")}
          className="text-xs uppercase tracking-wider"
        >
          Semua
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(cat)}
            className="text-xs uppercase tracking-wider"
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="rounded-sm border border-border">
        {filtered.map((product) => (
          <div key={product.id} className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-0 sm:gap-4 sm:px-4">
            <div className="h-12 w-12 shrink-0 overflow-hidden bg-secondary/30">
              {product.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <PlaceholderImage className="h-full w-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(product.price)} — Stok: {product.stock}
                {product.stock === 0 && <span className="ml-1 text-destructive">Habis</span>}
              </p>
            </div>
            <Link href={`/admin/products/${product.id}/edit`} className="shrink-0">
              <Button variant="outline" size="sm">Edit</Button>
            </Link>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {search ? `Tidak ada produk "${search}".` : "Belum ada produk."}
          </p>
        )}
      </div>
    </>
  );
}
