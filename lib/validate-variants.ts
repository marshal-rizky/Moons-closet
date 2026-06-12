import type { ProductVariant } from "@/lib/types";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Validates an unknown `variants` payload. Returns parsed variants or error messages. */
export function validateVariants(raw: unknown): { variants: ProductVariant[]; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(raw)) {
    return { variants: [], errors: ["variants harus berupa array"] };
  }
  if (raw.length > 12) {
    return { variants: [], errors: ["maksimal 12 varian"] };
  }

  const variants: ProductVariant[] = [];
  const seen = new Set<string>();

  raw.forEach((v, i) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) {
      errors.push(`varian #${i + 1} harus berupa objek`);
      return;
    }
    const o = v as Record<string, unknown>;

    const color = typeof o.color === "string" ? o.color.trim() : "";
    if (!color) errors.push(`varian #${i + 1}: color wajib diisi`);
    else if (seen.has(color.toLowerCase())) errors.push(`warna "${color}" duplikat`);
    seen.add(color.toLowerCase());

    const hex = typeof o.hex === "string" ? o.hex.trim() : "";
    if (!HEX_RE.test(hex)) errors.push(`varian #${i + 1}: hex harus format #rrggbb`);

    let images: string[] = [];
    if (o.images !== undefined) {
      if (!Array.isArray(o.images) || !o.images.every((s) => typeof s === "string")) {
        errors.push(`varian #${i + 1}: images harus array of string`);
      } else if (o.images.length > 5) {
        errors.push(`varian #${i + 1}: maksimal 5 foto`);
      } else {
        images = o.images as string[];
      }
    }

    const stock = o.stock;
    if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0) {
      errors.push(`varian #${i + 1}: stock harus bilangan bulat >= 0`);
    }

    variants.push({ color, hex, images, stock: typeof stock === "number" ? stock : 0 });
  });

  return { variants: errors.length > 0 ? [] : variants, errors };
}

export function sumVariantStock(variants: ProductVariant[]): number {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}
