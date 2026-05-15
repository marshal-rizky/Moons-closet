import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
  excludeId: string,
): Promise<string> {
  let candidate = base;
  let suffix = 1;
  while (true) {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .neq("id", excludeId)
      .limit(1)
      .maybeSingle();
    if (!data) return candidate;
    suffix++;
    candidate = `${base}-${suffix}`;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
  const updatePayload: Record<string, unknown> = {};

  // name — optional non-empty string
  if (raw.name !== undefined) {
    if (typeof raw.name !== "string" || raw.name.trim() === "") {
      errors.push("name harus berupa string tidak kosong");
    } else {
      updatePayload.name = raw.name.trim();
    }
  }

  // price — optional positive integer
  if (raw.price !== undefined) {
    if (typeof raw.price !== "number" || !Number.isInteger(raw.price) || raw.price <= 0) {
      errors.push("price harus berupa bilangan bulat positif");
    } else {
      updatePayload.price = raw.price;
    }
  }

  // category — optional non-empty string
  if (raw.category !== undefined) {
    if (typeof raw.category !== "string" || raw.category.trim() === "") {
      errors.push("category harus berupa string tidak kosong");
    } else {
      updatePayload.category = raw.category.trim().toLowerCase();
    }
  }

  // stock — optional non-negative integer
  if (raw.stock !== undefined) {
    if (typeof raw.stock !== "number" || !Number.isInteger(raw.stock) || raw.stock < 0) {
      errors.push("stock harus berupa bilangan bulat >= 0");
    } else {
      updatePayload.stock = raw.stock;
    }
  }

  // sizes — optional array of strings
  if (raw.sizes !== undefined) {
    if (!Array.isArray(raw.sizes) || !raw.sizes.every((s: unknown) => typeof s === "string")) {
      errors.push("sizes harus berupa array of string");
    } else {
      updatePayload.sizes = raw.sizes;
    }
  }

  // images — optional array of strings
  if (raw.images !== undefined) {
    if (!Array.isArray(raw.images) || !raw.images.every((s: unknown) => typeof s === "string")) {
      errors.push("images harus berupa array of string (URL)");
    } else {
      updatePayload.images = raw.images;
    }
  }

  // description — optional string
  if (raw.description !== undefined) {
    if (typeof raw.description !== "string") {
      errors.push("description harus berupa string");
    } else {
      updatePayload.description = raw.description;
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validasi gagal", details: errors }, { status: 400 });
  }

  // If name changed, regenerate slug with collision handling
  if (updatePayload.name) {
    updatePayload.slug = await uniqueSlug(
      supabase,
      slugify(updatePayload.name as string),
      id,
    );
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada field yang valid untuk diupdate" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("products")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });

  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
