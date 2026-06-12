# Moon's Closet — Variants, Branding, Photos, Config

## Context

Owner requests after Zara redesign went live: (1) storefront is too text-only — integrate the Moon's Closet brand logo + subtle moon theme; (2) upcoming catalog has one product in multiple colors — UI must support color variants; (3) Google Drive photos: one barrel-leg pants in 4 colors (12 photos) + brand logo on cream background to extract; (4) WhatsApp business number 6287702228429.

Decisions (owner confirmed): single product with internal color variants; dual logo (pure-black for chrome, original rose-gold for hero/favicon, subtle cream accent allowed); placeholder product name/price (editable in admin); medium moon-theme intensity.

Assets downloaded to `C:\Users\User\AppData\Local\Temp\mooncloset-drive\`:
- 12 product jpgs 4000×5000: Mocha (2102,2119,2123), Hitam (2720,2721,2732), Cream (4314,4320,4321), Abu-abu (4559,4568,4571)
- `image0.png` 1254×1254 logo, flat cream bg `#faf0e6`-ish (corner px `(250,235,222)`). Chroma-key extraction already prototyped in temp — works clean on black + white.

## Data shapes

```ts
// lib/types.ts additions
export type ProductVariant = {
  color: string;    // "Mocha"
  hex: string;      // "#6b4f3a"
  images: string[]; // max 5
  stock: number;    // per-color
};
// Product  += variants: ProductVariant[]
// CartItem += color: string | null   (null = legacy product)
// OrderItem += color: string | null
```

Invariant: when `variants.length > 0`, `product.stock` = derived sum of variant stocks (enforced by products API on save, orders API on decrement). Legacy products (`variants: []`) keep using `images`/`stock` — existing seed data unaffected.

New `lib/variants.ts` (pure helpers): `hasVariants`, `getVariant` (case-insensitive), `resolveSelectedVariant(p, colorParam?)` → matched variant else `variants[0]` else null, `effectiveImages(p, variant?)`, `effectiveStock(p, variant?)`.

## PDP color switching: `?color=` searchParam (chosen)

PDP is a server component; gallery and AddToCartButton are siblings in separate grid columns. SearchParam keeps architecture untouched: page resolves variant once, passes props to both. Swatches = `<Link href={...?color=X} replace scroll={false} prefetch>` — near-instant with router cache, shareable URLs, Zara-like. Invalid/missing `?color=` → silently default `variants[0]`.

## Phase 0 — Manual SQL (user runs in Supabase dashboard)

```sql
ALTER TABLE products ADD COLUMN variants JSONB DEFAULT '[]'::jsonb;
```
Also append to `supabase/schema.sql`. Blocks runtime of Phases 4/5/8 only; code work starts immediately.

## Phase 1 — Variant plumbing

- `lib/types.ts` — types above
- `lib/variants.ts` — new helpers
- `lib/cart-context.tsx` — cart key `(product_id, size, color)`; `removeItem`/`updateQuantity` gain `color` param; normalize loaded localStorage items with `color: i.color ?? null`
- `components/store/cart-item.tsx` — show `· {color}` next to size; pass color to mutations
- `app/(store)/cart/page.tsx` + `checkout/page.tsx` — list keys include color; checkout POST items include `color`

## Phase 2 — PDP

- `app/(store)/product/[slug]/page.tsx` — read `searchParams` (Promise in Next 16), `resolveSelectedVariant`, pass `effectiveImages` to gallery, `selectedVariant` to ATC, render ColorSwatches in info column; accordion lists available colors
- New `components/store/color-swatches.tsx` (server comp) — `WARNA` micro-label + selected name; `h-7 w-7` square swatch Links (inline hex bg), selected = `outline outline-1 outline-offset-2 outline-foreground`, out-of-stock = `opacity-40` + line-through overlay but clickable; 44px touch targets; design-system compliant (square, no shadow)
- `components/store/add-to-cart-button.tsx` — `selectedVariant` prop drives stock/outOfStock; addItem payload gains `color` + variant first image
- `product-gallery.tsx` — unchanged (already takes `images[]`)

