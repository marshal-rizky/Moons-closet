import type { SupabaseClient } from "@supabase/supabase-js";
import { sumVariantStock } from "@/lib/validate-variants";
import type { ProductVariant } from "@/lib/types";

export type StockCell = {
  product_id: string;
  color: string | null;
  size: string;
  quantity: number;
};

/** Aggregate order items into per-(product,color,size) cells. */
export function buildCells(
  items: { product_id: string; color: string | null; size: string; quantity: number }[]
): Map<string, StockCell> {
  const cells = new Map<string, StockCell>();
  for (const it of items) {
    const key = `${it.product_id}::${it.color ?? ""}::${it.size}`;
    const entry = cells.get(key);
    if (entry) entry.quantity += it.quantity;
    else cells.set(key, { product_id: it.product_id, color: it.color, size: it.size, quantity: it.quantity });
  }
  return cells;
}

/** Apply a stock change with optimistic concurrency. direction -1 = decrement, +1 = restore. */
async function applyStock(supabase: SupabaseClient, cells: Map<string, StockCell>, direction: -1 | 1) {
  const productIds = new Set([...cells.values()].map((c) => c.product_id));
  for (const pid of productIds) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data: fresh } = await supabase
        .from("products")
        .select("variants, stock")
        .eq("id", pid)
        .single();
      if (!fresh) break;

      const variants = (fresh.variants ?? []) as ProductVariant[];
      if (variants.length > 0) {
        const updatedVariants = variants.map((v) => ({
          ...v,
          sizes: (v.sizes ?? []).map((s) => {
            const cell = cells.get(`${pid}::${v.color}::${s.size}`);
            if (!cell) return s;
            return { ...s, stock: Math.max(0, s.stock + direction * cell.quantity) };
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
        let qty = 0;
        for (const c of cells.values()) if (c.product_id === pid) qty += c.quantity;
        const { data: upd } = await supabase
          .from("products")
          .update({ stock: Math.max(0, fresh.stock + direction * qty) })
          .eq("id", pid)
          .eq("stock", fresh.stock)
          .select("id");
        if (upd && upd.length) break;
      }
    }
  }
}

export function decrementStock(supabase: SupabaseClient, cells: Map<string, StockCell>) {
  return applyStock(supabase, cells, -1);
}

export function restoreStock(supabase: SupabaseClient, cells: Map<string, StockCell>) {
  return applyStock(supabase, cells, 1);
}
