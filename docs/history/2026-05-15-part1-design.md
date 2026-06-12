# Clothing Store Website — Design Spec

**Date:** 2026-05-15
**Purpose:** Website toko baju online untuk mamah. Semua asset placeholder, nothing hardcoded.
**Status:** Draft

---

## 1. Overview

Website toko baju online skala menengah dengan katalog produk, keranjang belanja, checkout (simpan order + notifikasi), dan admin panel. Target pasar lokal Indonesia, bahasa Indonesia, mata uang Rupiah.

Semua nama toko, logo, tagline, foto produk, warna tema menggunakan placeholder — bisa diganti kapan saja tanpa ubah code.

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| File Storage | Supabase Storage (foto produk) |
| Deployment | Vercel |
| Language | TypeScript |

## 3. Architecture

Monolith Next.js — storefront, admin panel, dan API routes dalam 1 project.

```
app/
├── (store)/              # Public storefront (route group)
│   ├── layout.tsx        # Store layout (navbar + footer)
│   ├── page.tsx          # Home
│   ├── shop/page.tsx     # Katalog produk
│   ├── product/[slug]/page.tsx  # Detail produk
│   ├── cart/page.tsx     # Keranjang
│   ├── checkout/page.tsx # Checkout form
│   └── contact/page.tsx  # Kontak
├── (admin)/              # Admin panel (route group, protected)
│   └── admin/
│       ├── layout.tsx    # Admin layout (sidebar)
│       ├── page.tsx      # Dashboard
│       ├── products/page.tsx    # List produk
│       ├── products/new/page.tsx    # Tambah produk
│       ├── products/[id]/edit/page.tsx  # Edit produk
│       ├── orders/page.tsx      # List pesanan
│       └── orders/[id]/page.tsx # Detail pesanan
├── api/
│   ├── orders/route.ts   # POST create order
│   └── upload/route.ts   # POST upload image
├── layout.tsx            # Root layout
└── globals.css
lib/
├── supabase/
│   ├── client.ts         # Browser client
│   ├── server.ts         # Server client
│   └── admin.ts          # Service role client (admin ops)
├── config.ts             # Site config from env vars
├── types.ts              # TypeScript types
└── utils.ts              # Helpers (format currency, etc.)
components/
├── store/                # Storefront components
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── product-card.tsx
│   ├── cart-item.tsx
│   └── category-filter.tsx
├── admin/                # Admin components
│   ├── sidebar.tsx
│   ├── product-form.tsx
│   ├── order-status-badge.tsx
│   └── stats-card.tsx
└── ui/                   # shadcn/ui components
```

## 4. Database Schema (Supabase)

### products
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| name | text | NOT NULL |
| slug | text | UNIQUE, NOT NULL, auto-generated |
| description | text | |
| price | integer | Dalam Rupiah (bukan float) |
| images | jsonb | Array of storage URLs |
| category | text | e.g. "atasan", "bawahan", "dress" |
| sizes | jsonb | Array of available sizes e.g. ["S","M","L","XL"] |
| stock | integer | Default 0 |
| is_active | boolean | Default true |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

### orders
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| order_number | serial | Auto-increment, human-readable |
| customer_name | text | NOT NULL |
| customer_phone | text | NOT NULL (WhatsApp) |
| customer_email | text | Optional |
| customer_address | text | NOT NULL |
| items | jsonb | Array of {product_id, name, size, quantity, price} |
| total | integer | Dalam Rupiah |
| status | text | "pending" / "confirmed" / "shipped" / "done" |
| notes | text | Optional notes from customer |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

### Supabase Auth
Admin users pakai Supabase Auth bawaan. Satu akun admin (mamah) — email + password login.

### Supabase Storage
Bucket `product-images` — public read, authenticated write. Max 5 foto per produk, JPG/PNG.

## 5. Halaman — Storefront

### 5.1 Home
- **Hero section:** Nama toko (dari env), tagline, CTA "Belanja Sekarang"
- **Kategori:** Grid 3 kolom, clickable ke /shop?category=x
- **Produk Terbaru:** Grid 4 kolom, 8 produk terbaru (is_active=true)

### 5.2 Shop (Katalog)
- **Category tabs:** "Semua" + dynamic categories (SELECT DISTINCT category FROM products) — tidak hardcode
- **Product grid:** 3-4 kolom responsive, tiap card: foto, nama, harga
- **Klik card** → /product/[slug]

### 5.3 Detail Produk
- **Layout:** Foto kiri (gallery jika >1 foto), info kanan
- **Info:** Nama, harga (format Rp xxx.xxx), deskripsi
- **Size selector:** Tombol S/M/L/XL (dari product.sizes)
- **Add to cart:** Harus pilih size dulu, simpan ke localStorage
- **Stock indicator:** Tampilkan jika stock rendah atau habis

