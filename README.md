# Moon's Closet — Clothing Store Website

Storefront + admin panel for an Indonesian clothing store. The public storefront is restyled in a Zara-inspired aesthetic; the admin panel is functional shadcn defaults.

- **Repo:** https://github.com/marshal-rizky/Moons-closet
- **Production:** https://clothing-website-beryl.vercel.app
- **Branch:** `main`

---

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui (admin)
- **Fonts:** system Helvetica (body) + Cormorant (display)
- **Database / auth / storage:** Supabase
- **Email:** Resend
- **Deployment:** Vercel

---

## Local setup

```bash
git clone git@github.com:marshal-rizky/Moons-closet.git
cd Moons-closet
cp .env.example .env.local       # fill in Supabase + Resend keys
npm install
npm run dev
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin

### Required env vars

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin key (never expose) |
| `NEXT_PUBLIC_STORE_NAME` | Wordmark + meta title |
| `NEXT_PUBLIC_STORE_TAGLINE` | Hero subtitle, footer |
| `NEXT_PUBLIC_STORE_WHATSAPP` | `628xxxxxxxxxx` (no leading `+`) |
| `NEXT_PUBLIC_STORE_EMAIL` | Public contact + admin alert recipient |
| `NEXT_PUBLIC_STORE_ADDRESS` | Footer + contact page |
| `RESEND_API_KEY` | Required for transactional emails |
| `RESEND_FROM_EMAIL` | Optional, defaults to `onboarding@resend.dev` |

Branding is entirely env-driven — no code changes needed to rename the store, swap the WhatsApp number, etc.

### Supabase setup
1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL Editor
3. (Optional) Run `supabase/seed.sql` for sample data
4. Create an admin user in **Authentication → Users**

---

## Project layout

```
app/(store)/      Public storefront — Zara design
app/(admin)/      Admin panel — auth-protected
app/api/          Orders / products / upload / email routes
components/store/ Storefront components
components/admin/ Admin components
components/ui/    Shared primitives
lib/              Supabase clients, contexts, config, email
supabase/         schema.sql + seed.sql
docs/             Project documentation (see below)
```

---

## Documentation

| Document | What it covers |
|---|---|
| [`docs/HANDOFF.md`](./docs/HANDOFF.md) | Current state, deployment info, env vars, file map, outstanding work |
| [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md) | Zara-inspired design tokens, typography, components, patterns |
| [`docs/for-owner/`](./docs/for-owner/) | Plain-language guides for the store owner (Bahasa Indonesia) — payment gateways, courier integration, API costs |
| [`docs/history/`](./docs/history/) | Past design specs, implementation plans, and session snapshots |

Start with `HANDOFF.md` for an orientation, then `DESIGN-SYSTEM.md` before touching any storefront UI.

---

## Deployment

Production deploys from `main` on Vercel. To enable auto-deploy on push, connect this repo in **Vercel → Settings → Git**. After connecting, every `git push origin main` redeploys production; branch pushes generate preview URLs.

To change branding, edit env vars on Vercel and redeploy — no code changes.

---

## License

Private project. All rights reserved.
