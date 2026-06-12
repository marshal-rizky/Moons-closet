# Part 2 Implementation Plan: Notifications, Animations, Search & QoL

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email notifications, Framer Motion animations, search bars, toast system, and QoL features to the clothing website.

**Architecture:** Install framer-motion for animations and resend for email. Build a toast notification system using React Context + Framer Motion. Add search via URL params (shop) and client-side filtering (admin). Layer animations progressively across existing pages using a reusable `<FadeIn>` wrapper.

**Tech Stack:** Next.js 16, Framer Motion, Resend, Supabase, Tailwind CSS v4, shadcn/ui

**Pre-existing (skip):** Checkout email field, `customer_email` in orders API, empty cart CTA in `cart/page.tsx`.

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install framer-motion and resend**

```bash
cd "C:/Users/User/clothing website" && npm install framer-motion resend
```

- [ ] **Step 2: Verify install**

```bash
cd "C:/Users/User/clothing website" && node -e "require('framer-motion'); require('resend'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/User/clothing website" && git add package.json package-lock.json && git commit -m "chore: add framer-motion and resend dependencies"
```

---

### Task 2: FadeIn Animation Component

**Files:**
- Create: `components/ui/fade-in.tsx`

- [ ] **Step 1: Create FadeIn component**

```tsx
// components/ui/fade-in.tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

const directionOffset = {
  up: { y: 16 },
  down: { y: -16 },
  left: { x: 16 },
  right: { x: -16 },
};

export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  direction = "up",
  className,
}: FadeInProps) {
  const offset = directionOffset[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/User/clothing website" && git add components/ui/fade-in.tsx && git commit -m "feat: add reusable FadeIn animation component"
```

---

### Task 3: Toast Notification System

**Files:**
- Create: `lib/toast-context.tsx`
- Create: `components/ui/toast.tsx`
- Modify: `components/providers.tsx`

- [ ] **Step 1: Create toast context**

```tsx
// lib/toast-context.tsx
"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface ToastItem {
  id: number;
  type: "success" | "error";
  message: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
  };
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = nextId++;
    setToasts((prev) => {
      const next = [...prev, { id, type, message }];
      return next.length > 3 ? next.slice(-3) : next;
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message: string) => addToast("success", message),
    error: (message: string) => addToast("error", message),
  };

  return (
    <ToastContext value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
```

- [ ] **Step 2: Create toast UI component**

```tsx
// components/ui/toast.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useToast } from "@/lib/toast-context";

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 left-4 z-[100] flex flex-col items-center gap-2 sm:left-auto sm:items-end sm:w-80">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`flex w-full items-center gap-3 rounded-sm border px-4 py-3 shadow-lg ${
              t.type === "success"
                ? "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100"
                : "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 3: Wire ToastProvider and ToastContainer into Providers**

Modify `components/providers.tsx`:

```tsx
"use client";

import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/lib/toast-context";
import { ToastContainer } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <ToastProvider>
        <CartProvider>{children}</CartProvider>
        <ToastContainer />
      </ToastProvider>
    </TooltipProvider>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/User/clothing website" && git add lib/toast-context.tsx components/ui/toast.tsx components/providers.tsx && git commit -m "feat: add toast notification system with Framer Motion animations"
```

---

### Task 4: Email Notification System

**Files:**
- Create: `lib/email.ts`
- Modify: `app/api/orders/route.ts`
- Modify: `app/api/orders/[id]/route.ts`

- [ ] **Step 1: Create email utility**

```typescript
// lib/email.ts
import { Resend } from "resend";
import { formatPrice, siteConfig } from "@/lib/config";
import type { Order } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export function sendAdminOrderAlert(order: Order) {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  resend.emails.send({
    from: fromEmail,
    to: siteConfig.email,
    subject: `Pesanan Baru #${order.order_number}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px;">
        <h2 style="margin-bottom: 4px;">Pesanan Baru #${order.order_number}</h2>
        <p style="color: #666; margin-top: 0;">dari ${order.customer_name}</p>
        <table style="width: 100%; border-collapse: collapse;">
          ${order.items
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;">${item.name} (${item.size}) &times; ${item.quantity}</td>
              <td style="padding: 8px 0; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
            </tr>`
            )
            .join("")}
          <tr>
            <td style="padding: 12px 0; font-weight: bold;">Total (${itemCount} item)</td>
            <td style="padding: 12px 0; font-weight: bold; text-align: right;">${formatPrice(order.total)}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 12px; background: #f9f9f9;">
          <p style="margin: 0 0 4px;"><strong>Telepon:</strong> ${order.customer_phone}</p>
          <p style="margin: 0;"><strong>Alamat:</strong> ${order.customer_address}</p>
        </div>
      </div>
    `,
  }).catch((err) => console.error("Admin email failed:", err));
}

