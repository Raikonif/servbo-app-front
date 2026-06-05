import type { Metadata } from "next";
import { vendorApplication } from "@/data/vendor";
import { BecomeVendorPage } from "@/features/marketplace/become-vendor-page";

export const metadata: Metadata = {
  title: "Become a Vendor",
};

export default function BecomeVendorRoute() {
  return <BecomeVendorPage application={vendorApplication} />;
}
