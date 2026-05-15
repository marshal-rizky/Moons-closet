# Readiness Worries

**Date:** 2026-05-15  
**Last updated:** 2026-05-15  
**Project status:** 14/14 tasks complete — DEPLOYED  
**Bottom line:** All critical issues resolved. Site is ready for soft launch.

## Resolved Issues

### Verification Blockers (ALL FIXED)
- ✅ Lint errors — fixed
- ✅ Build failure (turbopack root) — pinned in next.config.ts
- ✅ Next.js version mismatch in docs — updated to Next.js 16
- ✅ TypeScript SheetTrigger error — fixed with render pattern
- ✅ middleware.ts → proxy.ts migration — done

### Security & Data Integrity (ALL FIXED)
- ✅ Checkout server-side price recalculation — implemented
- ✅ Product API field whitelisting — implemented
- ✅ Slug collision handling — implemented
- ✅ Stock decrement on order creation — implemented
- ✅ Server-side validation (name 2-100 chars, address 10-500 chars, phone 10-15 digits, max 50 items) — implemented

### UX, Accessibility, and Design (ALL FIXED)
- ✅ Icon-only buttons aria-labels — added to navbar, cart-item, product-form
- ✅ Checkout redirect during render — moved to useEffect
- ✅ Ellipsis characters (... → …) — fixed in checkout, login, product-form
- ✅ Admin sidebar mobile responsive — hamburger menu with slide-out drawer on mobile

### Documentation (ALL FIXED)
- ✅ README replaced with project-specific content
- ✅ HANDOFF.md up to date
- ✅ Supabase image remote patterns configured
- ✅ Custom not-found.tsx page

## Remaining Items (Non-Blocking)

### 1. Rate limiting on order creation
Public order endpoint has no rate limiting. Not a blocker for soft launch — add if spam becomes an issue.

### 2. Real product photos
Seed data uses empty image arrays. Need real product photography before public marketing.

### 3. Stock not atomic
Stock decrement happens after order insert, not in a single transaction. Risk of overselling under high concurrency. Acceptable for current traffic volume — use a Postgres function if needed later.

### 4. Payment gateway
Currently manual confirmation via WhatsApp. Midtrans/Xendit integration planned for future.

### 5. WhatsApp notifications
Admin must check panel manually. Auto-notification planned for future.
