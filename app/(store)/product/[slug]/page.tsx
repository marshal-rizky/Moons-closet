import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/config";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductGallery } from "@/components/store/product-gallery";
import { ColorSwatches } from "@/components/store/color-swatches";
import { effectiveImages, hasVariants, resolveSelectedVariant } from "@/lib/variants";
import { categoryLabel } from "@/lib/categories";
import type { Product } from "@/lib/types";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ color?: string }>;
}) {
  const { slug } = await params;
  const { color } = await searchParams;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const p = product as Product;
  const sku = p.id.slice(0, 8).toUpperCase();
  const catLabel = categoryLabel(p.category);
  const variant = resolveSelectedVariant(p, color);
  const images = effectiveImages(p, variant);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="px-4 pt-4 text-[11px] tracking-[0.08em] uppercase opacity-60 sm:px-12">
        <Link href="/shop" className="hover:underline underline-offset-[4px]">
          Belanja
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/shop?category=${p.category}`}
          className="hover:underline underline-offset-[4px]"
        >
          {catLabel}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-0 px-4 pt-6 pb-20 sm:px-12 lg:grid-cols-[1fr_360px] lg:gap-12 lg:pt-10">
        {/* Image stack (scrolls) */}
        <div>
          <ProductGallery images={images} name={p.name} />
        </div>

        {/* Sticky info column */}
        <div className="lg:sticky lg:top-12 lg:h-fit lg:py-2">
          <div className="flex flex-col gap-6 pt-8 lg:pt-0">
            <div>
              <h1 className="text-[15px] tracking-[0.06em] uppercase">{p.name}</h1>
              <p className="mt-2 text-[12px] tracking-[0.04em] uppercase tabular-nums">
                {formatPrice(p.price)}
              </p>
              <div className="mt-4 border-t border-foreground/20" />
              <p className="mt-3 text-[11px] tracking-[0.08em] uppercase opacity-60">
                SKU | {sku} · {catLabel}
              </p>
            </div>

            {variant && (
              <ColorSwatches slug={p.slug} variants={p.variants} selected={variant} />
            )}

            <AddToCartButton product={p} selectedVariant={variant} />

            {p.description && (
              <div className="border-t border-foreground/10 pt-5">
                <p className="text-[13px] leading-[1.7]">
                  {p.description}
                </p>
              </div>
            )}

            <div className="border-t border-foreground/10 pt-5 text-[11px] tracking-[0.08em] uppercase">
              <details className="group border-b border-foreground/10 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  Detail Produk
                  <span aria-hidden className="opacity-60 transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 space-y-1 normal-case tracking-normal text-[12px] opacity-80">
                  <p>Kategori: {catLabel}</p>
                  <p>Ukuran tersedia: {(p.sizes as string[]).join(", ")}</p>
                  {hasVariants(p) && (
                    <p>Warna tersedia: {p.variants.map((v) => v.color).join(", ")}</p>
                  )}
                </div>
              </details>
              <details className="group border-b border-foreground/10 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  Pengiriman & Pengembalian
                  <span aria-hidden className="opacity-60 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 normal-case tracking-normal text-[12px] opacity-80">
                  Konfirmasi pesanan via WhatsApp. Pengiriman ke seluruh Indonesia.
                </p>
              </details>
              <details className="group border-b border-foreground/10 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  Bahan & Perawatan
                  <span aria-hidden className="opacity-60 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 normal-case tracking-normal text-[12px] opacity-80">
                  Informasi bahan tersedia di label produk. Cuci sesuai instruksi.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
