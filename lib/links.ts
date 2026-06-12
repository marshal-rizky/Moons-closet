import { siteConfig } from "@/lib/config";

// Link-in-bio entries (/links). To add a link later: fill href, set enabled: true.
export const bioLinks: { label: string; href: string; enabled: boolean }[] = [
  { label: "Belanja Koleksi", href: "/shop", enabled: true },
  { label: "WhatsApp", href: `https://wa.me/${siteConfig.whatsapp}`, enabled: true },
  { label: "Instagram", href: "", enabled: false },
  { label: "TikTok", href: "", enabled: false },
  { label: "Shopee", href: "", enabled: false },
  { label: "Tokopedia", href: "", enabled: false },
];
