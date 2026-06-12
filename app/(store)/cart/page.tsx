"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/config";
import { CartItem } from "@/components/store/cart-item";
import { FadeIn } from "@/components/ui/fade-in";

export default function CartPage() {
  const { items, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <FadeIn>
        <div className="mx-auto max-w-[420px] px-6 py-24 text-center sm:py-32">
          <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">|01|</p>
          <h1 className="mt-3 font-heading text-5xl uppercase">Tas Kosong</h1>
          <p className="mt-4 text-[12px] tracking-[0.04em] uppercase opacity-70">
            Belum ada produk di tas Anda.
          </p>
          <Link
            href="/shop"
            className="mt-10 inline-block border border-foreground px-8 py-3 text-[12px] tracking-[0.12em] uppercase hover:bg-foreground hover:text-background"
          >
            Mulai Belanja
          </Link>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="px-4 pt-6 pb-20 sm:px-12">
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">Anda</p>
        <h1 className="mt-2 font-heading text-4xl uppercase sm:text-5xl">
          Tas <span className="opacity-50 tabular-nums">[{totalItems}]</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
        <div>
          {items.map((item) => (
            <CartItem key={`${item.product_id}-${item.size}-${item.color ?? ""}`} item={item} />
          ))}
        </div>

        {/* Sticky summary */}
        <div className="lg:sticky lg:top-12 lg:h-fit">
          <div className="border border-foreground/10 p-6 sm:p-8">
            <h2 className="text-[11px] tracking-[0.12em] uppercase opacity-60">Ringkasan</h2>
            <div className="mt-5 space-y-3 text-[12px] tracking-[0.04em] uppercase">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between opacity-60">
                <span>Ongkir</span>
                <span>Dihitung saat checkout</span>
              </div>
            </div>
            <div className="mt-5 border-t border-foreground/20 pt-5">
              <div className="flex items-center justify-between text-[14px] tracking-[0.04em] uppercase">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(totalPrice)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block w-full border border-foreground py-4 text-center text-[12px] tracking-[0.12em] uppercase hover:bg-foreground hover:text-background"
            >
              Lanjut ke Checkout
            </Link>
            <Link
              href="/shop"
              className="mt-3 block text-center text-[11px] tracking-[0.08em] uppercase underline underline-offset-[4px] opacity-60"
            >
              Lanjut belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
