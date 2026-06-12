import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { bioProfile, bioSections } from "@/lib/links";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Links`,
  description: siteConfig.tagline,
};

const PILL =
  "block w-full rounded-full border border-foreground/15 bg-white/80 py-4 px-6 text-center text-[13px] tracking-[0.08em] uppercase transition-colors hover:bg-foreground hover:text-background";

function BioButton({ label, href }: { label: string; href: string }) {
  const external = href.startsWith("http");
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={PILL}>
      {label}
    </a>
  ) : (
    <Link href={href} className={PILL}>
      {label}
    </Link>
  );
}

export default function LinksPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center bg-cream px-6 py-12 sm:py-16">
      {/* Avatar */}
      <div className="overflow-hidden rounded-full border border-foreground/10">
        <Image
          src="/brand/avatar.png?v=2"
          alt={siteConfig.name}
          width={512}
          height={512}
          priority
          className="h-24 w-24 object-cover sm:h-28 sm:w-28"
        />
      </div>

      {/* Name + tagline */}
      <Image
        src="/brand/logo-black-nav.png?v=2"
        alt={siteConfig.name}
        width={720}
        height={219}
        className="mt-5 h-8 w-auto sm:h-9"
      />
      <p className="mt-3 text-[12px] tracking-[0.14em] uppercase opacity-60">
        {siteConfig.tagline}
      </p>

      {/* Social icons */}
      {bioProfile.instagram.enabled && bioProfile.instagram.href && (
        <a
          href={bioProfile.instagram.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="mt-4 opacity-80 hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden>
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
      )}

      {/* Link buttons */}
      <div className="mt-10 flex w-full max-w-md flex-col gap-4">
        {bioSections.map((section, i) => {
          const links = section.links.filter((l) => l.enabled && l.href);
          if (links.length === 0) return null;
          return (
            <div key={i} className="flex flex-col gap-4">
              {section.heading && (
                <h3 className="mt-4 text-center text-[12px] tracking-[0.18em] uppercase opacity-60">
                  {section.heading}
                </h3>
              )}
              {links.map((link) => (
                <BioButton key={link.label} label={link.label} href={link.href} />
              ))}
            </div>
          );
        })}
      </div>

      <p className="mt-auto pt-16 text-[11px] tracking-[0.08em] uppercase opacity-50">
        © {new Date().getFullYear()} {siteConfig.name}
      </p>
    </div>
  );
}
