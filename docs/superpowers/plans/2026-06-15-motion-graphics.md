# Motion Graphics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Celestial Editorial" motion graphics to the Moon's Closet storefront — a logo-driven hero entrance, a moon loader + crescent page transition, PDP image/swatch motion, and an add-to-cart micro-interaction — tiered by surface and performance-budgeted.

**Architecture:** An additive enhancement layer over the existing storefront. A central `lib/motion.ts` holds tokens/variants; a `MotionProvider` centralizes `prefers-reduced-motion` + a global kill switch; small client components render the moments and are gated so reduced-motion / SSR / no-JS always show complete, visible content. Nothing in the shopping/cart logic changes. Built on the already-installed Framer Motion (v12) + CSS + one inline SVG. No new dependencies.

**Tech Stack:** Next.js 16.2.6 (App Router), React 19, TypeScript, Framer Motion ^12.38.0, Tailwind CSS v4.

**Spec:** `docs/superpowers/specs/2026-06-15-motion-graphics-design.md`

---

## Verification approach (read first)

This repo has **no test runner** (see `package.json` — scripts are `dev`/`build`/`start`/`lint` only). Established verification is type-check + production build + lint + visual/Playwright checks. The units in this plan are visual (animations), which unit tests can't meaningfully assert. Per YAGNI and existing project convention, **we do NOT add a test framework.** Each task's verification gate is:

```
npx tsc --noEmit      # types
npm run build         # production build (RSC + client boundaries)
npm run lint          # eslint
```

plus, where noted, a manual/observed check. The final task adds reduced-motion, mobile-perf, and "the films" observation passes from the spec's §9.

**Branch:** `feat/motion-graphics` (already created). All commits land here. Author email **must** be `manmantab50@gmail.com` for any commit that will later deploy (Vercel Hobby rule). Use:
`git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "…"`.

**Deliberate refinements vs spec (and why):**
- **No `app/(store)/template.tsx` enter-fade.** A `template.tsx` wrapping content with `initial={{opacity:0}}` renders `opacity:0` in SSR HTML — exactly the invisible-content trap the spec forbids (§7). The crescent-wipe **overlay** gives the route-transition feel while keeping page content always SSR-visible. The transition is overlay-only.
- **No separate full-screen initial splash.** The spec mentions one, but a blocking splash on first paint fights the money-path speed budget. The `MoonLoader` covers data-fetch waits via `loading.tsx`; the hero entrance is home's first-paint moment. A dedicated initial splash is **deferred** (documented in the final task).
- **`CrescentMark` is presentation-only** (a pure SVG using `currentColor`); motion lives in each consumer rather than a `mode` prop. The waxing "loader" is a distinct visual (`MoonLoader`), not the double-crescent glyph, so a shared `mode` prop would couple unrelated things.

---

## File structure

**New files**
- `lib/motion.ts` — durations, easings, stagger, glow, FM variants. Single source of truth.
- `lib/motion-context.tsx` — `MotionProvider` + `useMotionEnabled()` hook (reduced-motion + kill switch).
- `components/store/brand/crescent-mark.tsx` — inline SVG crescent (presentation-only, `currentColor`).
- `components/store/moon-loader.tsx` — waxing-moon loader.
- `app/(store)/loading.tsx` — segment loading UI using `MoonLoader`.
- `components/store/page-transition.tsx` — crescent-wipe overlay, driven by `usePathname`.
- `components/store/hero-entrance.tsx` — home hero entrance overlay sequence.

**Modified files**
- `components/providers.tsx` — wrap tree in `MotionProvider`.
- `app/globals.css` — append `moon-wax` keyframe + reduced-motion stop.
- `app/(store)/layout.tsx` — mount `<PageTransition/>`.
- `app/(store)/page.tsx` — mount `<HeroEntrance/>` in the hero section.
- `components/store/product-gallery.tsx` — image reveal + swatch crossfade.
- `components/store/add-to-cart-button.tsx` — star-burst micro-interaction.
- `docs/DESIGN-SYSTEM.md` — update §7/§10 to reflect storefront motion (final task).

---

## Task 1: Motion tokens

**Files:**
- Create: `lib/motion.ts`

- [ ] **Step 1: Create the tokens module**

