"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/config";

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

  if (items.length === 0 && !success) return null;

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
            color: i.color ?? null,
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
      <div className="mx-auto max-w-[480px] px-6 py-24 text-center sm:py-32">
        <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">Konfirmasi</p>
        <h1 className="mt-3 font-heading text-5xl uppercase">Terima Kasih</h1>
        <p className="mt-6 text-[12px] tracking-[0.04em] uppercase opacity-80">
          Pesanan Anda berhasil dibuat. Kami akan menghubungi Anda via WhatsApp untuk konfirmasi.
        </p>
        <Link
          href="/shop"
          className="mt-10 inline-block border border-foreground px-8 py-3 text-[12px] tracking-[0.12em] uppercase hover:bg-foreground hover:text-background"
        >
          Lanjut Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-20 sm:px-12">
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">|02|</p>
        <h1 className="mt-2 font-heading text-4xl uppercase sm:text-5xl">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <Section title="Detail Kontak" idx="01">
            <Field label="Nama Lengkap" name="name" required placeholder="Nama lengkap" />
            <Field
              label="No. WhatsApp"
              name="phone"
              type="tel"
              required
              placeholder="08xxxxxxxxxx"
            />
            <Field
              label="Email (opsional)"
              name="email"
              type="email"
              placeholder="email@example.com"
            />
          </Section>

          <Section title="Pengiriman" idx="02">
            <Field
              label="Alamat Lengkap"
              name="address"
              required
              textarea
              rows={3}
              placeholder="Alamat lengkap untuk pengiriman"
            />
            <Field
              label="Catatan (opsional)"
              name="notes"
              textarea
              rows={2}
              placeholder="Catatan tambahan"
            />
          </Section>

          {error && (
            <p className="text-[11px] tracking-[0.08em] uppercase text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-foreground py-4 text-[12px] tracking-[0.12em] uppercase hover:bg-foreground hover:text-background disabled:opacity-50"
          >
            {loading ? "Memproses…" : "Konfirmasi Pesanan"}
          </button>
        </form>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-12 lg:h-fit">
          <div className="border border-foreground/10 p-6 sm:p-8">
            <h2 className="text-[11px] tracking-[0.12em] uppercase opacity-60">Ringkasan</h2>
            <div className="mt-5 space-y-2 text-[12px] tracking-[0.04em] uppercase">
              {items.map((item) => (
                <div
                  key={`${item.product_id}-${item.size}-${item.color ?? ""}`}
                  className="flex items-start justify-between gap-3"
                >
                  <span className="min-w-0 flex-1">
                    {item.name}{" "}
                    <span className="opacity-60">
                      / {item.size}
                      {item.color && <> / {item.color}</>} / x{item.quantity}
                    </span>
                  </span>
                  <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-foreground/20 pt-5">
              <div className="flex items-center justify-between text-[14px] tracking-[0.04em] uppercase">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  idx,
  children,
}: {
  title: string;
  idx: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.12em] uppercase">
        <span className="opacity-60">|{idx}|</span> <span className="ml-1">{title}</span>
      </p>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  textarea,
  rows = 1,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  const inputClass =
    "block w-full border-b border-foreground/30 bg-transparent py-3 text-[14px] outline-none placeholder:opacity-40 focus:border-foreground";
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.08em] uppercase opacity-70">
        {label}
        {required && <span className="ml-1 opacity-60">*</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={rows}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </label>
  );
}
