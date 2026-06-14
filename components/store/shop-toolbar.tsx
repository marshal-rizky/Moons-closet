"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CATEGORIES } from "@/lib/categories";

interface ShopToolbarProps {
  initialSearch?: string;
}

const SORTS = [
  { value: "", label: "Terbaru" },
  { value: "price-asc", label: "Termurah" },
  { value: "price-desc", label: "Termahal" },
];

export function ShopToolbar({ initialSearch = "" }: ShopToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "";
  const inStock = searchParams.get("stock") === "1";
  const [search, setSearch] = useState(initialSearch);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  // Any filter change returns to page 1
  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
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
    ...CATEGORIES.map((c) => ({ value: c.slug, label: c.label })),
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

      {/* Sort */}
      <div className="space-y-1.5 border-t border-foreground/10 pt-5 text-[12px] tracking-[0.06em] uppercase">
        <p className="mb-2 text-[11px] tracking-[0.12em] opacity-40">Urutkan</p>
        {SORTS.map((s) => {
          const active = currentSort === s.value;
          return (
            <button
              key={s.value || "newest"}
              onClick={() => updateParams({ sort: s.value || null })}
              className={`block w-full text-left uppercase tracking-[0.06em] ${active ? "font-medium" : "opacity-60 hover:opacity-100"}`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Filter + search */}
      <div className="space-y-2 border-t border-foreground/10 pt-5 text-[12px] tracking-[0.06em] uppercase">
        <button
          onClick={() => updateParams({ stock: inStock ? null : "1" })}
          className={`block w-full text-left uppercase tracking-[0.06em] ${inStock ? "font-medium" : "opacity-60 hover:opacity-100"}`}
        >
          {inStock ? "× " : ""}Hanya Tersedia
        </button>
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