```typescript
// lib/motion.ts
import type { Variants } from "framer-motion";

/** Brand gold used for crescent glow. Matches public/brand/mark-gold.png. */
export const GOLD = "#b08d57";

export const duration = {
  instant: 0.2,
  base: 0.4,
  entrance: 1.6,
} as const;

export const ease = {
  standard: [0.22, 1, 0.36, 1] as const, // soft ease-out
  wipe: [0.65, 0, 0.35, 1] as const,
} as const;

export const goldGlow = `drop-shadow(0 0 14px rgba(176,141,87,0.55))`;

/** Crescent/circle reveal wipe for the page-transition overlay. */
export const crescentWipe: Variants = {
  covering: { clipPath: "circle(150% at 50% 45%)" },
  revealed: {
    clipPath: "circle(0% at 50% 45%)",
    transition: { duration: 0.45, ease: ease.wipe },
  },
};
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/motion.ts
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(motion): add motion tokens and variants"
```

---

## Task 2: MotionProvider + hook

**Files:**
- Create: `lib/motion-context.tsx`
- Modify: `components/providers.tsx`

- [ ] **Step 1: Create the provider + hook**

```tsx
// lib/motion-context.tsx
"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/** Global kill switch — set to false to disable ALL storefront motion in prod
 *  without a code-shape change. */
const MOTION_ENABLED = true;

const MotionContext = createContext<boolean>(true);

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion(); // boolean | null (null on server)
  const enabled = MOTION_ENABLED && !reduced;
  return <MotionContext value={enabled}>{children}</MotionContext>;
}

/** True when motion should play (motion enabled AND user has not asked to reduce). */
export function useMotionEnabled(): boolean {
  return useContext(MotionContext);
}
```

Note: React 19 context-as-provider (`<MotionContext value=…>`) matches the existing pattern in `lib/toast-context.tsx`.

- [ ] **Step 2: Wire it into Providers**

Replace the entire contents of `components/providers.tsx`:

```tsx
"use client";

import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/lib/toast-context";
import { MotionProvider } from "@/lib/motion-context";
import { ToastContainer } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <TooltipProvider>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
          <ToastContainer />
        </ToastProvider>
      </TooltipProvider>
    </MotionProvider>
  );
}
```

- [ ] **Step 3: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add lib/motion-context.tsx components/providers.tsx
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(motion): add MotionProvider with reduced-motion + kill switch"
```

---

## Task 3: Crescent mark SVG

**Files:**
- Create: `components/store/brand/crescent-mark.tsx`

- [ ] **Step 1: Create the SVG component**

```tsx
// components/store/brand/crescent-mark.tsx
// Presentation-only. Uses currentColor so callers set gold/black/white via text color.
// Approximates public/brand/mark-gold.png; the real PNG remains the resting brand asset.

export function CrescentMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* outer crescent (opens to the right; interior is transparent) */}
      <path d="M70 8a46 46 0 1 0 0 84 36 36 0 1 1 0-84z" />
      {/* star ornament */}
      <circle cx="78" cy="20" r="3.4" />
    </svg>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Observed check (silhouette tuning)**

Open `public/brand/mark-gold.png` (Read tool or file preview) and compare the crescent silhouette. If it's clearly off, nudge the two arc radii (`46`/`36`) and the star position. This is a visual nicety — do not block the plan on a perfect match; the real PNG is the identity asset.

- [ ] **Step 4: Commit**

```bash
git add components/store/brand/crescent-mark.tsx
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(motion): add inline crescent mark SVG"
```

---

## Task 4: Moon loader + segment loading UI

**Files:**
- Modify: `app/globals.css` (append at end)
- Create: `components/store/moon-loader.tsx`
- Create: `app/(store)/loading.tsx`

- [ ] **Step 1: Append the waxing keyframe to globals.css**

Add to the **end** of `app/globals.css`:

```css
/* Moon loader — waxing disc. Cream (#faf0e6) inset shadow masks the gold disc. */
@keyframes moon-wax {
  0%   { box-shadow: inset -40px 0 0 0 #faf0e6; }
  50%  { box-shadow: inset 0 0 0 0 #faf0e6; }
  100% { box-shadow: inset 40px 0 0 0 #faf0e6; }
}
.moon-loader-disc {
  animation: moon-wax 2.2s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .moon-loader-disc { animation: none; }
}
```

- [ ] **Step 2: Create the MoonLoader component**

