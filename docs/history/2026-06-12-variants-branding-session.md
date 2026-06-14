# 2026-06-12 — Color Variants, Moon's Closet Branding, Links Page

**Session date:** 2026-06-12
**Scope:** Product color variants (full stack), brand logo + moon theme integration, a Linktree-style `/links` page, a real product seed, WhatsApp/store-name config, plus a Vercel deploy fix.
**Status:** All shipped to production (`main` → Vercel auto-deploy). Env vars updated on Vercel.

For the upfront design + decisions, see [`2026-06-12-variants-branding-plan.md`](./2026-06-12-variants-branding-plan.md).

---

## 1. Deploy fix (blocked deployment)

The previous push (`75559f9`, docs reorg) showed **BLOCKED** in Vercel — not a build failure.

- **Cause:** the commit was authored with `marshal.rizky@gmail.com`, which GitHub maps to a *different* account (`marshal11671`). Vercel's Hobby plan blocks Git deploys whose commit author isn't the connected account owner (`marshal-rizky`).
- **Fix:** set repo git email to `manmantab50@gmail.com` (the `marshal-rizky` / Vercel account), pushed an empty trigger commit (`14d4d92`). Deploy went green.
- **Going forward:** keep `git config user.email` = `manmantab50@gmail.com` for any commit that must deploy. If a deploy is BLOCKED with empty build logs, check `githubCommitAuthorLogin` in the deployment meta first.

---

## 2. Product color variants (full stack)

Same product sold in multiple colors — one product entry, internal variants.

### Data model
- **`supabase/schema.sql`** — added `variants JSONB DEFAULT '[]'::jsonb` to `products`. Manual `ALTER TABLE` was run in the Supabase dashboard.
- **`lib/types.ts`** — new `ProductVariant { color, hex, images, stock }`; `Product.variants`; `CartItem.color` and `OrderItem.color` (nullable — `null` = legacy product).
- **Invariant:** when `variants.length > 0`, `product.stock` is **derived** = sum of variant stocks (enforced by the products API on save and the orders API on decrement). Legacy products (`variants: []`) keep using `images`/`stock` unchanged.

### Helpers — `lib/variants.ts`
`hasVariants`, `getVariant` (case-insensitive), `resolveSelectedVariant(p, colorParam?)` (matched → `variants[0]` → null), `effectiveImages`, `effectiveStock`.

### Storefront
- **PDP** (`app/(store)/product/[slug]/page.tsx`) — reads `?color=` searchParam (server-rendered, shareable, no client state plumbing). Resolves the variant once, passes effective images to the gallery and the selected variant to the add-to-cart button.
- **`components/store/color-swatches.tsx`** (new) — square hex swatches as `<Link replace scroll={false}>`; selected = outline ring; out-of-stock = dimmed + diagonal line, still clickable. 44px touch targets.
- **`add-to-cart-button.tsx`** — stock/out-of-stock driven by the selected variant; cart payload carries `color` + the variant's first image.
- **`product-card.tsx`** — shows up to 4 colour dots (+N overflow) under the price; image falls back through `effectiveImages`.
- **Cart/checkout** — cart key is now `(product_id, size, color)`; line items show the colour; old localStorage carts are normalized to `color: null` on load.

### APIs
- **`lib/validate-variants.ts`** (new) — validates the variants array (≤12, unique case-insensitive colour, `#rrggbb` hex, ≤5 images, integer stock ≥0).
- **`app/api/products/route.ts` + `[id]/route.ts`** — accept `variants`; when non-empty, force `stock = sum(variant stocks)`.
- **`app/api/orders/route.ts`** — validates colour exists (400 on stale-cart / deleted variant), checks per-colour stock, **aggregates decrements per `(product_id, color)`** so two colours of one product in a single order don't clobber each other. Pre-existing read-modify-write race is documented, not fixed.
- **`lib/email.ts`** — order item rows render `(size / color)` when colour is present.

### Admin
- **`components/admin/product-form.tsx`** — "Varian Warna" editor: per-row colour name, `<input type=color>` + hex, per-variant stock, per-variant image upload (reuses `/api/upload`). When variants exist, the legacy stock field is replaced by a computed total and legacy photos become an optional fallback.
- **Product list + order detail** — show colour count / per-item colour.

---

## 3. Brand: Moon's Closet logo + moon theme

### Asset pipeline — `scripts/process-logo.py`
Input: the rose-gold-on-cream logo (`image0.png`). One-off chroma-key + recolor pipeline → committed to `public/brand/`:

