# Clothing Store Website — Handoff Document

**Last updated:** 2026-06-12
**Status:** Zara-style redesign live in code; production still serving the previous design until the next Vercel deploy.
**Repo:** https://github.com/marshal-rizky/Moons-closet (private, branch `main`)
**Production URL:** https://clothing-website-beryl.vercel.app

---

## Quick orientation

- **What this is:** a Next.js 16 storefront + admin panel for a clothing business. Indonesia market, IDR, Bahasa Indonesia.
- **What's deployed today:** the original "warm neutrals" design (Cormorant + Montserrat).
- **What's in the codebase but not yet deployed:** a full Zara-aesthetic redesign of every storefront page. Admin is unchanged.
- **What's next:** push to `main` to redeploy with the redesign, then connect Vercel to GitHub for auto-deploy.

For the design rationale and conventions of the Zara redesign, see [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md).
For a snapshot of what was done in the redesign session, see [`history/2026-06-12-zara-redesign.md`](./history/2026-06-12-zara-redesign.md).

---

## What's built

### Storefront (public, Zara-style)
- **Home** (`/`) — Full-bleed editorial hero, marquee strip, asymmetric category grid, editorial split, 4-up latest products.
- **Shop** (`/shop`) — Sticky left side nav with numbered categories + search toggle, hero product, 2-up edge-to-edge grid.
- **Product detail** (`/product/[slug]`) — Vertical image stack, sticky right info column, outlined ADD button, plain accordion details.
- **Cart** (`/cart`) — Line items + sticky summary card.
- **Checkout** (`/checkout`) — Numbered sections, bottom-border inputs, sticky order summary.
- **Contact** (`/contact`) — Three numbered columns + outlined WhatsApp CTA.
- **404** (`app/not-found.tsx`) — Editorial `|404| HILANG`.
- **Menu drawer** — Full-screen multi-column nav opened from hamburger.
- **Back-to-top** — Outlined "↑ ATAS" pill.

### Admin panel (`/admin/*`) — auth-protected
- **Login** (`/admin/login`) — Supabase email/password.
- **Dashboard** (`/admin`) — Stats cards + recent orders.
- **Products** (`/admin/products`) — List with search + category filter; new/edit forms with multi-image upload.
- **Orders** (`/admin/orders`) — List with status badges; detail page with animated 4-step timeline and status updater.

### Email notifications (Resend)
- Admin order alert on new order
- Customer confirmation on status → "confirmed"
- Customer shipping notification on status → "shipped"
- Sender: `onboarding@resend.dev` sandbox (upgrade to verified domain before go-live)

### API routes
- `POST /api/orders` — Create order (server-side price recalculation, stock/size/active validation, admin email).
- `PATCH /api/orders/[id]` — Update status (customer email triggers).
- `POST /api/products`, `PUT /api/products/[id]`, `DELETE /api/products/[id]` — Product CRUD with field whitelisting and slug collision handling.
- `POST /api/upload` — Image upload to Supabase Storage.
- `GET /api/test-email` — Diagnostic, **remove before production**.

### Infrastructure & security
- Supabase clients: browser / server (SSR cookies) / admin (service role)
- Defense-in-depth admin auth: `proxy.ts` + server-side `getUser()` in admin dashboard layout
- Login page lives outside `(dashboard)` group to avoid redirect loops
- Cart context with localStorage persistence
- All branding from `NEXT_PUBLIC_*` env vars — nothing hardcoded
- Checkout hardened: server-side price lookup + recalculation, stock/size validation
- Product APIs: field whitelisting, input validation, slug collision handling
- Supabase RLS policies for data access control
- Remote image patterns configured for Supabase Storage

---

## Deployment

### Production
- **URL:** https://clothing-website-beryl.vercel.app
- **Platform:** Vercel (`marshal-rizkys-projects`)
- **Supabase:** https://mfndnciwfvkadggukmvq.supabase.co
- **GitHub:** https://github.com/marshal-rizky/Moons-closet (branch `main`)

### Environment variables (set on Vercel)
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin key |
| `NEXT_PUBLIC_STORE_NAME` | Wordmark + meta title |
| `NEXT_PUBLIC_STORE_TAGLINE` | Hero subtitle, footer |
| `NEXT_PUBLIC_STORE_WHATSAPP` | `628xxxxxxxxxx` format |
| `NEXT_PUBLIC_STORE_EMAIL` | Public contact + admin alert recipient |
| `NEXT_PUBLIC_STORE_ADDRESS` | Footer + contact page |
| `RESEND_API_KEY` | Required for transactional emails |
| `RESEND_FROM_EMAIL` | Optional, defaults to `onboarding@resend.dev` |

