# Part 2: Notifications, Animations, Search & QoL

**Date:** 2026-05-15
**Status:** Approved

---

## 1. Email Notifications (Resend)

### Dependencies
- `resend` npm package

### Env Vars
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (verified sender or Resend onboarding address)
- Admin email from `siteConfig.email` in `lib/config.ts`

### New Files
- `lib/email.ts` — Resend client instance + two send functions

### Email Functions

**`sendAdminOrderAlert(order: Order)`**
- Triggered in: `app/api/orders/route.ts` POST handler, after successful order insert
- Fire-and-forget (don't await, don't block response)
- Subject: "Pesanan Baru #{order_number}"
- Body (HTML): customer name, item count, total (formatted IDR), customer phone, address
- To: `siteConfig.email`

**`sendCustomerShippingNotification(order: Order)`**
- Triggered in: `app/api/orders/[id]/route.ts` PATCH handler, when status changes to "shipped"
- Fire-and-forget
- Requires `customer_email` on order (currently nullable) — send only if email exists
- Subject: "Pesanan #{order_number} Sedang Dikirim"
- Body (HTML): order number, items list (name, size, qty, price), total, delivery address
- To: `order.customer_email`

### Checkout Form Change
- Add optional email field to checkout form (`customer_email`)
- Update `app/(store)/checkout/page.tsx` — add email input between phone and address
- Update `app/api/orders/route.ts` — accept and store `customer_email`
- Validate format if provided, allow empty

---

## 2. Animations (Framer Motion)

### Dependencies
- `framer-motion` npm package

### New Files
- `components/ui/fade-in.tsx` — reusable `<FadeIn>` wrapper component

### FadeIn Component Props
```typescript
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;        // default 0
  duration?: number;     // default 0.4
  direction?: "up" | "down" | "left" | "right"; // default "up"
  className?: string;
}
```

Uses `motion.div` with `whileInView`, `once: true`, `viewport: { margin: "-50px" }`.
Initial state: `opacity: 0, translateY: 16px` (or translateX for left/right).
Animate to: `opacity: 1, translate: 0`.

### Animation Locations

| Location | Animation | Implementation |
|----------|-----------|----------------|
| Product cards  ) | Fade-in + slight upward slide on scroll, staggered | Wrap `ProductCard` in `<FadeIn delay={index * 0.05}>` |
| Homepage hero section | Fade-in on load | `<FadeIn>` wrapper |
| Homepage category section | Fade-in on scroll | `<FadeIn>` wrapper |
| Homepage "Produk Terbaru" heading | Fade-in on scroll | `<FadeIn>` wrapper |
| Product detail — image | Fade-in | `<FadeIn>` |
| Product detail — info panel | Fade-in from right (desktop) | `<FadeIn direction="right">` |
| Cart badge | Scale pop when count changes | `motion.span` with `key={count}` for re-mount animation |
| Toast notifications | Slide-in from bottom, exit fade | Built into toast component (Section 4) |
| Admin order timeline | Sequential dot/line animation | Built into timeline component (Section 5) |
| Back-to-top button | Fade in/out | `AnimatePresence` + `motion.button` |

### What stays CSS-only
- Button hover/active (Tailwind `transition-colors`)
- Navbar backdrop blur
- Mobile sidebar slide (CSS transform)
- Image hover zoom on product cards (`transition-transform duration-500 group-hover:scale-105`)
- Skeleton shimmer (CSS keyframe)

### Client Component Boundaries
- `<FadeIn>` is a client component. Wrap server-rendered content — children remain server components where possible.
- Product grid wrapper becomes client component for stagger coordination.

---

## 3. Search Bar

### Shop Page Search

**URL params:** `?search=linen&category=Celana`

**Component changes:**
- `components/store/category-filter.tsx` → rename to `components/store/shop-toolbar.tsx`
- Combines search input + category filter pills in one component
- Client component (already is)

**Layout:**
```
Belanja (h1)
[search icon] [Cari produk...                 ] [X clear]
[Semua] [Celana] [Dress] [Atasan] ...
Product grid
```

**Search behavior:**
- Input with `Search` icon (Lucide) on left, `X` clear button on right (visible when has value)
- Debounced 300ms — updates URL params via `router.push()`
- Placeholder: no category active → "Cari produk..." / category active → "Cari di {category}..."
- Server-side filtering: Supabase query adds `.ilike("name", "%search%")` when search param present
- Combined with category: `.eq("category", cat).ilike("name", "%search%")`
- Clearing search preserves category. Changing category clears search.

**Shop page changes (`app/(store)/shop/page.tsx`):**
- Accept `search` from `searchParams`
- Add `.ilike("name", `%${search}%`)` to query when present
- Pass `search` prop to toolbar component

### Admin Products Search

**Component:** inline in `app/(admin)/admin/(dashboard)/products/page.tsx`
- Convert to client component (or extract search + list into client child)
- `useState` for search term
- Filter products client-side: `products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))`
- Same input styling as shop search
- Instant filtering, no debounce needed
- Placeholder: "Cari produk..."

---

## 4. Toast Notifications

### New Files
- `lib/toast-context.tsx` — ToastProvider + `useToast()` hook
- `components/ui/toast.tsx` — Toast container + individual toast

### Toast Context API
```typescript
interface ToastContext {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
  };
}
```

