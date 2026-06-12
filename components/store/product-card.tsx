import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/config";
import { effectiveImages, hasVariants } from "@/lib/variants";

const SWATCHES = [
  "zara-swatch-1",
  "zara-swatch-2",
  "zara-swatch-3",
  "zara-swatch-4",
  "zara-swatch-5",
  "zara-swatch-6",
  "zara-swatch-7",
  "zara-swatch-8",
];

function swatchFor(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return SWATCHES[h % SWATCHES.length];
}

export function ProductCard({ product, large = false }: { product: Product; large?: boolean }) {
  const images = effectiveImages(product);
  const hasImage = images.length > 0;
  const swatch = swatchFor(product.slug);
  const variants = hasVariants(product) ? product.variants : [];

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className={`aspect-[3/4] overflow-hidden ${hasImage ? "" : swatch}`}>
        {hasImage ? (
          <Image
            src={images[0]}
            alt={product.name}
            width={large ? 1200 : 600}
            height={large ? 1600 : 800}
            className="h-full w-full object-cover"
            priority={large}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-heading text-2xl tracking-[0.2em] uppercase opacity-30">
              {product.category.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 px-1 sm:px-2">
        <div className="min-w-0">
          <h3 className="truncate text-[11px] tracking-[0.06em] uppercase">{product.name}</h3>
          <p className="mt-1 text-[11px] tracking-[0.04em] uppercase tabular-nums">
            {formatPrice(product.price)}
          </p>
          {variants.length > 0 && (
            <div className="mt-2 flex items-center gap-1">
              {variants.slice(0, 4).map((v) => (
                <span
                  key={v.color}
                  title={v.color}
                  className="h-2 w-2 border border-foreground/20"
                  style={{ backgroundColor: v.hex }}
                />
              ))}
              {variants.length > 4 && (
                <span className="text-[10px] tracking-[0.04em] opacity-60">
                  +{variants.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
        <span
          aria-hidden
          className="grid h-5 w-5 shrink-0 place-items-center border border-foreground text-[14px] leading-none transition-colors group-hover:bg-foreground group-hover:text-background"
        >
          +
        </span>
      </div>
    </Link>
  );
}
