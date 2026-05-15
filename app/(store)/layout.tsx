import { Navbar } from "@/components/store/navbar";
import { BackToTop } from "@/components/ui/back-to-top";
import type { ReactNode } from "react";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <BackToTop />
    </div>
  );
}