### 5.4 Cart
- **List items:** Foto mini, nama, size, quantity (adjustable), harga, tombol hapus
- **Total:** Hitung otomatis
- **Tombol "Lanjut ke Checkout"**
- **Cart kosong:** Tampilkan pesan + link ke shop
- **Persistence:** localStorage, cart icon di navbar menunjukkan jumlah item

### 5.5 Checkout
- **Cart summary:** List items (read-only)
- **Form:** Nama lengkap, No. WhatsApp, Email (optional), Alamat lengkap, Catatan (optional)
- **Validasi:** Client-side, required fields
- **Submit:** POST /api/orders → simpan ke DB → clear cart → tampilkan konfirmasi
- **Konfirmasi:** "Pesanan berhasil! Kami akan menghubungi Anda via WhatsApp."

### 5.6 Kontak
- **Info kontak:** WhatsApp, email, alamat toko (semua dari env vars)
- **WhatsApp direct link:** wa.me/{number}

## 6. Admin Panel

### 6.1 Login
- Route: /admin/login
- Supabase Auth email/password
- Redirect ke /admin setelah login

### 6.2 Dashboard
- **Stats cards:** Pesanan baru (status=pending), total produk aktif, pendapatan bulan ini
- **Pesanan terbaru:** 5 pesanan terakhir dengan status badge

### 6.3 Kelola Produk
- **List:** Table/cards dengan foto, nama, harga, stok, status
- **Search:** Filter by nama
- **Actions:** Tambah baru, edit, hapus (soft delete via is_active=false)
- **Form tambah/edit:** Nama, harga, kategori (select), ukuran (multi-select), stok, deskripsi, upload foto (drag & drop, max 5)

### 6.4 Kelola Pesanan
- **List:** Table dengan order number, customer name, total, status badge, tanggal
- **Filter:** By status (tabs: Semua/Pending/Confirmed/Shipped/Done)
- **Detail:** Info customer lengkap, list items, total, update status buttons

## 7. Site Configuration

Semua configurable via environment variables — zero hardcoding:

```env
NEXT_PUBLIC_STORE_NAME="Nama Toko"
NEXT_PUBLIC_STORE_TAGLINE="Tagline toko"
NEXT_PUBLIC_STORE_WHATSAPP="628xxxxxxxxxx"
NEXT_PUBLIC_STORE_EMAIL="email@example.com"
NEXT_PUBLIC_STORE_ADDRESS="Alamat toko"
NEXT_PUBLIC_CURRENCY="IDR"
NEXT_PUBLIC_LOCALE="id-ID"

NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
SUPABASE_SERVICE_ROLE_KEY="xxx"
```

## 8. Design Style

- **Style:** Minimalis & Elegan
- **Color palette:** Neutral/warm tones — configurable via CSS variables
- **Typography:** Serif untuk headings, sans-serif untuk body (via Tailwind config)
- **Spacing:** Generous white space
- **Components:** shadcn/ui dengan custom theme
- **Responsive:** Mobile-first, breakpoints: sm/md/lg/xl
- **Placeholder images:** Generated SVG placeholders dengan warna netral

## 9. Cart Implementation

Client-side cart menggunakan localStorage + React Context:

- **CartContext:** Provider di root layout, expose cart state + actions
- **Actions:** addItem, removeItem, updateQuantity, clearCart
- **Persistence:** Sync ke localStorage on every change
- **Navbar badge:** Jumlah item di cart

## 10. Order Flow

```
Customer checkout
    → POST /api/orders (validate + save to DB)
    → Return order confirmation
    → Mamah buka admin panel, lihat pesanan baru
    → Update status: Pending → Confirmed → Shipped → Done
```

Notifikasi ke mamah: cukup cek admin panel untuk sekarang. WhatsApp notification bisa ditambah nanti.

## 11. Security

- **Admin routes:** Protected via Supabase Auth middleware
- **API routes:** Validate input, sanitize data
- **RLS (Row Level Security):** Supabase RLS on products (public read, admin write) dan orders (admin read/write, public create only)
- **File upload:** Validate file type + size di server
- **CSRF:** Handled by Next.js built-in

## 12. Future-Ready Architecture Notes

Arsitektur sengaja dibuat malleable untuk fitur masa depan:
- **Delivery integration (JNE, GoSend, GrabExpress):** Order schema jsonb-based, gampang tambah shipping fields (courier, tracking_number, shipping_cost). API modular — tambah /api/shipping route. Integrasi via RajaOngkir (cek ongkir) + API kurir masing-masing.
- **Payment gateway:** Checkout flow sudah ada, tinggal sisipkan payment step sebelum order creation.
- **Notifications:** Order creation bisa trigger webhook ke WhatsApp API / email service.

## 13. Out of Scope (Nanti)

- Payment gateway (Midtrans/Xendit)
- WhatsApp notification otomatis
- Customer accounts / login
- Wishlist
- Product reviews
- Promo codes / discounts
- Analytics dashboard
- Multi-language
- SEO advanced (sitemap, structured data)
