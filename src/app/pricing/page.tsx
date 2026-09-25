import type { Metadata } from "next";
import { PricingPage } from "@/features/marketplace/pricing-page";

export const metadata: Metadata = {
  title: "Pricing",
};

export default function PricingRoute() {
  return <PricingPage />;
}
