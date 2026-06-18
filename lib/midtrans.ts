import { createHash } from "crypto";

const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
const SNAP_BASE = isProd ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";

function serverKey(): string {
  const k = process.env.MIDTRANS_SERVER_KEY;
  if (!k) throw new Error("MIDTRANS_SERVER_KEY is not set");
  return k;
}

export type SnapItem = { id: string; price: number; quantity: number; name: string };

/** Create a Snap transaction. Returns the token used by snap.js + a redirect URL. */
export async function createSnapTransaction(params: {
  orderId: string;
  grossAmount: number;
  items: SnapItem[];
  customer: { first_name: string; phone: string; email?: string | null };
}): Promise<{ token: string; redirect_url: string }> {
  const auth = Buffer.from(serverKey() + ":").toString("base64");
  const res = await fetch(`${SNAP_BASE}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: { order_id: params.orderId, gross_amount: params.grossAmount },
      item_details: params.items.map((i) => ({
        id: i.id,
        price: i.price,
        quantity: i.quantity,
        name: i.name.slice(0, 50), // Midtrans name max length
      })),
      customer_details: {
        first_name: params.customer.first_name.slice(0, 50),
        phone: params.customer.phone,
        email: params.customer.email || undefined,
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Midtrans Snap error ${res.status}: ${text}`);
  }
  return res.json() as Promise<{ token: string; redirect_url: string }>;
}

/** Verify a Payment Notification signature: sha512(order_id+status_code+gross_amount+ServerKey). */
export function verifySignature(p: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const expected = createHash("sha512")
    .update(p.order_id + p.status_code + p.gross_amount + serverKey())
    .digest("hex");
  if (expected.length !== p.signature_key.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ p.signature_key.charCodeAt(i);
  }
  return diff === 0;
}
