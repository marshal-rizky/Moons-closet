# Go-Live Transition Plan — Moon's Closet

**Status:** Pre-launch / experimental. Site runs on the Vercel URL
`clothing-website-beryl.vercel.app`. This document is the ordered runbook for
launching on a real domain (`moonscloset.com`) when ready.

> **Core fact:** the site stays on **Vercel** (Next.js). The domain just *points*
> at Vercel — this is a ~10-minute DNS step, not a migration. Shared hosting
> (e.g. Hostinger Premium) is **not** used to host the app; if you buy such a
> plan it's only for the free domain + email mailboxes. See
> [`for-owner/delivery-and-payments-guide.md`](./for-owner/delivery-and-payments-guide.md)
> for the business-side payment/shipping overview.

---

## 0. Decide how you get the domain
Pick one (no rush while experimenting — the "free domain 1 year" clock starts the day you buy):

- **A. Registrar only (cheapest):** register `moonscloset.com` at any registrar (~Rp150–200k/yr) or directly in Vercel. Point it at Vercel. No hosting plan.
- **B. Hosting bundle (Hostinger Premium):** gets the domain free for year 1 + branded mailboxes. The hosting itself stays unused; you still point DNS at Vercel. Buy near launch, not now.

Either way the steps below are the same once you control the domain's DNS.

---

## 1. Pre-launch code cleanup
Do these before pointing a real domain at the site. All are small.

- [ ] **Delete the diagnostic route** `app/api/test-email/route.ts` (still present).
- [ ] **Remove debug logging** — 1 `console.log` in `lib/email.ts`.
- [ ] **Run the search index SQL** in Supabase → SQL Editor (from `supabase/schema.sql`):
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
  ```
- [ ] **Upload real product photos** via the admin panel (the gradient swatch placeholders disappear automatically once a product/variant has images).
- [ ] **Replace remaining placeholder content** — see env vars below (`STORE_EMAIL`, `STORE_ADDRESS`).

## 2. Point the domain at Vercel
1. Vercel → project `clothing-website` → **Settings → Domains → Add** `moonscloset.com` (and `www.moonscloset.com`).
2. Vercel shows the required DNS records. In the domain's DNS panel (registrar or hosting provider) add them:
   - Apex `moonscloset.com` → **A** record to Vercel's IP (Vercel shows the value), or use Vercel nameservers.
   - `www` → **CNAME** to `cname.vercel-dns.com`.
3. Set the primary domain in Vercel (redirect `www` → apex or vice-versa).
4. Wait for DNS propagation + automatic HTTPS (Vercel issues the certificate). Verify `https://moonscloset.com` serves the site.

> ⚠️ The hosting provider will try to park the domain on *their* server (a default/WordPress page). Override that with the Vercel records above. Don't install WordPress.

## 3. Email on the domain
**Branded mailboxes** (`hello@moonscloset.com`) come from the hosting provider (option B) or a service like Zoho Mail (free tier) / Cloudflare Email Routing (free forwarding). These use **MX records** — independent from the web A/CNAME, so they coexist.

**Transactional email (Resend)** — to send order emails from `@moonscloset.com` instead of the `onboarding@resend.dev` sandbox:
1. Resend dashboard → **Domains → Add Domain** `moonscloset.com`.
2. Add the **DKIM + SPF TXT records** Resend gives you to the domain's DNS.
   - If the host also provides mailboxes, **merge** the two SPF entries into one TXT record (one `v=spf1 … -all` line including both `include:` mechanisms).
3. Once verified, set env `RESEND_FROM_EMAIL=noreply@moonscloset.com` (or `pesanan@…`).

## 4. Environment variables (Vercel → Settings → Environment Variables)
Already set: `NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_STORE_TAGLINE`, `NEXT_PUBLIC_STORE_WHATSAPP` (+ Supabase keys).

Set / update at launch, then **redeploy**:

| Variable | Action |
|---|---|
| `NEXT_PUBLIC_STORE_EMAIL` | Set to the real public email (currently placeholder `email@example.com`). |
| `NEXT_PUBLIC_STORE_ADDRESS` | Set to the real store/warehouse address (currently "Alamat toko"). |
| `RESEND_FROM_EMAIL` | Set to `noreply@moonscloset.com` after Resend domain verify (step 3). Until then it defaults to the Resend sandbox. |

`.env.local` should mirror these for local dev.

## 5. Post-launch verification
- [ ] `https://moonscloset.com` and `https://www.moonscloset.com` both load over HTTPS.
- [ ] Place a real test order → admin receives the alert email **from the new domain**; customer confirmation/shipping emails send to a real address (not just the sandbox owner).
- [ ] Contact page shows the real email + address; WhatsApp link opens `6287702228429`.
- [ ] Favicon + logo render; `/links` works (the bio URL becomes `https://moonscloset.com/links`).
- [ ] Update bio links (Instagram/TikTok/Shopee/Tokopedia) in `lib/links.ts` as those accounts come online.
- [ ] (Optional) add the domain to Google Search Console + a sitemap.

## 6. Deploy reminder
Auto-deploy is on: every `git push origin main` redeploys production. **Commit author email must be `manmantab50@gmail.com`** (the GitHub/Vercel account) or Vercel blocks the deploy.

---

## Beyond launch (already scoped in HANDOFF)
- **Phase 2 — Payments (Midtrans):** Snap popup, payment columns on `orders`, webhook. Currently orders are confirmed manually via WhatsApp.
- **Phase 3 — Shipping (RajaOngkir):** province/city + courier selection, ongkir, tracking.
These are independent of the domain move and can follow on their own timeline.
