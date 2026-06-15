// lib/motion.ts
import type { Variants } from "framer-motion";

/** Brand gold used for crescent glow. Matches public/brand/mark-gold.png. */
export const GOLD = "#b08d57";

export const duration = {
  instant: 0.2,
  base: 0.4,
  entrance: 1.6,
} as const;

export const ease = {
  standard: [0.22, 1, 0.36, 1] as const, // soft ease-out
  wipe: [0.65, 0, 0.35, 1] as const,
} as const;

export const goldGlow = `drop-shadow(0 0 14px rgba(176,141,87,0.55))`;

/** Crescent/circle reveal wipe for the page-transition overlay. */
export const crescentWipe: Variants = {
  covering: { clipPath: "circle(150% at 50% 45%)" },
  revealed: {
    clipPath: "circle(0% at 50% 45%)",
    transition: { duration: 0.45, ease: ease.wipe },
  },
};
