import type { Product, ProductVariant } from "@/lib/types";

export function hasVariants(product: Product): boolean {
  return Array.isArray(product.variants) && product.variants.length > 0;
}

export function getVariant(
  product: Product,
  color: string | null | undefined
): ProductVariant | null {
  if (!color || !hasVariants(product)) return null;
  const lower = color.toLowerCase();
  return product.variants.find((v) => v.color.toLowerCase() === lower) ?? null;
}

/** Matched variant, else first variant, else null (legacy product). */
export function resolveSelectedVariant(
  product: Product,
  colorParam?: string | null
): ProductVariant | null {
  if (!hasVariants(product)) return null;
  return getVariant(product, colorParam) ?? product.variants[0];
}

export function effectiveImages(
  product: Product,
  variant?: ProductVariant | null
): string[] {
  const v = variant ?? (hasVariants(product) ? product.variants[0] : null);
  if (v && v.images.length > 0) return v.images;
  return product.images;
}

export function effectiveStock(
  product: Product,
  variant?: ProductVariant | null
): number {
  if (variant) return variant.stock;
  return product.stock;
}
