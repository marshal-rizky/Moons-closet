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
