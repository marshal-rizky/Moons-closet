# Design System — Zara-Inspired Storefront

**Applies to:** all public storefront pages (`app/(store)/**`)
**Does not apply to:** admin panel (`app/(admin)/**`), which keeps its functional shadcn defaults.

The storefront was redesigned to match Zara's aesthetic on 2026-06-12. This document captures the design tokens, component conventions, and patterns so future changes stay coherent.

---

## 1. Design principles

1. **Restraint over decoration.** No shadows, no rounded corners, no gradients on chrome. Imagery is the only visual richness.
2. **Tiny labels, huge imagery.** Product information is set in 11–13px uppercase tracking-wide. Product photos run edge-to-edge.
3. **Asymmetry with intention.** Numbered sections (`|01|`, `|02|`) and grid-breaking layouts (7-col + 5-col splits) replace evenly-spaced cards.
4. **Editorial typography.** A high-contrast serif (Cormorant) does the wordmark and display headlines; everything else is system Helvetica.
5. **Sticky utility, scrolling content.** Side navs and product info columns stay pinned while imagery scrolls past them.

---

## 2. Color tokens

Defined in `app/globals.css` `:root`. Use the CSS-var-backed Tailwind classes (`bg-background`, `text-foreground`, etc.), not raw hex.

| Token | Value | Use |
|---|---|---|
| `--background` | `#ffffff` | Page background |
| `--foreground` | `#000000` | Body text, borders, icons |
| `--secondary` / `--muted` / `--accent` | `#f4f4f4` | Subtle fills, hover swatches |
| `--muted-foreground` | `#767676` | De-emphasized labels |
| `--border` / `--input` / `--ring` | `#000000` | All borders are pure black |
| `--destructive` | `#c10000` | Error states only |
| `--radius` | `0` | **Everything is square-cornered.** |

Dark mode tokens exist for completeness but the storefront is light-mode-only by intent.

---

## 3. Typography

```css
--font-sans: "Helvetica Neue", Helvetica, Arial, sans-serif;
--font-heading: var(--font-heading), "Cormorant", ui-serif, Georgia, serif;
body { font-weight: 300; letter-spacing: 0.005em; }
```

- **Body / UI:** system Helvetica stack at weight 300. No Google Fonts loaded for sans — keeps it fast and "design-less" in the Zara way.
- **Display / wordmark:** Cormorant (Google Font, already loaded). Used only for the store wordmark and oversized hero/section headlines via `font-heading`.

### Type scale

| Use | Tailwind | Notes |
|---|---|---|
| Micro label (nav, breadcrumb, badges) | `text-[11px] tracking-[0.08em]–[0.18em] uppercase` | Wide letter-spacing is the visual signature |
| Small label / button | `text-[12px] tracking-[0.04em]–[0.12em] uppercase` | |
| Product title (in grid + PDP) | `text-[11px]–[15px] uppercase` | Sentence case is reserved for product description prose |
| Body prose (PDP description) | `text-[13px]–[15px] leading-[1.7]` | Sentence case |
| Section heading | `font-heading text-4xl–text-7xl uppercase` | Cormorant serif |
| Hero / wordmark | `font-heading text-6xl–text-[120px]` | Cormorant; tight tracking `[0.04em]–[0.18em]` |

---

## 4. Layout patterns

### 4.1 Page chrome

- **Sticky top header** `h-12` (mobile) / `h-14` (desktop) — `sticky top-0`, no border, white bg.
  - Left: hamburger (a single `h-px w-6` horizontal line)
  - Center (mobile only): wordmark in Cormorant, tracked wide
  - Right: tiny uppercase links — `SEARCH`, `TAS [count]`, `KONTAK`
- **Full-screen menu drawer** (3-column on desktop, single column on mobile) — opened from hamburger, contains:
  - Top categories with active-dot marker
  - Numbered sections `|01| KOLEKSI`, `|02| ATASAN`…
  - Product link column
  - WhatsApp / contact under a hairline divider
- **Footer** — 4-column grid of micro-label links + © line, hairline `border-foreground/10` divider.

### 4.2 Hero (home page)

Full-bleed swatch (88dvh), oversized Cormorant headline with `mix-blend-difference` for high contrast over whatever image is behind. Center-stacked: `presents` superscript → big headline → tagline. Replace the swatch with a real photo once available — the blend mode handles contrast automatically.

### 4.3 PLP (`/shop`)

Two-column grid: `lg:grid-cols-[180px_1fr]`.

- **Left side nav** (sticky on `lg+`): page title, product count, numbered category buttons, search toggle.
- **Right product column:** hero product (max-w-820, single column) then 2-up edge-to-edge grid (`gap-x-px` on desktop for a near-touching look).

### 4.4 PDP (`/product/[slug]`)

Two-column grid: `lg:grid-cols-[1fr_360px]`.

- **Image stack (left):** every product image rendered vertically full-width — no thumbnails, you just scroll.
- **Sticky info column (right):** name, price, hairline, SKU + category, size buttons, outlined ADD button, description prose, accordion details.

### 4.5 Cart / Checkout

Two-column: `lg:grid-cols-[1fr_360px]` (cart) and `lg:grid-cols-[1fr_380px]` (checkout). Left = items / form. Right = sticky summary card with hairline border, ringed by `border-foreground/10`.

---

## 5. Components

### 5.1 Buttons

There are essentially **two button styles** on the storefront:

| Style | Use | Classes |
|---|---|---|
| **Outline primary** | Add to cart, confirm checkout, all CTAs | `border border-foreground py-4 text-[12px] tracking-[0.12em] uppercase hover:bg-foreground hover:text-background` |
| **Text link** | Secondary actions, "lihat semua", filters | `text-[11px] tracking-[0.12em] uppercase underline underline-offset-[6px]` |

