import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireSession } from "@/features/auth/require-session";
import { CheckoutView } from "@/features/cart/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <RequireSession>
      {/* useSearchParams (?seller=) needs a Suspense boundary. */}
      <Suspense>
        <CheckoutView />
      </Suspense>
    </RequireSession>
  );
}