| Asset | Use |
|---|---|
| `logo-gold.png` | original metallic, transparent bg |
| `logo-black.png` / `logo-white.png` | recolored (alpha gamma-lifted so thin serifs survive) |
| `logo-black-nav.png` | wordmark **cropped above the star ornament** so it sits ~50% wider at the same header height |
| `logo-white-nav.png` | same crop, white (hero) |
| `logo-gold-divider.png` | full gold logo pre-rendered at 2× the divider display height |
| `mark-gold.png` / `mark-black.png` | the double-crescent mark alone |
| `mark-divider.png` | crescent pre-rendered at 2× (kept for reference; divider now uses the full logo) |
| `avatar.png` | round avatar for `/links` (gold mark on cream) |
| `app/icon.png` | favicon (gold mark on cream); old `favicon.ico` deleted |

**Key technique:** small marks/wordmarks are *pre-rendered at 2× their CSS display height* with an alpha gamma-lift and served `unoptimized`, because downscaling the 383–1021px masters in-browser thinned hairline strokes to invisibility.

### Integration
- **Navbar** (`navbar.tsx`) — text wordmark replaced with `logo-black-nav.png`, centered on **both mobile and desktop**.
- **Hero** (`app/(store)/page.tsx`) — `logo-white-nav.png` inside the existing `mix-blend-difference` container, displayed large (h-12 mobile / h-20 desktop).
- **Footer** (`footer.tsx`) — cropped wordmark, `self-start` to stop flex-column stretch distortion.
- **Moon divider** (`components/store/moon-divider.tsx`, new) — cream band with the **full gold logo**, between the editorial split and latest-products sections on the home page.
- **404** (`not-found.tsx`) — black mark above the `|404|` label.
- **`app/globals.css`** — added `--color-cream: #faf0e6` token (`bg-cream`), the only sanctioned non-B/W chrome colour.
- **`next.config.ts`** — added `images.localPatterns` for `/brand/**?v=2` (Next 16 blocks query strings on local images unless allow-listed). Brand `src`s carry `?v=2` as a cache-buster.
- **`docs/DESIGN-SYSTEM.md`** — appended a "Brand assets" section (inventory + where gold/cream are allowed).

---

## 4. Real product seed

- **`scripts/process-photos.py`** — downscales the 12 Drive photos to ≤1600px, JPEG q82 → `scripts/out/` (gitignored).
- **`scripts/seed-product.mjs`** — uploads to the Supabase `product-images` bucket (service-role key, bypasses RLS) and inserts one product: **Celana Barrel High Waist**, Rp 185.000, category `bawahan`, sizes S/M/L/XL, 4 colour variants (Mocha / Hitam / Cream / Abu-abu), 3 photos + 10 stock each. Hex values were sampled from the actual photos. Idempotent: aborts if the slug already exists.
- **Verified end-to-end:** placed a 2-colour test order → DB items carried colour, per-variant stocks decremented independently (Hitam 10→9, Cream 10→9), derived total updated. Test order removed afterward.

---

## 5. Links page (Linktree-style)

- **`app/links/page.tsx`** — standalone route (no storefront chrome), modeled on linktr.ee/inessaofficial: round avatar, wordmark, tagline, optional Instagram icon (inline SVG — `lucide-react` dropped brand icons), pill buttons, and section headings.
- **`lib/links.ts`** — config: `bioProfile` (social icons) + `bioSections` (grouped pill links). Active today: **Website — Belanja Koleksi** (`/shop`) and **Order & Pertanyaan — WhatsApp**. Disabled placeholders (hidden until `href` filled + `enabled: true`): Instagram, TikTok Shop, Shopee, Tokopedia.
- **Bio URL:** `https://clothing-website-beryl.vercel.app/links`

---

## 6. Config / env vars

- **`.env.local`** updated: `NEXT_PUBLIC_STORE_NAME="Moon's Closet"`, `NEXT_PUBLIC_STORE_TAGLINE="Koleksi pilihan untuk setiap fase"`, `NEXT_PUBLIC_STORE_WHATSAPP="6287702228429"` (WA business number).
- **Vercel:** the same three vars were updated in the project's Environment Variables and redeployed. ✅ Done.

---

## Commits (this session, on `main`)

| Commit | Summary |
|---|---|
| `14d4d92` | chore: trigger redeploy with correct commit author |
| `437284b` | feat: color variants, Moon's Closet branding, link-in-bio page |
| `a565f34` | fix: logo legibility — wider nav wordmark, solid strokes, visible mark |
| `72c1dbe` | fix: hero logo uses cropped white wordmark, displayed larger |
| `903ce05` | fix: divider crescent mark — pre-render at 2x display size |
| `e9bd20f` | feat: moon divider uses the full gold logo instead of crescent mark |
| `688d4e8` | feat: restyle /links to Linktree-pattern profile page |

---

## Still open / future

- Fill the social/marketplace links in `lib/links.ts` once the accounts exist (Instagram, TikTok Shop, Shopee, Tokopedia) — buttons appear automatically.
- Minor: a hydration console warning when the cart is non-empty (cart context reads localStorage on first render). Harmless; fix in a follow-up if desired.
- Pre-go-live items from `HANDOFF.md` still stand (delete `/api/test-email`, verify Resend domain, etc.).
