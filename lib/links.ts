import { siteConfig } from "@/lib/config";

// Link-in-bio config (/links), structured like a Linktree profile.
// To activate a link later: fill href, set enabled: true.

export type BioIcon =
  | "website"
  | "whatsapp"
  | "instagram"
  | "tiktok"
  | "shopee"
  | "tokopedia";

export type BioLink = { label: string; href: string; enabled: boolean; icon: BioIcon };
export type BioSection = { heading?: string; links: BioLink[] };

export const bioProfile = {
  // shown under the tagline as icon shortcuts when enabled
  instagram: { href: "", enabled: false },
  tiktok: { href: "", enabled: false },
};

export const bioSections: BioSection[] = [
  {
    links: [
      { label: "Website — Belanja Koleksi", href: "/shop", enabled: true, icon: "website" },
      {
        label: "Order & Pertanyaan — WhatsApp",
        href: `https://wa.me/${siteConfig.whatsapp}`,
        enabled: true,
        icon: "whatsapp",
      },
      { label: "TikTok Shop", href: "", enabled: false, icon: "tiktok" },
      { label: "Instagram", href: "", enabled: false, icon: "instagram" },
    ],
  },
  {
    heading: "Belanja di Marketplace",
    links: [
      { label: "Shopee Official Store", href: "", enabled: false, icon: "shopee" },
      { label: "Tokopedia", href: "", enabled: false, icon: "tokopedia" },
    ],
  },
];
