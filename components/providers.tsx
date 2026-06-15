"use client";

import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/lib/toast-context";
import { MotionProvider } from "@/lib/motion-context";
import { ToastContainer } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <TooltipProvider>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
          <ToastContainer />
        </ToastProvider>
      </TooltipProvider>
    </MotionProvider>
  );
}
