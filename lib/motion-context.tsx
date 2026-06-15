// lib/motion-context.tsx
"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/** Global kill switch for JS-driven motion. Disable in prod by setting
 *  NEXT_PUBLIC_MOTION_ENABLED="false" (no code change). Note: the pure-CSS
 *  reveal/loader honor prefers-reduced-motion only, not this flag. */
const MOTION_ENABLED = process.env.NEXT_PUBLIC_MOTION_ENABLED !== "false";

const MotionContext = createContext<boolean>(true);

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion(); // boolean | null (null on server)
  const enabled = MOTION_ENABLED && !reduced;
  return <MotionContext value={enabled}>{children}</MotionContext>;
}

/** True when motion should play (motion enabled AND user has not asked to reduce). */
export function useMotionEnabled(): boolean {
  return useContext(MotionContext);
}