```tsx
// components/store/moon-loader.tsx
// Pure-CSS loader (no JS hooks). Reduced-motion handled by the CSS media query.
export function MoonLoader({ label = "Memuat" }: { label?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <span className="moon-loader-disc block h-10 w-10 rounded-full bg-[#b08d57]" />
        <span className="text-[9px] tracking-[0.3em] uppercase text-foreground/70">
          {label}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the segment loading file**

```tsx
// app/(store)/loading.tsx
import { MoonLoader } from "@/components/store/moon-loader";

export default function Loading() {
  return <MoonLoader />;
}
```

- [ ] **Step 4: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds; `(store)` segment shows a loading boundary.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css components/store/moon-loader.tsx "app/(store)/loading.tsx"
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(motion): add waxing moon loader + store loading boundary"
```

---

## Task 5: Crescent-wipe page transition

**Files:**
- Create: `components/store/page-transition.tsx`
- Modify: `app/(store)/layout.tsx`

- [ ] **Step 1: Create the transition overlay**

```tsx
// components/store/page-transition.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { crescentWipe } from "@/lib/motion";
import { useMotionEnabled } from "@/lib/motion-context";

/**
 * On route change, an overlay mounts already covering the screen (crescent at
 * 150%) and reveals the new page by shrinking the crescent to 0. pointer-events
 * are off so it never blocks taps. Skips the very first mount so it doesn't
 * collide with the hero entrance.
 */
export function PageTransition() {
  const enabled = useMotionEnabled();
  const pathname = usePathname();
  const first = useRef(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Checkout stays motion-free (spec §2) — no wipe when landing there.
    if (pathname?.startsWith("/checkout")) return;
    setCount((c) => c + 1);
  }, [pathname]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          key={count}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[60] bg-cream"
          variants={crescentWipe}
          initial="covering"
          animate="revealed"
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
        />
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Mount it in the store layout**

Replace the entire contents of `app/(store)/layout.tsx`:

```tsx
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { BackToTop } from "@/components/ui/back-to-top";
import { PageTransition } from "@/components/store/page-transition";
import type { ReactNode } from "react";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
      <PageTransition />
    </div>
  );
}
```

- [ ] **Step 3: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 4: Observed check**

`npm run dev`, navigate between `/`, `/shop`, a product page. Expected: a cream crescent reveal sweeps in on each navigation (~450ms), never blocks clicking, content underneath is correct. Toggle OS "reduce motion" → no overlay, instant navigation.

- [ ] **Step 5: Commit**

```bash
git add components/store/page-transition.tsx "app/(store)/layout.tsx"
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(motion): add crescent-wipe page transition overlay"
```

---

## Task 6: Hero moon entrance

**Files:**
- Create: `components/store/hero-entrance.tsx`
- Modify: `app/(store)/page.tsx`

- [ ] **Step 1: Create the hero entrance overlay**

```tsx
// components/store/hero-entrance.tsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CrescentMark } from "@/components/store/brand/crescent-mark";
import { useMotionEnabled } from "@/lib/motion-context";
import { ease, GOLD, goldGlow } from "@/lib/motion";

/**
 * Cream overlay above the static hero. Plays the assemble-in sequence (~1.6s),
 * then fades to reveal the real resting hero (PNG logo) underneath. Dismisses
 * early on first scroll or tap. Renders nothing when motion is disabled, so the
 * static hero is shown immediately (SSR-safe — overlay is pure enhancement).
 */
export function HeroEntrance({
  wordmark,
  tagline,
}: {
  wordmark: string;
  tagline: string;
}) {
  const enabled = useMotionEnabled();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDone(true);
      return;
    }
    const timer = setTimeout(() => setDone(true), 1600);
    const skip = () => setDone(true);
    window.addEventListener("scroll", skip, { passive: true, once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="absolute inset-0 z-20 grid place-items-center bg-cream"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: ease.standard } }}
        >
          <div className="text-center" style={{ color: GOLD }}>
            <motion.div
              className="mx-auto h-16 w-16"
              initial={{ opacity: 0, scale: 0.6, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: goldGlow }}
              transition={{ duration: 0.5, ease: ease.standard }}
            >
              <CrescentMark className="h-full w-full" />
            </motion.div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <motion.span
                className="h-px w-12 origin-right"
                style={{ backgroundColor: GOLD }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease: ease.standard }}
              />
              <motion.span
                className="font-heading text-3xl uppercase tracking-[0.2em] text-foreground"
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0 0 0)" }}
                transition={{ duration: 0.5, delay: 0.45, ease: ease.standard }}
              >
                {wordmark}
              </motion.span>
              <motion.span
                className="h-px w-12 origin-left"
                style={{ backgroundColor: GOLD }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease: ease.standard }}
              />
            </div>

            <motion.p
              className="mt-4 text-[11px] tracking-[0.18em] uppercase text-foreground/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              {tagline}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Mount it in the home hero section**

