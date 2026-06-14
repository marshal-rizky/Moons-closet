import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/product-card";
import { ShopToolbar } from "@/components/store/shop-toolbar";
import { categoryLabel } from "@/lib/categories";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 12;

type SortKey = "newest" | "price-asc" | "price-desc";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    stock?: string;
    page?: string;
  }>;
}) {
  const { category, search, sort, stock, page: pageParam } = await searchParams;
  const supabase = await createClient();

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const sortKey: SortKey =
    sort === "price-asc" || sort === "price-desc" ? sort : "newest";

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  if (category) query = query.eq("category", category);
  if (search) query = query.ilike("name", `%${search}%`);
  if (stock === "1") query = query.gt("stock", 0);

  if (sortKey === "price-asc") query = query.order("price", { ascending: true });
  else if (sortKey === "price-desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: products, count } = await query.range(from, to);

  const list = (products as Product[]) || [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const title = category ? categoryLabel(category) : "Semua";

  // Hero (large) product only on the first page of the default view
  const showHero = page === 1 && sortKey === "newest" && stock !== "1";
  const [hero, ...rest] = showHero ? list : [];
  const gridItems = showHero ? rest : list;

  // Build query strings for pagination that preserve active filters
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    if (stock) params.set("stock", stock);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <div className="relative">
      <div className="lg:grid lg:grid-cols-[210px_1fr] lg:gap-0">
        {/* Side nav */}
        <aside className="border-b border-foreground/10 px-4 py-6 sm:px-12 lg:sticky lg:top-12 lg:h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:py-12 lg:pl-12 lg:pr-6">
          <div className="mb-6 hidden lg:block">
            <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">Belanja</p>
            <h1 className="mt-2 font-heading text-2xl uppercase leading-[1.1] break-words">{title}</h1>
            <p className="mt-1 text-[11px] tracking-[0.08em] uppercase opacity-60">
              {total} produk
            </p>
          </div>
          <Suspense fallback={null}>
            <ShopToolbar initialSearch={search || ""} />
          </Suspense>
        </aside>

        {/* Product column */}
        <div className="px-4 pb-20 pt-6 sm:px-6 lg:px-0 lg:pt-12">
          {/* Mobile title */}
          <div className="mb-6 px-2 lg:hidden">
            <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">Belanja</p>
            <h1 className="mt-2 font-heading text-4xl uppercase">{title}</h1>
            <p className="mt-1 text-[11px] tracking-[0.08em] uppercase opacity-60">
              {total} produk
            </p>
          </div>

          {list.length === 0 && (
            <div className="py-20 text-center text-[12px] tracking-[0.08em] uppercase opacity-60">
              {search
                ? `Tidak ada produk untuk "${search}"`
                : "Belum ada produk."}
            </div>
          )}

          {hero && (
            <div className="mb-6 lg:mb-12 lg:px-6">
              <div className="mx-auto max-w-[820px]">
                <ProductCard product={hero} large />
              </div>
            </div>
          )}

          {gridItems.length > 0 && (
            <div className="grid grid-cols-2 gap-x-2 gap-y-10 sm:gap-x-3 sm:gap-y-14 lg:gap-x-px lg:gap-y-16 lg:px-0">
              {gridItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-8 text-[11px] tracking-[0.12em] uppercase">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="underline underline-offset-[6px] hover:opacity-60">
                  ← Sebelumnya
                </Link>
              ) : (
                <span className="opacity-30">← Sebelumnya</span>
              )}
              <span className="tabular-nums opacity-60">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className="underline underline-offset-[6px] hover:opacity-60">
                  Berikutnya →
                </Link>
              ) : (
                <span className="opacity-30">Berikutnya →</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
