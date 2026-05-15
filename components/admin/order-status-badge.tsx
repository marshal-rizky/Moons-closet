import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  confirmed: { label: "Dikonfirmasi", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  shipped: { label: "Dikirim", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  done: { label: "Selesai", className: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
} as const;

export function OrderStatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status];
  return (
    <Badge variant="secondary" className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}
