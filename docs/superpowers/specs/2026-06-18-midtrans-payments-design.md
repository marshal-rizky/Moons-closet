# Midtrans Payments — Design Spec

**Date:** 2026-06-18
**Status:** Approved (design); pending implementation plan
**Scope:** Storefront checkout + orders API + admin order view (`app/(store)/checkout`, `app/api/orders`, new `app/api/payments/*`, `app/(admin)/.../orders`). Admin auth and fulfillment flow otherwise unchanged.
**Phase:** Phase 2 (Payments) from `docs/HANDOFF.md`. Business context: `docs/for-owner/delivery-and-payments-guide.md`.

---

## 1. Goal & direction

Let customers pay online at checkout via **Midtrans Snap** (QRIS, Virtual Account, e-wallet, etc.), with money landing automatically — while keeping the existing **manual "order via WhatsApp"** flow as a fallback. Today orders are created with no payment step and the owner confirms payment manually over WhatsApp; this adds a real payment rail without removing the manual one.

Decisions reached during brainstorming (owner-confirmed):

- **Payment mode:** *Online pay + WhatsApp fallback.* Checkout offers "Bayar Online" (Snap) and "Pesan via WhatsApp" (today's flow).
- **Stock timing:** *Deduct at order creation + auto-restore.* Stock is decremented when the order is created (same as today, for both paths). For online orders, if payment expires/fails, the webhook restores stock and marks the order failed/expired. Accepted tradeoff: an item can read "sold out" for the ~15 min an unpaid online order is pending.
- **Admin workflow on payment success:** *Stay Pending for review.* A confirmed online payment sets `payment_status = paid` but leaves fulfillment `status = pending`; the owner still clicks **Confirm** manually (which fires the existing customer confirmation email).

## 2. Approach

**Midtrans Snap popup + server-side token, no new npm dependencies.**

- Snap's frontend is a `<script>` tag (Snap.js), not a package — loaded via `next/script`.
- The server talks to Midtrans over plain REST (`fetch`) with HTTP Basic auth (Server Key) — consistent with this codebase's established "no new dependencies" discipline.
- **Rejected:** `midtrans-client` npm (a dependency for what is two REST calls); redirect-to-Midtrans page (Snap popup keeps buyers on `moonscloset.com`, per the owner guide).

## 3. Data model

New columns on `orders` (a single `ALTER TABLE` run in the Supabase SQL editor, plus appended to `supabase/schema.sql`). All nullable / defaulted so existing rows are valid:

| Column | Type | Default | Meaning |
|---|---|---|---|
| `payment_method` | text | `'whatsapp'` | `'online'` (Snap) or `'whatsapp'` (manual fallback) |
| `payment_status` | text | `'unpaid'` | `'unpaid'` → `'pending'` → `'paid'` / `'failed'` / `'expired'` |
| `midtrans_order_id` | text | null | Unique id sent to Midtrans, format `MC-{order_number}-{rand}`. Indexed for webhook lookup. |
| `midtrans_transaction_id` | text | null | Transaction id Midtrans returns |
| `paid_at` | timestamptz | null | When payment cleared |

```sql
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS midtrans_order_id TEXT,
  ADD COLUMN IF NOT EXISTS midtrans_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_orders_midtrans_order_id ON orders(midtrans_order_id);
```

A `CHECK` constraint mirrors the allowed `payment_status` / `payment_method` values. `lib/types.ts` `Order` type extended with the five fields (`payment_status` and `payment_method` as string unions).

The existing fulfillment `status` (`pending | confirmed | shipped | done`) and its flow are untouched.

## 4. Components

### 4.1 `lib/midtrans.ts` (new)
Single source for Midtrans calls. No SDK.
- `createSnapTransaction(params)` — `POST` to the Snap API (`https://app.sandbox.midtrans.com/snap/v1/transactions` in sandbox, `https://app.midtrans.com/...` in production) with `Authorization: Basic base64(ServerKey + ':')`. Sends `transaction_details` (`order_id`, `gross_amount`), `item_details`, `customer_details`. Returns `{ token, redirect_url }`.
- `verifySignature(orderId, statusCode, grossAmount, signatureKey)` — recomputes `sha512(order_id + status_code + gross_amount + ServerKey)` and constant-time-compares to the notification's `signature_key`.
- Reads `MIDTRANS_SERVER_KEY` and `MIDTRANS_IS_PRODUCTION` (host + production flag derive from the latter).

### 4.2 `lib/stock.ts` (new — refactor)
The per-`(product, color, size)` optimistic-concurrency stock logic currently inlined in `app/api/orders/route.ts` is extracted into:
- `decrementStock(supabase, cells)` — existing decrement behavior, moved verbatim.
- `restoreStock(supabase, cells)` — the inverse (adds quantities back) using the same re-read → guarded-update → retry pattern.
Both the orders route and the webhook use this one module, so decrement and restore can never drift apart.

### 4.3 `POST /api/orders` (modified)
- Accepts a new `payment_method` field (`'online' | 'whatsapp'`, default `'whatsapp'`).
- All existing validation, server-side price recalculation, order insert, **stock decrement**, and admin-alert email stay exactly as today, for **both** paths.
- If `payment_method === 'online'`: generate `midtrans_order_id`, call `createSnapTransaction`, persist `midtrans_order_id` + `payment_method:'online'` + `payment_status:'pending'`, and return `{ success, order, snap_token }`.
- If `payment_method === 'whatsapp'`: persist `payment_method:'whatsapp'` + `payment_status:'unpaid'`; response unchanged from today.
- If the Snap call fails, the order has already been created (stock decremented); return an error telling the client to retry payment, and surface a way to retry/Snap-token re-fetch (see §6 error handling).

### 4.4 `POST /api/payments/webhook` (new, public, unauthenticated by design)
Midtrans's server-to-server Payment Notification endpoint.
1. Parse body, call `verifySignature`. On mismatch → `403`, do nothing.
2. Look up order by `midtrans_order_id`. If missing → `200` (ack, nothing to do).
3. **Idempotency:** if the order is already in a terminal payment state matching this outcome, ack `200` and stop (Midtrans retries notifications).
4. Map `transaction_status`:
   - `capture` (accept) / `settlement` → `payment_status:'paid'`, set `midtrans_transaction_id`, `paid_at`. Fulfillment `status` stays `pending`. **No email** (owner confirms manually).
   - `expire` → `payment_status:'expired'` + `restoreStock`.
   - `cancel` / `deny` / `failure` → `payment_status:'failed'` + `restoreStock`.
   - `pending` → `payment_status:'pending'` (no stock change; already decremented at creation).
5. Always respond `200` for handled cases so Midtrans stops retrying.

### 4.5 Checkout page (modified — `app/(store)/checkout/page.tsx`)
- Two actions replace the single submit:
  - **"Bayar Online"** → POST `payment_method:'online'` → on success call `window.snap.pay(snap_token, { onSuccess, onPending, onError, onClose })`.
    - `onSuccess` / `onPending` → `clearCart()`, show result screen ("Pembayaran diterima" / "Menunggu pembayaran — selesaikan di aplikasi pembayaran Anda").
    - `onError` / `onClose` → keep cart, show retry message (order already exists, payment unfinished).
  - **"Pesan via WhatsApp"** → POST `payment_method:'whatsapp'` → today's success screen, unchanged.
- Snap.js loaded via `next/script` with `data-client-key={NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}`; script `src` host (sandbox vs production) derives from `MIDTRANS_IS_PRODUCTION` exposed to the client as `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION`.
- Design-system compliant: both buttons use the existing outline-primary style; no new visual primitives.

### 4.6 Admin (modified)
- **Order detail** (`app/(admin)/admin/(dashboard)/orders/[id]/page.tsx`) — a payment block: method (Online / WhatsApp), `payment_status` as an Indonesian badge (Lunas / Menunggu / Gagal / Kedaluwarsa / Belum Bayar), and `paid_at` when present.
- **Order list** — a compact "Lunas" marker for paid orders.
- No change to the status updater or emails.

## 5. Configuration

Environment variables (`.env.local` for dev, Vercel env for prod):

| Variable | Scope | Notes |
|---|---|---|
| `MIDTRANS_SERVER_KEY` | server-only secret | Sandbox `Mid-server-…` for dev; production key at launch. Never client-exposed. |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | public | Sandbox `Mid-client-…`; shipped in Snap.js tag. |
| `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` | public | `'false'` in sandbox; selects Snap.js host. |
| `MIDTRANS_IS_PRODUCTION` | server | `'false'` in sandbox; selects API host. |

Merchant ID is not needed in code. Sandbox keys live at `dashboard.sandbox.midtrans.com → Settings → Access Keys`; this account's sandbox keys are **not** `SB-` prefixed (verified by screenshot — the environment label, not the prefix, is authoritative).

The Midtrans **Payment Notification URL** (Sandbox dashboard → Settings → Configuration) must point to `https://<deployed-host>/api/payments/webhook`.

## 6. Error handling & edge cases

- **Bad/forged webhook signature** → `403`, ignored.
- **Webhook for unknown order** → `200` ack, no-op.
- **Duplicate webhooks** → idempotent; terminal states are not re-applied, stock is not double-restored.
- **Snap creation fails after order insert** → order exists with `payment_status:'pending'` and stock already decremented; client shown a retryable error. (A "resume payment" affordance — re-issue a Snap token for an existing unpaid order — is noted as a possible follow-up, not required for v1.)
- **Customer closes Snap without paying** → no immediate webhook; the Midtrans transaction expires later and fires `expire`, which restores stock. Relying on Midtrans expiry avoids a custom cron (YAGNI).
- **WhatsApp orders** → never receive a payment webhook; behave exactly as today (`payment_status:'unpaid'`).
- **Price integrity** → unchanged: the server recalculates `total` from the DB; the Snap `gross_amount` uses that server total, never a client-supplied amount.
- **Concurrency** → decrement and restore share `lib/stock.ts`'s optimistic-concurrency pattern (re-read, guarded update on unchanged total, retry).

## 7. Out of scope (v1)

- Resume/retry payment for an abandoned unpaid order (re-issuing a Snap token). Follow-up.
- Refund automation from the admin (do it in the Midtrans dashboard for now).
- Card payments tuning, installments/paylater enablement — all toggled in the Midtrans dashboard without code; default Snap method set is used.
- Shipping cost / RajaOngkir (separate Phase 3) — `gross_amount` is the product total only for now.
- Customer-facing payment-status page / order tracking.

## 8. Verification plan

1. **Build green:** `npx tsc --noEmit` + `npm run build` + `npm run lint` pass.
2. **Sandbox happy path (deployed):** place an online order on a Vercel deploy → Snap popup → pay with a Midtrans sandbox QRIS/VA simulator → webhook sets `payment_status:'paid'`, `paid_at` set, fulfillment still `pending`, admin badge shows Lunas.
3. **Expiry/restore:** create an online order, let the transaction expire (or trigger `expire` via Midtrans simulator) → `payment_status:'expired'`, stock restored to the pre-order level.
4. **Signature security:** POST a forged notification → `403`, order unchanged.
5. **Idempotency:** replay a `settlement` notification → no duplicate side effects.
6. **WhatsApp path regression:** WA order still creates, decrements stock, sends admin email, shows the unchanged success screen.
7. **Price integrity:** tampered client total ignored; Snap amount equals server-recalculated total.

## 9. Follow-ups / notes

- Going to production: set production `MIDTRANS_SERVER_KEY` + client key, flip both `*_IS_PRODUCTION` to `'true'`, set the production Payment Notification URL, complete Midtrans KYC (KTP + bank account; 3–7 day approval).
- Deploy reminder: commits that reach production must be authored `manmantab50@gmail.com` or Vercel blocks the deploy.
- Update `docs/HANDOFF.md` Phase 2 checklist once shipped.
