// components/store/hero-entrance.tsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CrescentMark } from "@/components/store/brand/crescent-mark";
import { useMotionEnabled } from "@/lib/motion-context";
import { ease, GOLD, goldGlow } from "@/lib/motion";

/**
 * Cream overlay above the static hero. Plays the assemble-in sequence (~1.6s),
 * then fades to reveal the real resting hero (PNG logo) underneath. Dismisses
 * early on first scroll or tap. Renders nothing when motion is disabled, so the
 * static hero is shown immediately (SSR-safe — overlay is pure enhancement).
 */
export function HeroEntrance({
  wordmark,
  tagline,
}: {
  wordmark: string;
  tagline: string;
}) {
  const enabled = useMotionEnabled();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDone(true);
      return;
    }
    const timer = setTimeout(() => setDone(true), 1600);
    const skip = () => setDone(true);
    window.addEventListener("scroll", skip, { passive: true, once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="absolute inset-0 z-20 grid place-items-center bg-cream"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: ease.standard } }}
        >
          <div className="text-center" style={{ color: GOLD }}>
            <motion.div
              className="mx-auto h-16 w-16"
              initial={{ opacity: 0, scale: 0.6, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: goldGlow }}
              transition={{ duration: 0.5, ease: ease.standard }}
            >
              <CrescentMark className="h-full w-full" />
            </motion.div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <motion.span
                className="h-px w-12 origin-right"
                style={{ backgroundColor: GOLD }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease: ease.standard }}
              />
              <motion.span
                className="font-heading text-3xl uppercase tracking-[0.2em] text-foreground"
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0 0 0)" }}
                transition={{ duration: 0.5, delay: 0.45, ease: ease.standard }}
              >
                {wordmark}
              </motion.span>
              <motion.span
                className="h-px w-12 origin-left"
                style={{ backgroundColor: GOLD }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease: ease.standard }}
              />
            </div>

            <motion.p
              className="mt-4 text-[11px] tracking-[0.18em] uppercase text-foreground/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              {tagline}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
