import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/config";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import type { Order } from "@/lib/types";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold mb-6">Pesanan</h1>
      <div className="rounded-sm border border-border">
        <div className="hidden sm:grid grid-cols-5 gap-4 border-b border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
          <span>No.</span><span>Customer</span><span>Total</span><span>Status</span><span>Tanggal</span>
        </div>
        {(orders as Order[] || []).map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.id}`}
            className="grid sm:grid-cols-5 gap-2 sm:gap-4 border-b border-border px-4 py-3 last:border-0 hover:bg-secondary/30 transition-colors">
            <span className="text-sm font-medium">#{order.order_number}</span>
            <span className="text-sm">{order.customer_name}</span>
            <span className="text-sm">{formatPrice(order.total)}</span>
            <span><OrderStatusBadge status={order.status} /></span>
            <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("id-ID")}</span>
          </Link>
        ))}
        {(!orders || orders.length === 0) && <p className="px-4 py-8 text-center text-sm text-muted-foreground">Belum ada pesanan.</p>}
      </div>
    </div>
  );
}
