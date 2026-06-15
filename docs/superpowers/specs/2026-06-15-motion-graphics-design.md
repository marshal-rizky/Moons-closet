# Motion Graphics — Design Spec

**Date:** 2026-06-15
**Status:** Approved (design); pending implementation plan
**Scope:** Storefront (`app/(store)/**`). Admin untouched.
**Concept:** "Celestial Editorial" — animated, on-brand motion driven by the Moon's Closet crescent mark.

---

## 1. Goal & direction

Add expressive motion graphics to the storefront. Decisions reached during brainstorming:

- **Intensity direction:** Expressive / animated (a deliberate departure from the current Zara-restraint rule in `DESIGN-SYSTEM.md` §7, which bans motion beyond CSS color transitions). This spec **supersedes** that rule for the storefront and the design system should be updated to match once shipped.
- **Primary goal:** **Social / shareable content.** Success = "this looks great in a phone screen recording for Instagram/TikTok," not "this lifts checkout conversion." Implies vertical/phone framing and satisfying, reliable set pieces.
- **Creative concept:** **Celestial Editorial** — cream + gold, moon-phase motifs, hairlines that draw, serif text wipes. Refined and unmistakably the current brand, just animated. (Rejected: Dreamy Gradient — too big a brand shift; Cinematic Night — introduces dark mode.)

## 2. Scope — tiered intensity

Motion is woven across the storefront but **tiered**, with the heaviest treatment where it films best and the buying flow kept fast:

| Surface | Tier | Treatment |
|---|---|---|
| Home (`/`) | **Full** | Hero moon entrance + loader/transitions |
| Shop (`/shop`) | Light | Page transitions + loader only (no card-reveal motion — explicitly cut) |
| Product detail (`/product/[slug]`) | Light | Image reveal + swatch crossfade |
| Cart | Light | Add-to-cart micro-interaction (global) |
| Checkout | **None** | Stays clean, fast, instant. By design. |

**Cut during brainstorming (out of scope):** scroll-driven moon phases, ambient star-field, product-card staggered reveals, custom moon cursor.

## 3. The four moments

### 3.1 Hero moon entrance (Home only)
On home load: SVG crescent scales in with a gold glow → two hairlines draw outward → the **real logo PNG** clip-wipes in over the crescent → tagline fades → settles into the normal resting hero.
- **Timing:** ~1.6s total.
- **Replay:** plays on every full load of `/` (always present for filming), but **any scroll or tap instantly skips** to the resting state.
- **Degradation:** the resting hero (real PNG logo) renders immediately; the sequence is pure enhancement — content is never invisible.

### 3.2 Moon loader + page transition (global)
- **Loader:** waxing-moon animation in route-segment `loading.tsx` files (during server fetch) + a brief initial-load splash. **On home, the hero entrance is the branded first-paint moment — no separate splash on `/`;** the splash/loader applies to initial loads of non-home routes and to data-fetch waits, so the two never stack.
- **Transition:** on route change, a crescent/circle wipe sweeps as an **overlay** (driven by `usePathname`), revealing the new page. Capped ~400ms, never blocks taps; if a page is slow, the loader takes over.
- Same crescent shape as the hero — navigation feels continuous.

### 3.3 PDP image + swatch motion (Product detail)
- **Image reveal:** images rise/fade in as the gallery mounts.
- **Swatch crossfade:** switching color (existing `?color=` link navigation, `replace scroll={false}`) crossfades the gallery via `AnimatePresence` keyed on selected color.
- **Dependency note:** shines with real photos; until then it crossfades the gradient swatch placeholders (still smooth). No rework needed when real photos arrive.

### 3.4 Add-to-cart micro-interaction (global)
A small star-burst / moon-pulse radiates from the button on add, alongside the existing toast. Pure decoration over unchanged cart logic.

## 4. Logo integration (the brand-coherence decision)

The moon motif **is the existing logo**, not a new invention. Approach is a **hybrid**:
- A small **inline SVG crescent** (matching `public/brand/mark-gold.png`) carries the *animated* moments (entrance glow/draw, loader wax, transition wipe).
- The **real logo PNG is always the resting/displayed state.** The SVG performs, then hands off to the PNG. The logo is never replaced.

SVG crescent uses `currentColor` (inherits gold/black/white per context) with three behaviors via a `mode` prop: `entrance` | `loader` | `wipe`.

## 5. Technical approach

