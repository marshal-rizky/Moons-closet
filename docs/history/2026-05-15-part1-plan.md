# Clothing Store Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimalist, elegant clothing store website with product catalog, cart, checkout, and admin panel for a mom's clothing business.

**Architecture:** Monolith Next.js 15 App Router with route groups `(store)` for public storefront and `(admin)` for protected admin panel. Supabase for database, auth, and file storage. Client-side cart via localStorage + React Context. All branding configurable via env vars.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui (new-york style, zinc base), Supabase (PostgreSQL + Auth + Storage), Vercel deployment

**Design System:**
- Typography: Cormorant (headings) + Montserrat (body)
- Colors: Warm neutrals — Background `#faf7f5`, Text `#2c2c2c`, Accent configurable via CSS vars
- Style: Minimalis & Elegan — generous whitespace, serif headings, clean lines
- Icons: Lucide (via shadcn/ui)
- Radius: `0.375rem` (subtle)

**Design Skills Applied:** ui-ux-pro-max, frontend-design, vercel:shadcn

---

## Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`
- Create: `app/layout.tsx`, `app/globals.css`
- Create: `lib/utils.ts`
- Create: `components.json`
- Create: `.env.local`, `.env.example`
- Create: `.gitignore`

- [ ] **Step 1.1: Initialize Next.js project**

```bash
cd "C:/Users/User/clothing website"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes
```

- [ ] **Step 1.2: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

- [ ] **Step 1.3: Fix Geist font issue after shadcn init**

In `app/globals.css`, inside `@theme inline`, replace font declarations:

```css
--font-sans: "Geist", "Geist Fallback", ui-sans-serif, system-ui, sans-serif;
--font-mono: "Geist Mono", "Geist Mono Fallback", ui-monospace, monospace;
```

In `app/layout.tsx`, move font variable classNames from `<body>` to `<html>`:

```tsx
<html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
  <body className="antialiased">
```

- [ ] **Step 1.4: Install Supabase client + additional dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 1.5: Add shadcn/ui components**

```bash
npx shadcn@latest add button card input label select badge table tabs dialog dropdown-menu separator skeleton sheet avatar textarea alert scroll-area tooltip
```

- [ ] **Step 1.6: Add Cormorant + Montserrat fonts**

In `app/layout.tsx`, add Google Fonts via `next/font/google`:

```tsx
import { Cormorant, Montserrat } from "next/font/google";

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});
```

Update `<html>` tag:

```tsx
<html lang="id" className={`${cormorant.variable} ${montserrat.variable}`}>
```

In `app/globals.css`, update `@theme inline`:

```css
--font-sans: var(--font-body), "Montserrat", ui-sans-serif, system-ui, sans-serif;
--font-heading: var(--font-heading), "Cormorant", ui-serif, Georgia, serif;
```

- [ ] **Step 1.7: Configure theme colors**

In `app/globals.css`, update CSS variables inside `@theme inline` for warm neutral palette:

```css
--color-background: oklch(0.98 0.005 80);
--color-foreground: oklch(0.2 0.02 60);
--color-card: oklch(1 0 0);
--color-card-foreground: oklch(0.2 0.02 60);
--color-primary: oklch(0.25 0.02 60);
--color-primary-foreground: oklch(0.98 0.005 80);
--color-secondary: oklch(0.94 0.01 80);
--color-secondary-foreground: oklch(0.25 0.02 60);
--color-muted: oklch(0.94 0.01 80);
--color-muted-foreground: oklch(0.55 0.01 60);
--color-accent: oklch(0.94 0.01 80);
--color-accent-foreground: oklch(0.25 0.02 60);
--color-destructive: oklch(0.55 0.2 25);
--color-border: oklch(0.88 0.01 80);
--color-input: oklch(0.88 0.01 80);
--color-ring: oklch(0.25 0.02 60);
--radius: 0.375rem;
```

- [ ] **Step 1.8: Create .env.example and .env.local**

Create `.env.example`:

```env
NEXT_PUBLIC_STORE_NAME="Nama Toko"
NEXT_PUBLIC_STORE_TAGLINE="Tagline toko"
NEXT_PUBLIC_STORE_WHATSAPP="628xxxxxxxxxx"
NEXT_PUBLIC_STORE_EMAIL="email@example.com"
NEXT_PUBLIC_STORE_ADDRESS="Alamat toko"

NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
SUPABASE_SERVICE_ROLE_KEY="xxx"
```

Copy to `.env.local` with placeholder values.

- [ ] **Step 1.9: Create lib/config.ts**

```tsx
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "Nama Toko",
  tagline: process.env.NEXT_PUBLIC_STORE_TAGLINE || "Tagline toko",
  whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP || "628000000000",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || "email@example.com",
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS || "Alamat toko",
  currency: "IDR",
  locale: "id-ID",
} as const;

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
```

