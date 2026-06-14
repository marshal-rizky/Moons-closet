# 2026-06-15 — Scalability Pass, Button Icons, Menu & Sort Fixes

**Session date:** 2026-06-15
**Scope:** Storefront polish + a scalability pass so the catalog and variations grow cleanly. All shipped to production (`main` → Vercel).
**Status:** Live. Still pre-launch / experimental (no custom domain yet — see [`../GO-LIVE.md`](../GO-LIVE.md)).

---

## Commits (this session, on `main`)

| Commit | Summary |
|---|---|
| `175cee8` | fix: menu drawer — remove fake categories and dead duplicate column |
| `2690879` | feat: button icons + fix clipped shop sidebar heading |
| `320cf6e` | feat: scalability pass — categories, pagination, per-size stock, admin |
| `460efb2` | fix: clearer shop sort labels (Termurah/Termahal) |

---

## 1. Menu drawer cleanup (`175cee8`)
The full-screen menu had three columns but only one worked — two were placeholder layout copied from Zara that didn't fit a single-brand women's store:
- Fake top categories (`Wanita` / `Anak` / `Aksesoris`) — Anak & Aksesoris don't exist; none were links.
- A `|01| Koleksi … |04| Dress` numbered column that was non-clickable decoration duplicating the real links beside it.

Replaced all three with **one functional numbered list** of the real category links (Cormorant editorial, `|0N|` index) + Kontak / WhatsApp under a divider. `components/store/navbar.tsx`.

## 2. Button icons (`2690879`)
Minimal, on-brand icons added (chosen over plastering every button — kept Zara restraint):
- **`/links` pills** — brand glyphs per pill (Globe, WhatsApp, Instagram, TikTok, Shopee→bag, Tokopedia→store). New `components/store/brand-icons.tsx` holds inline WhatsApp/Instagram/TikTok SVGs (lucide dropped brand icons); icon keys live in `lib/links.ts`.
- **Storefront CTAs** — lucide icons: add-to-cart (bag), cart→checkout (arrow), empty-cart (bag), checkout confirm (check), contact WhatsApp CTA (WhatsApp glyph), back-to-top (arrow-up).

## 3. Shop sidebar heading clip fix (`2690879`)
The fixed-`180px` sidebar had `lg:overflow-y-auto`, which makes CSS compute `overflow-x` to `auto` too, so the `text-3xl` Cormorant category title ("BAWAHAN") was clipped at the divider. Fix: column widened to `210px`, title dropped to `text-2xl` + `break-words`. Swept the storefront — no other instance of this pattern (the product-card `truncate` and admin table scroll are intentional).

## 4. Scalability pass (`320cf6e`)
Driven by a design/scalability review (more products, more variations). See the review summary below.

- **Categories single-source** — new `lib/categories.ts` is the one place categories live. It drives navbar, footer, shop side-nav, home grid, all labels, and the admin form/filter. Removed the 4 duplicated `CATEGORY_LABEL` maps + hardcoded nav lists, and the full-table category scans on home/shop. *Add a category by editing one file.*
- **Home category showcase** — uniform grid that adapts to any number of categories (was hand-composed for exactly 3 and broke with more).
- **Shop** — server-side pagination (`.range()`, 12/page) + sort (Terbaru / Termurah / Termahal) + "Hanya Tersedia" in-stock filter. No longer loads the entire catalog. `app/(store)/shop/page.tsx`, `components/store/shop-toolbar.tsx`.
- **Admin products** — server-side pagination + search + an **Arsip view with Pulihkan (restore)**. Previously loaded all rows and filtered client-side, and soft-deleted products were invisible/unrecoverable. Restore uses `PUT /api/products/[id]` with `is_active: true` (the PUT now accepts `is_active`).
- **Variation model → per-(color,size) stock.** `ProductVariant.sizes: [{size, stock}]` replaces the single per-color `stock`. PDP shows the selected color's sizes and disables sold-out sizes; the orders API validates and decrements the exact `(color, size)` cell; the admin form has a per-size stock grid. `products.stock` stays a derived total (sum of all cells). Existing data migrated by `scripts/migrate-variant-sizes.mjs` (old per-color stock distributed across sizes, totals preserved).
- **Atomic-safe stock decrement** — optimistic concurrency (re-read → apply → guarded update on unchanged total → retry on conflict) prevents lost updates under concurrent orders, with no DB migration. `app/api/orders/route.ts`.
- **Search index** — trigram GIN index added to `supabase/schema.sql` (query already uses ILIKE). **Still needs to be run in Supabase** — see GO-LIVE.

### Verified
`tsc --noEmit` + `npm run build` pass. Order flow tested against migrated data: exact per-cell decrement (e.g. Hitam L 2→0, Mocha S 3→2), oversell + missing-color guards return 400, optimistic path confirmed. Test orders cleaned up and stock restored to seed (40).

## 5. Shop sort labels (`460efb2`)
`Harga ↑ / ↓` arrows were ambiguous (users read ascending as "expensive"). Renamed to **Termurah / Termahal** (Shopee/Tokopedia convention). Sort logic unchanged and verified (Termurah lists 155k→225k).

---

## Notes / judgment calls
- **Categories**: consolidated into `lib/categories.ts` rather than a DB `categories` table — same maintainability win, no migration, right-sized for the store.
- **Atomic decrement**: chose optimistic concurrency over a plpgsql RPC because DDL can't be executed/tested from the agent environment, and shipping an untested stock function to a live store is riskier than the rare race it fixes.
- **Higgsfield skills** (downloaded 2026-06-15) generate images/video (product photos, ads, avatars, marketplace cards) — **not 3D models**. A brand 3D model was considered but isn't producible with these tools.

## Still open
- Run the trigram index SQL in Supabase (search optimization; works without it).
- `NEXT_PUBLIC_STORE_EMAIL` and `NEXT_PUBLIC_STORE_ADDRESS` still placeholder (contact page shows `email@example.com` / "Alamat toko").
- Pre-launch cleanup + domain go-live — see [`../GO-LIVE.md`](../GO-LIVE.md).
