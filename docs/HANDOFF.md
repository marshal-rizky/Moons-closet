# Clothing Store Website — Handoff Document

**Date:** 2026-05-17 (last updated)
**Status:** Part 1 + Part 2 complete — DEPLOYED & E2E TESTED
**Branch:** master
**Production URL:** https://clothing-website-beryl.vercel.app

---

## What's Built

### Storefront (Public)
- **Home** (`/`) — Hero section, category grid (Atasan/Bawahan/Dress), 8 latest products
- **Shop** (`/shop`) — Full catalog with category filter tabs, product grid
- **Product Detail** (`/product/[slug]`) — Image gallery, size selector, stock indicator, add-to-cart
- **Cart** (`/cart`) — Line items with quantity controls, empty state, running total
- **Checkout** (`/checkout`) — Form (name, WhatsApp, address, notes) → server-side validated → success state
- **Contact** (`/contact`) — WhatsApp link, email, address (all from env vars)
- **Navbar** — Sticky header, desktop nav links, cart badge with item count, mobile hamburger (Sheet)
- **Footer** — 3-column: store info, quick links, contact details (contact page only)
- **Back to Top** — Scroll-triggered floating button with smooth scroll
- **404 Page** — Branded not-found page in Indonesian
- **Animations** — FadeIn on scroll (hero, categories, products, cart), spring-animated cart badge, crossfade product gallery, staggered order timeline
- **Toast System** — Global toast notifications (success/error) via React Context, auto-dismiss 3s, max 3 visible
- **Skeleton Loading** — Shimmer skeleton cards while products load

### Admin Panel (`/admin/*`) — Auth-Protected
- **Login** (`/admin/login`) — Supabase email/password auth
- **Dashboard** (`/admin`) — Stats cards (pending orders, total products, monthly revenue) + recent orders table
- **Products** (`/admin/products`) — List with search bar + category filter pills, thumbnails, price, stock, active/inactive toggle
- **New Product** (`/admin/products/new`) — Full form: name, description, price, category, sizes, stock, multi-image upload
- **Edit Product** (`/admin/products/[id]/edit`) — Same form pre-filled, soft delete option
- **Orders** (`/admin/orders`) — Orders list with status badges, customer info
- **Order Detail** (`/admin/orders/[id]`) — Full order info, items list, status updater (pending → confirmed → shipped → done), animated timeline

### Email Notifications (Resend)
- **Admin Order Alert** — Sent to store owner on every new order (items, total, customer info)
- **Customer Confirmation** — Sent when admin changes status to "confirmed"
- **Customer Shipping** — Sent when admin changes status to "shipped"
- **Sender:** `onboarding@resend.dev` (sandbox) — upgrade to custom domain for production
- **Implementation:** All emails are `await`ed to prevent serverless function early termination

### API Routes
- `POST /api/orders` — Create order (server-side price recalculation, validates stock/sizes/active status, sends admin email)
- `PATCH /api/orders/[id]` — Update order status (sends confirmation/shipping email to customer)
- `POST /api/products` — Create product (field whitelist, slug generation with collision handling)
- `PUT /api/products/[id]` — Update product (validated, slug regeneration on name change)
- `DELETE /api/products/[id]` — Soft delete (sets is_active=false)
- `POST /api/upload` — Image upload to Supabase Storage (validates type/size)
- `GET /api/test-email` — Diagnostic endpoint (sends test email, returns env var status) — **remove before production**

### Infrastructure & Security
- Supabase clients: browser, server (SSR cookies), admin (service role)
- **Defense-in-depth auth:** proxy.ts (Next.js 16) + server-side auth check in admin dashboard layout
- Admin route group `(dashboard)` with server-side `getUser()` check — login page outside this group to prevent redirect loops
- Cart Context with localStorage persistence
- All branding from `NEXT_PUBLIC_*` env vars — nothing hardcoded
- Checkout hardened: server-side price lookup, total recalculation, stock/size/active validation
- Product APIs: field whitelisting, input validation, slug collision handling
- Supabase RLS policies for data access control
- Turbopack root pinned in next.config.ts (prevents workspace inference issues)
- Remote image patterns configured for Supabase Storage

---

## Deployment

### Production
- **URL:** https://clothing-website-beryl.vercel.app
- **Platform:** Vercel (marshal-rizkys-projects)
- **Supabase:** https://mfndnciwfvkadggukmvq.supabase.co

