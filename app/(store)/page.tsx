import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: categoriesRaw } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  const categories = [...new Set((categoriesRaw || []).map((c) => c.category))].filter(Boolean);

  return (
    <div>
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        <h1 className="font-heading text-4xl font-semibold tracking-wider uppercase sm:text-5xl lg:text-6xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          {siteConfig.tagline}
        </p>
        <Link href="/shop" className="mt-8">
          <Button size="lg" className="text-xs uppercase tracking-widest">
            Belanja Sekarang
          </Button>
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold tracking-wider text-center uppercase mb-8">
            Kategori
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/shop?category=${cat}`}
                className="group flex aspect-[4/3] items-center justify-center bg-secondary/40 transition-colors hover:bg-secondary/60"
              >
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                  {cat}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold tracking-wider text-center uppercase mb-8">
          Produk Terbaru
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {(products as Product[] || []).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
