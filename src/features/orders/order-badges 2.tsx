import { type OrderStatus, STATUS_LABELS } from "@/lib/orders";

const tones: Record<OrderStatus, string> = {
  pending_payment: "bg-warning-soft text-warning",
  confirmed: "bg-accent-soft text-accent-text",
  cancelled: "bg-surface-2 text-muted",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
