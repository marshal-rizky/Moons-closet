import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/config";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductGallery } from "@/components/store/product-gallery";
import { FadeIn } from "@/components/ui/fade-in";
import type { Product } from "@/lib/types";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const p = product as Product;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <FadeIn>
          <ProductGallery images={p.images} name={p.name} />
        </FadeIn>

        <FadeIn direction="right" delay={0.1}>
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {p.category}
              </p>
              <h1 className="mt-2 font-heading text-3xl font-semibold">
                {p.name}
              </h1>
              <p className="mt-2 text-xl text-muted-foreground">
                {formatPrice(p.price)}
              </p>
            </div>

            <AddToCartButton product={p} />

            {p.description && (
              <div className="border-t border-border pt-6">
                <h2 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Deskripsi
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
