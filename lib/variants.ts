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

/** Total stock of a single color across all its sizes. */
export function variantStock(variant: ProductVariant): number {
  return (variant.sizes ?? []).reduce((sum, s) => sum + (s.stock || 0), 0);
}

/** Stock of one (color, size) cell. */
export function variantSizeStock(variant: ProductVariant, size: string): number {
  return (variant.sizes ?? []).find((s) => s.size === size)?.stock ?? 0;
}

/** Sizes available for the active selection (variant sizes, else product sizes). */
export function effectiveSizes(
  product: Product,
  variant?: ProductVariant | null
): string[] {
  if (variant) return (variant.sizes ?? []).map((s) => s.size);
  return product.sizes;
}

/** Available stock for the active selection (variant total, else product stock). */
export function effectiveStock(
  product: Product,
  variant?: ProductVariant | null
): number {
  if (variant) return variantStock(variant);
  return product.stock;
}
