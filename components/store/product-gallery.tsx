"use client";

import Image from "next/image";
import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionEnabled } from "@/lib/motion-context";
import { duration, ease } from "@/lib/motion";

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

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const enabled = useMotionEnabled();

  // Stack vertically like Zara — no thumbnails, scroll through all shots.
  const items: (string | number)[] =
    images.length > 0 ? images : Array.from({ length: 2 }, (_, i) => i);

  // Signature changes when the selected color (image set) changes.
  const sig = images.length > 0 ? images.join("|") : `ph-${name}`;

  // Don't animate the very first render (keeps images SSR-visible, no flash);
  // crossfade only when the signature changes (color switch).
  const prevSig = useRef(sig);
  const isChange = prevSig.current !== sig;
  prevSig.current = sig;

  const stack = (
    <div className="flex flex-col gap-1">
      {items.map((src, i) => {
        if (typeof src === "string") {
          return (
            <div
              key={i}
              className="relative aspect-[3/4] w-full overflow-hidden bg-secondary"
            >
              <Image
                src={src}
                alt={`${name} ${i + 1}`}
                width={1200}
                height={1600}
                priority={i === 0}
                className="h-full w-full object-cover"
              />
            </div>
          );
        }
        const cls = swatchFor(`${name}-${i}`);
        return (
          <div
            key={i}
            className={`relative aspect-[3/4] w-full overflow-hidden ${cls} flex items-center justify-center`}
          >
            <span className="font-heading text-7xl tracking-[0.2em] uppercase opacity-20">
              {name.charAt(0)}
            </span>
          </div>
        );
      })}
    </div>
  );

  if (!enabled) return stack;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sig}
        initial={isChange ? { opacity: 0 } : false}
        animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.standard } }}
        exit={{ opacity: 0, transition: { duration: duration.instant } }}
      >
        {stack}
      </motion.div>
    </AnimatePresence>
  );
}
