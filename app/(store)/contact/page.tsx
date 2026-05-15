import { MessageCircle, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/store/footer";

export default function ContactPage() {
  return (
    <>
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-wider uppercase mb-8">Kontak</h1>

      <div className="space-y-6">
        <a
          href={`https://wa.me/${siteConfig.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-4 rounded-sm border border-border p-4 transition-colors hover:bg-secondary/30"
        >
          <MessageCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-medium">WhatsApp</h2>
            <p className="mt-1 text-sm text-muted-foreground">Chat langsung dengan kami</p>
          </div>
        </a>

        <a
          href={`mailto:${siteConfig.email}`}
          className="flex items-start gap-4 rounded-sm border border-border p-4 transition-colors hover:bg-secondary/30"
        >
          <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-medium">Email</h2>
            <p className="mt-1 text-sm text-muted-foreground">{siteConfig.email}</p>
          </div>
        </a>

        <div className="flex items-start gap-4 rounded-sm border border-border p-4">
          <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-medium">Alamat</h2>
            <p className="mt-1 text-sm text-muted-foreground">{siteConfig.address}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="text-xs uppercase tracking-widest">Chat via WhatsApp</Button>
        </a>
      </div>
    </div>
    <Footer />
    </>
  );
}