In `app/(store)/page.tsx`, add the import near the other component imports (after the `FadeIn` import on line 7):

```tsx
import { HeroEntrance } from "@/components/store/hero-entrance";
```

Then, inside the hero `<section className="relative">` (opens at line 28), add the overlay as the **first child** of that section, immediately before `<Link href={`/product/${hero.slug}`}>`:

```tsx
        <section className="relative">
          <HeroEntrance wordmark={siteConfig.name} tagline={siteConfig.tagline} />
          <Link href={`/product/${hero.slug}`}>
```

The section is already `relative` and sized by the inner `h-[88dvh]` block, so the `absolute inset-0` overlay covers the hero exactly. The static hero (real `logo-white-nav.png`) stays rendered underneath and is what remains after the overlay fades.

**Logo handoff (spec §4):** the overlay performs with the inline **crescent SVG + a serif text wordmark** (the animated layer); when it fades out it reveals the **real `logo-white-nav.png` hero** beneath, which is the resting brand state. The PNG is never replaced — it's what you're left looking at.

**Lazy-load note (spec §7 guardrail):** no `next/dynamic` is used. `HeroEntrance` is imported only by `app/(store)/page.tsx`, so Next's route-based code splitting already ships it solely with `/`. `next/dynamic({ ssr: false })` is *not permitted inside a Server Component* (which `page.tsx` is), so forcing it would break the build. SSR-safety here comes from the component returning `null` when motion is disabled (static hero shows immediately), not from `ssr:false`. `PageTransition` is needed on every store route (shared layout) so isolating it saves nothing; `MoonLoader` is already its own chunk via `loading.tsx`.

- [ ] **Step 3: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 4: Observed check**

`npm run dev`, load `/`. Expected: cream overlay → crescent scales in with gold glow → hairlines draw → "Moon's Closet" wipes in → tagline → fades after ~1.6s to the normal hero. Scroll or tap mid-sequence → dismisses immediately. Toggle OS reduce-motion → no overlay, normal hero shown instantly. Disable JS (DevTools) → normal hero visible, no blank.

- [ ] **Step 5: Commit**

```bash
git add components/store/hero-entrance.tsx "app/(store)/page.tsx"
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(motion): add logo-driven hero entrance on home"
```

---

## Task 7: PDP image reveal + swatch crossfade

**Files:**
- Modify: `components/store/product-gallery.tsx`

- [ ] **Step 1: Replace the gallery with a crossfade-on-color-change version**

Replace the entire contents of `components/store/product-gallery.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionEnabled } from "@/lib/motion-context";
import { duration, ease } from "@/lib/motion";

const SWATCHES = [
  "zara-swatch-1",
  "zara-swatch-2",
  "zara-swatch-3",
  "zara-swatch-4",
  "zara-swatch-5",
  "zara-swatch-6",
  "zara-swatch-7",
  "zara-swatch-8",
];

function swatchFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return SWATCHES[h % SWATCHES.length];
}

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const enabled = useMotionEnabled();

  // Stack vertically like Zara — no thumbnails, scroll through all shots.
  const items: (string | number)[] =
    images.length > 0 ? images : Array.from({ length: 2 }, (_, i) => i);

  // Signature changes when the selected color (image set) changes.
  const sig = images.length > 0 ? images.join("|") : `ph-${name}`;

  // Don't animate the very first render (keeps images SSR-visible, no flash);
  // crossfade only when the signature changes (color switch).
  const prevSig = useRef(sig);
  const isChange = prevSig.current !== sig;
  prevSig.current = sig;

  const stack = (
    <div className="flex flex-col gap-1">
      {items.map((src, i) => {
        if (typeof src === "string") {
          return (
            <div
              key={i}
              className="relative aspect-[3/4] w-full overflow-hidden bg-secondary"
            >
              <Image
                src={src}
                alt={`${name} ${i + 1}`}
                width={1200}
                height={1600}
                priority={i === 0}
                className="h-full w-full object-cover"
              />
            </div>
          );
        }
        const cls = swatchFor(`${name}-${i}`);
        return (
          <div
            key={i}
            className={`relative aspect-[3/4] w-full overflow-hidden ${cls} flex items-center justify-center`}
          >
            <span className="font-heading text-7xl tracking-[0.2em] uppercase opacity-20">
              {name.charAt(0)}
            </span>
          </div>
        );
      })}
    </div>
  );

  if (!enabled) return stack;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sig}
        initial={isChange ? { opacity: 0 } : false}
        animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.standard } }}
        exit={{ opacity: 0, transition: { duration: duration.instant } }}
      >
        {stack}
      </motion.div>
    </AnimatePresence>
  );
}
```

