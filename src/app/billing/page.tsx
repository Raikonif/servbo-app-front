import type { Metadata } from "next";
import { billingAccount, pricingPlans } from "@/data/billing";
import { BillingPage } from "@/features/marketplace/billing-page";

export const metadata: Metadata = {
  title: "Billing",
};

export default function BillingRoute() {
  return <BillingPage account={billingAccount} plans={pricingPlans} />;
}
