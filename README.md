# Clothing Store Website

Website toko baju online dengan katalog produk, keranjang belanja, checkout, dan admin panel.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** Vercel
- **Language:** TypeScript

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd "clothing website"
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_STORE_NAME` | Store name |
| `NEXT_PUBLIC_STORE_TAGLINE` | Store tagline |
| `NEXT_PUBLIC_STORE_WHATSAPP` | WhatsApp number (e.g. 628xxx) |
| `NEXT_PUBLIC_STORE_EMAIL` | Store email |
| `NEXT_PUBLIC_STORE_ADDRESS` | Store address |

### 3. Supabase Setup

1. Create a new Supabase project
2. Run `supabase/schema.sql` in the SQL Editor
3. (Optional) Run `supabase/seed.sql` for sample data
4. Create an admin user in Authentication > Users

### 4. Run Locally

```bash
npm run dev
```

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin

## Project Structure

```
app/
├── (store)/           # Public storefront
├── (admin)/admin/     # Admin panel (auth-protected)
├── api/               # API routes
└── layout.tsx         # Root layout

components/
├── store/             # Storefront components
├── admin/             # Admin components
└── ui/                # shadcn/ui primitives

lib/
├── supabase/          # Supabase clients
├── cart-context.tsx   # Cart state management
├── config.ts          # Site config from env vars
└── types.ts           # TypeScript types
```

## Deployment

Deployed on Vercel. Push to `master` to trigger auto-deploy.

All branding is configurable via environment variables — no code changes needed.
