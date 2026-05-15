"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0 && !success) {
      router.push("/cart");
    }
  }, [items.length, success, router]);

  if (items.length === 0 && !success) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.get("name"),
          customer_phone: form.get("phone"),
          customer_email: form.get("email") || null,
          customer_address: form.get("address"),
          notes: form.get("notes") || null,
          items: items.map((i) => ({
            product_id: i.product_id,
            size: i.size,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat pesanan.");
        return;
      }

      clearCart();
      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">Pesanan Berhasil!</h1>
        <p className="mt-2 text-muted-foreground">
          Terima kasih! Kami akan menghubungi Anda via WhatsApp untuk konfirmasi pesanan.
        </p>
        <Link href="/shop" className="mt-6 inline-block">
          <Button className="text-xs uppercase tracking-widest">Lanjut Belanja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-wider uppercase mb-8">Checkout</h1>

      <div className="mb-8 rounded-sm border border-border p-4">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Ringkasan Pesanan</h2>
        {items.map((item) => (
          <div key={`${item.product_id}-${item.size}`} className="flex justify-between py-1 text-sm">
            <span>{item.name} ({item.size}) &times; {item.quantity}</span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <Separator className="my-3" />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span className="font-heading text-lg">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap *</Label>
          <Input id="name" name="name" required placeholder="Nama lengkap" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">No. WhatsApp *</Label>
          <Input id="phone" name="phone" type="tel" required placeholder="08xxxxxxxxxx" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (opsional)</Label>
          <Input id="email" name="email" type="email" placeholder="email@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Alamat Lengkap *</Label>
          <Textarea id="address" name="address" required placeholder="Alamat lengkap untuk pengiriman" rows={3} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Catatan (opsional)</Label>
          <Textarea id="notes" name="notes" placeholder="Catatan tambahan untuk pesanan" rows={2} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full text-xs uppercase tracking-widest" size="lg">
          {loading ? "Memproses\u2026" : "Pesan Sekarang"}
        </Button>
      </form>
    </div>
  );
}
