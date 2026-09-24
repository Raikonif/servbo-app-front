import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShellFallback } from "@/features/auth/auth-shell";
import { VerifyEmail } from "@/features/auth/verify-email";

export const metadata: Metadata = {
  title: "Verify email",
};

// Reads the URL (next, token, auth_error), so it renders on the client.
export default function Page() {
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <VerifyEmail />
    </Suspense>
  );
}
