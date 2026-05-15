import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/config";
import { StatsCard } from "@/components/admin/stats-card";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import type { Order } from "@/lib/types";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthOrders } = await supabase
    .from("orders")
    .select("total")
    .gte("created_at", startOfMonth.toISOString())
    .in("status", ["confirmed", "shipped", "done"]);

  const revenue = (monthOrders || []).reduce((sum, o) => sum + o.total, 0);

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatsCard label="Pesanan Baru" value={pendingOrders || 0} />
        <StatsCard label="Total Produk" value={totalProducts || 0} />
        <StatsCard label="Pendapatan Bulan Ini" value={formatPrice(revenue)} />
      </div>

      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pesanan Terbaru</h2>
      <div className="rounded-sm border border-border">
        {(recentOrders as Order[] || []).map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0 hover:bg-secondary/30 transition-colors"
          >
            <div>
              <span className="text-sm font-medium">{order.customer_name}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {order.items.length} item — {formatPrice(order.total)}
              </span>
            </div>
            <OrderStatusBadge status={order.status} />
          </Link>
        ))}
        {(!recentOrders || recentOrders.length === 0) && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">Belum ada pesanan.</p>
        )}
      </div>
    </div>
  );
}
