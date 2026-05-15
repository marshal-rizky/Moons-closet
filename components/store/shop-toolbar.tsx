"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShopToolbarProps {
  categories: string[];
  initialSearch?: string;
}

export function ShopToolbar({ categories, initialSearch = "" }: ShopToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/shop?${params.toString()}`);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (search !== currentSearch) {
        updateParams({ search: search || null });
      }
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleCategoryChange(category: string) {
    updateParams({ category: category || null, search: null });
    setSearch("");
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={currentCategory ? `Cari di ${currentCategory}\u2026` : "Cari produk\u2026"}
          className="h-10 w-full rounded-sm border border-border bg-background pl-10 pr-10 text-sm outline-none transition-colors focus:border-foreground"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              updateParams({ search: null });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!currentCategory ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange("")}
          className="text-xs uppercase tracking-wider"
        >
          Semua
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={currentCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(cat)}
            className="text-xs uppercase tracking-wider"
          >
            {cat}
          </Button>
        ))}
      </div>
    </div>
  );
}
