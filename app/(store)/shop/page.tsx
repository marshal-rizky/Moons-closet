import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/product-card";
import { ShopToolbar } from "@/components/store/shop-toolbar";
import { ProductGridSkeleton } from "@/components/store/product-card-skeleton";
import type { Product } from "@/lib/types";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data: products } = await query;

  const { data: categoriesRaw } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  const categories = [...new Set((categoriesRaw || []).map((c) => c.category))].filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-wider uppercase mb-8">
        Belanja
      </h1>

      <Suspense fallback={null}>
        <ShopToolbar categories={categories} initialSearch={search || ""} />
      </Suspense>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {(products as Product[] || []).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {(!products || products.length === 0) && (
        <div className="py-20 text-center text-muted-foreground">
          {search
            ? `Tidak ada produk "${search}"${category ? ` di kategori ${category}` : ""}.`
            : "Belum ada produk dalam kategori ini."}
        </div>
      )}
    </div>
  );
}
