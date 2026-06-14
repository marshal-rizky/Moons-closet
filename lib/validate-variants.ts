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

    // sizes: [{ size, stock }] — per-size stock for this color
    const sizes: { size: string; stock: number }[] = [];
    if (!Array.isArray(o.sizes) || o.sizes.length === 0) {
      errors.push(`varian #${i + 1}: minimal satu ukuran`);
    } else {
      const seenSize = new Set<string>();
      o.sizes.forEach((s, j) => {
        if (!s || typeof s !== "object" || Array.isArray(s)) {
          errors.push(`varian #${i + 1} ukuran #${j + 1} tidak valid`);
          return;
        }
        const so = s as Record<string, unknown>;
        const size = typeof so.size === "string" ? so.size.trim() : "";
        if (!size) errors.push(`varian #${i + 1} ukuran #${j + 1}: nama wajib`);
        else if (seenSize.has(size.toUpperCase())) errors.push(`varian #${i + 1}: ukuran "${size}" duplikat`);
        seenSize.add(size.toUpperCase());
        const stock = so.stock;
        if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0) {
          errors.push(`varian #${i + 1} ukuran "${size}": stock harus bilangan bulat >= 0`);
        }
        sizes.push({ size, stock: typeof stock === "number" ? stock : 0 });
      });
    }

    variants.push({ color, hex, images, sizes });
  });

  return { variants: errors.length > 0 ? [] : variants, errors };
}

/** Total stock across all variants and their sizes. */
export function sumVariantStock(variants: ProductVariant[]): number {
  return variants.reduce(
    (sum, v) => sum + (v.sizes ?? []).reduce((s, x) => s + (x.stock || 0), 0),
    0
  );
}
