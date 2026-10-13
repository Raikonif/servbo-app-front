import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireSession } from "@/features/auth/require-session";
import { BecomeVendorPayPage } from "@/features/marketplace/become-vendor-pay-page";

export const metadata: Metadata = {
  title: "Pay your credit pack",
  robots: { index: false },
};

export default function BecomeVendorPayRoute() {
  return (
    <RequireSession>
      {/* useSearchParams (?payment=) needs a Suspense boundary. */}
      <Suspense>
        <BecomeVendorPayPage />
      </Suspense>
    </RequireSession>
  );
}
