import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireSession } from "@/features/auth/require-session";
import { OrdersView } from "@/features/orders/orders-view";

export const metadata: Metadata = {
  title: "My orders",
  robots: { index: false },
};

export default function OrdersPage() {
  return (
    <RequireSession>
      <Suspense>
        <OrdersView />
      </Suspense>
    </RequireSession>
  );
}
