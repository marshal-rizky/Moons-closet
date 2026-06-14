import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAdminOrderAlert } from "@/lib/email";
import { sumVariantStock } from "@/lib/validate-variants";
import type { Order, ProductVariant } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, customer_address, customer_email, items, notes } = body;

    // --- Basic field validation ---
    if (!customer_name || !customer_phone || !customer_address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Data tidak lengkap. Mohon isi semua field yang wajib." },
        { status: 400 }
      );
    }

    const nameTrimmed = customer_name.trim();
    if (nameTrimmed.length < 2 || nameTrimmed.length > 100) {
      return NextResponse.json(
        { error: "Nama harus antara 2-100 karakter." },
        { status: 400 }
      );
    }

    const addressTrimmed = customer_address.trim();
    if (addressTrimmed.length < 10 || addressTrimmed.length > 500) {
      return NextResponse.json(
        { error: "Alamat harus antara 10-500 karakter." },
        { status: 400 }
      );
    }

    const phoneClean = customer_phone.replace(/\D/g, "");
    if (phoneClean.length < 10 || phoneClean.length > 15) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid." },
        { status: 400 }
      );
    }

    if (items.length > 50) {
      return NextResponse.json(
        { error: "Maksimal 50 item per pesanan." },
        { status: 400 }
      );
    }

    // --- Validate items shape ---
    for (const item of items) {
      if (
        typeof item.product_id !== "string" || !item.product_id ||
        typeof item.size !== "string" || !item.size ||
        !Number.isInteger(item.quantity) || item.quantity <= 0 ||
        (item.color !== undefined && item.color !== null && typeof item.color !== "string")
      ) {
        return NextResponse.json(
          { error: "Data item pesanan tidak valid." },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    // --- Fetch all referenced products from DB ---
    const productIds = [...new Set(items.map((i: { product_id: string }) => i.product_id))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, images, sizes, stock, variants, is_active")
      .in("id", productIds);

    if (productsError) {
      console.error("Product fetch error:", productsError);
      return NextResponse.json(
        { error: "Gagal memverifikasi produk. Silakan coba lagi." },
        { status: 500 }
      );
    }

    type ProductRow = {
      id: string; name: string; price: number; images: string[];
      sizes: string[]; stock: number; variants: ProductVariant[] | null; is_active: boolean;
    };
    const productMap = new Map((products ?? []).map((p: ProductRow) => [p.id, p]));

    // --- Validate each item against DB and build server-side order items ---
    const orderItems: { product_id: string; name: string; size: string; color: string | null; quantity: number; price: number; image: string }[] = [];
    let total = 0;

    for (const item of items) {
      const product = productMap.get(item.product_id);

      if (!product) {
        return NextResponse.json(
          { error: `Produk tidak ditemukan: ${item.product_id}` },
          { status: 400 }
        );
      }

      if (!product.is_active) {
        return NextResponse.json(
          { error: `Produk "${product.name}" sudah tidak tersedia.` },
          { status: 400 }
        );
      }

      if (!product.sizes.includes(item.size)) {
        return NextResponse.json(
          { error: `Ukuran "${item.size}" tidak tersedia untuk produk "${product.name}".` },
          { status: 400 }
        );
      }

      const variants = Array.isArray(product.variants) ? product.variants : [];
      let variant: ProductVariant | null = null;

      if (variants.length > 0) {
        // variant product — color required and must still exist (stale carts)
        if (typeof item.color !== "string" || !item.color) {
          return NextResponse.json(
            { error: `Pilih warna untuk produk "${product.name}".` },
            { status: 400 }
          );
        }
        const lower = item.color.toLowerCase();
        variant = variants.find((v) => v.color.toLowerCase() === lower) ?? null;
        if (!variant) {
          return NextResponse.json(
            { error: `Warna "${item.color}" tidak tersedia untuk produk "${product.name}".` },
            { status: 400 }
          );
        }
        const sizeEntry = (variant.sizes ?? []).find((s) => s.size === item.size);
        if (!sizeEntry) {
          return NextResponse.json(
            { error: `Ukuran "${item.size}" tidak tersedia untuk "${product.name}" warna ${variant.color}.` },
            { status: 400 }
          );
        }
        // per-(color,size) stock is checked after aggregation
      } else if (!product.sizes.includes(item.size)) {
        return NextResponse.json(
          { error: `Ukuran "${item.size}" tidak tersedia untuk produk "${product.name}".` },
          { status: 400 }
        );
      }

      orderItems.push({
        product_id: item.product_id,
        name: product.name,
        size: item.size,
        color: variant?.color ?? null, // canonical casing from DB
        quantity: item.quantity,
        price: product.price,
        image: (variant ? variant.images[0] : undefined) ?? product.images?.[0] ?? "",
      });

      total += product.price * item.quantity;
    }

    // --- Aggregate quantities per (product, color, size) cell ---
    const cells = new Map<
      string,
      { product_id: string; color: string | null; size: string; quantity: number }
    >();
    for (const oi of orderItems) {
      const key = `${oi.product_id}::${oi.color ?? ""}::${oi.size}`;
      const entry = cells.get(key);
      if (entry) entry.quantity += oi.quantity;
      else cells.set(key, { product_id: oi.product_id, color: oi.color, size: oi.size, quantity: oi.quantity });
    }

    // --- Stock check: variant products per (color,size); legacy per product ---
    const legacyByProduct = new Map<string, number>();
    for (const c of cells.values()) {
      const product = productMap.get(c.product_id)!;
      const variants = Array.isArray(product.variants) ? product.variants : [];
      if (variants.length > 0) {
        const variant = variants.find((v) => v.color === c.color);
        const pool = variant?.sizes?.find((s) => s.size === c.size)?.stock ?? 0;
        if (c.quantity > pool) {
          return NextResponse.json(
            { error: `Stok tidak cukup untuk "${product.name}" warna ${c.color} ukuran ${c.size}. Tersedia: ${pool}.` },
            { status: 400 }
          );
        }
      } else {
        legacyByProduct.set(c.product_id, (legacyByProduct.get(c.product_id) ?? 0) + c.quantity);
      }
    }
    for (const [pid, qty] of legacyByProduct) {
      const product = productMap.get(pid)!;
      if (qty > product.stock) {
        return NextResponse.json(
          { error: `Stok tidak cukup untuk "${product.name}". Tersedia: ${product.stock}.` },
          { status: 400 }
        );
      }
    }

    // --- Insert order with server-calculated values ---
    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name: customer_name.trim(),
        customer_phone: phoneClean,
        customer_email: customer_email?.trim() || null,
        customer_address: customer_address.trim(),
        items: orderItems,
        total,
        notes: notes?.trim() || null,
        status: "pending",
      })
      .select("id, order_number")
      .single();

    if (error) {
      console.error("Order creation error:", error);
      return NextResponse.json(
        { error: "Gagal membuat pesanan. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // --- Decrement stock with optimistic concurrency: re-read the row, apply the
    // decrement, and write only if the total stock hasn't changed since the read
    // (`.eq("stock", fresh.stock)` guard). On a concurrent change the guard misses
    // and we retry with fresh data — preventing lost updates without a DB lock. ---
    const productIdsToUpdate = new Set([...cells.values()].map((c) => c.product_id));
    for (const pid of productIdsToUpdate) {
      const base = productMap.get(pid);
      if (!base) continue;
      const isVariant = Array.isArray(base.variants) && base.variants.length > 0;

      for (let attempt = 0; attempt < 4; attempt++) {
        const { data: fresh } = await supabase
          .from("products")
          .select("variants, stock")
          .eq("id", pid)
          .single();
        if (!fresh) break;

        if (isVariant) {
          const freshVariants = (fresh.variants ?? []) as ProductVariant[];
          const updatedVariants = freshVariants.map((v) => ({
            ...v,
            sizes: (v.sizes ?? []).map((s) => {
              const cell = cells.get(`${pid}::${v.color}::${s.size}`);
              return cell ? { ...s, stock: Math.max(0, s.stock - cell.quantity) } : s;
            }),
          }));
          const { data: upd } = await supabase
            .from("products")
            .update({ variants: updatedVariants, stock: sumVariantStock(updatedVariants) })
            .eq("id", pid)
            .eq("stock", fresh.stock)
            .select("id");
          if (upd && upd.length) break;
        } else {
          const qty = legacyByProduct.get(pid) ?? 0;
          const { data: upd } = await supabase
            .from("products")
            .update({ stock: Math.max(0, fresh.stock - qty) })
            .eq("id", pid)
            .eq("stock", fresh.stock)
            .select("id");
          if (upd && upd.length) break;
        }
      }
    }

    // --- Send admin notification email ---
    await sendAdminOrderAlert({
      ...data,
      customer_name: customer_name.trim(),
      customer_phone: phoneClean,
      customer_email: customer_email?.trim() || null,
      customer_address: customer_address.trim(),
      items: orderItems,
      total,
      notes: notes?.trim() || null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Order);

    return NextResponse.json({ success: true, order: data });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