- [ ] **Step 1.10: Create lib/types.ts**

```tsx
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  product_id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string | null;
};

export type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "done";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  product_id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string | null;
  slug: string;
};
```

- [ ] **Step 1.11: Initialize git and commit**

```bash
git init
echo "node_modules/\n.next/\n.env.local\n.env\n.superpowers/" > .gitignore
git add -A
git commit -m "feat: initialize Next.js project with shadcn/ui and Supabase config"
```

- [ ] **Step 1.12: Verify dev server starts**

```bash
npm run dev
```

Expected: App runs on localhost:3000 with default Next.js page, fonts load correctly.

---

## Task 2: Supabase Client Setup

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `middleware.ts`

- [ ] **Step 2.1: Create browser client**

Create `lib/supabase/client.ts`:

```tsx
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2.2: Create server client**

Create `lib/supabase/server.ts`:

```tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Component
          }
        },
      },
    }
  );
}
```

- [ ] **Step 2.3: Create admin client (service role)**

Create `lib/supabase/admin.ts`:

```tsx
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

- [ ] **Step 2.4: Create middleware helper**

Create `lib/supabase/middleware.ts`:

```tsx
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin") &&
      !request.nextUrl.pathname.startsWith("/admin/login") &&
      !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 2.5: Create root middleware**

Create `middleware.ts` at project root:

```tsx
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 2.6: Commit**

```bash
git add lib/supabase/ middleware.ts
git commit -m "feat: add Supabase client setup with auth middleware"
```

---

## Task 3: Database Schema (Supabase SQL)

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 3.1: Create SQL schema file**

Create `supabase/schema.sql`:

```sql
-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  category TEXT NOT NULL DEFAULT '',
  sizes JSONB DEFAULT '[]'::jsonb,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number SERIAL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'shipped', 'done')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read active products
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Products: authenticated users (admin) can do everything
CREATE POLICY "Admin full access to products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Orders: anyone can create orders
CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Orders: authenticated users (admin) can read and update
CREATE POLICY "Admin full access to orders"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can read images
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Storage policy: authenticated users can upload/delete
CREATE POLICY "Admin can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
```

- [ ] **Step 3.2: Run this SQL in Supabase Dashboard**

Go to Supabase Dashboard → SQL Editor → paste and run `schema.sql`.

- [ ] **Step 3.3: Create seed data file**

Create `supabase/seed.sql`:

```sql
INSERT INTO products (name, slug, description, price, images, category, sizes, stock, is_active) VALUES
  ('Blouse Satin Elegan', 'blouse-satin-elegan', 'Blouse satin dengan detail kerah yang elegan, cocok untuk acara formal maupun kasual.', 185000, '[]', 'atasan', '["S","M","L","XL"]', 25, true),
  ('Kemeja Linen Polos', 'kemeja-linen-polos', 'Kemeja linen premium dengan bahan adem dan nyaman untuk sehari-hari.', 165000, '[]', 'atasan', '["S","M","L","XL"]', 30, true),
  ('Celana Kulot Wide Leg', 'celana-kulot-wide-leg', 'Celana kulot wide leg dengan bahan jatuh yang nyaman, cocok untuk berbagai kesempatan.', 175000, '[]', 'bawahan', '["S","M","L","XL"]', 20, true),
  ('Rok Midi A-Line', 'rok-midi-a-line', 'Rok midi A-line klasik dengan detail lipatan yang cantik.', 155000, '[]', 'bawahan', '["S","M","L","XL"]', 18, true),
  ('Dress Midi Floral', 'dress-midi-floral', 'Dress midi dengan motif floral yang feminin dan anggun.', 225000, '[]', 'dress', '["S","M","L","XL"]', 15, true),
  ('Dress Wrap Polos', 'dress-wrap-polos', 'Dress wrap klasik yang flattering untuk semua bentuk tubuh.', 210000, '[]', 'dress', '["S","M","L"]', 12, true),
  ('Cardigan Rajut Oversized', 'cardigan-rajut-oversized', 'Cardigan rajut oversized yang cozy untuk layering.', 195000, '[]', 'atasan', '["M","L","XL"]', 22, true),
  ('Celana Palazzo High Waist', 'celana-palazzo-high-waist', 'Celana palazzo high waist dengan bahan premium yang jatuh sempurna.', 185000, '[]', 'bawahan', '["S","M","L","XL"]', 16, true);
```

- [ ] **Step 3.4: Run seed SQL in Supabase Dashboard**