export function sendCustomerShippingNotification(order: Order) {
  if (!order.customer_email) return;

  resend.emails.send({
    from: fromEmail,
    to: order.customer_email,
    subject: `Pesanan #${order.order_number} Sedang Dikirim`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px;">
        <h2>Pesanan Anda Sedang Dikirim! 🚚</h2>
        <p>Halo ${order.customer_name},</p>
        <p>Pesanan <strong>#${order.order_number}</strong> sedang dalam perjalanan ke alamat Anda.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          ${order.items
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;">${item.name} (${item.size}) &times; ${item.quantity}</td>
              <td style="padding: 8px 0; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
            </tr>`
            )
            .join("")}
          <tr>
            <td style="padding: 12px 0; font-weight: bold;">Total</td>
            <td style="padding: 12px 0; font-weight: bold; text-align: right;">${formatPrice(order.total)}</td>
          </tr>
        </table>
        <div style="padding: 12px; background: #f9f9f9;">
          <p style="margin: 0;"><strong>Alamat pengiriman:</strong> ${order.customer_address}</p>
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 16px;">Terima kasih telah berbelanja di ${siteConfig.name}!</p>
      </div>
    `,
  }).catch((err) => console.error("Customer email failed:", err));
}
```

- [ ] **Step 2: Wire admin email into orders POST route**

In `app/api/orders/route.ts`, add import at top:

```typescript
import { sendAdminOrderAlert } from "@/lib/email";
import type { Order } from "@/lib/types";
```

Then after the stock decrement loop (after line 163, before `return NextResponse.json`), add:

```typescript
    // --- Send admin notification email (fire-and-forget) ---
    sendAdminOrderAlert({
      ...data,
      customer_name: customer_name.trim(),
      customer_phone: phoneClean,
      customer_email: customer_email?.trim() || null,
      customer_address: customer_address.trim(),
      items: orderItems,
      total,
      notes: notes?.trim() || null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Order);
```

- [ ] **Step 3: Wire shipping email into orders PATCH route**

Replace `app/api/orders/[id]/route.ts` entirely:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendCustomerShippingNotification } from "@/lib/email";
import type { Order } from "@/lib/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await request.json();
  const validStatuses = ["pending", "confirmed", "shipped", "done"];
  if (!validStatuses.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send shipping notification when status changes to "shipped"
  if (status === "shipped") {
    sendCustomerShippingNotification(data as Order);
  }

  return NextResponse.json(data);
}
```

- [ ] **Step 4: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/User/clothing website" && git add lib/email.ts app/api/orders/route.ts "app/api/orders/[id]/route.ts" && git commit -m "feat: add email notifications — admin on new order, customer on shipping"
```

---

### Task 5: Shimmer CSS + Product Card Skeleton

**Files:**
- Modify: `app/globals.css`
- Create: `components/store/product-card-skeleton.tsx`

- [ ] **Step 1: Add shimmer keyframe to globals.css**

Append to the end of `app/globals.css`:

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-shimmer {
  background: linear-gradient(90deg, transparent 25%, oklch(0.9 0 0 / 50%) 50%, transparent 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

- [ ] **Step 2: Create skeleton component**

```tsx
// components/store/product-card-skeleton.tsx
export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] bg-secondary/30 animate-shimmer" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-secondary/30 animate-shimmer" />
        <div className="h-4 w-1/2 rounded bg-secondary/30 animate-shimmer" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/User/clothing website" && git add app/globals.css components/store/product-card-skeleton.tsx && git commit -m "feat: add product card skeleton with shimmer animation"
