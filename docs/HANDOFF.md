# Clothing Store Website — Handoff Document

**Date:** 2026-05-15
**Status:** 14/14 tasks complete — DEPLOYED
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
- **Footer** — 3-column: store info, quick links, contact details
- **404 Page** — Branded not-found page in Indonesian

### Admin Panel (`/admin/*`) — Auth-Protected
- **Login** (`/admin/login`) — Supabase email/password auth
- **Dashboard** (`/admin`) — Stats cards (pending orders, total products, monthly revenue) + recent orders table
- **Products** (`/admin/products`) — List with thumbnails, price, stock, active/inactive toggle
- **New Product** (`/admin/products/new`) — Full form: name, description, price, category, sizes, stock, multi-image upload
- **Edit Product** (`/admin/products/[id]/edit`) — Same form pre-filled, soft delete option
- **Orders** (`/admin/orders`) — Orders list with status badges, customer info
- **Order Detail** (`/admin/orders/[id]`) — Full order info, items list, status updater (pending → confirmed → shipped → done)

### API Routes
- `POST /api/orders` — Create order (server-side price recalculation, validates stock/sizes/active status)
- `PATCH /api/orders/[id]` — Update order status
- `POST /api/products` — Create product (field whitelist, slug generation with collision handling)
- `PUT /api/products/[id]` — Update product (validated, slug regeneration on name change)
- `DELETE /api/products/[id]` — Soft delete (sets is_active=false)
- `POST /api/upload` — Image upload to Supabase Storage (validates type/size)

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
- `NEXT_PUBLIC_STORE_EMAIL`
- `NEXT_PUBLIC_STORE_ADDRESS`

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

## Future Plans
- Delivery integration (JNE, GoSend, GrabExpress) — architecture kept malleable for this
- Payment gateway integration (Midtrans/Xendit)
- WhatsApp notification on new orders
- Real product photos to replace placeholder images
- Store name and branding finalization
- Stock decrement on order creation/confirmation

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
│   ├── orders/           # Order endpoints
│   ├── products/         # Product endpoints
│   └── upload/           # Image upload
├── layout.tsx            # Root layout
├── not-found.tsx         # Custom 404
└── globals.css           # Theme + Tailwind

components/
├── admin/                # Admin-specific components
├── store/                # Store-specific components
├── ui/                   # shadcn/ui primitives
└── providers.tsx         # Context providers

lib/
├── supabase/             # Supabase clients + middleware helper
├── cart-context.tsx      # Cart state management
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
- **Design Spec:** `docs/superpowers/specs/2026-05-15-clothing-store-design.md`
- **Implementation Plan:** `docs/superpowers/plans/2026-05-15-clothing-store-plan.md`
- **Readiness Audit:** `docs/READINESS_WORRIES.md` (most issues now resolved)
