"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { siteConfig } from "@/lib/config";

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
              className="flex h-[calc(100dvh-3rem)] flex-col justify-between overflow-y-auto px-6 pt-10 pb-16 sm:h-[calc(100dvh-3.5rem)] sm:px-12 sm:pt-16"
            >
              {/* Numbered category links */}
              <nav className="flex flex-col gap-5 sm:gap-6">
                {collections.map((c, i) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex w-fit items-baseline gap-4 font-heading text-3xl uppercase leading-none transition-opacity hover:opacity-50 sm:text-5xl"
                  >
                    <span className="font-sans text-[11px] tracking-[0.08em] tabular-nums opacity-50">
                      |0{i + 1}|
                    </span>
                    {c.label}
                  </Link>
                ))}
              </nav>

              {/* Secondary links */}
              <div className="mt-12 flex flex-col gap-3 border-t border-foreground/10 pt-6 text-[11px] tracking-[0.12em] uppercase opacity-70">
                <Link href="/contact" onClick={() => setMenuOpen(false)} className="w-fit">
                  Kontak
                </Link>
                <a
                  href={`https://wa.me/${siteConfig.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit"
                >
                  WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
