"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface ShopToolbarProps {
  categories: string[];
  initialSearch?: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  atasan: "Atasan",
  bawahan: "Bawahan",
  dress: "Dress",
};

export function ShopToolbar({ categories, initialSearch = "" }: ShopToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const [search, setSearch] = useState(initialSearch);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (search !== currentSearch) updateParams({ search: search || null });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleCategoryChange(category: string) {
    updateParams({ category: category || null, search: null });
    setSearch("");
  }

  const items = [
    { value: "", label: "View All" },
    ...categories.map((c) => ({ value: c, label: CATEGORY_LABEL[c] || c })),
  ];

  return (
    <div className="space-y-6">
      {/* Numbered category nav */}
      <div className="space-y-1.5 text-[12px] tracking-[0.06em] uppercase">
        {items.map((item, i) => {
          const active = currentCategory === item.value;
          const idx = String(i + 1).padStart(2, "0");
          return (
            <button
              key={item.value || "all"}
              onClick={() => handleCategoryChange(item.value)}
              className={`block w-full text-left uppercase tracking-[0.06em] ${active ? "font-medium" : "opacity-60 hover:opacity-100"}`}
            >
              <span className={active ? "" : "opacity-70"}>|{idx}|</span>{" "}
              <span className="ml-1">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters / search toggle */}
      <div className="pt-2 text-[12px] tracking-[0.06em] uppercase">
        <button
          onClick={() => setSearchOpen((v) => !v)}
          className="block py-1 uppercase tracking-[0.06em] opacity-60 hover:opacity-100"
        >
          {searchOpen ? "× Tutup" : "Cari"}
        </button>
        {searchOpen && (
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk…"
            className="mt-2 block w-full border-b border-foreground bg-transparent py-2 text-[13px] tracking-normal uppercase outline-none placeholder:opacity-40"
          />
        )}
      </div>
    </div>
  );
}
