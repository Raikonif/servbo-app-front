import type { Metadata } from "next";
import { RequireSession } from "@/features/auth/require-session";
import { BecomeVendorPage } from "@/features/marketplace/become-vendor-page";

export const metadata: Metadata = {
  title: "Become a Vendor",
};

export default function BecomeVendorRoute() {
  return (
    <RequireSession>
      <BecomeVendorPage />
    </RequireSession>
  );
}