**Approach A: Framer Motion + CSS + inline SVG. No new dependencies.**
- Framer Motion (already shipped) for orchestrated sequences and `AnimatePresence`.
- CSS keyframes for loops/loader.
- Inline SVG for the crescent.
- Page transitions: `app/(store)/template.tsx` for **enter** animations + an overlay wipe for the visual transition. (App Router can't cleanly animate the *outgoing* page, so the transition is an overlay, not a true cross-page morph — accepted tradeoff.)

Rejected: GSAP (its ScrollTrigger strength is unused since scroll-phases were cut); Lottie (geometric concept is codeable; no motion designer/AE assets; adds runtime + data cost).

## 6. Architecture & files

**New files**
- `lib/motion.ts` — durations, easings, FM variants. Single source of truth.
- `components/store/brand/crescent-mark.tsx` — inline SVG crescent (`mode` prop).
- `components/store/hero-entrance.tsx` — home hero overlay sequence.
- `components/store/moon-loader.tsx` — waxing-moon loader.
- `components/store/page-transition.tsx` — crescent-wipe overlay, driven by `usePathname`.
- `app/(store)/template.tsx` — per-route mount for enter animations.
- Route `loading.tsx` files as needed (using `moon-loader`).

**Modified files (surgical)**
- `components/providers.tsx` — add `MotionProvider` (centralizes `prefers-reduced-motion` + global on/off flag).
- `app/(store)/layout.tsx` — mount `<PageTransition/>` + initial splash; gate tiers.
- `app/(store)/page.tsx` — wrap hero in `<HeroEntrance/>`.
- `components/store/product-gallery.tsx` — image reveal + swatch crossfade.
- `components/store/add-to-cart-button.tsx` — star-burst micro-interaction (logic untouched).

**Architectural rules**
1. Tiering is controlled in the layout, not scattered across components.
2. No new dependencies.
3. Reduced-motion + kill switch read once in `MotionProvider`; every component respects them — no half-animated states.
4. The real logo PNG is always the resting state.

## 7. Performance & accessibility guardrails (non-negotiable)

**Performance**
- Animate **transform & opacity only.** Never layout-triggering properties. Glow via pre-composited `drop-shadow` that's faded, not continuously animated.
- **Lazy-load** `hero-entrance`, `page-transition`, `moon-loader` via `next/dynamic`. Shop/PDP never download home's hero code.
- **Pause off-screen** via `IntersectionObserver` / FM `whileInView`.
- **No continuous loops on the money-path** — shop/PDP motion is entrance-triggered, fires once.
- **Bundle budget:** target < 15KB gzipped added JS total. Report actual delta after build.

**Accessibility & degradation**
- `prefers-reduced-motion`: read once in `MotionProvider`; when set, all motion skipped, content in final state. Site fully usable with zero motion.
- **Global kill switch** in `MotionProvider` to disable everything in production without redeploy.
- **Zero CLS:** elements reserve final space; nothing animates size or pushes content.
- Animated elements default to **visible** in SSR; the "from" state is applied client-side only when motion is allowed — slow/failed JS shows complete content.
- Motion never blocks interaction: transitions cap ~400ms; hero skips on first touch; taps register immediately.

**Explicitly prevents** the prior `FadeIn whileInView` bug (below-fold content stuck at `opacity:0`). Every animated element defaults to visible; motion is additive.

## 8. Motion tokens

In `lib/motion.ts`:

| Token | Value | Used by |
|---|---|---|
| `duration.instant` | 0.2s | swatch crossfade, micro-bursts |
| `duration.base` | 0.4s | image reveals, transition wipe |
| `duration.entrance` | 1.6s | hero entrance (full sequence) |
| `ease.standard` | `[0.22, 1, 0.36, 1]` | most reveals |
| `ease.wipe` | `[0.65, 0, 0.35, 1]` | crescent wipe |
| `stagger` | 0.08s | hero sequence |
| `glow.gold` | `drop-shadow(0 0 14px rgba(176,141,87,.55))` | crescent mark |

Exported FM variants: `entranceMark`, `drawLine`, `wordWipe`, `crescentWipe`, `starBurst`.

## 9. Verification plan

1. **Build green:** `tsc --noEmit` + `npm run build` pass; report gzipped JS delta vs < 15KB budget.
2. **Reduced-motion:** emulate `prefers-reduced-motion: reduce` → every page complete, zero animation, fully usable.
3. **No-JS / slow-JS:** throttle/disable JS → hero logo, products, all content visible (anti-`opacity:0` check).
4. **Mobile perf:** Playwright 375×812 + CPU throttle → ~60fps transitions, CLS ≈ 0, TTI not regressed. Lighthouse mobile before/after.
5. **Functional regression:** add-to-cart, swatch switch, checkout all work with motion on and off.
6. **The films:** screen-record home entrance, a page transition, an add-to-cart at phone viewport — the actual social deliverable. If it doesn't record well, it isn't done.
7. **Desktop pass:** 1440×900 sanity check.

## 10. Follow-ups / notes

- Update `DESIGN-SYSTEM.md` §7 (and §10 "intentionally NOT in the system") once shipped, to reflect that storefront motion is now expressive-but-budgeted.
- PDP swatch/image motion is best appreciated after real product photos exist (currently placeholders).
- Deploy reminder: commits that reach production must be authored `manmantab50@gmail.com` or Vercel blocks the deploy.
