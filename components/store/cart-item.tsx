"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/config";

const SWATCHES = [
  "zara-swatch-1",
  "zara-swatch-2",
  "zara-swatch-3",
  "zara-swatch-4",
  "zara-swatch-5",
  "zara-swatch-6",
  "zara-swatch-7",
  "zara-swatch-8",
];

function swatchFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return SWATCHES[h % SWATCHES.length];
}

import type { CartItem as CartItemType } from "@/lib/types";

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart();
  const swatch = swatchFor(item.product_id);

  return (
    <div className="grid grid-cols-[100px_1fr] gap-4 border-b border-foreground/10 py-5 sm:grid-cols-[140px_1fr] sm:gap-6 sm:py-6">
      <Link href={`/product/${item.slug}`} className="block">
        <div className={`aspect-[3/4] w-full overflow-hidden ${item.image ? "" : swatch}`}>
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={140}
              height={186}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-heading text-4xl tracking-[0.2em] uppercase opacity-20">
                {item.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[12px] tracking-[0.06em] uppercase">{item.name}</h3>
            <p className="mt-1 text-[11px] tracking-[0.08em] uppercase opacity-70">
              Ukuran {item.size}
              {item.color && <> · {item.color}</>}
            </p>
            <p className="mt-2 text-[12px] tracking-[0.04em] uppercase tabular-nums">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
          <button
            onClick={() => removeItem(item.product_id, item.size, item.color ?? null)}
            className="text-[11px] tracking-[0.08em] uppercase underline underline-offset-[4px] opacity-60 hover:opacity-100"
          >
            Hapus
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => updateQuantity(item.product_id, item.size, item.color ?? null, item.quantity - 1)}
            aria-label="Kurangi"
            className="grid h-8 w-8 place-items-center border border-foreground/30 text-base leading-none hover:border-foreground"
          >
            −
          </button>
          <span className="min-w-[2ch] text-center text-[12px] tracking-[0.04em] tabular-nums">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.product_id, item.size, item.color ?? null, item.quantity + 1)}
            aria-label="Tambah"
            className="grid h-8 w-8 place-items-center border border-foreground/30 text-base leading-none hover:border-foreground"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