### To swap branding
Edit env vars in [Vercel → Settings → Environment Variables](https://vercel.com/marshal-rizkys-projects/clothing-website/settings/environment-variables), then redeploy.

### To enable auto-deploy
Vercel → project → Settings → Git → **Connect Git Repository** → `marshal-rizky/Moons-closet`. After that, `git push origin main` auto-deploys production; branch pushes get preview URLs.

---

## Local development

```bash
git clone git@github.com:marshal-rizky/Moons-closet.git
cd Moons-closet
cp .env.example .env.local   # fill in Supabase + Resend keys
npm install
npm run dev
```

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (admin only) |
| Fonts | system Helvetica (storefront body) + Cormorant (display) |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Email | Resend |
| Animations | Framer Motion (storefront FadeIn, menu drawer, cart badge) |
| Deployment | Vercel |

---

## Architecture notes

- Route groups: `(store)` for public, `(admin)` for protected, with nested `(dashboard)` inside `(admin)` so the login page can opt out of the auth check.
- `proxy.ts` (Next.js 16 convention, replaces deprecated `middleware.ts`) for route-level auth redirect.
- Client-side cart (no auth required for shoppers).
- Order flow: customer fills form → server validates and recalculates prices → order saved → admin reviews and updates status; status changes trigger customer emails.
- No payment gateway yet — admin confirms manually via WhatsApp.
- Products use soft delete (`is_active` flag).
- JSONB columns for `images`, `sizes`, and `order.items` to stay flexible.

---

## Outstanding / future work

### Pre go-live cleanup
- Delete `/api/test-email` route
- Remove `console.log` debug from `lib/email.ts`
- Verify a custom domain in Resend and set `RESEND_FROM_EMAIL=noreply@yourdomain.com`
- Replace "Nama Toko" defaults with the real store name / tagline / WhatsApp / address
- Upload real product photos (the design ships gradient swatch placeholders that disappear automatically once `product.images` is non-empty)

### Phase 2: Payment integration (Midtrans)
See [`for-owner/delivery-and-payments-guide.md`](./for-owner/delivery-and-payments-guide.md) for the business-side overview. Implementation tasks:
- Add Midtrans columns to `orders`: `payment_method`, `payment_status`, `midtrans_transaction_id`, `midtrans_snap_token`, `paid_at`
- `POST /api/payments/create` — server creates Midtrans transaction, returns `snap_token`
- `POST /api/payments/webhook` — verify signature, update payment status, restore stock on failure
- Update checkout to open Snap popup and handle success / pending / error callbacks
- Show payment status in admin order detail
- Payment expiry handling

### Phase 3: Delivery integration (RajaOngkir)
- Add columns to `orders`: `shipping_courier`, `shipping_service`, `shipping_cost`, `shipping_tracking_number`, `shipping_city_id`, `weight`
- Add `weight` to `products` (default 300g)
- `/api/shipping/provinces`, `/api/shipping/cities`, `/api/shipping/cost` endpoints
- Province / city dropdowns + courier selection in checkout
- Free shipping threshold via `FREE_SHIPPING_THRESHOLD` env var
- Tracking number input in admin order detail
- Include tracking link in shipping email

### Nice-to-have
- Mobile PLP side nav as horizontal scroll tabs (currently stacks vertically)
- Real product photography
- Wishlist / customer accounts
- Promo codes
- Analytics dashboard

---

## File map

```
app/
├── (store)/               # Public storefront (Zara redesign)
│   ├── layout.tsx         # Navbar + Footer + BackToTop
│   ├── page.tsx           # Home
│   ├── shop/              # PLP with sticky side nav
│   ├── product/[slug]/    # PDP with image stack + sticky info
│   ├── cart/              # Cart with sticky summary
│   ├── checkout/          # Checkout with bottom-border inputs
│   └── contact/           # Three numbered columns
├── (admin)/admin/         # Admin panel (unchanged from prior work)
│   ├── layout.tsx
│   ├── login/
│   └── (dashboard)/       # Auth-protected group
│       ├── layout.tsx     # getUser() check + sidebar
│       ├── page.tsx       # Dashboard
│       ├── products/      # CRUD
│       └── orders/        # Order management
├── api/                   # API routes
│   ├── orders/            # Create + status updates (with email)
│   ├── products/          # Field-whitelisted CRUD
│   ├── test-email/        # Diagnostic — remove before prod
│   └── upload/            # Supabase Storage
├── layout.tsx             # Root (loads Cormorant only)
├── not-found.tsx          # Editorial 404
└── globals.css            # Tokens + Zara swatches + base resets

components/
├── store/                 # All redesigned in Zara style
│   ├── navbar.tsx         # Sticky strip + full-screen drawer
│   ├── footer.tsx
│   ├── product-card.tsx
│   ├── product-gallery.tsx
│   ├── add-to-cart-button.tsx
│   ├── cart-item.tsx
│   ├── shop-toolbar.tsx
│   ├── product-card-skeleton.tsx
│   └── placeholder-image.tsx  # used by admin product list
├── admin/                 # Untouched
│   └── order-timeline.tsx
├── ui/                    # shadcn primitives + custom
│   ├── fade-in.tsx
│   ├── back-to-top.tsx
│   └── toast.tsx
└── providers.tsx          # Cart + Toast contexts

lib/
├── supabase/              # Browser / server / admin / middleware helper
├── cart-context.tsx
├── toast-context.tsx
├── email.ts               # Resend functions
├── config.ts              # siteConfig from env
├── types.ts
└── utils.ts

proxy.ts                   # Auth redirect (Next.js 16 convention)
next.config.ts             # Turbopack root + Supabase remote image patterns

supabase/
├── schema.sql             # Tables + RLS + indexes
└── seed.sql               # Sample products

docs/
├── HANDOFF.md             # This file
├── DESIGN-SYSTEM.md       # Zara redesign tokens + patterns
├── for-owner/             # Plain-language docs (Indonesian)
│   ├── delivery-and-payments-guide.md
│   ├── delivery-and-payments-guide.html
│   └── biaya-api-lengkap.html
└── history/               # Historical design + plan + session docs
    ├── 2026-05-15-part1-design.md
    ├── 2026-05-15-part1-plan.md
    ├── 2026-05-15-part2-design.md
    ├── 2026-05-15-part2-plan.md
    └── 2026-06-12-zara-redesign.md
```
