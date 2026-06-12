import Image from "next/image";
import { siteConfig } from "@/lib/config";

/** Cream band with the crescent mark — the single sanctioned non-B/W accent. */
export function MoonDivider() {
  return (
    <section className="bg-cream py-10 sm:py-14">
      <div className="flex items-center justify-center gap-6 px-8 sm:gap-10">
        <span aria-hidden className="h-px max-w-[160px] flex-1 bg-foreground/10" />
        <Image
          src="/brand/logo-gold-divider.png?v=2"
          alt={siteConfig.name}
          width={356}
          height={160}
          unoptimized
          className="h-16 w-auto sm:h-20"
        />
        <span aria-hidden className="h-px max-w-[160px] flex-1 bg-foreground/10" />
      </div>
    </section>
  );
}
