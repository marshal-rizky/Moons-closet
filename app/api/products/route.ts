import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateVariants, sumVariantStock } from "@/lib/validate-variants";
import type { ProductVariant } from "@/lib/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, base: string): Promise<string> {
  let candidate = base;
  let suffix = 1;
  while (true) {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .limit(1)
      .maybeSingle();
    if (!data) return candidate;
    suffix++;
    candidate = `${base}-${suffix}`;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Body harus berupa objek" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const errors: string[] = [];

  // name — required non-empty string
  if (typeof raw.name !== "string" || raw.name.trim() === "") {
    errors.push("name wajib diisi (string tidak kosong)");
  }
  const name = typeof raw.name === "string" ? raw.name.trim() : "";

  // price — required positive integer
  if (typeof raw.price !== "number" || !Number.isInteger(raw.price) || raw.price <= 0) {
    errors.push("price wajib diisi (bilangan bulat positif)");
  }

  // category — required non-empty string
  if (typeof raw.category !== "string" || raw.category.trim() === "") {
    errors.push("category wajib diisi (string tidak kosong)");
  }
  const category = typeof raw.category === "string" ? raw.category.trim().toLowerCase() : "";

  // stock — required non-negative integer
  if (typeof raw.stock !== "number" || !Number.isInteger(raw.stock) || raw.stock < 0) {
    errors.push("stock wajib diisi (bilangan bulat >= 0)");
  }

  // sizes — optional array of strings
  let sizes: string[] = [];
  if (raw.sizes !== undefined) {
    if (!Array.isArray(raw.sizes) || !raw.sizes.every((s: unknown) => typeof s === "string")) {
      errors.push("sizes harus berupa array of string");
    } else {
      sizes = raw.sizes as string[];
    }
  }

  // images — optional array of strings
  let images: string[] = [];
  if (raw.images !== undefined) {
    if (!Array.isArray(raw.images) || !raw.images.every((s: unknown) => typeof s === "string")) {
      errors.push("images harus berupa array of string (URL)");
    } else {
      images = raw.images as string[];
    }
  }

  // description — optional string
  let description: string | undefined;
  if (raw.description !== undefined) {
    if (typeof raw.description !== "string") {
      errors.push("description harus berupa string");
    } else {
      description = raw.description;
    }
  }

  // variants — optional array of {color, hex, images, stock}
  let variants: ProductVariant[] = [];
  if (raw.variants !== undefined) {
    const result = validateVariants(raw.variants);
    errors.push(...result.errors);
    variants = result.variants;
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validasi gagal", details: errors }, { status: 400 });
  }

  const slug = await uniqueSlug(supabase, slugify(name));

  const insertPayload: Record<string, unknown> = {
    name,
    price: raw.price,
    category,
    sizes,
    // with variants, total stock is derived from per-color stocks
    stock: variants.length > 0 ? sumVariantStock(variants) : raw.stock,
    images,
    slug,
    variants,
  };
  if (description !== undefined) insertPayload.description = description;

  const { data, error } = await supabase
    .from("products")
    .insert(insertPayload)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
