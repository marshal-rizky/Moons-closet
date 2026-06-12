# 2026-06-12 — Zara Storefront Redesign

**Session date:** 2026-06-12
**Scope:** All public storefront pages (`app/(store)/**`). Admin panel untouched.
**Trigger:** Owner wanted the storefront to look like https://www.zara.com/id/en/.

---

## Method

1. **Live extraction.** Used Playwright MCP to navigate Zara's site at 1440×900 (desktop) and 375×812 (mobile). Captured:
   - Home + hero typography
   - PLP grid (`/woman-dresses-l1066.html`)
   - PDP (`/short-dress-with-belt-p02354709.html`)
   - Menu drawer (opened via hamburger)
   - Mobile equivalents of all of the above

2. **DOM inspection** via `browser_evaluate` to read computed styles — fonts, weights, sizes, letter-spacing, colors — directly from the live site so the recreation was data-driven, not guessed.

3. **Implementation** matching the extracted tokens.

## Extracted Zara design tokens

| Token | Value |
|---|---|
| Body font | `"Helvetica Now Text", Helvetica, Arial, sans-serif` |
| Body weight | `300` |
| Body bg | `#ffffff` |
| Body fg | `#000000` |
| Default size | `16px` |
| Micro label size | `11–13px` |
| Letter-spacing | `normal` (Zara's wide tracking comes from the custom font, not CSS) |
| Text transform on labels | `uppercase` |
| Radius | `0` everywhere |

We substituted the system Helvetica stack for Zara's proprietary Helvetica Now Text (visually near-identical on macOS/iOS, falls back to Arial on Windows). Used Cormorant (already loaded) for the wordmark and oversized display since we can't reproduce Zara's custom logo SVG.

## Files changed

### Tokens / global

- `app/globals.css` — replaced warm-neutral palette with pure white/black, set all `--radius-*` to 0, dropped Montserrat from the font stack, added `text-transform: inherit` for form controls so utility classes propagate into `<button>`, added 8 `zara-swatch-N` gradient placeholder classes.
- `app/layout.tsx` — dropped Montserrat import, kept Cormorant for the wordmark variable.

### Layout

- `app/(store)/layout.tsx` — added Footer (was previously only on contact page).
- `components/store/navbar.tsx` — full rewrite: sticky thin top strip, hamburger + wordmark + tiny right-side links, full-screen menu drawer with 3-column nav and active-dot top categories.
- `components/store/footer.tsx` — 4-column micro-label grid, hairline dividers.

### Pages

- `app/(store)/page.tsx` — full-bleed editorial hero (88dvh + `mix-blend-difference`), marquee strip, asymmetric 12-col category grid (ATASAN takes 7 cols and 2 rows; BAWAHAN + DRESS stack on the right), editorial split section, 4-up latest-products grid.
- `app/(store)/shop/page.tsx` + `components/store/shop-toolbar.tsx` — sticky 180px left side nav with numbered `|01| VIEW ALL` buttons and `CARI` search toggle, hero product on top, 2-up edge-to-edge grid below.
- `app/(store)/product/[slug]/page.tsx` + `components/store/product-gallery.tsx` + `components/store/add-to-cart-button.tsx` — image stack (left, vertical scroll) + sticky info column (right, 360px), thin black-outlined ADD button, plain `<details>` accordion for product details.
- `app/(store)/cart/page.tsx` + `components/store/cart-item.tsx` — sticky summary card, hairline item rows, outlined +/− quantity buttons.
- `app/(store)/checkout/page.tsx` — bottom-border-only inputs, numbered sections, sticky order summary.
- `app/(store)/contact/page.tsx` — three numbered columns, hairline divider, single outlined CTA.
- `app/not-found.tsx` — minimal `|404| HILANG` editorial 404.
- `components/ui/back-to-top.tsx` — outlined "↑ ATAS" pill instead of the previous rounded shadow button.
- `components/store/product-card.tsx` — edge-to-edge image, tiny uppercase label, outlined `+` quick-add, deterministic swatch fallback.

## Bugs hit & fixed during verification

1. **Categories/products invisible on full-page screenshot.** `<FadeIn>` uses `whileInView` so content below the fold stayed `opacity: 0` in the screenshot — content was actually fine, only the verification method was wrong. Fixed by taking scrolled viewport shots.
2. **Buttons not uppercase even with `uppercase` parent.** Browser UA stylesheet resets `text-transform` and `letter-spacing` on form controls. Fixed globally in `app/globals.css` with `button, input, textarea, select { text-transform: inherit; letter-spacing: inherit; }`.
3. **Wordmark wrapping to two lines on mobile.** Header strip had no `position: relative` for the absolutely-positioned wordmark, and font size was too large for narrow viewports. Fixed by adding `relative` to the wrapper and reducing wordmark to `text-lg` on mobile with `whitespace-nowrap`.

## Verified working

- Desktop 1440×900: home, shop, PDP, cart, checkout, contact, menu drawer
- Mobile 375×812: home, shop, menu drawer
- Hot reload clean across the session — no compile errors in dev log

## Reference screenshots (not committed)

Live captures from zara.com were saved to repo root during extraction (e.g. `zara-home.png`, `zara-plp.png`, `zara-pdp.png`, `zara-menu.png`). New site captures saved as `new-home.png`, `new-shop.png`, `pdp-1.png`, `mobile-home-*.png`, etc. **All `.png` / `.jpg` at repo root are gitignored** (see `.gitignore` "dev screenshots" section).

## Tagged commit

The redesign + planning docs were squashed into one commit on the move to GitHub:

> `feat: redesign storefront in Zara aesthetic + planning docs`

Pushed to `main` of `github.com/marshal-rizky/Moons-closet` on 2026-06-12.
