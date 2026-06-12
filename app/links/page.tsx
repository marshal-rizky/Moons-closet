import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { bioLinks } from "@/lib/links";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Links`,
  description: siteConfig.tagline,
};

export default function LinksPage() {
  const links = bioLinks.filter((l) => l.enabled && l.href);

  return (
    <div className="flex min-h-dvh flex-col items-center bg-cream px-6 py-16 sm:py-24">
      <Image
        src="/brand/mark-gold.png"
        alt=""
        aria-hidden
        width={383}
        height={204}
        priority
        className="h-12 w-auto sm:h-14"
      />
      <Image
        src="/brand/logo-black.png"
        alt={siteConfig.name}
        width={1021}
        height={459}
        className="mt-6 h-8 w-auto sm:h-9"
      />
      <p className="mt-3 text-[11px] tracking-[0.18em] uppercase opacity-60">
        {siteConfig.tagline}
      </p>

      <nav className="mt-12 flex w-full max-w-md flex-col gap-3">
        {links.map((link) => {
          const external = link.href.startsWith("http");
          const cls =
            "block w-full border border-foreground bg-transparent py-4 text-center text-[12px] tracking-[0.12em] uppercase transition-colors hover:bg-foreground hover:text-background";
          return external ? (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
              {link.label}
            </a>
          ) : (
            <Link key={link.label} href={link.href} className={cls}>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <p className="mt-auto pt-16 text-[11px] tracking-[0.08em] uppercase opacity-50">
        © {new Date().getFullYear()} {siteConfig.name}
      </p>
    </div>
  );
}
