# Clothing Store Website — Handoff Document

**Date:** 2026-05-15
**Status:** 12/14 tasks complete
**Branch:** master (13 commits)

---

## What's Built

### Storefront (Public)
- **Home** (`/`) — Hero section, category grid (Atasan/Bawahan/Dress), 8 latest products
- **Shop** (`/shop`) — Full catalog with category filter tabs, product grid
- **Product Detail** (`/product/[slug]`) — Image gallery, size selector, stock indicator, add-to-cart
- **Cart** (`/cart`) — Line items with quantity controls, empty state, running total
- **Checkout** (`/checkout`) — Form (name, WhatsApp, address, notes) → saves order to DB → success state
- **Contact** (`/contact`) — WhatsApp link, email, address (all from env vars)
- **Navbar** — Sticky header, desktop nav links, cart badge with item count, mobile hamburger (Sheet)
- **Footer** — 3-column: store info, quick links, contact details

### Admin Panel (`/admin/*`)
- **Login** (`/admin/login`) — Supabase email/password auth
- **Dashboard** (`/admin`) — Stats cards (pending orders, total products, monthly revenue) + recent orders table
- **Products** (`/admin/products`) — List with thumbnails, price, stock, active/inactive toggle
- **New Product** (`/admin/products/new`) — Full form: name, description, price, category, sizes, stock, multi-image upload
- **Edit Product** (`/admin/products/[id]/edit`) — Same form pre-filled, soft delete option
- **Orders** (`/admin/orders`) — Orders list with status badges, customer info
- **Order Detail** (`/admin/orders/[id]`) — Full order info, items list, status updater (pending → confirmed → shipped → done)

### API Routes
- `POST /api/orders` — Create order (validates WhatsApp format, generates order number)
- `PATCH /api/orders/[id]` — Update order status
- `POST /api/products` — Create product (auto-generates slug)
- `PUT /api/products/[id]` — Update product
- `DELETE /api/products/[id]` — Soft delete (sets is_active=false)
- `POST /api/upload` — Image upload to Supabase Storage (validates type/size)

### Infrastructure
- Supabase clients: browser, server (SSR cookies), admin (service role)
- Auth middleware protecting `/admin/*` routes (redirects to login)
- Cart Context with localStorage persistence
- All branding from `NEXT_PUBLIC_*` env vars — nothing hardcoded

---

## What's NOT Done

### Task 13: Final Polish & Verification
- Add dynamic metadata to root layout (from env vars)
- Create custom 404 page
- Run `next build` to verify no errors

### Task 14: Deploy to Vercel
- Install Vercel CLI
- Set up Supabase project (cloud)
- Run `schema.sql` and `seed.sql`
- Create storage bucket
- Configure env vars on Vercel
- Deploy
- Create admin user via Supabase dashboard

---

## Prerequisites Before Running

### 1. Supabase Project
Create a project at [supabase.com](https://supabase.com), then:
1. Run `supabase/schema.sql` in SQL Editor (creates tables, RLS policies, triggers, indexes, storage bucket)
2. Run `supabase/seed.sql` in SQL Editor (inserts 8 sample products)
3. Create a storage bucket named `product-images` (public)
4. Create an admin user: Authentication → Users → Add User (email/password)

### 2. Environment Variables
Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Store Branding (all customizable)
NEXT_PUBLIC_STORE_NAME=Nama Toko
NEXT_PUBLIC_STORE_TAGLINE=Tagline toko
NEXT_PUBLIC_STORE_WHATSAPP=628000000000
NEXT_PUBLIC_STORE_EMAIL=email@example.com
NEXT_PUBLIC_STORE_ADDRESS=Alamat toko
```

### 3. Run Locally
```bash
npm install
npm run dev
```
- Store: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Fonts:** Cormorant (headings) + Montserrat (body)
- **Language:** Bahasa Indonesia
- **Currency:** IDR (Rupiah)

## Architecture Notes
- Route groups: `(store)` for public pages, `(admin)` for protected pages
- Client-side cart (no auth required for shoppers)
- Order flow: customer fills form → order saved to DB → admin reviews & updates status
- No payment gateway — manual confirmation by admin
- Products use soft delete (`is_active` flag)
- JSONB columns for flexibility (images array, sizes array, order items)

## Future Plans
- Delivery integration (JNE, GoSend, GrabExpress) — architecture kept malleable for this
- Payment gateway integration
- Real product photos to replace placeholder images
- Store name and branding finalization

---

## File Map

```
app/
├── (store)/          # Public storefront
│   ├── layout.tsx    # Navbar + Footer wrapper
│   ├── page.tsx      # Home
│   ├── shop/         # Catalog
│   ├── product/[slug]/ # Product detail
│   ├── cart/         # Shopping cart
│   ├── checkout/     # Checkout form
│   └── contact/      # Contact info
├── (admin)/admin/    # Admin panel (auth-protected)
│   ├── layout.tsx    # Sidebar wrapper
│   ├── login/        # Login form
│   ├── page.tsx      # Dashboard
│   ├── products/     # CRUD
│   └── orders/       # Management
├── api/              # API routes
│   ├── orders/       # Order endpoints
│   ├── products/     # Product endpoints
│   └── upload/       # Image upload
├── layout.tsx        # Root layout
└── globals.css       # Theme + Tailwind

components/
├── admin/            # Admin-specific components
├── store/            # Store-specific components
├── ui/               # shadcn/ui primitives
└── providers.tsx     # Context providers

lib/
├── supabase/         # Supabase clients + middleware
├── cart-context.tsx   # Cart state management
├── config.ts         # Site config from env vars
├── types.ts          # TypeScript types
└── utils.ts          # cn() utility

supabase/
├── schema.sql        # Full DB schema + RLS
└── seed.sql          # Sample data

docs/
├── superpowers/specs/ # Design spec
└── superpowers/plans/ # Implementation plan
```

---

## Reference Docs
- **Design Spec:** `docs/superpowers/specs/2026-05-15-clothing-store-design.md`
- **Implementation Plan:** `docs/superpowers/plans/2026-05-15-clothing-store-plan.md`
