/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/types";

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
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleSize(size: string) {
    setSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    if (images.length + files.length > 5) { setError("Maksimal 5 foto."); return; }

    setUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal upload foto."); break; }
      setImages((prev) => [...prev, data.url]);
    }
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

    const body = { name, price: parseInt(price), category, sizes, stock: parseInt(stock), description, images };
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
        <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="atasan, bawahan, dress, dll." />
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
        <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required min="0" />
      </div>
      <div className="space-y-2">
        <Label>Foto Produk (max 5)</Label>
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
