# Midtrans Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Midtrans Snap online payment to checkout (QRIS/VA/e-wallet) alongside the existing manual "order via WhatsApp" flow, with a signature-verified webhook that marks orders paid or restores stock on failure.

**Architecture:** An additive payment layer over the existing order flow. Orders are still created and stock still decremented at order creation for both paths. Online orders also get a Snap token (server-created via REST) and a public webhook updates `payment_status` / restores stock. A shared `lib/stock.ts` holds the optimistic-concurrency decrement (moved from the orders route) plus its inverse restore. Payment state lives in new `orders` columns, kept separate from the untouched fulfillment `status`.

**Tech Stack:** Next.js 16.2.6 (App Router), React 19, TypeScript, Supabase (admin client), Midtrans Snap REST API + Snap.js. No new npm dependencies (`crypto` + `fetch` are built-in).

**Spec:** `docs/superpowers/specs/2026-06-18-midtrans-payments-design.md`

---

## Verification approach (read first)

This repo has **no test runner** (`package.json` scripts are `dev`/`build`/`start`/`lint` only), matching the convention used by the motion-graphics plan. Per YAGNI and existing project convention, **we do NOT add a test framework.** Each task's gate is:

```
npx tsc --noEmit      # types
npm run build         # production build (RSC + client boundaries)
npm run lint          # eslint
```

plus, where noted, a manual/observed check. **The webhook + paid/expired callbacks can only be exercised on a deployed URL** (Midtrans cannot reach `localhost`) — that full sandbox run is the final task.

**Branch:** create `feat/midtrans-payments` before Task 1 (`git checkout -b feat/midtrans-payments`). Every commit's author **must** be `manmantab50@gmail.com` (Vercel Hobby rule). Use:
`git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "…"`.

---

## File structure

**New files**
- `lib/midtrans.ts` — Snap transaction creation + signature verification. No SDK.
- `lib/stock.ts` — `buildCells`, `decrementStock`, `restoreStock` (optimistic concurrency, shared).
- `app/api/payments/webhook/route.ts` — Midtrans Payment Notification handler.
- `components/admin/payment-badge.tsx` — payment method + status badge.

**Modified files**
- `supabase/schema.sql` — append the `orders` payment columns + index (reference copy of the migration).
- `lib/types.ts` — extend `Order` with the five payment fields.
- `app/api/orders/route.ts` — use `lib/stock.ts`; accept `payment_method`; create Snap token for online.
- `app/(store)/checkout/page.tsx` — two actions (Bayar Online / Pesan via WhatsApp) + Snap.js.
- `app/(admin)/admin/(dashboard)/orders/[id]/page.tsx` — payment block.
- `app/(admin)/admin/(dashboard)/orders/page.tsx` — "Lunas" marker.
- `docs/HANDOFF.md` — tick Phase 2 progress (final task).

---

## Task 1: Database migration + types

**Files:**
- Modify: `supabase/schema.sql` (append)
- Modify: `lib/types.ts`

- [ ] **Step 1: Run the migration in Supabase → SQL Editor**

```sql
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS midtrans_order_id TEXT,
  ADD COLUMN IF NOT EXISTS midtrans_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_chk
    CHECK (payment_method IN ('online','whatsapp')) NOT VALID;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_chk
    CHECK (payment_status IN ('unpaid','pending','paid','failed','expired')) NOT VALID;

CREATE INDEX IF NOT EXISTS idx_orders_midtrans_order_id ON orders(midtrans_order_id);
```

(`NOT VALID` skips re-checking existing rows; new/updated rows are enforced.)

- [ ] **Step 2: Append the same SQL to `supabase/schema.sql`**

Append at the end of the file, under a comment header:

```sql
-- Payments (Midtrans) — added 2026-06-18
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS midtrans_order_id TEXT,
  ADD COLUMN IF NOT EXISTS midtrans_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_orders_midtrans_order_id ON orders(midtrans_order_id);
```

- [ ] **Step 3: Extend the `Order` type**

In `lib/types.ts`, replace the `Order` type (lines 39-52) with:

