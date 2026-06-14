import { siteConfig } from "@/lib/config";
import { WhatsAppIcon } from "@/components/store/brand-icons";

export default function ContactPage() {
  return (
    <div className="px-4 pt-10 pb-24 sm:px-12">
      <div className="mb-12">
        <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">|03|</p>
        <h1 className="mt-2 font-heading text-5xl uppercase sm:text-7xl">Kontak</h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
        <ContactBlock idx="01" label="WhatsApp">
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] underline underline-offset-[6px] hover:no-underline"
          >
            +{siteConfig.whatsapp}
          </a>
          <p className="mt-3 text-[12px] tracking-[0.04em] uppercase opacity-70">
            Chat langsung untuk informasi & pemesanan
          </p>
        </ContactBlock>

        <ContactBlock idx="02" label="Email">
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-[15px] underline underline-offset-[6px] hover:no-underline"
          >
            {siteConfig.email}
          </a>
          <p className="mt-3 text-[12px] tracking-[0.04em] uppercase opacity-70">
            Pertanyaan umum, kerjasama, kemitraan
          </p>
        </ContactBlock>

        <ContactBlock idx="03" label="Alamat">
          <p className="text-[15px] leading-[1.5]">{siteConfig.address}</p>
          <p className="mt-3 text-[12px] tracking-[0.04em] uppercase opacity-70">
            Toko fisik & gudang pengiriman
          </p>
        </ContactBlock>
      </div>

      <div className="mt-20 border-t border-foreground/10 pt-10">
        <a
          href={`https://wa.me/${siteConfig.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-foreground px-8 py-4 text-[12px] tracking-[0.12em] uppercase hover:bg-foreground hover:text-background"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Chat via WhatsApp
        </a>
      </div>
    </div>
  );
}

function ContactBlock({
  idx,
  label,
  children,
}: {
  idx: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.12em] uppercase">
        <span className="opacity-60">|{idx}|</span> <span className="ml-1">{label}</span>
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}
