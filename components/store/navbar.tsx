"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { siteConfig } from "@/lib/config";

const sections = [
  { label: "Atasan", category: "atasan" },
  { label: "Bawahan", category: "bawahan" },
  { label: "Dress", category: "dress" },
];

const collections = [
  { label: "Semua Produk", href: "/shop" },
  { label: "Atasan", href: "/shop?category=atasan" },
  { label: "Bawahan", href: "/shop?category=bawahan" },
  { label: "Dress", href: "/shop?category=dress" },
];

export function Navbar() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background">
        <div className="relative flex h-12 items-center justify-between px-4 sm:h-14 sm:px-6">
          {/* Left: hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Buka menu"
            className="flex h-10 w-10 items-center justify-center -ml-2"
          >
            <span aria-hidden className="block h-px w-6 bg-foreground" />
          </button>

          {/* Center: logo wordmark */}
          <Link
            href="/"
            aria-label={siteConfig.name}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Image
              src="/brand/logo-black-nav.png?v=2"
              alt={siteConfig.name}
              width={720}
              height={219}
              priority
              className="h-7 w-auto sm:h-8"
            />
          </Link>

          {/* Right: account links */}
          <nav className="ml-auto flex items-center gap-5 text-[11px] tracking-[0.08em] uppercase sm:gap-7 sm:text-[12px]">
            <Link
              href="/shop"
              className="hidden hover:underline underline-offset-[6px] sm:inline"
            >
              Search
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-1.5 hover:underline underline-offset-[6px]"
            >
              <span>Tas</span>
              <span aria-hidden>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={totalItems}
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.12 }}
                    className="inline-block tabular-nums"
                  >
                    [{totalItems}]
                  </motion.span>
                </AnimatePresence>
              </span>
            </Link>
            <Link
              href="/contact"
              className="hidden hover:underline underline-offset-[6px] sm:inline"
            >
              Kontak
            </Link>
          </nav>
        </div>
      </header>

      {/* Full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="relative flex h-12 items-center justify-between px-4 sm:h-14 sm:px-6">
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Tutup menu"
                className="flex h-10 w-10 items-center justify-center -ml-2 text-xl leading-none"
              >
                ×
              </button>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                aria-label={siteConfig.name}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Image
                  src="/brand/logo-black-nav.png?v=2"
                  alt={siteConfig.name}
                  width={720}
                  height={219}
                  className="h-7 w-auto sm:h-8"
                />
              </Link>
              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                className="ml-auto text-[11px] tracking-[0.08em] uppercase sm:text-[12px]"
              >
                Tas [{totalItems}]
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="grid h-[calc(100dvh-3rem)] grid-cols-1 gap-x-12 gap-y-12 overflow-y-auto px-6 pt-8 pb-16 sm:h-[calc(100dvh-3.5rem)] sm:grid-cols-[auto_auto_1fr] sm:px-12 sm:pt-12"
            >
              {/* Top categories */}
              <div className="space-y-3 text-[17px] sm:text-[19px]">
                <div className="flex items-center gap-2 font-medium">
                  <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-foreground" />
                  Wanita
                </div>
                <div className="opacity-50">Anak</div>
                <div className="opacity-50">Aksesoris</div>
              </div>

              {/* Numbered sections */}
              <div className="space-y-2 text-[12px] tracking-[0.08em] uppercase">
                <div className="flex items-baseline gap-3">
                  <span className="tabular-nums opacity-60">|01|</span>
                  <span>Koleksi</span>
                </div>
                {sections.map((s, i) => (
                  <div key={s.category} className="flex items-baseline gap-3 opacity-60">
                    <span className="tabular-nums">|0{i + 2}|</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Product links */}
              <div className="flex flex-col gap-3 text-[15px] sm:text-[16px]">
                {collections.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={() => setMenuOpen(false)}
                    className="w-fit hover:underline underline-offset-[6px]"
                  >
                    {c.label}
                  </Link>
                ))}
                <div className="mt-4 border-t border-foreground/10 pt-4 text-[11px] tracking-[0.08em] uppercase opacity-70">
                  <Link
                    href="/contact"
                    onClick={() => setMenuOpen(false)}
                    className="block py-1"
                  >
                    Kontak
                  </Link>
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-1"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