```typescript
export type PaymentMethod = "online" | "whatsapp";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "expired";

export type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "done";
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  midtrans_order_id: string | null;
  midtrans_transaction_id: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql lib/types.ts
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(payments): add order payment columns + types"
```

---

## Task 2: Shared stock module (extract decrement + add restore)

**Files:**
- Create: `lib/stock.ts`
- Modify: `app/api/orders/route.ts`

- [ ] **Step 1: Create `lib/stock.ts`**

This moves the exact optimistic-concurrency logic out of the orders route and adds the inverse (`restoreStock`). `direction = -1` decrements, `+1` restores; the re-read → guarded-update-on-unchanged-`stock` → retry pattern is identical to today's.

```typescript
// lib/stock.ts
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
```

- [ ] **Step 2: Use the module in the orders route**

In `app/api/orders/route.ts`:

(a) Replace the import line `import { sumVariantStock } from "@/lib/validate-variants";` (line 4) with:

```typescript
import { buildCells, decrementStock } from "@/lib/stock";
```

(b) Replace the inline cells-building block (currently lines 164-174, the `const cells = new Map…` through its closing `}`) with:

```typescript
    // --- Aggregate quantities per (product, color, size) cell ---
    const cells = buildCells(orderItems);
```

(c) Replace the entire decrement loop (currently lines 228-273, the comment block `// --- Decrement stock with optimistic concurrency…` through the closing `}` of the `for (const pid of productIdsToUpdate)` loop) with:

```typescript
    // --- Decrement stock (optimistic concurrency in lib/stock.ts) ---
    await decrementStock(supabase, cells);
```

The stock-availability **check** block (lines 176-202, building `legacyByProduct` and validating pools) stays as-is — it runs before the insert and still uses `cells` + `productMap`.

- [ ] **Step 3: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds. Behavior is unchanged (pure refactor).

- [ ] **Step 4: Commit**

```bash
git add lib/stock.ts app/api/orders/route.ts
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "refactor(payments): extract stock decrement + add restore to lib/stock.ts"
```

---

## Task 3: Midtrans helper

**Files:**
- Create: `lib/midtrans.ts`

- [ ] **Step 1: Create `lib/midtrans.ts`**

```typescript
// lib/midtrans.ts
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/midtrans.ts
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(payments): add Midtrans Snap + signature helper"
```

---

## Task 4: Orders route — accept payment_method, create Snap token

**Files:**
- Modify: `app/api/orders/route.ts`

- [ ] **Step 1: Add the Midtrans import**

At the top of `app/api/orders/route.ts`, add after the `lib/stock` import:

```typescript
import { createSnapTransaction } from "@/lib/midtrans";
```

- [ ] **Step 2: Read `payment_method` from the body**

The body destructure currently is:

```typescript
    const { customer_name, customer_phone, customer_address, customer_email, items, notes } = body;
```

Replace it with:

```typescript
    const { customer_name, customer_phone, customer_address, customer_email, items, notes } = body;
    const paymentMethod: "online" | "whatsapp" = body.payment_method === "online" ? "online" : "whatsapp";
```

- [ ] **Step 3: Persist the payment method on insert**

In the `.insert({ … })` for the order (currently lines 207-216), add the two payment fields. The object becomes:

```typescript
      .insert({
        customer_name: customer_name.trim(),
        customer_phone: phoneClean,
        customer_email: customer_email?.trim() || null,
        customer_address: customer_address.trim(),
        items: orderItems,
        total,
        notes: notes?.trim() || null,
        status: "pending",
        payment_method: paymentMethod,
        payment_status: "unpaid",
      })
      .select("id, order_number")
      .single();
```

- [ ] **Step 4: Create the Snap transaction for online orders**

Immediately **after** the admin email block (after the `await sendAdminOrderAlert({ … } as Order);` call, around line 288) and **before** the final `return NextResponse.json({ success: true, order: data });`, insert:

