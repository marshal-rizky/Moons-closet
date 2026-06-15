// lib/motion-context.tsx
"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/** Global kill switch — set to false to disable ALL storefront motion in prod
 *  without a code-shape change. */
const MOTION_ENABLED = true;

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
