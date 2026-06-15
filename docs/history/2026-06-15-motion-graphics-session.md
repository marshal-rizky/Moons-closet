# 2026-06-15 — Motion Graphics ("Celestial Editorial")

**Session date:** 2026-06-15
**Scope:** Storefront motion layer (`app/(store)/**`). Admin untouched.
**Status:** Live. Shipped to production (`main` → Vercel). Still pre-launch / experimental (no custom domain — see [`../GO-LIVE.md`](../GO-LIVE.md)).

Design + plan: [`../superpowers/specs/2026-06-15-motion-graphics-design.md`](../superpowers/specs/2026-06-15-motion-graphics-design.md), [`../superpowers/plans/2026-06-15-motion-graphics.md`](../superpowers/plans/2026-06-15-motion-graphics.md). Token/convention reference: [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md) §7.

---

## What & why

Owner wanted "a lot of motion graphics," primarily for **social/shareable content** (looks good in phone screen recordings for IG/TikTok). Brainstormed to a deliberate, scoped design rather than motion everywhere — this **supersedes** the old Zara "restraint extends to motion" rule for the storefront.

Decisions reached:
- **Concept:** "Celestial Editorial" — cream + gold, the brand **crescent mark** drives everything. The motion *is the logo coming alive*, not decoration.
- **Tiered intensity:** Home = full / Shop·Product = light / **Checkout = none** (stays fast).
- **Logo handoff:** an inline **SVG crescent** performs the animated bits; the **real PNG logo is always the resting state** — never replaced.
- **Tech:** Framer Motion (already installed) + CSS + one inline SVG. **No new dependencies.**

## Commits (this session, on `main`)

| Commit | Summary |
|---|---|
| `dbdaa3d` | feat(motion): motion tokens and variants (`lib/motion.ts`) |
| `a549319` | feat(motion): MotionProvider — reduced-motion + kill switch (`lib/motion-context.tsx`) |
| `4a05c18` | feat(motion): inline crescent mark SVG |
| `5a10171` | feat(motion): waxing moon loader + store `loading.tsx` |
| `9abb6f9` | feat(motion): crescent-wipe page transition overlay |
| `103935f` | feat(motion): logo-driven hero entrance on home |
| `459bb59` | feat(motion): PDP gallery reveal/crossfade on color switch |
| `649527c` | feat(motion): add-to-cart star-burst micro-interaction |
| `32db047` | fix(motion): resolve react-hooks lint errors; CSS gallery reveal |
| `ec2279f` | docs: design system updated for tiered motion |
| `b3d23d5` | fix(motion): hero overlay client-mount gate (SSR-safe) + env kill switch |

## The moments

1. **Hero entrance** (home) — crescent scales in with gold glow → hairlines draw → wordmark wipes → reveals the real resting logo. ~1.6s, skips on first scroll/tap.
2. **Moon loader + page transition** — waxing-moon `loading.tsx`; crescent-wipe overlay on route change (skips `/checkout`).
3. **PDP gallery** — fade-in reveal on mount; replays on color switch (the React key changes per image set).
4. **Add-to-cart** — gold star-burst on add, alongside the existing toast.

## Architecture

- `lib/motion.ts` — durations, easings, `GOLD`, `goldGlow`, `crescentWipe` variant. One place to tune feel.
- `lib/motion-context.tsx` — `MotionProvider` + `useMotionEnabled()`. Respects `prefers-reduced-motion`; global kill switch via `NEXT_PUBLIC_MOTION_ENABLED="false"`.
- `components/store/brand/crescent-mark.tsx`, `hero-entrance.tsx`, `moon-loader.tsx`, `page-transition.tsx`; `app/(store)/loading.tsx`, `template`-free transition.
- Modified: `providers.tsx`, `(store)/layout.tsx`, `(store)/page.tsx`, `product-gallery.tsx`, `add-to-cart-button.tsx`, `globals.css`.

## Guardrails (enforced)

- **Transform/opacity only** (glow is a one-shot `drop-shadow`). No layout-animating props.
- **SSR-visible by default** — JS overlays activate only after client mount, so no-JS / slow-JS ship finished content (no `opacity:0` trap).
- **Reduced-motion** disables everything (JS via `useMotionEnabled`, CSS via media query).
- **Kill switch scope:** the JS flag gates Framer motion; the pure-CSS reveal/loader honor `prefers-reduced-motion` only (documented in DESIGN-SYSTEM §7).

## Verification

`tsc --noEmit` clean; `npm run build` green; `npm run lint` down to the 2 pre-existing errors (`product-list.tsx`, `shop-toolbar.tsx` — untouched). Runtime smoke (Playwright): 0 console errors on home + product. A final independent review caught a **Critical SSR bug** — the hero overlay was rendering server-side (`useReducedMotion` is `null` on the server → `enabled` true), leaving the home hero a blank cream box with no/slow JS. Fixed via the client-mount gate and **verified** the overlay is absent from the server HTML while the resting logo is present.

## Notes / judgment calls

- **Dropped from scope** during brainstorming: scroll-driven moon phases, ambient star-field, product-card reveals, custom cursor. Cut for perf/social-focus.
- **Page transition is an overlay**, not a true cross-page morph — App Router can't cleanly animate the outgoing page.
- **SSR-safety tradeoff:** the hero now briefly shows the resting logo before the overlay assembles. Accepted over the no-JS blank-box bug.
- **PDP gallery** uses a CSS reveal (not Framer) — keeps it a server component, ships less JS, SSR-visible; replaced an unsafe ref-during-render pattern flagged in review.

## Still open

- PDP gallery motion is best with real photos (seeded product already has them).
- Pre-launch cleanup + domain go-live unchanged — see [`../GO-LIVE.md`](../GO-LIVE.md).
