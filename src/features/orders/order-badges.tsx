import { useTranslations } from "next-intl";
import type { OrderStatus } from "@/lib/orders";

const tones: Record<OrderStatus, string> = {
  pending_payment: "bg-warning-soft text-warning",
  confirmed: "bg-accent-soft text-accent-text",
  shipped: "bg-accent-soft text-accent-text",
  ready_for_pickup: "bg-accent-soft text-accent-text",
  delivered: "bg-accent text-accent-fg",
  cancelled: "bg-surface-2 text-muted",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders.status");
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[status]}`}
    >
      {t(status)}
    </span>
  );
}
