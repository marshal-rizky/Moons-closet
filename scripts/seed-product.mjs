// One-off: upload processed pants photos to Supabase Storage and insert the
// 4-color variant product. Requires the `variants` column (see supabase/schema.sql).
// Usage: node --env-file=.env.local scripts/seed-product.mjs
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "out");
const SLUG = "celana-barrel-high-waist";

// file groups per color, in gallery order
// hex sampled from the lit thigh area of each photo set, lifted slightly so
// Hitam vs Abu-abu stay distinguishable as 8px swatch dots
const COLORS = [
  { color: "Mocha", hex: "#54453d", files: ["2102.jpg", "2119.jpg", "2123.jpg"] },
  { color: "Hitam", hex: "#1f1d1f", files: ["2720.jpg", "2721.jpg", "2732.jpg"] },
  { color: "Cream", hex: "#cfc5bb", files: ["4314.jpg", "4320.jpg", "4321.jpg"] },
  { color: "Abu-abu", hex: "#4a4846", files: ["4559.jpg", "4568.jpg", "4571.jpg"] },
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: existing } = await supabase
  .from("products")
  .select("id")
  .eq("slug", SLUG)
  .maybeSingle();
if (existing) {
  console.error(`Product "${SLUG}" already exists (${existing.id}) — aborting.`);
  process.exit(1);
}

const variants = [];
for (const { color, hex, files } of COLORS) {
  const images = [];
  for (const [i, file] of files.entries()) {
    const key = `seed/${SLUG}-${color.toLowerCase().replace(/\s+/g, "-")}-${i + 1}.jpg`;
    const body = await readFile(path.join(OUT, file));
    const { error } = await supabase.storage
      .from("product-images")
      .upload(key, body, { contentType: "image/jpeg", upsert: true });
    if (error) {
      console.error(`Upload failed for ${key}:`, error.message);
      process.exit(1);
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(key);
    images.push(data.publicUrl);
    console.log("uploaded", key);
  }
  variants.push({ color, hex, images, stock: 10 });
}

const { data, error } = await supabase
  .from("products")
  .insert({
    name: "Celana Barrel High Waist",
    slug: SLUG,
    description:
      "Celana barrel high waist dengan sabuk D-ring, potongan melengkung yang modern dan nyaman. Bahan tebal jatuh, tidak menerawang. Tersedia dalam empat warna.",
    price: 185000,
    category: "bawahan",
    sizes: ["S", "M", "L", "XL"],
    stock: variants.reduce((s, v) => s + v.stock, 0),
    images: [],
    variants,
    is_active: true,
  })
  .select("id, slug")
  .single();

if (error) {
  console.error("Insert failed:", error.message);
  process.exit(1);
}
console.log("Product created:", data.id, data.slug);
