import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySignature } from "@/lib/midtrans";
import { buildCells, restoreStock } from "@/lib/stock";
import type { OrderItem, PaymentStatus } from "@/lib/types";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const order_id = String(body.order_id ?? "");
  const status_code = String(body.status_code ?? "");
  const gross_amount = String(body.gross_amount ?? "");
  const signature_key = String(body.signature_key ?? "");
  const transaction_status = String(body.transaction_status ?? "");
  const fraud_status = String(body.fraud_status ?? "");
  const transaction_id = body.transaction_id ? String(body.transaction_id) : null;

  if (!order_id || !status_code || !gross_amount || !signature_key) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (!verifySignature({ order_id, status_code, gross_amount, signature_key })) {
    return NextResponse.json({ error: "invalid signature" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, items, payment_status")
    .eq("midtrans_order_id", order_id)
    .single();

  // Unknown order: acknowledge so Midtrans stops retrying.
  if (!order) return NextResponse.json({ received: true });

  // Map Midtrans transaction_status -> our payment_status.
  let newStatus: PaymentStatus | null = null;
  let restore = false;
  if (transaction_status === "capture") {
    newStatus = fraud_status === "accept" ? "paid" : "pending";
  } else if (transaction_status === "settlement") {
    newStatus = "paid";
  } else if (transaction_status === "pending") {
    newStatus = "pending";
  } else if (transaction_status === "expire") {
    newStatus = "expired";
    restore = true;
  } else if (["cancel", "deny", "failure"].includes(transaction_status)) {
    newStatus = "failed";
    restore = true;
  }
  if (!newStatus) return NextResponse.json({ received: true });

  // Idempotency: never re-apply a terminal payment state (Midtrans retries).
  const terminal: PaymentStatus[] = ["paid", "expired", "failed"];
  if (terminal.includes(order.payment_status as PaymentStatus)) {
    return NextResponse.json({ received: true });
  }

  const update: Record<string, unknown> = {
    payment_status: newStatus,
    midtrans_transaction_id: transaction_id,
  };
  if (newStatus === "paid") update.paid_at = new Date().toISOString();

  await supabase.from("orders").update(update).eq("id", order.id);

  if (restore) {
    const cells = buildCells(
      (order.items as OrderItem[]).map((i) => ({
        product_id: i.product_id,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
      }))
    );
    await restoreStock(supabase, cells);
  }

  return NextResponse.json({ received: true });
}