### Toast Component
- Position: bottom-right (desktop), bottom-center (mobile)
- Max 3 visible, oldest dismissed when exceeding
- Auto-dismiss: 3s
- Animation: `motion.div` slide-in from bottom + fade, `AnimatePresence` for exit
- Styling: rounded border, icon (CheckCircle2 for success, AlertCircle for error), message text
- Colors: green accent for success, red for error (using theme `--destructive` / custom success color)

### Integration
- Wrap app in `<ToastProvider>` inside `components/providers.tsx`
- Provider renders `<ToastContainer />` (fixed positioned, portal-like)

### Usage Points
| Action | Type | Message |
|--------|------|---------|
| Add to cart | success | "Ditambahkan ke keranjang!" |
| Remove from cart | success | "Dihapus dari keranjang" |
| Checkout success | success | "Pesanan berhasil dibuat!" |
| Admin status update | success | "Status pesanan diperbarui" |
| Admin product save | success | "Produk disimpan" |
| Any API error | error | Error message from API |

### Replaces
- Current button text swap in `add-to-cart-button.tsx` ("Ditambahkan!" timeout) → replaced with toast

---

## 5. QoL Features

### 5a. Loading Skeletons

**New file:** `components/store/product-card-skeleton.tsx`

- Matches `ProductCard` dimensions: 3:4 aspect ratio image placeholder + two text line placeholders
- CSS shimmer animation via `@keyframes shimmer` (background gradient slide)
- Add shimmer keyframe to `globals.css`

**Usage:**
- Shop page: wrap product grid in `<Suspense fallback={<SkeletonGrid />}>` where `SkeletonGrid` renders 8 skeleton cards
- Homepage "Produk Terbaru": same pattern with 8 skeletons

### 5b. Back-to-Top Button

**New file:** `components/ui/back-to-top.tsx`

- Client component
- Listens to `window.scroll` (throttled)
- Appears when `scrollY > 400`
- Fixed position: `bottom-20 right-4` (above toast area)
- `ChevronUp` icon from Lucide
- `onClick: window.scrollTo({ top: 0, behavior: "smooth" })`
- Framer Motion fade in/out with `AnimatePresence`
- Mobile: `w-10 h-10` touch target, desktop: `w-9 h-9`
- Render in store layout (`app/(store)/layout.tsx`)

### 5c. Order Status Timeline

**New file:** `components/admin/order-timeline.tsx`

- Horizontal timeline with 4 steps: Pending → Confirmed → Shipped → Done
- Each step: dot + label below
- Connecting lines between dots
- States: completed (filled dot, solid line), current (pulsing dot), future (gray dot, dashed line)
- Framer Motion: dots and lines animate in sequentially on mount (staggerChildren)
- Mobile: same horizontal layout, smaller text, scrollable if needed
- Used on: `app/(admin)/admin/(dashboard)/orders/[id]/page.tsx` — above order details, alongside existing status badge

### 5d. Empty Cart CTA

**Modify:** `app/(store)/cart/page.tsx`

- When cart empty, show:
  - `ShoppingBag` icon (Lucide), large, muted color
  - "Keranjang kamu kosong" text
  - "Belanja Sekarang" button → links to `/shop`
- Wrapped in `<FadeIn>` for entrance animation

### 5e. Product Image Gallery

**Modify:** `app/(store)/product/[slug]/page.tsx`

- If product has multiple images:
  - State: `selectedImage` index (default 0)
  - Main image: large display, crossfade animation on change (`AnimatePresence` + `motion.img` with key)
  - Thumbnail row below main image: small clickable thumbnails
  - Active thumbnail: border highlight
  - Mobile: thumbnail row scrolls horizontally (`overflow-x-auto`, `flex`, `gap-2`)
- If single image: current behavior, no thumbnails

---

## Technical Notes

### Package Additions
```
npm install framer-motion resend
```

### New Env Vars
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### File Summary

**New files (8):**
1. `lib/email.ts`
2. `lib/toast-context.tsx`
3. `components/ui/fade-in.tsx`
4. `components/ui/toast.tsx`
5. `components/ui/back-to-top.tsx`
6. `components/store/product-card-skeleton.tsx`
7. `components/store/shop-toolbar.tsx` (replaces category-filter.tsx)
8. `components/admin/order-timeline.tsx`

**Modified files (14):**
1. `app/api/orders/route.ts` — email trigger + accept customer_email
2. `app/api/orders/[id]/route.ts` — shipping email trigger
3. `app/(store)/shop/page.tsx` — search param, toolbar, suspense skeletons
4. `app/(store)/page.tsx` — FadeIn animations, skeleton fallback
5. `app/(store)/checkout/page.tsx` — add email field
6. `app/(store)/cart/page.tsx` — empty cart CTA
7. `app/(store)/product/[slug]/page.tsx` — image gallery
8. `app/(store)/layout.tsx` — back-to-top button
9. `app/(admin)/admin/(dashboard)/products/page.tsx` — search bar
10. `app/(admin)/admin/(dashboard)/orders/[id]/page.tsx` — order timeline
11. `components/providers.tsx` — wrap in ToastProvider
12. `components/store/add-to-cart-button.tsx` — use toast instead of text swap
13. `components/store/navbar.tsx` — animated cart badge
14. `app/globals.css` — shimmer keyframe

**Deleted files (1):**
1. `components/store/category-filter.tsx` (replaced by shop-toolbar.tsx)

### Mobile-First
All new components follow mobile-first approach per project memory. Base styles = mobile, `sm:`/`md:`/`lg:` for larger screens.
