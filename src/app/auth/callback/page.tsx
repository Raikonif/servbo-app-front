import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCallback } from "@/features/auth/auth-callback";
import { AuthShellFallback } from "@/features/auth/auth-shell";

export const metadata: Metadata = {
  title: "Signing in",
};

// Reads the URL (next, token, auth_error), so it renders on the client.
export default function Page() {
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <AuthCallback />
    </Suspense>
  );
}
