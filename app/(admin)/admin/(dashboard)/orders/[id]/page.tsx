import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/config";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusUpdater } from "./status-updater";
import type { Order } from "@/lib/types";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
  if (!order) notFound();

  const o = order as Order;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Pesanan #{o.order_number}</h1>
          <p className="text-xs text-muted-foreground">
            {new Date(o.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <OrderStatusBadge status={o.status} />
      </div>

      <div className="rounded-sm border border-border p-4 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Info Customer</h2>
        <div className="space-y-1 text-sm">
          <p className="font-medium">{o.customer_name}</p>
          <p className="text-muted-foreground">{o.customer_phone}</p>
          {o.customer_email && <p className="text-muted-foreground">{o.customer_email}</p>}
          <p className="text-muted-foreground">{o.customer_address}</p>
        </div>
      </div>

      <div className="rounded-sm border border-border p-4 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Item Pesanan</h2>
        {o.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div className="text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="text-muted-foreground"> — {item.size} &times; {item.quantity}</span>
            </div>
            <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 mt-3 border-t border-border font-medium">
          <span>Total</span>
          <span className="font-heading text-lg">{formatPrice(o.total)}</span>
        </div>
      </div>

      {o.notes && (
        <div className="rounded-sm border border-border p-4 mb-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Catatan</h2>
          <p className="text-sm text-muted-foreground">{o.notes}</p>
        </div>
      )}

      <OrderStatusUpdater orderId={o.id} currentStatus={o.status} />
    </div>
  );
}