```typescript
    // --- Online payment: create Midtrans Snap transaction ---
    if (paymentMethod === "online") {
      const midtransOrderId = `MC-${data.order_number}-${Math.random().toString(36).slice(2, 8)}`;
      try {
        const snap = await createSnapTransaction({
          orderId: midtransOrderId,
          grossAmount: total,
          items: orderItems.map((oi) => ({
            id: oi.product_id,
            price: oi.price,
            quantity: oi.quantity,
            name: `${oi.name}${oi.color ? ` ${oi.color}` : ""} ${oi.size}`,
          })),
          customer: {
            first_name: customer_name.trim(),
            phone: phoneClean,
            email: customer_email?.trim() || null,
          },
        });

        await supabase
          .from("orders")
          .update({ midtrans_order_id: midtransOrderId, payment_status: "pending" })
          .eq("id", data.id);

        return NextResponse.json({ success: true, order: data, snap_token: snap.token });
      } catch (err) {
        console.error("Snap creation failed:", err);
        // Order + stock already committed; tell client payment couldn't start.
        return NextResponse.json(
          { error: "Pesanan dibuat, tetapi pembayaran gagal dimulai. Hubungi kami via WhatsApp.", order: data },
          { status: 502 }
        );
      }
    }

```

Note: `item_details` prices sum to `total` (each `price * quantity` summed equals the server `total`), which Snap requires.

- [ ] **Step 5: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 6: Observed check (Snap token, local)**

Set `MIDTRANS_SERVER_KEY` (sandbox) + `MIDTRANS_IS_PRODUCTION=false` in `.env.local`. `npm run dev`, then:

```bash
curl -s -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -d '{"customer_name":"Test","customer_phone":"08123456789","customer_address":"Jl. Test No. 1 Bandung","payment_method":"online","items":[{"product_id":"<REAL_PRODUCT_ID>","size":"M","color":"Mocha","quantity":1}]}'
```

Expected: JSON includes `snap_token`. (Use a real product id/size/color from your DB; this consumes 1 stock — restore it after.)

- [ ] **Step 7: Commit**

```bash
git add app/api/orders/route.ts
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(payments): create Snap token for online orders"
```

---

## Task 5: Payment webhook

**Files:**
- Create: `app/api/payments/webhook/route.ts`

- [ ] **Step 1: Create the webhook route**

```typescript
// app/api/payments/webhook/route.ts
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
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds; `/api/payments/webhook` appears in the route list.

- [ ] **Step 3: Observed check (signature rejection, local)**

`npm run dev`, then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/payments/webhook -H "Content-Type: application/json" -d '{"order_id":"MC-1-abc","status_code":"200","gross_amount":"185000.00","signature_key":"forged","transaction_status":"settlement"}'
```

Expected: `403` (forged signature rejected). Full paid/expired flow is verified on a deploy in Task 8.

- [ ] **Step 4: Commit**

```bash
git add app/api/payments/webhook/route.ts
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(payments): add signature-verified Midtrans webhook"
```

---

## Task 6: Checkout — two actions + Snap.js

**Files:**
- Modify: `app/(store)/checkout/page.tsx`

- [ ] **Step 1: Replace the checkout page**

Replace the **entire** contents of `app/(store)/checkout/page.tsx` with the following. It keeps the existing layout, `Section`, and `Field` helpers; adds the Snap.js script, a `placeOrder(method)` function, two buttons, and online success/pending screens.

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/config";

declare global {
  interface Window {
    snap?: { pay: (token: string, opts: Record<string, (result?: unknown) => void>) => void };
  }
}

const SNAP_IS_PROD = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
const SNAP_SRC = `${SNAP_IS_PROD ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com"}/snap/snap.js`;
const SNAP_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";

