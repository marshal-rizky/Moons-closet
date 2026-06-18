import type { PaymentMethod, PaymentStatus } from "@/lib/types";

const STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Belum Bayar",
  pending: "Menunggu",
  paid: "Lunas",
  failed: "Gagal",
  expired: "Kedaluwarsa",
};

const STATUS_CLASS: Record<PaymentStatus, string> = {
  unpaid: "bg-secondary text-muted-foreground",
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  expired: "bg-red-100 text-red-800",
};

export function PaymentBadge({
  method,
  status,
}: {
  method: PaymentMethod;
  status: PaymentStatus;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {method === "online" ? "Online" : "WhatsApp"}
      </span>
      <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}>
        {STATUS_LABEL[status]}
      </span>
    </span>
  );
}