## Phase 3 — Product card

- `components/store/product-card.tsx` — image from `effectiveImages(product)[0]`; under price: up to 4 square dots `h-2 w-2 border border-foreground/20` inline hex + `+N` label if more

## Phase 4 — APIs

- New `lib/validate-variants.ts` — array ≤12; each: non-empty unique color (case-insens), hex `/^#[0-9a-fA-F]{6}$/`, images ≤5 strings, stock int ≥0
- `app/api/products/route.ts` + `[id]/route.ts` — accept `variants`; when non-empty force `stock = sum`
- `app/api/orders/route.ts`:
  - item validation allows optional `color`
  - product fetch selects `variants`
  - per-item: variants present → require color, match case-insensitively (400 `Warna "X" tidak tersedia` if stale/deleted), stock check vs variant, store canonical color + variant image
  - stock decrement: **aggregate per (product_id, color) first** (two colors of same product in one order would clobber otherwise), write updated variants array + derived stock; legacy path unchanged. RMW race pre-exists — comment, out of scope
- `lib/email.ts` — item lines render `(${size} / ${color})` when color present

## Phase 5 — Admin

- `components/admin/product-form.tsx` — "Varian Warna" section: rows (color name, `<input type="color">` + hex text, per-variant stock, per-variant image strip reusing existing `/api/upload` pattern, remove), "Tambah Varian"; when variants exist disable legacy Stok (show computed total), legacy photos marked optional; submit includes `variants`
- `app/(admin)/admin/(dashboard)/products/product-list.tsx` — stock cell: `Stok: N · M warna`
- `app/(admin)/admin/(dashboard)/orders/[id]/page.tsx` — item line shows `/ {color}`

## Phase 6 — Logo asset pipeline (independent track)

New `scripts/process-logo.py` (Pillow verified installed; chroma-key approach already validated in temp). Input `%TEMP%\mooncloset-drive\image0.png` → outputs committed to `public/brand/`:
1. Chroma-key cream bg, un-blend fringe → `logo-gold.png` (trimmed + 4% pad)
2. Alpha-preserving recolor → `logo-black.png`, `logo-white.png`
3. Crop double-crescent mark → `mark-gold.png`, `mark-black.png` (tune crop box by viewing output)
4. `app/icon.png` 512×512 — gold mark on cream square; **delete `app/favicon.ico`**
5. `logo-black-nav.png` 720px wide (2× for ~360px display)

Run once, visually verify each PNG (Read tool), commit.

## Phase 7 — Brand integration (medium moon theme)

- `.env.local`: `NEXT_PUBLIC_STORE_NAME="Moon's Closet"`, `NEXT_PUBLIC_STORE_WHATSAPP="6287702228429"`, tagline placeholder `"Koleksi pilihan untuk setiap fase"` (owner can change). **Manual step documented in README: same vars in Vercel → redeploy**
- `app/globals.css`: add `--color-cream: #faf0e6` to `@theme` (only sanctioned non-B/W chrome color)
- `components/store/navbar.tsx`: replace both text wordmarks (mobile center ~line 55, drawer header ~line 119) with `<Image src="/brand/logo-black-nav.png" className="h-6 w-auto sm:h-7" priority>`; **show centered logo on desktop too** (currently mobile-only; verify no collision with right links at 640–768px)
- `components/store/footer.tsx`: brand column heading → small `logo-black.png` (h-5) above tagline
- `app/(store)/page.tsx` hero: replace `{siteConfig.name} presents` text with `logo-white.png` (h-8 sm:h-12) inside existing `mix-blend-difference` container; keep KOLEKSI BARU headline
- New `components/store/moon-divider.tsx`: full-width `bg-cream` band, centered `mark-gold.png` h-8 flanked by hairlines, `py-10`; insert once on home between editorial split and latest products
- `app/not-found.tsx`: `mark-black.png` above `|404|`
- `docs/DESIGN-SYSTEM.md`: append "Brand assets" section (inventory, cream token rule, where gold allowed)

