import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShellFallback } from "@/features/auth/auth-shell";
import { CheckEmail } from "@/features/auth/check-email";

export const metadata: Metadata = {
  title: "Check your email",
};

// Reads the URL (next, token, auth_error), so it renders on the client.
export default function Page() {
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <CheckEmail />
    </Suspense>
  );
}
