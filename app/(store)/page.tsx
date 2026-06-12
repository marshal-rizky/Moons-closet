import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config";
import { ProductCard } from "@/components/store/product-card";
import { MoonDivider } from "@/components/store/moon-divider";
import { FadeIn } from "@/components/ui/fade-in";
import type { Product } from "@/lib/types";

const CATEGORY_LABEL: Record<string, string> = {
  atasan: "Atasan",
  bawahan: "Bawahan",
  dress: "Dress",
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(9);

  const { data: categoriesRaw } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  const categories = [...new Set((categoriesRaw || []).map((c) => c.category))].filter(Boolean);
  const list = (products as Product[]) || [];
  const [hero, ...rest] = list;

  return (
    <div className="bg-background">
      {/* HERO: full-bleed editorial */}
      {hero && (
        <section className="relative">
          <Link href={`/product/${hero.slug}`}>
            <div className="relative h-[88dvh] w-full overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 zara-swatch-2"
              />
              <div className="absolute inset-0 grid place-items-center">
                <FadeIn>
                  <div className="text-center text-background mix-blend-difference">
                    <Image
                      src="/brand/logo-white.png"
                      alt={siteConfig.name}
                      width={1021}
                      height={459}
                      priority
                      className="mx-auto h-10 w-auto sm:h-14"
                    />
                    <p className="mt-3 text-[11px] tracking-[0.18em] uppercase">
                      <span className="font-heading italic">presents</span>
                    </p>
                    <h1 className="mt-4 font-heading text-6xl leading-[0.95] tracking-[0.04em] uppercase sm:text-[120px] sm:leading-[0.9]">
                      Koleksi
                      <br />
                      <span className="italic">Baru</span>
                    </h1>
                    <p className="mt-6 text-[11px] tracking-[0.18em] uppercase">
                      {siteConfig.tagline}
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Marquee strip */}
      <section className="border-y border-foreground/10 bg-background">
        <div className="overflow-hidden">
          <div className="flex animate-[marquee_40s_linear_infinite] gap-12 whitespace-nowrap py-3 text-[11px] tracking-[0.18em] uppercase">
            {[
              "Pengiriman ke seluruh Indonesia",
              "Bayar via WhatsApp",
              "Bahan premium",
              "Koleksi terbatas",
              "Pengiriman ke seluruh Indonesia",
              "Bayar via WhatsApp",
              "Bahan premium",
              "Koleksi terbatas",
            ].map((t, i) => (
              <span key={i} className="shrink-0">— {t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Asymmetric category showcase */}
      <section className="px-4 pt-16 pb-8 sm:px-12 sm:pt-24">
        <FadeIn>
          <div className="flex items-end justify-between mb-10 sm:mb-16">
            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">|02| Koleksi</p>
              <h2 className="mt-3 font-heading text-4xl leading-none uppercase sm:text-7xl">
                Kategori
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden text-[11px] tracking-[0.12em] uppercase underline underline-offset-[6px] sm:inline"
            >
              Lihat semua
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-px sm:grid-cols-12">
          {categories.map((cat, i) => {
            const span = i === 0 ? "sm:col-span-7 sm:row-span-2" : i === 1 ? "sm:col-span-5" : "sm:col-span-5";
            const aspect = i === 0 ? "aspect-[4/5] sm:aspect-auto sm:h-[80vh]" : "aspect-[5/4] sm:aspect-auto sm:h-[39.7vh]";
            const swatchClass = `zara-swatch-${(i % 8) + 1}`;
            return (
              <FadeIn key={cat} delay={i * 0.08} className={span}>
                <Link
                  href={`/shop?category=${cat}`}
                  className={`group relative block ${aspect} overflow-hidden ${swatchClass}`}
                >
                  <div className="absolute inset-0 flex items-end p-6 sm:p-10">
                    <div className="text-background mix-blend-difference">
                      <p className="text-[11px] tracking-[0.18em] uppercase">|0{i + 1}|</p>
                      <h3 className="mt-2 font-heading text-4xl leading-none uppercase sm:text-6xl">
                        {CATEGORY_LABEL[cat] || cat}
                      </h3>
                      <p className="mt-3 text-[11px] tracking-[0.12em] uppercase underline underline-offset-[6px]">
                        Belanja
                      </p>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* Editorial split */}
      <section className="px-4 py-20 sm:px-12 sm:py-32">
        <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2 sm:gap-20">
          <FadeIn>
            <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">|03| Tentang</p>
            <h2 className="mt-3 font-heading text-5xl leading-[0.95] uppercase sm:text-7xl">
              Mode untuk
              <br />
              <span className="italic">setiap hari</span>
            </h2>
          </FadeIn>
          <FadeIn direction="right">
            <p className="text-[14px] leading-[1.7] sm:text-[15px]">
              Koleksi yang dipilih dengan teliti untuk wanita Indonesia.
              Bahan yang nyaman, potongan yang flattering, harga yang masuk akal.
              Tidak ada yang berlebihan — hanya hal-hal yang benar-benar Anda pakai.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-block text-[11px] tracking-[0.12em] uppercase underline underline-offset-[6px]"
            >
              Belanja sekarang
            </Link>
          </FadeIn>
        </div>
      </section>

      <MoonDivider />

      {/* Latest products */}
      {rest.length > 0 && (
        <section className="px-4 pb-24 sm:px-12">
          <FadeIn>
            <div className="mb-10 flex items-end justify-between sm:mb-16">
              <div>
                <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">|04| Produk</p>
                <h2 className="mt-3 font-heading text-4xl leading-none uppercase sm:text-7xl">
                  Terbaru
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-[11px] tracking-[0.12em] uppercase underline underline-offset-[6px]"
              >
                Semua
              </Link>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 gap-x-2 gap-y-10 sm:grid-cols-4 sm:gap-x-3 sm:gap-y-16">
            {rest.slice(0, 8).map((product, i) => (
              <FadeIn key={product.id} delay={(i % 4) * 0.05}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