No filled-black buttons, no rounded buttons, no shadow. Disabled state: `disabled:opacity-50`.

### 5.2 Product card (`components/store/product-card.tsx`)

- 3:4 aspect ratio, edge-to-edge image (no padding inside the image box)
- Below: 11px uppercase truncated title + 11px tabular-nums price + outlined `+` quick-add square
- `large` prop bumps image resolution and `priority` for the PLP hero slot

### 5.3 Forms (`checkout/page.tsx`)

Inputs use **bottom-border-only** style: `border-b border-foreground/30 bg-transparent py-3 text-[14px] focus:border-foreground`. Labels sit above as 11px uppercase. No filled input bg, no rounded inputs.

### 5.4 Accordion (PDP details)

Plain `<details>` with `border-b border-foreground/10` separators and a `+` indicator that rotates to `×` (45deg) on open. Uppercase 11px headings, sentence-case body inside.

### 5.5 Toast & back-to-top

- Toast styling lives in `components/ui/toast.tsx` — kept structurally as-is, themed via tokens
- Back-to-top button is a thin outlined "↑ ATAS" pill, bottom-right (`components/ui/back-to-top.tsx`)

---

## 6. Imagery & placeholders

Until real product photos are available, the codebase ships **8 deterministic gradient swatches** (`zara-swatch-1` through `zara-swatch-8`) defined in `globals.css`. Product cards, galleries, and cart items pick a swatch via a stable hash of the product slug or ID — so the same product always shows the same swatch.

When real photos arrive, no changes needed: the swatch is only rendered when `product.images.length === 0`.

---

## 7. Motion

**Updated 2026-06-15.** The storefront now uses **expressive but performance-budgeted** motion — a deliberate departure from the original "restraint extends to motion" stance. Full rationale + scope in [`superpowers/specs/2026-06-15-motion-graphics-design.md`](./superpowers/specs/2026-06-15-motion-graphics-design.md). The "Celestial Editorial" concept is driven by the brand crescent mark.

**Tiering** (intensity by surface, so spectacle lives where it films best and the buying flow stays fast):

- **Home — full:** logo-driven hero entrance (`components/store/hero-entrance.tsx`) + crescent-wipe page transitions + moon loader.
- **Shop / Product — light:** page transitions, moon loader, PDP gallery reveal/crossfade on color switch.
- **Cart — light:** add-to-cart star-burst micro-interaction.
- **Checkout — none:** stays clean and instant (page transition explicitly skips `/checkout`).

**Foundations:**

- `lib/motion.ts` — single source of truth for durations, easings, glow, and the `crescentWipe` variant.
- `lib/motion-context.tsx` — `MotionProvider` + `useMotionEnabled()`: respects `prefers-reduced-motion` and exposes a global kill switch (`MOTION_ENABLED`).
- Animate **transform / opacity only**; glow is a one-shot `drop-shadow`, not a continuous animation.
- Every animated element is **visible by default** (SSR-safe) — motion is additive, never an `opacity:0` trap.

**Pre-existing entrance conventions (still in use):**

- `<FadeIn>` wrapper (`components/ui/fade-in.tsx`) — 16px upward translate, 0.4s ease-out, `whileInView` with `once: true`.
- Cart badge: `AnimatePresence` keyed on count for a small pop on change.
- Menu drawer: backdrop fade 0.18s, content slide-up 0.25s, slight delay so the backdrop appears first.
- Back-to-top: fade + small y translate.

---

## 8. Accessibility notes

- All interactive elements meet 44px touch target via padding or hit-area expansion (size chips use `min-w-[44px]`, header buttons use `h-10 w-10` even when their visual mark is a 24px line).
- Focus rings use `outline-ring/50` (the foreground color at 50% opacity) — visible but in-style.
- Uppercase + wide letter-spacing reduces legibility for users with dyslexia, but is reserved for short labels (≤30 chars). Long-form text stays sentence case.
- Color contrast is maximum: pure black on pure white = 21:1.

---

## 9. Brand assets (added 2026-06-12)

Source logo (rose-gold on cream) processed by `scripts/process-logo.py` into `public/brand/`:

| Asset | Use |
|---|---|
| `logo-black-nav.png` | Navbar + menu drawer wordmark (720px, display ≤360px) |
| `logo-black.png` | Footer brand column, light backgrounds |
| `logo-white.png` | Home hero inside `mix-blend-difference` container |
| `logo-gold.png` | Original metallic version — reserve for special placements |
| `mark-gold.png` | Moon divider (home), links page header, favicon source |
| `mark-black.png` | 404 page; monochrome contexts |
| `app/icon.png` | Favicon — gold mark on cream |

Rules:
- **Cream `#faf0e6`** is exposed as the `cream` Tailwind color (`bg-cream`) — the ONLY sanctioned non-B/W chrome color. Current uses: moon divider band, `/links` page background, favicon, and motion surfaces (hero-entrance overlay, page-transition wipe, moon loader). Do not spread it further without a system-level discussion.
- **Gold `#b08d57`** (exported as `GOLD` in `lib/motion.ts`) appears in: moon divider mark, links page mark, favicon, and motion accents (hero-entrance crescent + hairlines, moon loader disc, add-to-cart star-burst, the `CrescentMark` SVG). Everything else uses the black (or white-blend) logo.
- Color variant swatches on product cards/PDP use each variant's `hex` inline — product data, not chrome.

## 10. What's intentionally NOT in the system

- No filled buttons (only outlined)
- No rounded corners anywhere (`--radius: 0`)
- No shadows on cards or modals
- No gradient meshes, no glass effects
- No Inter, no Geist, no rounded sans-serif
- No emoji icons (lucide only, used sparingly)

If a future change needs any of the above, treat it as a system-level discussion, not a one-off override.
