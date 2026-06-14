import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/product-card";
import { ShopToolbar } from "@/components/store/shop-toolbar";
import type { Product } from "@/lib/types";

const CATEGORY_LABEL: Record<string, string> = {
  atasan: "Atasan",
  bawahan: "Bawahan",
  dress: "Dress",
};

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

  if (category) query = query.eq("category", category);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data: products } = await query;

  const { data: categoriesRaw } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  const categories = [...new Set((categoriesRaw || []).map((c) => c.category))].filter(Boolean);
  const list = (products as Product[]) || [];
  const [hero, ...rest] = list;
  const totalCount = list.length;
  const title = category ? CATEGORY_LABEL[category] || category : "Semua";

  return (
    <div className="relative">
      {/* Layout: side nav (sticky on desktop) + product column */}
      <div className="lg:grid lg:grid-cols-[210px_1fr] lg:gap-0">
        {/* Side nav */}
        <aside className="border-b border-foreground/10 px-4 py-6 sm:px-12 lg:sticky lg:top-12 lg:h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:py-12 lg:pl-12 lg:pr-6">
          <div className="mb-6 hidden lg:block">
            <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">Belanja</p>
            <h1 className="mt-2 font-heading text-2xl uppercase leading-[1.1] break-words">{title}</h1>
            <p className="mt-1 text-[11px] tracking-[0.08em] uppercase opacity-60">
              {totalCount} produk
            </p>
          </div>
          <Suspense fallback={null}>
            <ShopToolbar categories={categories} initialSearch={search || ""} />
          </Suspense>
        </aside>

        {/* Product column */}
        <div className="px-4 pb-20 pt-6 sm:px-6 lg:px-0 lg:pt-12">
          {/* Mobile title */}
          <div className="mb-6 px-2 lg:hidden">
            <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">Belanja</p>
            <h1 className="mt-2 font-heading text-4xl uppercase">{title}</h1>
            <p className="mt-1 text-[11px] tracking-[0.08em] uppercase opacity-60">
              {totalCount} produk
            </p>
          </div>

          {list.length === 0 && (
            <div className="py-20 text-center text-[12px] tracking-[0.08em] uppercase opacity-60">
              {search
                ? `Tidak ada produk untuk "${search}"`
                : "Belum ada produk."}
            </div>
          )}

          {/* Hero product: full-width on desktop */}
          {hero && (
            <div className="mb-6 lg:mb-12 lg:px-6">
              <div className="mx-auto max-w-[820px]">
                <ProductCard product={hero} large />
              </div>
            </div>
          )}

          {/* Rest of products: 2-up edge-to-edge */}
          {rest.length > 0 && (
            <div className="grid grid-cols-2 gap-x-2 gap-y-10 sm:gap-x-3 sm:gap-y-14 lg:gap-x-px lg:gap-y-16 lg:px-0">
              {rest.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