```

---

### Task 6: Shop Toolbar (Search + Category Filter)

**Files:**
- Create: `components/store/shop-toolbar.tsx`
- Delete: `components/store/category-filter.tsx`
- Modify: `app/(store)/shop/page.tsx`

- [ ] **Step 1: Create shop toolbar component**

```tsx
// components/store/shop-toolbar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShopToolbarProps {
  categories: string[];
  initialSearch?: string;
}

export function ShopToolbar({ categories, initialSearch = "" }: ShopToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const [search, setSearch] = useState(initialSearch);

  // Sync input with URL on browser back/forward
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/shop?${params.toString()}`);
  }

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (search !== currentSearch) {
        updateParams({ search: search || null });
      }
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleCategoryChange(category: string) {
    updateParams({ category: category || null, search: null });
    setSearch("");
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={currentCategory ? `Cari di ${currentCategory}\u2026` : "Cari produk\u2026"}
          className="h-10 w-full rounded-sm border border-border bg-background pl-10 pr-10 text-sm outline-none transition-colors focus:border-foreground"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              updateParams({ search: null });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!currentCategory ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange("")}
          className="text-xs uppercase tracking-wider"
        >
          Semua
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={currentCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(cat)}
            className="text-xs uppercase tracking-wider"
          >
            {cat}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update shop page to use toolbar + search filtering**

Replace `app/(store)/shop/page.tsx` entirely:

```tsx
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/product-card";
import { ShopToolbar } from "@/components/store/shop-toolbar";
import { ProductGridSkeleton } from "@/components/store/product-card-skeleton";
import type { Product } from "@/lib/types";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
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
        <ShopToolbar categories={categories} initialSearch={search || ""} />
      </Suspense>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {(products as Product[] || []).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {(!products || products.length === 0) && (
        <div className="py-20 text-center text-muted-foreground">
          {search
            ? `Tidak ada produk "${search}"${category ? ` di kategori ${category}` : ""}.`
            : "Belum ada produk dalam kategori ini."}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Delete old category-filter.tsx**

```bash
cd "C:/Users/User/clothing website" && rm components/store/category-filter.tsx
```

- [ ] **Step 4: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/User/clothing website" && git add components/store/shop-toolbar.tsx "app/(store)/shop/page.tsx" && git rm components/store/category-filter.tsx && git commit -m "feat: add search bar to shop page with category-scoped filtering"
```

---

### Task 7: Admin Products Search

**Files:**
- Modify: `app/(admin)/admin/(dashboard)/products/page.tsx`

- [ ] **Step 1: Convert admin products to client component with search**

The admin products page is currently a server component. We need to split it: keep the server component for data fetching, extract the list + search into a client component.

Create `app/(admin)/admin/(dashboard)/products/product-list.tsx`:

```tsx
// app/(admin)/admin/(dashboard)/products/product-list.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/store/placeholder-image";
import type { Product } from "@/lib/types";

export function ProductList({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk\u2026"
          className="h-10 w-full rounded-sm border border-border bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-foreground"
        />
      </div>

      <div className="rounded-sm border border-border">
        {filtered.map((product) => (
          <div key={product.id} className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-0 sm:gap-4 sm:px-4">
            <div className="h-12 w-12 shrink-0 overflow-hidden bg-secondary/30">
              {product.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <PlaceholderImage className="h-full w-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(product.price)} — Stok: {product.stock}
                {product.stock === 0 && <span className="ml-1 text-destructive">Habis</span>}
              </p>
            </div>
            <Link href={`/admin/products/${product.id}/edit`} className="shrink-0">
              <Button variant="outline" size="sm">Edit</Button>
            </Link>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {search ? `Tidak ada produk "${search}".` : "Belum ada produk."}
          </p>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Simplify admin products page to use ProductList**

Replace `app/(admin)/admin/(dashboard)/products/page.tsx`:

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProductList } from "./product-list";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="font-heading text-xl font-semibold sm:text-2xl">Produk</h1>
        <Link href="/admin/products/new"><Button size="sm" className="sm:size-default">+ Tambah Produk</Button></Link>
      </div>
      <ProductList products={(products as Product[]) || []} />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/User/clothing website" && git add "app/(admin)/admin/(dashboard)/products/product-list.tsx" "app/(admin)/admin/(dashboard)/products/page.tsx" && git commit -m "feat: add search bar to admin products page"
```

---

### Task 8: Homepage Animations

**Files:**
- Modify: `app/(store)/page.tsx`

- [ ] **Step 1: Add FadeIn animations to homepage**

Replace `app/(store)/page.tsx` entirely:

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
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
      <FadeIn duration={0.6}>
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
      </FadeIn>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <FadeIn>
            <h2 className="font-heading text-2xl font-semibold tracking-wider text-center uppercase mb-8">
              Kategori
            </h2>
          </FadeIn>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {categories.map((cat, i) => (
              <FadeIn key={cat} delay={i * 0.05}>
                <Link
                  href={`/shop?category=${cat}`}
                  className="group flex aspect-[4/3] items-center justify-center bg-secondary/40 transition-colors hover:bg-secondary/60"
                >
                  <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                    {cat}
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* Latest Products */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <FadeIn>
          <h2 className="font-heading text-2xl font-semibold tracking-wider text-center uppercase mb-8">
            Produk Terbaru
          </h2>
        </FadeIn>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {(products as Product[] || []).map((product, i) => (
            <FadeIn key={product.id} delay={i * 0.05}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/User/clothing website" && git add "app/(store)/page.tsx" && git commit -m "feat: add fade-in scroll animations to homepage"
```

---

### Task 9: Product Detail — Image Gallery + Animations

**Files:**
- Modify: `app/(store)/product/[slug]/page.tsx`
- Create: `components/store/product-gallery.tsx`

- [ ] **Step 1: Create interactive product gallery component**

```tsx
// components/store/product-gallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { PlaceholderImage } from "./placeholder-image";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] overflow-hidden bg-secondary/30">
        <PlaceholderImage className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image with crossfade */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={images[selected]}
              alt={`${name} ${selected + 1}`}
              width={600}
              height={800}
              className="h-full w-full object-cover"
              priority={selected === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails (only if multiple images) */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`shrink-0 aspect-square w-16 overflow-hidden transition-all sm:w-20 ${
                selected === i
                  ? "ring-2 ring-foreground ring-offset-2"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update product detail page to use gallery + FadeIn**

Replace `app/(store)/product/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/config";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductGallery } from "@/components/store/product-gallery";
import { FadeIn } from "@/components/ui/fade-in";
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <FadeIn>
          <ProductGallery images={p.images} name={p.name} />
        </FadeIn>

        <FadeIn direction="right" delay={0.1}>
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
        </FadeIn>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/User/clothing website" && git add components/store/product-gallery.tsx "app/(store)/product/[slug]/page.tsx" && git commit -m "feat: add interactive image gallery with crossfade + page animations"
```

---

### Task 10: Animated Cart Badge + Add-to-Cart Toast

**Files:**
- Modify: `components/store/navbar.tsx`
- Modify: `components/store/add-to-cart-button.tsx`

- [ ] **Step 1: Add animated cart badge to navbar**

Replace the cart badge `<span>` in `components/store/navbar.tsx`. The file needs to import `motion` and `AnimatePresence` and use them on the badge.

Replace `components/store/navbar.tsx` entirely:

```tsx
"use client";

import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
        <Link href="/" className="font-heading text-xl font-semibold tracking-wider uppercase">
          {siteConfig.name}
        </Link>

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

        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative" aria-label="Keranjang belanja">
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="md:hidden"
              render={<Button variant="ghost" size="icon" aria-label="Menu navigasi" />}
            >
              <Menu className="h-5 w-5" />
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

- [ ] **Step 2: Replace button text swap with toast in add-to-cart**

Replace `components/store/add-to-cart-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");

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
    toast.success("Ditambahkan ke keranjang!");
  }

  return (
    <div className="space-y-4">
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

      {outOfStock && (
        <p className="text-sm text-destructive">Stok habis</p>
      )}
      {!outOfStock && product.stock <= 5 && (
        <p className="text-sm text-muted-foreground">
          Sisa {product.stock} stok
        </p>
      )}

      <Button
        onClick={handleAdd}
        disabled={!selectedSize || outOfStock}
        className="w-full text-xs uppercase tracking-widest"
        size="lg"
      >
        {outOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/User/clothing website" && git add components/store/navbar.tsx components/store/add-to-cart-button.tsx && git commit -m "feat: animated cart badge + toast on add-to-cart"
```

---

### Task 11: Back-to-Top Button

**Files:**
- Create: `components/ui/back-to-top.tsx`
- Modify: `app/(store)/layout.tsx`

- [ ] **Step 1: Create back-to-top button component**

```tsx
// components/ui/back-to-top.tsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          setVisible(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-md transition-colors hover:bg-secondary sm:h-9 sm:w-9"
          aria-label="Kembali ke atas"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Add BackToTop to store layout**

Replace `app/(store)/layout.tsx`:

```tsx
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { BackToTop } from "@/components/ui/back-to-top";
import type { ReactNode } from "react";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/User/clothing website" && git add components/ui/back-to-top.tsx "app/(store)/layout.tsx" && git commit -m "feat: add back-to-top button with fade animation"
```

---

### Task 12: Order Status Timeline

**Files:**
- Create: `components/admin/order-timeline.tsx`
- Modify: `app/(admin)/admin/(dashboard)/orders/[id]/page.tsx`

- [ ] **Step 1: Create order timeline component**

```tsx
// components/admin/order-timeline.tsx
"use client";

import { motion } from "framer-motion";

const steps = [
  { status: "pending", label: "Pending" },
  { status: "confirmed", label: "Dikonfirmasi" },
  { status: "shipped", label: "Dikirim" },
  { status: "done", label: "Selesai" },
];

export function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = steps.findIndex((s) => s.status === currentStatus);

  return (
    <div className="flex items-start justify-between gap-1 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.status} className="flex items-center flex-1 min-w-0 last:flex-none">
            <div className="flex flex-col items-center">
              {/* Dot */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold sm:h-9 sm:w-9 ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-primary/30 ring-offset-2" : ""}`}
              >
                {i + 1}
              </motion.div>
              {/* Label */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.1 }}
                className={`mt-1.5 text-[10px] uppercase tracking-wider sm:text-xs ${
                  isCompleted ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </motion.span>
            </div>

            {/* Connecting line */}
            {!isLast && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.1 + 0.05, duration: 0.3 }}
                className={`mx-1 mb-5 h-0.5 flex-1 origin-left sm:mx-2 ${
                  i < currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Add timeline to order detail page**

In `app/(admin)/admin/(dashboard)/orders/[id]/page.tsx`, add import:

```typescript
import { OrderTimeline } from "@/components/admin/order-timeline";
```

Then add the timeline after the header `<div>` (after line 26, the closing `</div>` of the flex header), before the customer info section:

```tsx
      <div className="mb-6">
        <OrderTimeline currentStatus={o.status} />
      </div>
```

The full return block becomes:

```tsx
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Pesanan #{o.order_number}</h1>
          <p className="text-xs text-muted-foreground">
            {new Date(o.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <OrderStatusBadge status={o.status} />
      </div>

      <div className="mb-6">
        <OrderTimeline currentStatus={o.status} />
      </div>

      <div className="rounded-sm border border-border p-4 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Info Customer</h2>
        <div className="space-y-1 text-sm">
          <p className="font-medium">{o.customer_name}</p>
          <p className="text-muted-foreground">{o.customer_phone}</p>
          {o.customer_email && <p className="text-muted-foreground">{o.customer_email}</p>}
          <p className="text-muted-foreground">{o.customer_address}</p>
        </div>
      </div>

      <div className="rounded-sm border border-border p-4 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Item Pesanan</h2>
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

      {o.notes && (
        <div className="rounded-sm border border-border p-4 mb-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Catatan</h2>
          <p className="text-sm text-muted-foreground">{o.notes}</p>
        </div>
      )}

      <OrderStatusUpdater orderId={o.id} currentStatus={o.status} />
    </div>
  );
```

- [ ] **Step 3: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/User/clothing website" && git add components/admin/order-timeline.tsx "app/(admin)/admin/(dashboard)/orders/[id]/page.tsx" && git commit -m "feat: add animated order status timeline to admin order detail"
```

---

### Task 13: Cart Page FadeIn + Shop Page Animations

**Files:**
- Modify: `app/(store)/cart/page.tsx`

- [ ] **Step 1: Add FadeIn to cart empty state**

In `app/(store)/cart/page.tsx`, add import at top:

```typescript
import { FadeIn } from "@/components/ui/fade-in";
```

Wrap the empty cart return block (the `<div>` inside the `if (items.length === 0)` block) with `<FadeIn>`:

```tsx
  if (items.length === 0) {
    return (
      <FadeIn>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h1 className="mt-4 font-heading text-2xl font-semibold">Keranjang Kosong</h1>
          <p className="mt-2 text-muted-foreground">Belum ada produk di keranjang kamu.</p>
          <Link href="/shop" className="mt-6 inline-block">
            <Button className="text-xs uppercase tracking-widest">Mulai Belanja</Button>
          </Link>
        </div>
      </FadeIn>
    );
  }
```

- [ ] **Step 2: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/User/clothing website" && git add "app/(store)/cart/page.tsx" && git commit -m "feat: add fade-in animation to empty cart state"
```

---

### Task 14: Admin Status Updater Toast Feedback

**Files:**
- Modify: `app/(admin)/admin/(dashboard)/orders/[id]/status-updater.tsx`

- [ ] **Step 1: Add toast feedback to status updater**

Replace `app/(admin)/admin/(dashboard)/orders/[id]/status-updater.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/button";

const statusFlow = [
  { status: "confirmed", label: "Konfirmasi", className: "bg-green-600 hover:bg-green-700 text-white" },
  { status: "shipped", label: "Kirim", className: "bg-blue-600 hover:bg-blue-700 text-white" },
  { status: "done", label: "Selesai", className: "bg-purple-600 hover:bg-purple-700 text-white" },
] as const;

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const currentIndex = statusFlow.findIndex((s) => s.status === currentStatus);
  const availableStatuses = statusFlow.filter((_, i) => i > currentIndex);

  if (currentStatus === "done" || availableStatuses.length === 0) return null;

  async function updateStatus(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("Status pesanan diperbarui");
      } else {
        toast.error("Gagal memperbarui status");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Update Status</h2>
      <div className="flex gap-2">
        {availableStatuses.map((s) => (
          <Button key={s.status} disabled={loading} className={s.className} onClick={() => updateStatus(s.status)}>
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd "C:/Users/User/clothing website" && npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/User/clothing website" && git add "app/(admin)/admin/(dashboard)/orders/[id]/status-updater.tsx" && git commit -m "feat: add toast feedback to admin order status updates"
```

---

### Task 15: Final Build Verification + Deploy

- [ ] **Step 1: Full build check**

```bash
cd "C:/Users/User/clothing website" && npx next build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Manual smoke test**

Start dev server and verify:

```bash
cd "C:/Users/User/clothing website" && npx next dev
```

Check these pages:
1. Homepage — hero fades in, categories stagger in, product cards stagger in
2. `/shop` — search bar visible, type to search, category pills work, search respects category
3. Product detail — image gallery with thumbnails, crossfade on click, info slides from right
4. Add to cart — toast appears bottom-right, cart badge pops
5. Cart empty state — fades in with CTA
6. Admin products — search bar filters products
7. Admin order detail — timeline visible with animation
8. Admin status update — toast on success
9. Scroll down — back-to-top button appears
10. Mobile — all above works on small screens

- [ ] **Step 3: Commit any remaining changes**

If any fixes were needed during smoke test, commit them.

- [ ] **Step 4: Deploy**

```bash
cd "C:/Users/User/clothing website" && vercel --prod --yes
```

Note: `RESEND_API_KEY` and `RESEND_FROM_EMAIL` must be added to Vercel environment variables for email to work in production. Add via:

```bash
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
```