- [ ] **Step 3.5: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema and seed data"
```

---

## Task 4: Cart Context (Client-Side State)

**Files:**
- Create: `lib/cart-context.tsx`
- Create: `components/providers.tsx`

- [ ] **Step 4.1: Create CartContext**

Create `lib/cart-context.tsx`:

```tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { CartItem } from "@/lib/types";

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "clothing-store-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product_id === newItem.product_id && i.size === newItem.size
      );
      if (existing) {
        return prev.map((i) =>
          i.product_id === newItem.product_id && i.size === newItem.size
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product_id === productId && i.size === size))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, size);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.product_id === productId && i.size === size
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
```

- [ ] **Step 4.2: Create Providers wrapper**

Create `components/providers.tsx`:

```tsx
"use client";

import { CartProvider } from "@/lib/cart-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <CartProvider>{children}</CartProvider>
    </TooltipProvider>
  );
}
```

- [ ] **Step 4.3: Wrap root layout with Providers**

In `app/layout.tsx`, wrap `{children}` with `<Providers>`:

```tsx
import { Providers } from "@/components/providers";

// Inside return:
<body className="font-body antialiased">
  <Providers>{children}</Providers>
</body>
```

- [ ] **Step 4.4: Commit**

```bash
git add lib/cart-context.tsx components/providers.tsx app/layout.tsx
git commit -m "feat: add cart context with localStorage persistence"
```

---

## Task 5: Store Layout — Navbar & Footer

**Files:**
- Create: `components/store/navbar.tsx`
- Create: `components/store/footer.tsx`
- Create: `app/(store)/layout.tsx`

- [ ] **Step 5.1: Create Navbar**

Create `components/store/navbar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/shop", label: "Belanja" },
  { href: "/contact", label: "Kontak" },
];

export function Navbar() {
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="font-heading text-xl font-semibold tracking-wider uppercase">
          {siteConfig.name}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Cart + Mobile Menu */}
        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-heading text-lg tracking-wider uppercase">
                {siteConfig.name}
              </SheetTitle>
              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5.2: Create Footer**

Create `components/store/footer.tsx`:

```tsx
import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-lg font-semibold tracking-wider uppercase">
              {siteConfig.name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {siteConfig.tagline}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Menu</h4>
            <nav className="mt-3 flex flex-col gap-2">
              <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground">
                Belanja
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Kontak
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Kontak</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <a
                href={`https://wa.me/${siteConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                WhatsApp
              </a>
              <a href={`mailto:${siteConfig.email}`} className="hover:text-foreground">
                {siteConfig.email}
              </a>
              <p>{siteConfig.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5.3: Create store layout**

Create `app/(store)/layout.tsx`:

```tsx
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import type { ReactNode } from "react";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 5.4: Commit**

```bash
git add components/store/ app/\(store\)/layout.tsx
git commit -m "feat: add store navbar and footer with responsive mobile menu"
```

---

## Task 6: Storefront Pages — Home, Shop, Product Detail

**Files:**
- Create: `components/store/product-card.tsx`
- Create: `components/store/category-filter.tsx`
- Create: `components/store/product-gallery.tsx`
- Create: `components/store/add-to-cart-button.tsx`
- Create: `components/store/placeholder-image.tsx`
- Create: `app/(store)/page.tsx`
- Create: `app/(store)/shop/page.tsx`
- Create: `app/(store)/product/[slug]/page.tsx`

- [ ] **Step 6.1: Create placeholder image component**

Create `components/store/placeholder-image.tsx`:

```tsx
export function PlaceholderImage({
  className = "",
  text = "",
}: {
  className?: string;
  text?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-secondary/60 text-muted-foreground ${className}`}
    >
      {text && <span className="text-xs">{text}</span>}
    </div>
  );
}
```

- [ ] **Step 6.2: Create ProductCard component**

Create `components/store/product-card.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/config";
import { PlaceholderImage } from "./placeholder-image";

export function ProductCard({ product }: { product: Product }) {
  const hasImage = product.images.length > 0;

  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="aspect-[3/4] overflow-hidden bg-secondary/30">
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={533}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImage className="h-full w-full" />
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 6.3: Create CategoryFilter component**

Create `components/store/category-filter.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CategoryFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";

  function handleFilter(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!currentCategory ? "default" : "outline"}
        size="sm"
        onClick={() => handleFilter("")}
        className="text-xs uppercase tracking-wider"
      >
        Semua
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat}
          variant={currentCategory === cat ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilter(cat)}
          className="text-xs uppercase tracking-wider"
        >
          {cat}
        </Button>
      ))}
    </div>
  );
}
```

- [ ] **Step 6.4: Create Home page**

Create `app/(store)/page.tsx`:

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: categoriesRaw } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  const categories = [...new Set((categoriesRaw || []).map((c) => c.category))].filter(Boolean);

  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        <h1 className="font-heading text-4xl font-semibold tracking-wider uppercase sm:text-5xl lg:text-6xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          {siteConfig.tagline}
        </p>
        <Link href="/shop" className="mt-8">
          <Button size="lg" className="text-xs uppercase tracking-widest">
            Belanja Sekarang
          </Button>
        </Link>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold tracking-wider text-center uppercase mb-8">
            Kategori
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/shop?category=${cat}`}
                className="group flex aspect-[4/3] items-center justify-center bg-secondary/40 transition-colors hover:bg-secondary/60"
              >
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                  {cat}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Products */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="font-heading text-2xl font-semibold tracking-wider text-center uppercase mb-8">
          Produk Terbaru
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {(products as Product[] || []).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 6.5: Create Shop page**

Create `app/(store)/shop/page.tsx`:

```tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/product-card";
import { CategoryFilter } from "@/components/store/category-filter";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/lib/types";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data: products } = await query;

  const { data: categoriesRaw } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  const categories = [...new Set((categoriesRaw || []).map((c) => c.category))].filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-wider uppercase mb-8">
        Belanja
      </h1>

      <Suspense fallback={null}>
        <CategoryFilter categories={categories} />
      </Suspense>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {(products as Product[] || []).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {(!products || products.length === 0) && (
        <div className="py-20 text-center text-muted-foreground">
          Belum ada produk dalam kategori ini.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6.6: Create AddToCartButton**

Create `components/store/add-to-cart-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);

  const sizes = product.sizes as string[];
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (!selectedSize || outOfStock) return;
    addItem({
      product_id: product.id,
      name: product.name,
      size: selectedSize,
      quantity: 1,
      price: product.price,
      image: product.images[0] || null,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Size Selector */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
          Ukuran
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`cursor-pointer border px-4 py-2 text-sm transition-colors ${
                selectedSize === size
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Stock indicator */}
      {outOfStock && (
        <p className="text-sm text-destructive">Stok habis</p>
      )}
      {!outOfStock && product.stock <= 5 && (
        <p className="text-sm text-muted-foreground">
          Sisa {product.stock} stok
        </p>
      )}

      {/* Add to Cart */}
      <Button
        onClick={handleAdd}
        disabled={!selectedSize || outOfStock}
        className="w-full text-xs uppercase tracking-widest"
        size="lg"
      >
        {added
          ? "Ditambahkan!"
          : outOfStock
            ? "Stok Habis"
            : "Tambah ke Keranjang"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 6.7: Create Product Detail page**

Create `app/(store)/product/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/config";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { PlaceholderImage } from "@/components/store/placeholder-image";
import type { Product } from "@/lib/types";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const p = product as Product;
  const images = p.images as string[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-[3/4] overflow-hidden bg-secondary/30">
            {images.length > 0 ? (
              <Image
                src={images[0]}
                alt={p.name}
                width={600}
                height={800}
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <PlaceholderImage className="h-full w-full" />
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1).map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden bg-secondary/30">
                  <Image
                    src={img}
                    alt={`${p.name} ${i + 2}`}
                    width={150}
                    height={150}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {p.category}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold">
              {p.name}
            </h1>
            <p className="mt-2 text-xl text-muted-foreground">
              {formatPrice(p.price)}
            </p>
          </div>

          <AddToCartButton product={p} />

          {p.description && (
            <div className="border-t border-border pt-6">
              <h2 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                Deskripsi
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6.8: Commit**

```bash
git add components/store/ app/\(store\)/
git commit -m "feat: add home, shop, and product detail pages"
```

---

## Task 7: Cart & Checkout Pages

**Files:**
- Create: `components/store/cart-item.tsx`
- Create: `app/(store)/cart/page.tsx`
- Create: `app/(store)/checkout/page.tsx`
- Create: `app/api/orders/route.ts`

- [ ] **Step 7.1: Create CartItem component**

Create `components/store/cart-item.tsx`:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "./placeholder-image";
import type { CartItem as CartItemType } from "@/lib/types";

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 border-b border-border py-4">
      {/* Image */}
      <Link href={`/product/${item.slug}`} className="shrink-0">
        <div className="h-20 w-16 overflow-hidden bg-secondary/30">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={64}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <PlaceholderImage className="h-full w-full" />
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              Ukuran: {item.size}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => removeItem(item.product_id, item.size)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                updateQuantity(item.product_id, item.size, item.quantity - 1)
              }
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                updateQuantity(item.product_id, item.size, item.quantity + 1)
              }
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm font-medium">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7.2: Create Cart page**

Create `app/(store)/cart/page.tsx`:

```tsx
"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/config";
import { CartItem } from "@/components/store/cart-item";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">
          Keranjang Kosong
        </h1>
        <p className="mt-2 text-muted-foreground">
          Belum ada produk di keranjang kamu.
        </p>
        <Link href="/shop" className="mt-6 inline-block">
          <Button className="text-xs uppercase tracking-widest">
            Mulai Belanja
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-wider uppercase mb-8">
        Keranjang
      </h1>

      <div className="space-y-0">
        {items.map((item) => (
          <CartItem
            key={`${item.product_id}-${item.size}`}
            item={item}
          />
        ))}
      </div>

      <Separator className="my-6" />

      <div className="flex items-center justify-between text-lg">
        <span className="font-medium">Total</span>
        <span className="font-heading text-xl font-semibold">
          {formatPrice(totalPrice)}
        </span>
      </div>

      <Link href="/checkout" className="mt-6 block">
        <Button className="w-full text-xs uppercase tracking-widest" size="lg">
          Lanjut ke Checkout
        </Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 7.3: Create Orders API route**

Create `app/api/orders/route.ts`:

```tsx
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { customer_name, customer_phone, customer_address, customer_email, items, total, notes } = body;

    // Validate required fields
    if (!customer_name || !customer_phone || !customer_address || !items?.length || !total) {
      return NextResponse.json(
        { error: "Data tidak lengkap. Mohon isi semua field yang wajib." },
        { status: 400 }
      );
    }

    // Validate phone format (basic)
    const phoneClean = customer_phone.replace(/\D/g, "");
    if (phoneClean.length < 10 || phoneClean.length > 15) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name: customer_name.trim(),
        customer_phone: phoneClean,
        customer_email: customer_email?.trim() || null,
        customer_address: customer_address.trim(),
        items,
        total,
        notes: notes?.trim() || null,
        status: "pending",
      })
      .select("id, order_number")
      .single();

    if (error) {
      console.error("Order creation error:", error);
      return NextResponse.json(
        { error: "Gagal membuat pesanan. Silakan coba lagi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order: data });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 7.4: Create Checkout page**

Create `app/(store)/checkout/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice, siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0 && !success) {
    router.push("/cart");
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.get("name"),
          customer_phone: form.get("phone"),
          customer_email: form.get("email") || null,
          customer_address: form.get("address"),
          notes: form.get("notes") || null,
          items: items.map((i) => ({
            product_id: i.product_id,
            name: i.name,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
            image: i.image,
          })),
          total: totalPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat pesanan.");
        return;
      }

      clearCart();
      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">
          Pesanan Berhasil!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Terima kasih! Kami akan menghubungi Anda via WhatsApp untuk konfirmasi pesanan.
        </p>
        <Link href="/shop" className="mt-6 inline-block">
          <Button className="text-xs uppercase tracking-widest">
            Lanjut Belanja
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-wider uppercase mb-8">
        Checkout
      </h1>

      {/* Order Summary */}
      <div className="mb-8 rounded-sm border border-border p-4">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          Ringkasan Pesanan
        </h2>
        {items.map((item) => (
          <div
            key={`${item.product_id}-${item.size}`}
            className="flex justify-between py-1 text-sm"
          >
            <span>
              {item.name} ({item.size}) &times; {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <Separator className="my-3" />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span className="font-heading text-lg">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap *</Label>
          <Input id="name" name="name" required placeholder="Nama lengkap" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">No. WhatsApp *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="08xxxxxxxxxx"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (opsional)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Alamat Lengkap *</Label>
          <Textarea
            id="address"
            name="address"
            required
            placeholder="Alamat lengkap untuk pengiriman"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Catatan (opsional)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Catatan tambahan untuk pesanan"
            rows={2}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full text-xs uppercase tracking-widest"
          size="lg"
        >
          {loading ? "Memproses..." : "Pesan Sekarang"}
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 7.5: Commit**

```bash
git add components/store/cart-item.tsx app/\(store\)/cart/ app/\(store\)/checkout/ app/api/orders/
git commit -m "feat: add cart, checkout pages, and order API"
```

---

## Task 8: Contact Page

**Files:**
- Create: `app/(store)/contact/page.tsx`

- [ ] **Step 8.1: Create Contact page**

Create `app/(store)/contact/page.tsx`:

```tsx
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-wider uppercase mb-8">
        Kontak
      </h1>

      <div className="space-y-6">
        <a
          href={`https://wa.me/${siteConfig.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-4 rounded-sm border border-border p-4 transition-colors hover:bg-secondary/30"
        >
          <MessageCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-medium">WhatsApp</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Chat langsung dengan kami
            </p>
          </div>
        </a>

        <a
          href={`mailto:${siteConfig.email}`}
          className="flex items-start gap-4 rounded-sm border border-border p-4 transition-colors hover:bg-secondary/30"
        >
          <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-medium">Email</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {siteConfig.email}
            </p>
          </div>
        </a>

        <div className="flex items-start gap-4 rounded-sm border border-border p-4">
          <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-medium">Alamat</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {siteConfig.address}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a
          href={`https://wa.me/${siteConfig.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg" className="text-xs uppercase tracking-widest">
            Chat via WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 8.2: Commit**

```bash
git add app/\(store\)/contact/
git commit -m "feat: add contact page"
```

---

## Task 9: Admin Panel — Login & Layout

**Files:**
- Create: `app/(admin)/admin/login/page.tsx`
- Create: `app/(admin)/admin/layout.tsx`
- Create: `components/admin/sidebar.tsx`

- [ ] **Step 9.1: Create Admin Login page**

Create `app/(admin)/admin/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-xl tracking-wider uppercase">
            {siteConfig.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">Admin Login</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Masuk..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 9.2: Create Admin Sidebar**

Create `components/admin/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingCart },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-dvh w-56 flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <Link href="/admin" className="font-heading text-sm font-semibold tracking-wider uppercase">
          {siteConfig.name}
        </Link>
        <p className="text-xs text-muted-foreground">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 9.3: Create Admin Layout**

Create `app/(admin)/admin/layout.tsx`:

```tsx
import { AdminSidebar } from "@/components/admin/sidebar";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 9.4: Commit**

```bash
git add app/\(admin\)/ components/admin/
git commit -m "feat: add admin login, sidebar, and layout"
```

---

## Task 10: Admin Dashboard

**Files:**
- Create: `app/(admin)/admin/page.tsx`
- Create: `components/admin/stats-card.tsx`
- Create: `components/admin/order-status-badge.tsx`

- [ ] **Step 10.1: Create StatsCard and OrderStatusBadge**

Create `components/admin/stats-card.tsx`:

```tsx
import { Card, CardContent } from "@/components/ui/card";

export function StatsCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
```

Create `components/admin/order-status-badge.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  confirmed: { label: "Dikonfirmasi", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  shipped: { label: "Dikirim", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  done: { label: "Selesai", className: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
} as const;

export function OrderStatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];
  return (
    <Badge variant="secondary" className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}
```

- [ ] **Step 10.2: Create Dashboard page**

Create `app/(admin)/admin/page.tsx`:

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/config";
import { StatsCard } from "@/components/admin/stats-card";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import type { Order } from "@/lib/types";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Revenue this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthOrders } = await supabase
    .from("orders")
    .select("total")
    .gte("created_at", startOfMonth.toISOString())
    .in("status", ["confirmed", "shipped", "done"]);

  const revenue = (monthOrders || []).reduce((sum, o) => sum + o.total, 0);

  // Recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatsCard label="Pesanan Baru" value={pendingOrders || 0} />
        <StatsCard label="Total Produk" value={totalProducts || 0} />
        <StatsCard label="Pendapatan Bulan Ini" value={formatPrice(revenue)} />
      </div>

      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Pesanan Terbaru
      </h2>
      <div className="rounded-sm border border-border">
        {(recentOrders as Order[] || []).map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0 hover:bg-secondary/30 transition-colors"
          >
            <div>
              <span className="text-sm font-medium">{order.customer_name}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {order.items.length} item — {formatPrice(order.total)}
              </span>
            </div>
            <OrderStatusBadge status={order.status} />
          </Link>
        ))}
        {(!recentOrders || recentOrders.length === 0) && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Belum ada pesanan.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 10.3: Commit**

```bash
git add app/\(admin\)/admin/page.tsx components/admin/
git commit -m "feat: add admin dashboard with stats and recent orders"
```

---

## Task 11: Admin — Product Management (CRUD)

**Files:**
- Create: `app/(admin)/admin/products/page.tsx`
- Create: `app/(admin)/admin/products/new/page.tsx`
- Create: `app/(admin)/admin/products/[id]/edit/page.tsx`
- Create: `components/admin/product-form.tsx`
- Create: `app/api/products/route.ts`
- Create: `app/api/products/[id]/route.ts`
- Create: `app/api/upload/route.ts`

- [ ] **Step 11.1: Create product API routes**

Create `app/api/products/route.ts`:

```tsx
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const { data, error } = await supabase
    .from("products")
    .insert({ ...body, slug })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
```

Create `app/api/products/[id]/route.ts`:

```tsx
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const { data, error } = await supabase
    .from("products")
    .update({ ...body, slug })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 11.2: Create upload API route**

Create `app/api/upload/route.ts`:

```tsx
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(filename, file);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
```

- [ ] **Step 11.3: Create ProductForm component**

Create `components/admin/product-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/types";

const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

type ProductFormProps = {
  product?: Product;
};

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [category, setCategory] = useState(product?.category || "");
  const [sizes, setSizes] = useState<string[]>((product?.sizes as string[]) || []);
  const [stock, setStock] = useState(product?.stock?.toString() || "0");
  const [description, setDescription] = useState(product?.description || "");
  const [images, setImages] = useState<string[]>((product?.images as string[]) || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleSize(size: string) {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    if (images.length + files.length > 5) {
      setError("Maksimal 5 foto.");
      return;
    }

    setUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal upload foto.");
        break;
      }
      setImages((prev) => [...prev, data.url]);
    }
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      name,
      price: parseInt(price),
      category,
      sizes,
      stock: parseInt(stock),
      description,
      images,
    };

    const url = isEditing ? `/api/products/${product.id}` : "/api/products";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal menyimpan produk.");
      setSaving(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Produk *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Harga (Rp) *</Label>
        <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategori *</Label>
        <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="atasan, bawahan, dress, dll." />
      </div>

      <div className="space-y-2">
        <Label>Ukuran Tersedia</Label>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`cursor-pointer border px-4 py-2 text-sm transition-colors ${
                sizes.includes(size)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stock">Stok *</Label>
        <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required min="0" />
      </div>

      <div className="space-y-2">
        <Label>Foto Produk (max 5)</Label>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {images.map((img, i) => (
              <div key={i} className="relative h-20 w-20 border border-border">
                <img src={img} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-border rounded-sm px-4 py-6 text-sm text-muted-foreground hover:border-foreground transition-colors">
          <Upload className="h-4 w-4" />
          {uploading ? "Mengupload..." : "Klik untuk upload foto"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Menyimpan..." : isEditing ? "Update Produk" : "Tambah Produk"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 11.4: Create Products list page**

Create `app/(admin)/admin/products/page.tsx`:

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/store/placeholder-image";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold">Produk</h1>
        <Link href="/admin/products/new">
          <Button>+ Tambah Produk</Button>
        </Link>
      </div>

      <div className="rounded-sm border border-border">
        {(products as Product[] || []).map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden bg-secondary/30">
              {product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <PlaceholderImage className="h-full w-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(product.price)} — Stok: {product.stock}
                {product.stock === 0 && (
                  <span className="ml-1 text-destructive">Habis</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/products/${product.id}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </div>
          </div>
        ))}
        {(!products || products.length === 0) && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Belum ada produk.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 11.5: Create New Product page**

Create `app/(admin)/admin/products/new/page.tsx`:

```tsx
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold mb-6">Tambah Produk</h1>
      <ProductForm />
    </div>
  );
}
```

- [ ] **Step 11.6: Create Edit Product page**

Create `app/(admin)/admin/products/[id]/edit/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import type { Product } from "@/lib/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold mb-6">Edit Produk</h1>
      <ProductForm product={product as Product} />
    </div>
  );
}
```

- [ ] **Step 11.7: Commit**

```bash
git add app/api/products/ app/api/upload/ app/\(admin\)/admin/products/ components/admin/product-form.tsx
git commit -m "feat: add admin product management (list, create, edit, delete, image upload)"
```

---

## Task 12: Admin — Order Management

**Files:**
- Create: `app/(admin)/admin/orders/page.tsx`
- Create: `app/(admin)/admin/orders/[id]/page.tsx`
- Create: `app/api/orders/[id]/route.ts`

- [ ] **Step 12.1: Create order status update API**

Create `app/api/orders/[id]/route.ts`:

```tsx
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await request.json();

  const validStatuses = ["pending", "confirmed", "shipped", "done"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
```

- [ ] **Step 12.2: Create Orders list page**

Create `app/(admin)/admin/orders/page.tsx`:

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/config";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import type { Order } from "@/lib/types";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold mb-6">Pesanan</h1>

      <div className="rounded-sm border border-border">
        <div className="hidden sm:grid grid-cols-5 gap-4 border-b border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
          <span>No.</span>
          <span>Customer</span>
          <span>Total</span>
          <span>Status</span>
          <span>Tanggal</span>
        </div>
        {(orders as Order[] || []).map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="grid sm:grid-cols-5 gap-2 sm:gap-4 border-b border-border px-4 py-3 last:border-0 hover:bg-secondary/30 transition-colors"
          >
            <span className="text-sm font-medium">#{order.order_number}</span>
            <span className="text-sm">{order.customer_name}</span>
            <span className="text-sm">{formatPrice(order.total)}</span>
            <span><OrderStatusBadge status={order.status} /></span>
            <span className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString("id-ID")}
            </span>
          </Link>
        ))}
        {(!orders || orders.length === 0) && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Belum ada pesanan.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 12.3: Create Order Detail page with status update**

Create `app/(admin)/admin/orders/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/config";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusUpdater } from "./status-updater";
import type { Order } from "@/lib/types";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const o = order as Order;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Pesanan #{o.order_number}
          </h1>
          <p className="text-xs text-muted-foreground">
            {new Date(o.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <OrderStatusBadge status={o.status} />
      </div>

      {/* Customer Info */}
      <div className="rounded-sm border border-border p-4 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Info Customer
        </h2>
        <div className="space-y-1 text-sm">
          <p className="font-medium">{o.customer_name}</p>
          <p className="text-muted-foreground">{o.customer_phone}</p>
          {o.customer_email && (
            <p className="text-muted-foreground">{o.customer_email}</p>
          )}
          <p className="text-muted-foreground">{o.customer_address}</p>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-sm border border-border p-4 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Item Pesanan
        </h2>
        {o.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div className="text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="text-muted-foreground"> — {item.size} &times; {item.quantity}</span>
            </div>
            <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 mt-3 border-t border-border font-medium">
          <span>Total</span>
          <span className="font-heading text-lg">{formatPrice(o.total)}</span>
        </div>
      </div>

      {/* Notes */}
      {o.notes && (
        <div className="rounded-sm border border-border p-4 mb-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Catatan
          </h2>
          <p className="text-sm text-muted-foreground">{o.notes}</p>
        </div>
      )}

      {/* Status Update */}
      <OrderStatusUpdater orderId={o.id} currentStatus={o.status} />
    </div>
  );
}
```

- [ ] **Step 12.4: Create OrderStatusUpdater client component**

Create `app/(admin)/admin/orders/[id]/status-updater.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const statusFlow = [
  { status: "confirmed", label: "Konfirmasi", className: "bg-green-600 hover:bg-green-700 text-white" },
  { status: "shipped", label: "Kirim", className: "bg-blue-600 hover:bg-blue-700 text-white" },
  { status: "done", label: "Selesai", className: "bg-purple-600 hover:bg-purple-700 text-white" },
] as const;

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const currentIndex = statusFlow.findIndex((s) => s.status === currentStatus);
  const availableStatuses = statusFlow.filter((_, i) => i > currentIndex);

  if (currentStatus === "done" || availableStatuses.length === 0) return null;

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
        Update Status
      </h2>
      <div className="flex gap-2">
        {availableStatuses.map((s) => (
          <Button
            key={s.status}
            disabled={loading}
            className={s.className}
            onClick={() => updateStatus(s.status)}
          >
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 12.5: Commit**

```bash
git add app/api/orders/ app/\(admin\)/admin/orders/
git commit -m "feat: add admin order management with status updates"
```

---

## Task 13: Final Polish & Verification

**Files:**
- Modify: `app/layout.tsx` (metadata)
- Create: `app/not-found.tsx`

- [ ] **Step 13.1: Add metadata to root layout**

In `app/layout.tsx`, add metadata:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STORE_NAME || "Toko Baju",
  description: process.env.NEXT_PUBLIC_STORE_TAGLINE || "Toko baju online",
};
```

- [ ] **Step 13.2: Create 404 page**

Create `app/not-found.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-6xl font-semibold">404</h1>
      <p className="mt-4 text-muted-foreground">Halaman tidak ditemukan.</p>
      <Link href="/" className="mt-6">
        <Button className="text-xs uppercase tracking-widest">
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 13.3: Run dev server and verify all pages**

```bash
npm run dev
```

Verify these routes:
- `/` — Home page with hero, categories, latest products
- `/shop` — Product grid with category filters
- `/product/blouse-satin-elegan` — Product detail with size selector
- `/cart` — Cart (empty state and with items)
- `/checkout` — Checkout form
- `/contact` — Contact page with WhatsApp link
- `/admin/login` — Admin login
- `/admin` — Dashboard (after login)
- `/admin/products` — Product list
- `/admin/products/new` — Add product form
- `/admin/orders` — Order list

- [ ] **Step 13.4: Run build to verify no errors**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript or compilation errors.

- [ ] **Step 13.5: Final commit**

```bash
git add -A
git commit -m "feat: add 404 page and metadata"
```

---

## Task 14: Deploy to Vercel

- [ ] **Step 14.1: Install Vercel CLI**

```bash
npm i -g vercel
```

- [ ] **Step 14.2: Set up Supabase project**

Go to https://supabase.com → Create new project → Run `schema.sql` in SQL editor → Run `seed.sql` → Copy project URL and keys.

- [ ] **Step 14.3: Deploy**

```bash
vercel deploy
```

Set environment variables when prompted, or via `vercel env add`.

- [ ] **Step 14.4: Create admin user in Supabase**

Go to Supabase Dashboard → Authentication → Users → Add user (email + password).

- [ ] **Step 14.5: Verify production deployment**

Test all routes on the deployed URL. Verify admin login works.

- [ ] **Step 14.6: Commit any deploy config**

```bash
git add -A
git commit -m "chore: add deployment configuration"
```
