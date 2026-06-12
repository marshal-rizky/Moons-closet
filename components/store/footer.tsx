import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-foreground/10 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-12 sm:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          <FooterCol heading="Bantuan">
            <Link href="/contact">Kontak</Link>
            <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a href={`mailto:${siteConfig.email}`}>Email</a>
          </FooterCol>

          <FooterCol heading="Belanja">
            <Link href="/shop">Semua</Link>
            <Link href="/shop?category=atasan">Atasan</Link>
            <Link href="/shop?category=bawahan">Bawahan</Link>
            <Link href="/shop?category=dress">Dress</Link>
          </FooterCol>

          <FooterCol heading="Toko">
            <p>{siteConfig.address}</p>
          </FooterCol>

          <div className="flex flex-col gap-2 text-[12px] tracking-[0.04em]">
            <Image
              src="/brand/logo-black.png"
              alt={siteConfig.name}
              width={1021}
              height={459}
              className="mb-2 h-6 w-auto"
            />
            <p>{siteConfig.tagline}</p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-foreground/10 pt-6 text-[11px] tracking-[0.08em] uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} {siteConfig.name}</span>
          <span className="opacity-60">Indonesia / Bahasa Indonesia</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 text-[12px] tracking-[0.04em]">
      <h3 className="mb-2 text-[11px] tracking-[0.12em] uppercase">{heading}</h3>
      <div className="flex flex-col gap-2 [&>a]:w-fit [&>a:hover]:underline [&>a]:underline-offset-[4px]">
        {children}
      </div>
    </div>
  );
}
