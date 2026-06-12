import Link from "next/link";
import type { ProductVariant } from "@/lib/types";

export function ColorSwatches({
  slug,
  variants,
  selected,
}: {
  slug: string;
  variants: ProductVariant[];
  selected: ProductVariant;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.12em] uppercase">
        Warna <span className="ml-1 opacity-60">{selected.color}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {variants.map((v) => {
          const active = v.color === selected.color;
          return (
            <Link
              key={v.color}
              href={`/product/${slug}?color=${encodeURIComponent(v.color)}`}
              replace
              scroll={false}
              aria-label={`Warna ${v.color}${v.stock <= 0 ? " (stok habis)" : ""}`}
              aria-current={active ? "true" : undefined}
              className="grid h-11 w-11 place-items-center"
            >
              <span
                className={`relative block h-7 w-7 border ${
                  active
                    ? "border-foreground outline outline-1 outline-offset-2 outline-foreground"
                    : "border-foreground/20 hover:border-foreground"
                } ${v.stock <= 0 ? "opacity-40" : ""}`}
                style={{ backgroundColor: v.hex }}
              >
                {v.stock <= 0 && (
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(to_top_right,transparent_calc(50%-0.5px),var(--foreground)_50%,transparent_calc(50%+0.5px))]"
                  />
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
