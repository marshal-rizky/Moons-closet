import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProductList } from "./product-list";
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
      <ProductList products={(products as Product[]) || []} />
    </div>
  );
}
