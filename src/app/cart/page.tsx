import type { Metadata } from "next";
import { RequireSession } from "@/features/auth/require-session";
import { CartView } from "@/features/cart/cart-view";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <RequireSession>
      <CartView />
    </RequireSession>
  );
}
