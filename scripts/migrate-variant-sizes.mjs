// One-off: migrate variants from the old { color, hex, images, stock } shape to
// the new per-size { color, hex, images, sizes:[{size,stock}] } shape.
// The old per-color stock is distributed across the product's sizes.
// Idempotent: variants already in the new shape are skipped.
// Usage: node --env-file=.env.local scripts/migrate-variant-sizes.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// distribute n across k buckets as evenly as possible (remainder to the front)
function distribute(n, k) {
  if (k <= 0) return [];
  const base = Math.floor(n / k);
  const rem = n % k;
  return Array.from({ length: k }, (_, i) => base + (i < rem ? 1 : 0));
}

const { data: products, error } = await supabase
  .from("products")
  .select("id, name, sizes, variants");

if (error) {
  console.error("Fetch failed:", error.message);
  process.exit(1);
}

let migrated = 0;
for (const p of products ?? []) {
  const variants = Array.isArray(p.variants) ? p.variants : [];
  if (variants.length === 0) continue;
  // already migrated if every variant has a sizes array
  if (variants.every((v) => Array.isArray(v.sizes))) continue;

  const sizes = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ["ONE"];
  const newVariants = variants.map((v) => {
    if (Array.isArray(v.sizes)) return v; // mixed shape — leave as-is
    const dist = distribute(Number(v.stock) || 0, sizes.length);
    const { stock, ...rest } = v; // drop old stock
    void stock;
    return { ...rest, sizes: sizes.map((size, i) => ({ size, stock: dist[i] })) };
  });
  const total = newVariants.reduce(
    (s, v) => s + v.sizes.reduce((a, x) => a + (x.stock || 0), 0),
    0
  );

  const { error: upErr } = await supabase
    .from("products")
    .update({ variants: newVariants, stock: total })
    .eq("id", p.id);
  if (upErr) {
    console.error(`Update failed for ${p.name}:`, upErr.message);
    process.exit(1);
  }
  console.log(`Migrated "${p.name}" → ${newVariants.length} variants, total stock ${total}`);
  migrated++;
}

console.log(`Done. ${migrated} product(s) migrated.`);
