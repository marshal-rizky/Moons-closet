/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/store/placeholder-image";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="font-heading text-xl font-semibold sm:text-2xl">Produk</h1>
        <Link href="/admin/products/new"><Button size="sm" className="sm:size-default">+ Tambah Produk</Button></Link>
      </div>
      <div className="rounded-sm border border-border">
        {(products as Product[] || []).map((product) => (
          <div key={product.id} className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-0 sm:gap-4 sm:px-4">
            <div className="h-12 w-12 shrink-0 overflow-hidden bg-secondary/30">
              {product.images.length > 0 ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" /> : <PlaceholderImage className="h-full w-full" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">{formatPrice(product.price)} — Stok: {product.stock}{product.stock === 0 && <span className="ml-1 text-destructive">Habis</span>}</p>
            </div>
            <Link href={`/admin/products/${product.id}/edit`} className="shrink-0"><Button variant="outline" size="sm">Edit</Button></Link>
          </div>
        ))}
        {(!products || products.length === 0) && <p className="px-4 py-8 text-center text-sm text-muted-foreground">Belum ada produk.</p>}
      </div>
    </div>
  );
}
