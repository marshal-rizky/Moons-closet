import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/config";
import { PlaceholderImage } from "./placeholder-image";

export function ProductCard({ product }: { product: Product }) {
  const hasImage = product.images.length > 0;

  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="aspect-[3/4] overflow-hidden bg-secondary/30">
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={533}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImage className="h-full w-full" />
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
