import type { Metadata } from "next";
import { RequireSession } from "@/features/auth/require-session";
import { OrderDetailView } from "@/features/orders/order-detail-view";

export const metadata: Metadata = { title: "Order", robots: { index: false } };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireSession>
      <OrderDetailView orderId={id} />
    </RequireSession>
  );
}
