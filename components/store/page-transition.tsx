// components/store/page-transition.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { crescentWipe } from "@/lib/motion";
import { useMotionEnabled } from "@/lib/motion-context";

/**
 * On route change, an overlay mounts already covering the screen (crescent at
 * 150%) and reveals the new page by shrinking the crescent to 0. pointer-events
 * are off so it never blocks taps. Skips the very first mount so it doesn't
 * collide with the hero entrance.
 */
export function PageTransition() {
  const enabled = useMotionEnabled();
  const pathname = usePathname();
  const first = useRef(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Checkout stays motion-free (spec §2) — no wipe when landing there.
    if (pathname?.startsWith("/checkout")) return;
    setCount((c) => c + 1);
  }, [pathname]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          key={count}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[60] bg-cream"
          variants={crescentWipe}
          initial="covering"
          animate="revealed"
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
        />
      )}
    </AnimatePresence>
  );
}
