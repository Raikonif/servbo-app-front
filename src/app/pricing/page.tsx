import type { Metadata } from "next";
import { pricingPlans } from "@/data/billing";
import { PricingPage } from "@/features/marketplace/pricing-page";

export const metadata: Metadata = {
  title: "Pricing",
};

export default function PricingRoute() {
  return <PricingPage plans={pricingPlans} />;
}
