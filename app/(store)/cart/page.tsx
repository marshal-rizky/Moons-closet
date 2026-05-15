"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/config";
import { CartItem } from "@/components/store/cart-item";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <FadeIn>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h1 className="mt-4 font-heading text-2xl font-semibold">Keranjang Kosong</h1>
          <p className="mt-2 text-muted-foreground">Belum ada produk di keranjang kamu.</p>
          <Link href="/shop" className="mt-6 inline-block">
            <Button className="text-xs uppercase tracking-widest">Mulai Belanja</Button>
          </Link>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-wider uppercase mb-8">Keranjang</h1>
      <div className="space-y-0">
        {items.map((item) => (
          <CartItem key={`${item.product_id}-${item.size}`} item={item} />
        ))}
      </div>
      <Separator className="my-6" />
      <div className="flex items-center justify-between text-lg">
        <span className="font-medium">Total</span>
        <span className="font-heading text-xl font-semibold">{formatPrice(totalPrice)}</span>
      </div>
      <Link href="/checkout" className="mt-6 block">
        <Button className="w-full text-xs uppercase tracking-widest" size="lg">Lanjut ke Checkout</Button>
      </Link>
    </div>
  );
}