### Environment Variables (set on Vercel)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STORE_NAME`
- `NEXT_PUBLIC_STORE_TAGLINE`
- `NEXT_PUBLIC_STORE_WHATSAPP`
- `NEXT_PUBLIC_STORE_EMAIL` — also used as admin alert recipient
- `NEXT_PUBLIC_STORE_ADDRESS`
- `RESEND_API_KEY` — Resend API key for transactional emails
- `RESEND_FROM_EMAIL` — (optional) defaults to `onboarding@resend.dev`

### To Update Branding
Change env vars in [Vercel Dashboard → Settings → Environment Variables](https://vercel.com/marshal-rizkys-projects/clothing-website/settings/environment-variables), then redeploy.

---

## Local Development

### 1. Environment Variables
Create `.env.local` with Supabase credentials and store branding (see `.env.example`).

### 2. Run Locally
```bash
npm install
npm run dev
```
- Store: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## Tech Stack
- **Framework:** Next.js 16.2.6 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 + shadcn/ui (Base UI)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Email:** Resend (transactional emails)
- **Animations:** Framer Motion (FadeIn, AnimatePresence, motion.div/span)
- **Fonts:** Cormorant (headings) + Montserrat (body)
- **Language:** Bahasa Indonesia
- **Currency:** IDR (Rupiah)
- **Deployment:** Vercel

## Architecture Notes
- Route groups: `(store)` for public pages, `(admin)` with nested `(dashboard)` for auth-protected pages
- Login page at `(admin)/admin/login/` — outside `(dashboard)` group to avoid redirect loops
- `proxy.ts` (Next.js 16 convention, replaces deprecated `middleware.ts`) for route-level auth
- Client-side cart (no auth required for shoppers)
- Order flow: customer fills form → server validates & recalculates prices → order saved → admin reviews & updates status
- No payment gateway — manual confirmation by admin via WhatsApp
- Products use soft delete (`is_active` flag)
- JSONB columns for flexibility (images array, sizes array, order items)

## Completed (Part 2)
- ~~Stock decrement on order creation~~ ✅
- ~~Email notifications (admin + customer)~~ ✅ (Resend)
- ~~Framer Motion animations~~ ✅
- ~~Search + category filters~~ ✅ (storefront + admin)
- ~~Toast notification system~~ ✅
- ~~Skeleton loading states~~ ✅
- ~~Back to Top button~~ ✅
- ~~Order timeline visualization~~ ✅

## Remaining / Future
- **Custom email domain** — verify domain in Resend to send to any email (currently sandbox: only delivers to account owner)
- **Remove `/api/test-email`** — diagnostic endpoint, delete before going live
- **Real store branding** — replace "Nama Toko" defaults with actual store name, tagline, WhatsApp, address in env vars
- **Real product photos** — replace placeholder SVGs with actual product images
- Delivery integration (JNE, GoSend, GrabExpress) — architecture kept malleable
- Payment gateway integration (Midtrans/Xendit)
- WhatsApp notification on new orders

---

## File Map

```
app/
├── (store)/              # Public storefront
│   ├── layout.tsx        # Navbar + Footer wrapper
│   ├── page.tsx          # Home
│   ├── shop/             # Catalog
│   ├── product/[slug]/   # Product detail
│   ├── cart/             # Shopping cart
│   ├── checkout/         # Checkout form
│   └── contact/          # Contact info
├── (admin)/admin/        # Admin panel
│   ├── layout.tsx        # Pass-through (no auth)
│   ├── login/            # Login form (no auth required)
│   └── (dashboard)/      # Auth-protected group
│       ├── layout.tsx    # Auth check + sidebar
│       ├── page.tsx      # Dashboard
│       ├── products/     # Product CRUD
│       └── orders/       # Order management
├── api/                  # API routes
│   ├── orders/           # Order endpoints (+ email triggers)
│   ├── products/         # Product endpoints
│   ├── test-email/       # Email diagnostic (remove before prod)
│   └── upload/           # Image upload
├── layout.tsx            # Root layout
├── not-found.tsx         # Custom 404
└── globals.css           # Theme + Tailwind

components/
├── admin/                # Admin-specific components
│   └── order-timeline.tsx  # Animated 4-step order timeline
├── store/                # Store-specific components
│   ├── shop-toolbar.tsx    # Search + category filter pills
│   ├── product-gallery.tsx # Image gallery with crossfade
│   └── product-card-skeleton.tsx # Shimmer skeleton
├── ui/                   # shadcn/ui primitives
│   ├── fade-in.tsx         # FadeIn scroll animation wrapper
│   ├── back-to-top.tsx     # Scroll-to-top button
│   └── toast.tsx           # Toast notification container
└── providers.tsx         # Context providers (Cart + Toast)

lib/
├── supabase/             # Supabase clients + middleware helper
├── cart-context.tsx      # Cart state management
├── toast-context.tsx     # Toast notification state
├── email.ts              # Resend email functions (admin alert, confirmation, shipping)
├── config.ts             # Site config from env vars
├── types.ts              # TypeScript types
└── utils.ts              # cn() utility

proxy.ts                  # Next.js 16 proxy (auth redirect)
next.config.ts            # Turbopack root + image patterns

supabase/
├── schema.sql            # Full DB schema + RLS
└── seed.sql              # Sample data
```

---

## Reference Docs

### Implementation Docs
- **Design Spec:** `docs/superpowers/specs/2026-05-15-clothing-store-design.md`
- **Part 1 Plan:** `docs/superpowers/plans/2026-05-15-clothing-store-plan.md`
- **Part 2 Plan:** `docs/superpowers/plans/2026-05-15-part2-implementation.md`
- **Part 2 Design Spec:** `docs/superpowers/specs/2026-05-15-part2-design.md`

### Business Planning Docs (for store owner)
- **Delivery & Payment Guide:** `docs/delivery-and-payments-guide.html` — Thorough explanation of QRIS, payment gateways (Midtrans), couriers (JNE/J&T/SiCepat), RajaOngkir, free shipping strategy, complete order flow, money flow. Open in browser → Ctrl+P → Save as PDF.
- **API Costs Reference:** `docs/biaya-api-lengkap.html` — Detailed cost breakdown for every paid service needed to go fully live (Midtrans, RajaOngkir, domain, email, optional Pro tiers). 3 budget scenarios + marketplace comparison. Open in browser → Ctrl+P → Save as PDF.

---

## Next Session Priorities

### Phase 1: Go-Live Prep (Owner Tasks)
1. **Buy domain** (Niagahoster/Cloudflare ~Rp 150-270rb/year)
2. **Verify domain in Resend** — enables sending email to any address (currently sandbox-locked to account owner email)
3. **Add domain to Vercel** → update DNS
4. **Update branding env vars** on Vercel: real `NEXT_PUBLIC_STORE_NAME`, tagline, WhatsApp, address
5. **Sign up Midtrans Sandbox** at dashboard.midtrans.com (free, approval for production takes 3-7 days)
6. **Sign up RajaOngkir Starter** (free) at rajaongkir.com

### Phase 2: Payment Integration (Dev Tasks)
Per delivery-and-payments-guide.html section "Cara Kerja Pembayaran":
- Add Midtrans columns to `orders` table: `payment_method`, `payment_status`, `midtrans_transaction_id`, `midtrans_snap_token`, `paid_at`
- Create `/api/payments/create` endpoint (server creates Midtrans transaction, returns snap_token)
- Create `/api/payments/webhook` endpoint (verify signature, update payment_status, restore stock on failure)
- Update checkout flow: create order → open Snap popup → handle success/pending/error callbacks
- Update admin order detail to show payment status
- Add payment expiry handling

### Phase 3: Delivery Integration (Dev Tasks)
- Add columns to `orders`: `shipping_courier`, `shipping_service`, `shipping_cost`, `shipping_tracking_number`, `shipping_city_id`, `weight`
- Add `weight` column to `products` (default 300g)
- Create `/api/shipping/provinces`, `/api/shipping/cities`, `/api/shipping/cost` endpoints
- Add province/city dropdowns + courier selection UI to checkout
- Implement free shipping threshold (env var `FREE_SHIPPING_THRESHOLD`)
- Add tracking number input field in admin order detail
- Include tracking link in shipping email

### Cleanup Before Launch
- Delete `/api/test-email` route
- Remove `console.log` debug statements from `lib/email.ts`
- Set `RESEND_FROM_EMAIL=noreply@yourdomain.com` after domain verified
