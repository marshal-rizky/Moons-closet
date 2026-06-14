/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/categories";
import type { Product, ProductVariant } from "@/lib/types";

const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

type ProductFormProps = { product?: Product };

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [category, setCategory] = useState(product?.category || "");
  const [sizes, setSizes] = useState<string[]>((product?.sizes as string[]) || []);
  const [stock, setStock] = useState(product?.stock?.toString() || "0");
  const [description, setDescription] = useState(product?.description || "");
  const [images, setImages] = useState<string[]>((product?.images as string[]) || []);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const hasVariants = variants.length > 0;
  const variantStockTotal = variants.reduce(
    (sum, v) => sum + (v.sizes ?? []).reduce((a, s) => a + (s.stock || 0), 0),
    0
  );

  function updateVariant(index: number, patch: Partial<ProductVariant>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function setVariantSizeStock(index: number, size: string, stock: number) {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        const exists = v.sizes.some((s) => s.size === size);
        const next = exists
          ? v.sizes.map((s) => (s.size === size ? { ...s, stock } : s))
          : [...v.sizes, { size, stock }];
        return { ...v, sizes: next };
      })
    );
  }

  async function uploadFiles(files: FileList): Promise<string[]> {
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal upload foto.");
        break;
      }
      urls.push(data.url);
    }
    return urls;
  }

  async function handleVariantUpload(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    if (variants[index].images.length + files.length > 5) {
      setError("Maksimal 5 foto per varian.");
      return;
    }
    setUploading(true);
    setError("");
    const urls = await uploadFiles(files);
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, images: [...v.images, ...urls] } : v))
    );
    setUploading(false);
    e.target.value = "";
  }

  function toggleSize(size: string) {
    const next = sizes.includes(size) ? sizes.filter((s) => s !== size) : [...sizes, size];
    setSizes(next);
    // keep every variant's per-size stock list in sync with the product sizes
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        sizes: next.map((sz) => ({
          size: sz,
          stock: v.sizes.find((x) => x.size === sz)?.stock ?? 0,
        })),
      }))
    );
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    if (images.length + files.length > 5) { setError("Maksimal 5 foto."); return; }

    setUploading(true);
    setError("");
    const urls = await uploadFiles(files);
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      name,
      price: parseInt(price),
      category,
      sizes,
      stock: hasVariants ? variantStockTotal : parseInt(stock),
      description,
      images,
      variants: variants.map((v) => ({
        color: v.color.trim(),
        hex: v.hex,
        images: v.images,
        sizes: v.sizes.map((s) => ({ size: s.size, stock: Number(s.stock) || 0 })),
      })),
    };
    const url = isEditing ? `/api/products/${product.id}` : "/api/products";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal menyimpan produk.");
      setSaving(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Produk *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Harga (Rp) *</Label>
        <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Kategori *</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="h-9 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
        >
          <option value="" disabled>Pilih kategori</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Ukuran Tersedia</Label>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button key={size} type="button" onClick={() => toggleSize(size)}
              className={`cursor-pointer border px-4 py-2 text-sm transition-colors ${sizes.includes(size) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground"}`}>
              {size}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="stock">Stok *</Label>
        {hasVariants ? (
          <p className="border border-border rounded-sm px-3 py-2 text-sm text-muted-foreground">
            {variantStockTotal} — dihitung dari varian warna
          </p>
        ) : (
          <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required min="0" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Varian Warna</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                { color: "", hex: "#1a1a1a", images: [], sizes: sizes.map((sz) => ({ size: sz, stock: 0 })) },
              ])
            }
          >
            <Plus className="mr-1 h-3 w-3" /> Tambah Varian
          </Button>
        </div>
        {hasVariants && (
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="space-y-3 border border-border rounded-sm p-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`variant-color-${i}`} className="text-xs">Nama Warna *</Label>
                    <Input
                      id={`variant-color-${i}`}
                      value={v.color}
                      onChange={(e) => updateVariant(i, { color: e.target.value })}
                      placeholder="Hitam, Mocha, dll."
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`variant-hex-${i}`} className="text-xs">Warna</Label>
                    <input
                      id={`variant-hex-${i}`}
                      type="color"
                      value={v.hex}
                      onChange={(e) => updateVariant(i, { hex: e.target.value })}
                      className="block h-9 w-12 cursor-pointer border border-border bg-transparent p-0.5"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Hapus varian ${v.color || i + 1}`}
                    onClick={() => setVariants((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Per-size stock */}
                <div>
                  <Label className="text-xs">Stok per ukuran</Label>
                  {sizes.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {sizes.map((sz) => (
                        <div key={sz} className="w-16 space-y-1">
                          <span className="block text-center text-[11px] text-muted-foreground">{sz}</span>
                          <Input
                            type="number"
                            min="0"
                            value={v.sizes.find((s) => s.size === sz)?.stock ?? 0}
                            onChange={(e) => setVariantSizeStock(i, sz, parseInt(e.target.value) || 0)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pilih &quot;Ukuran Tersedia&quot; dulu untuk mengatur stok per ukuran.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {v.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {v.images.map((img, j) => (
                        <div key={j} className="relative h-16 w-16 border border-border">
                          <img src={img} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            aria-label="Hapus foto"
                            onClick={() =>
                              updateVariant(i, { images: v.images.filter((_, k) => k !== j) })
                            }
                            className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border rounded-sm px-3 py-3 text-xs text-muted-foreground hover:border-foreground transition-colors">
                    <Upload className="h-3 w-3" />
                    {uploading ? "Mengupload…" : `Foto ${v.color || "varian"} (max 5)`}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => handleVariantUpload(i, e)}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Foto Produk {hasVariants ? "(opsional — fallback)" : "(max 5)"}</Label>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {images.map((img, i) => (
              <div key={i} className="relative h-20 w-20 border border-border">
                <img src={img} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} aria-label="Hapus foto" className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-border rounded-sm px-4 py-6 text-sm text-muted-foreground hover:border-foreground transition-colors">
          <Upload className="h-4 w-4" />
          {uploading ? "Mengupload\u2026" : "Klik untuk upload foto"}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>{saving ? "Menyimpan\u2026" : isEditing ? "Update Produk" : "Tambah Produk"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
      </div>
    </form>
  );
}
