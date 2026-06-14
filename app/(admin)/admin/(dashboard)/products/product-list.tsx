"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/store/placeholder-image";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  category: string;
  archived: boolean;
};

export function ProductList({ products, total, page, pageSize, q, category, archived }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(q);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => setSearch(q), [q]);

  function setParams(updates: Record<string, string | null>, keepPage = false) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    if (!keepPage) params.delete("page");
    router.push(`/admin/products?${params.toString()}`);
  }

  // debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== q) setParams({ q: search || null });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function restore(id: string) {
    setRestoring(id);
    await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: true }),
    });
    setRestoring(null);
    router.refresh();
  }

  function pageHref(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    return `/admin/products?${params.toString()}`;
  }

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk…"
          className="h-10 w-full rounded-sm border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-foreground"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant={!category ? "default" : "outline"} size="sm" onClick={() => setParams({ category: null })} className="text-xs uppercase tracking-wider">
          Semua
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.slug}
            variant={category === cat.slug ? "default" : "outline"}
            size="sm"
            onClick={() => setParams({ category: cat.slug })}
            className="text-xs uppercase tracking-wider"
          >
            {cat.label}
          </Button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        <Button
          variant={archived ? "default" : "outline"}
          size="sm"
          onClick={() => setParams({ archived: archived ? null : "1" })}
          className="text-xs uppercase tracking-wider"
        >
          {archived ? "Arsip" : "Lihat Arsip"}
        </Button>
      </div>

      <div className="rounded-sm border border-border">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-0 sm:gap-4 sm:px-4">
            <div className="h-12 w-12 shrink-0 overflow-hidden bg-secondary/30">
              {(product.variants?.[0]?.images[0] || product.images[0]) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.variants?.[0]?.images[0] || product.images[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <PlaceholderImage className="h-full w-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(product.price)} · {categoryLabel(product.category)} — Stok: {product.stock}
                {(product.variants?.length ?? 0) > 0 && (
                  <span className="ml-1">· {product.variants.length} warna</span>
                )}
                {product.stock === 0 && <span className="ml-1 text-destructive">Habis</span>}
              </p>
            </div>
            {archived ? (
              <Button
                variant="outline"
                size="sm"
                disabled={restoring === product.id}
                onClick={() => restore(product.id)}
                className="shrink-0"
              >
                {restoring === product.id ? "…" : "Pulihkan"}
              </Button>
            ) : (
              <Link href={`/admin/products/${product.id}/edit`} className="shrink-0">
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            )}
          </div>
        ))}
        {products.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {q ? `Tidak ada produk "${q}".` : archived ? "Tidak ada produk diarsip." : "Belum ada produk."}
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="text-muted-foreground hover:text-foreground">← Sebelumnya</Link>
          ) : (
            <span className="text-muted-foreground/40">← Sebelumnya</span>
          )}
          <span className="tabular-nums text-muted-foreground">{page} / {totalPages}</span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="text-muted-foreground hover:text-foreground">Berikutnya →</Link>
          ) : (
            <span className="text-muted-foreground/40">Berikutnya →</span>
          )}
        </div>
      )}
    </>
  );
}