type Result = "wa" | "paid" | "pending";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState<"" | "online" | "whatsapp">("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0 && !result) {
      router.push("/cart");
    }
  }, [items.length, result, router]);

  if (items.length === 0 && !result) return null;

  async function placeOrder(e: React.FormEvent<HTMLFormElement>, method: "online" | "whatsapp") {
    e.preventDefault();
    setLoading(method);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      customer_name: form.get("name"),
      customer_phone: form.get("phone"),
      customer_email: form.get("email") || null,
      customer_address: form.get("address"),
      notes: form.get("notes") || null,
      payment_method: method,
      items: items.map((i) => ({
        product_id: i.product_id,
        size: i.size,
        color: i.color ?? null,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat pesanan.");
        return;
      }

      if (method === "whatsapp") {
        clearCart();
        setResult("wa");
        return;
      }

      // Online: open Snap popup.
      if (!window.snap || !data.snap_token) {
        setError("Pembayaran tidak dapat dimulai. Coba lagi atau pesan via WhatsApp.");
        return;
      }
      window.snap.pay(data.snap_token, {
        onSuccess: () => {
          clearCart();
          setResult("paid");
        },
        onPending: () => {
          clearCart();
          setResult("pending");
        },
        onError: () => setError("Pembayaran gagal. Silakan coba lagi."),
        onClose: () => setError("Pembayaran belum selesai. Pesanan Anda menunggu pembayaran."),
      });
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading("");
    }
  }

  if (result) {
    const copy =
      result === "paid"
        ? { h: "Pembayaran Diterima", p: "Terima kasih! Pembayaran Anda sudah kami terima. Pesanan akan segera kami proses." }
        : result === "pending"
          ? { h: "Menunggu Pembayaran", p: "Selesaikan pembayaran di aplikasi pilihan Anda. Pesanan otomatis diproses setelah pembayaran masuk." }
          : { h: "Terima Kasih", p: "Pesanan Anda berhasil dibuat. Kami akan menghubungi Anda via WhatsApp untuk konfirmasi." };
    return (
      <div className="mx-auto max-w-[480px] px-6 py-24 text-center sm:py-32">
        <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">Konfirmasi</p>
        <h1 className="mt-3 font-heading text-5xl uppercase">{copy.h}</h1>
        <p className="mt-6 text-[12px] tracking-[0.04em] uppercase opacity-80">{copy.p}</p>
        <Link
          href="/shop"
          className="mt-10 inline-block border border-foreground px-8 py-3 text-[12px] tracking-[0.12em] uppercase hover:bg-foreground hover:text-background"
        >
          Lanjut Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-20 sm:px-12">
      <Script src={SNAP_SRC} data-client-key={SNAP_CLIENT_KEY} strategy="afterInteractive" />

      <div className="mb-8">
        <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">|02|</p>
        <h1 className="mt-2 font-heading text-4xl uppercase sm:text-5xl">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
        {/* Form */}
        <form onSubmit={(e) => placeOrder(e, "online")} className="space-y-8">
          <Section title="Detail Kontak" idx="01">
            <Field label="Nama Lengkap" name="name" required placeholder="Nama lengkap" />
            <Field label="No. WhatsApp" name="phone" type="tel" required placeholder="08xxxxxxxxxx" />
            <Field label="Email (opsional)" name="email" type="email" placeholder="email@example.com" />
          </Section>

          <Section title="Pengiriman" idx="02">
            <Field label="Alamat Lengkap" name="address" required textarea rows={3} placeholder="Alamat lengkap untuk pengiriman" />
            <Field label="Catatan (opsional)" name="notes" textarea rows={2} placeholder="Catatan tambahan" />
          </Section>

          {error && (
            <p className="text-[11px] tracking-[0.08em] uppercase text-destructive">{error}</p>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading !== ""}
              className="flex w-full items-center justify-center gap-2 border border-foreground bg-foreground py-4 text-[12px] tracking-[0.12em] uppercase text-background hover:opacity-80 disabled:opacity-50"
            >
              {loading === "online" ? "Memproses…" : "Bayar Online"}
            </button>
            <button
              type="submit"
              formNoValidate
              onClick={(e) => {
                // Submit through the WhatsApp path instead of online.
                const formEl = e.currentTarget.form;
                if (formEl) {
                  e.preventDefault();
                  if (formEl.reportValidity()) {
                    placeOrder({ preventDefault() {}, currentTarget: formEl } as unknown as React.FormEvent<HTMLFormElement>, "whatsapp");
                  }
                }
              }}
              disabled={loading !== ""}
              className="flex w-full items-center justify-center gap-2 border border-foreground py-4 text-[12px] tracking-[0.12em] uppercase hover:bg-foreground hover:text-background disabled:opacity-50"
            >
              {!loading && <Check className="h-4 w-4" />}
              {loading === "whatsapp" ? "Memproses…" : "Pesan via WhatsApp"}
            </button>
          </div>
        </form>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-12 lg:h-fit">
          <div className="border border-foreground/10 p-6 sm:p-8">
            <h2 className="text-[11px] tracking-[0.12em] uppercase opacity-60">Ringkasan</h2>
            <div className="mt-5 space-y-2 text-[12px] tracking-[0.04em] uppercase">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.size}-${item.color ?? ""}`} className="flex items-start justify-between gap-3">
                  <span className="min-w-0 flex-1">
                    {item.name}{" "}
                    <span className="opacity-60">
                      / {item.size}
                      {item.color && <> / {item.color}</>} / x{item.quantity}
                    </span>
                  </span>
                  <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-foreground/20 pt-5">
              <div className="flex items-center justify-between text-[14px] tracking-[0.04em] uppercase">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, idx, children }: { title: string; idx: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.12em] uppercase">
        <span className="opacity-60">|{idx}|</span> <span className="ml-1">{title}</span>
      </p>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  textarea,
  rows = 1,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  const inputClass =
    "block w-full border-b border-foreground/30 bg-transparent py-3 text-[14px] outline-none placeholder:opacity-40 focus:border-foreground";
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.08em] uppercase opacity-70">
        {label}
        {required && <span className="ml-1 opacity-60">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} required={required} placeholder={placeholder} rows={rows} className={`${inputClass} resize-none`} />
      ) : (
        <input name={name} type={type} required={required} placeholder={placeholder} className={inputClass} />
      )}
    </label>
  );
}
```

- [ ] **Step 2: Type-check + build + lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all pass.

- [ ] **Step 3: Observed check (local)**

Add `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` + `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false` to `.env.local`. `npm run dev`, add an item, go to `/checkout`. Expected: both buttons render; "Bayar Online" opens the Snap popup (sandbox); "Pesan via WhatsApp" shows the Terima Kasih screen. Required-field validation still blocks empty submits on both buttons.

- [ ] **Step 4: Commit**

```bash
git add "app/(store)/checkout/page.tsx"
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(payments): checkout Bayar Online (Snap) + WhatsApp fallback"
```

---

## Task 7: Admin payment display

**Files:**
- Create: `components/admin/payment-badge.tsx`
- Modify: `app/(admin)/admin/(dashboard)/orders/[id]/page.tsx`
- Modify: `app/(admin)/admin/(dashboard)/orders/page.tsx`

- [ ] **Step 1: Create the payment badge component**

```tsx
// components/admin/payment-badge.tsx
import type { PaymentMethod, PaymentStatus } from "@/lib/types";

const STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Belum Bayar",
  pending: "Menunggu",
  paid: "Lunas",
  failed: "Gagal",
  expired: "Kedaluwarsa",
};

const STATUS_CLASS: Record<PaymentStatus, string> = {
  unpaid: "bg-secondary text-muted-foreground",
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  expired: "bg-red-100 text-red-800",
};

export function PaymentBadge({
  method,
  status,
}: {
  method: PaymentMethod;
  status: PaymentStatus;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {method === "online" ? "Online" : "WhatsApp"}
      </span>
      <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}>
        {STATUS_LABEL[status]}
      </span>
    </span>
  );
}
```

- [ ] **Step 2: Add the payment block to the order detail page**

In `app/(admin)/admin/(dashboard)/orders/[id]/page.tsx`:

(a) Add the import after line 5 (`import { OrderTimeline } …`):

```tsx
import { PaymentBadge } from "@/components/admin/payment-badge";
```

(b) Insert a payment block immediately after the customer-info block (after its closing `</div>` on line 41, before the "Item Pesanan" block):

```tsx
      <div className="rounded-sm border border-border p-4 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Pembayaran</h2>
        <PaymentBadge method={o.payment_method} status={o.payment_status} />
        {o.paid_at && (
          <p className="mt-2 text-xs text-muted-foreground">
            Dibayar {new Date(o.paid_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
```

- [ ] **Step 3: Add a "Lunas" marker to the orders list**

In `app/(admin)/admin/(dashboard)/orders/page.tsx`, replace the customer-name cell (line 22):

```tsx
            <span className="text-sm">{order.customer_name}</span>
```

with (appends a small "Lunas" tag for paid orders):

```tsx
            <span className="text-sm">
              {order.customer_name}
              {order.payment_status === "paid" && (
                <span className="ml-2 rounded-sm bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-800">Lunas</span>
              )}
            </span>
```

- [ ] **Step 4: Type-check + build + lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add components/admin/payment-badge.tsx "app/(admin)/admin/(dashboard)/orders/[id]/page.tsx" "app/(admin)/admin/(dashboard)/orders/page.tsx"
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(payments): show payment method/status in admin"
```

---

## Task 8: Env config, deployed sandbox verification, docs

**Files:**
- Modify: `.env.example`
- Modify: `docs/HANDOFF.md`

- [ ] **Step 1: Document env vars in `.env.example`**

Append to `.env.example`:

```env
# Midtrans payments (sandbox values for dev; production keys + IS_PRODUCTION=true at launch)
MIDTRANS_SERVER_KEY="Mid-server-xxxxxxxx"
MIDTRANS_IS_PRODUCTION="false"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="Mid-client-xxxxxxxx"
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION="false"
```

- [ ] **Step 2: Set the four env vars on Vercel (Preview + Production)**

In Vercel → project → Settings → Environment Variables, add `MIDTRANS_SERVER_KEY`, `MIDTRANS_IS_PRODUCTION=false`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false` (sandbox values). Mirror them in `.env.local`.

- [ ] **Step 3: Deploy the branch + set the Midtrans notification URL**

Push the branch and let Vercel build a Preview deployment. Copy its URL. In the Midtrans **Sandbox** dashboard → Settings → Configuration → **Payment Notification URL**, set:

```
https://<preview-host>/api/payments/webhook
```

- [ ] **Step 4: Deployed sandbox verification (spec §8)**

On the deployed Preview:
1. **Happy path:** place an online order → Snap popup → pay with the Midtrans sandbox simulator (e.g. QRIS or a test VA). Confirm in admin: `payment_status` → **Lunas**, `paid_at` set, fulfillment **still Pending**.
2. **Expiry/restore:** create an online order, then in the Midtrans dashboard cancel/expire the transaction (or wait for expiry) → webhook fires → `payment_status` → **Kedaluwarsa/Gagal**, and the product's stock returns to its pre-order value.
3. **Idempotency:** in the Midtrans dashboard, resend the settlement notification → order stays paid, no duplicate effects, stock unchanged.
4. **WhatsApp regression:** place a WhatsApp order → admin email arrives, stock decremented, success screen shown, `payment_status` = Belum Bayar.

Record the results in the PR/commit message.

- [ ] **Step 5: Update HANDOFF Phase 2 status**

In `docs/HANDOFF.md`, under "Phase 2: Payment integration (Midtrans)", mark the implemented items done (Snap token endpoint, webhook, payment columns, checkout popup, admin status) and note remaining production steps (production keys, KYC, production notification URL).

- [ ] **Step 6: Commit**

```bash
git add .env.example docs/HANDOFF.md
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "docs(payments): env config + HANDOFF Phase 2 status"
```

---

## Going to production (post-merge, when KYC approved)

- Swap to production `MIDTRANS_SERVER_KEY` + `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`; set both `*_IS_PRODUCTION=true` on Vercel; redeploy.
- Set the **production** Payment Notification URL to `https://moonscloset.com/api/payments/webhook`.
- Complete Midtrans KYC (KTP + bank account; 3–7 day approval) before real charges.

## Deferred (out of scope, per spec §7)

- Resume/retry payment for an abandoned unpaid order (re-issue Snap token).
- Admin refund button (use Midtrans dashboard).
- Card/installment/paylater tuning (dashboard-configurable, no code).
- Shipping cost in `gross_amount` (Phase 3 — RajaOngkir).
