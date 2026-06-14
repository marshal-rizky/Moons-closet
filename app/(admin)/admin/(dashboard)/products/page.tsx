import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProductList } from "./product-list";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; archived?: string; page?: string }>;
}) {
  const { q, category, archived, page: pageParam } = await searchParams;
  const supabase = await createClient();

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const showArchived = archived === "1";

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", !showArchived)
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);
  if (category) query = query.eq("category", category);

  const { data: products, count } = await query.range(from, to);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="font-heading text-xl font-semibold sm:text-2xl">Produk</h1>
        <Link href="/admin/products/new">
          <Button size="sm" className="sm:size-default">+ Tambah Produk</Button>
        </Link>
      </div>
      <ProductList
        products={(products as Product[]) || []}
        total={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        q={q ?? ""}
        category={category ?? ""}
        archived={showArchived}
      />
    </div>
  );
}