## Phase 8 — Photos + seed product

- New `scripts/process-photos.py`: 12 jpgs → max 1600px LANCZOS, JPEG q82 → `scripts/out/` (gitignored)
- New `scripts/seed-product.mjs` (`node --env-file=.env.local`): supabase-js with service-role key (bypasses RLS; NOT via `/api/upload` which needs session); upload to `product-images` bucket as `seed/celana-barrel-{color}-{n}.jpg`; abort if slug exists; insert:

```js
{ name: "Celana Barrel High Waist", slug: "celana-barrel-high-waist",
  price: 185000, category: "bawahan", sizes: ["S","M","L","XL"],
  stock: 40, images: [], is_active: true,
  variants: [
    { color: "Mocha",   hex: "#6b4f3a", images: [3 urls], stock: 10 },
    { color: "Hitam",   hex: "#1a1a1a", images: [3 urls], stock: 10 },
    { color: "Cream",   hex: "#e8dcc8", images: [3 urls], stock: 10 },
    { color: "Abu-abu", hex: "#4a4a4a", images: [3 urls], stock: 10 },
  ] }
```
(hex eyeballed vs photos during implementation)

## Phase 9 — Link-in-bio page (Linktree-style)

Owner wants a Linktree-equivalent (ref: linktr.ee/inessaofficial) for social bios. No external links exist yet — build structure now, fill later.

- New `lib/links.ts` — single editable array: `{ label, href, enabled }[]`. Ship with: Shop (`/shop`, enabled), WhatsApp (`https://wa.me/{siteConfig.whatsapp}`, enabled), Instagram / TikTok / Shopee / Tokopedia (placeholder `href: ""`, `enabled: false`). Only enabled entries render — adding a link later = edit one file
- New `app/links/page.tsx` — **standalone route outside `(store)` group** (no navbar/footer, like a real Linktree): centered mobile-first column (max-w-md), `mark-gold.png` small on top, `logo-black.png` wordmark, tagline micro-label, then full-width outlined buttons in design-system style (`border border-foreground py-4 text-[12px] tracking-[0.12em] uppercase hover:bg-foreground hover:text-background`), hairline footer line `© Moon's Closet`. Cream background (`bg-cream`) for the page — brand moment, consistent with moon-divider accent
- Add `metadata` (title "Moon's Closet — Links"); page is static
- URL to put in bios: `https://<domain>/links`

## Order & dependencies

Phase 0 (user) → unblocks runtime. Code: 1→2→3, then 4→5. Track 6→7 independent/parallel. 8 after 0+4. 9 after 6 (needs logo assets). Verify last.

## Edge cases

- Legacy products: helpers fall back, no color UI, `color: null`
- Old localStorage carts: normalized on load; `null` ≠ any color string in merge keys
- Stale cart/deleted variant: orders API 400 with clear message (checkout surfaces it)
- Invalid `?color=`: default `variants[0]`, never 404
- Variant out of stock: swatch crossed but navigable; full out-of-stock when sum = 0
- Same product 2 colors in 1 order: decrement aggregation handles
- Concurrent order RMW race: pre-existing, documented only

## Verification

1. `npx tsc --noEmit` + `npm run build` pass
2. Playwright MCP 375×812: home (logo, hero blend, moon divider, card dots), PDP swatch-switch all 4 colors (gallery swap, URL update, scroll preserved, per-color stock), cart with 2 colors + 1 legacy product as separate lines
3. Playwright 1440×900: navbar logo no collision, PDP sticky columns, PLP
4. Order flow with mixed colors → Supabase: items have color, per-variant stocks decremented, derived stock updated, admin order detail + email show color
5. Admin: edit seeded product variants, save, derived stock correct
6. Favicon renders; 404 mark; image sizes sane via next/image
7. Manual (user): Vercel env vars `NEXT_PUBLIC_STORE_NAME` + `NEXT_PUBLIC_STORE_WHATSAPP` → redeploy