Why this is SSR-safe: on the first render `isChange` is `false`, so `initial={false}` means the gallery renders fully visible (no `opacity:0` in the SSR HTML). Only a subsequent color switch (`?color=` navigation re-renders the parent server component with new `images`) changes `sig` and triggers the crossfade.

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

- [ ] **Step 3: Observed check**

`npm run dev`, open the seeded product (`/product/celana-barrel-high-waist`). Click each color swatch. Expected: gallery crossfades between variant image sets (or placeholder swatches if no real photos), URL updates `?color=`, scroll position preserved (swatches use `scroll={false}`). First load shows images immediately with no fade flash. Reduce-motion → hard cut, no crossfade, images visible.

- [ ] **Step 4: Commit**

```bash
git add components/store/product-gallery.tsx
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(motion): crossfade PDP gallery on color switch"
```

---

## Task 8: Add-to-cart star-burst micro-interaction

**Files:**
- Modify: `components/store/add-to-cart-button.tsx`

- [ ] **Step 1: Add burst state + imports**

In `components/store/add-to-cart-button.tsx`, update the imports at the top. Replace lines 1–8 (the `"use client"` through the `import type … ProductVariant }` block) with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useMotionEnabled } from "@/lib/motion-context";
import { GOLD, ease } from "@/lib/motion";
import { effectiveSizes, effectiveStock, variantSizeStock } from "@/lib/variants";
import type { Product, ProductVariant } from "@/lib/types";
```

- [ ] **Step 2: Add the burst trigger inside the component**

In the component body, after the line `const { toast } = useToast();`, add:

```tsx
  const motionEnabled = useMotionEnabled();
  const [burst, setBurst] = useState(0);
```

Then, inside `handleAdd`, immediately after `toast.success("Ditambahkan ke tas");`, add:

```tsx
    if (motionEnabled) setBurst(Date.now());
```

- [ ] **Step 3: Add a self-resetting burst layer over the button**

The Add button is currently the last element (lines ~110–117). Wrap it in a relative container and add the burst overlay. Replace the existing `<button onClick={handleAdd} … </button>` block with:

```tsx
      {/* Add button — Zara style: white bg, thin black border, sentence case */}
      <div className="relative">
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex w-full items-center justify-center gap-2 border border-foreground bg-background py-4 text-[12px] tracking-[0.12em] uppercase transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-foreground"
        >
          {!outOfStock && <ShoppingBag className="h-4 w-4" />}
          {outOfStock ? "Stok Habis" : "Tambah ke Tas"}
        </button>
        <AnimatePresence>
          {motionEnabled && burst > 0 && <StarBurst key={burst} />}
        </AnimatePresence>
      </div>
```

- [ ] **Step 4: Add the StarBurst sub-component at the bottom of the file**

Append after the closing brace of `AddToCartButton`:

```tsx
function StarBurst() {
  // 6 gold stars radiate from the button center, then fade. Transform/opacity only.
  const stars = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    return { x: Math.cos(angle) * 46, y: Math.sin(angle) * 46 };
  });
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: GOLD }}
          initial={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: s.x, y: s.y, scale: 0.4 }}
          transition={{ duration: 0.5, ease: ease.standard }}
        />
      ))}
    </div>
  );
}
```

The burst auto-clears: it stays mounted but invisible after the animation. The next add sets a new `burst` key, remounting and replaying. To avoid leaving a stale invisible node, also reset after the animation — add this effect inside `AddToCartButton` (after the existing `useEffect` that clears the selected size):

```tsx
  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => setBurst(0), 600);
    return () => clearTimeout(t);
  }, [burst]);
