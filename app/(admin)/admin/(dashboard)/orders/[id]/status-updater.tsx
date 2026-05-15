"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const statusFlow = [
  { status: "confirmed", label: "Konfirmasi", className: "bg-green-600 hover:bg-green-700 text-white" },
  { status: "shipped", label: "Kirim", className: "bg-blue-600 hover:bg-blue-700 text-white" },
  { status: "done", label: "Selesai", className: "bg-purple-600 hover:bg-purple-700 text-white" },
] as const;

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const currentIndex = statusFlow.findIndex((s) => s.status === currentStatus);
  const availableStatuses = statusFlow.filter((_, i) => i > currentIndex);

  if (currentStatus === "done" || availableStatuses.length === 0) return null;

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Update Status</h2>
      <div className="flex gap-2">
        {availableStatuses.map((s) => (
          <Button key={s.status} disabled={loading} className={s.className} onClick={() => updateStatus(s.status)}>
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
