import type { Metadata } from "next";
import { RequireSession } from "@/features/auth/require-session";
import { BillingPage } from "@/features/marketplace/billing-page";

export const metadata: Metadata = {
  title: "Billing",
};

export default function BillingRoute() {
  return (
    <RequireSession>
      <BillingPage />
    </RequireSession>
  );
}