```

- [ ] **Step 5: Type-check + build + lint**

Run: `npx tsc --noEmit && npm run build && npm run lint`
Expected: all pass. (The existing `eslint-disable-next-line react-hooks/exhaustive-deps` on the size-clear effect is unchanged.)

- [ ] **Step 6: Observed check**

`npm run dev`, open a product, pick a size, click "Tambah ke Tas". Expected: gold stars radiate from the button and fade, toast appears, item lands in cart. Reduce-motion → toast + cart only, no burst. Cart/checkout logic unchanged.

- [ ] **Step 7: Commit**

```bash
git add components/store/add-to-cart-button.tsx
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "feat(motion): add star-burst micro-interaction on add-to-cart"
```

---

## Task 9: Full verification, docs update, bundle check

**Files:**
- Modify: `docs/DESIGN-SYSTEM.md`

- [ ] **Step 1: Verification gates (spec §9)**

Run each and confirm:

```bash
npx tsc --noEmit          # types clean
npm run lint              # eslint clean
npm run build             # production build green
```

Capture the **First Load JS** figures from `npm run build` output for `/`, `/shop`, `/product/[slug]`. Confirm the added client JS is within the spec's < 15KB gzipped budget (Framer Motion is already counted in the baseline; the new components are small). If a route blew the budget, note which and why in the commit message.

- [ ] **Step 2: Reduced-motion pass**

`npm run dev`. In Chrome DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce". Visit `/`, `/shop`, a product. Expected: hero shows instantly (no overlay), no page-transition wipe, gallery hard-cuts on swatch, no add-to-cart burst, moon loader is a static disc. Every page fully usable.

- [ ] **Step 3: No-JS / slow-JS pass**

DevTools → disable JavaScript, reload `/` and a product page. Expected: hero logo, products, gallery images, and all content are visible (no `opacity:0` blanks). This is the anti-regression check for the old `FadeIn whileInView` bug.

- [ ] **Step 4: Mobile perf + the films (spec §9.4, §9.6)**

Use Playwright MCP (the project's established tool) at 375×812 with CPU throttling:
- Record the home entrance, a page transition, and an add-to-cart.
- Confirm transitions look ~60fps (no visible stutter), layout does not jump (CLS ≈ 0 — nothing animates size/position of page content; overlays are `position:fixed/absolute`), and taps register immediately.
- The recordings are the actual social deliverable — if they don't look great, iterate on timings in `lib/motion.ts` before calling done.

- [ ] **Step 5: Functional regression**

With motion ON: add-to-cart → cart → checkout completes; swatch switch works; navigation works. Confirm nothing in the money-path changed behavior.

- [ ] **Step 6: Update the design system doc**

In `docs/DESIGN-SYSTEM.md`, update **§7 (Motion)** to replace the "No animation on hover beyond CSS color transitions — Zara's restraint extends to motion" stance with the new reality: storefront motion is now **expressive but performance-budgeted and tiered** (Home full / Shop·PDP light / Checkout none), driven by the crescent mark, gated by `MotionProvider` (reduced-motion + kill switch), transform/opacity only, SSR-visible by default. In **§10 ("intentionally NOT in the system")**, remove or qualify the blanket "no motion" implication. Reference `docs/superpowers/specs/2026-06-15-motion-graphics-design.md`.

- [ ] **Step 7: Final commit**

```bash
git add docs/DESIGN-SYSTEM.md
git -c user.email=manmantab50@gmail.com -c user.name="marshal Rizky" commit -m "docs: update design system for storefront motion + verify motion pass"
```

---

## Deferred (out of scope for this plan)

- **Initial full-screen splash** on non-home first loads (money-path speed prioritized; `MoonLoader` + `loading.tsx` cover fetch waits).
- **Product-card quick-add burst** — the burst lives on the PDP add button; if the `+` quick-add on `product-card.tsx` does a direct add-to-cart (verify), wiring the same burst there is a small follow-up.
- **Scroll-driven moon phases, ambient star-field, product-card reveals, custom cursor** — explicitly cut during brainstorming.
- **Real product photography** — PDP image motion is fully realized only once real photos replace placeholder swatches.
```
