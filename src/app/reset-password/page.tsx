import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShellFallback } from "@/features/auth/auth-shell";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

// Reads the URL (next, token, auth_error), so it renders on the client.
export default function Page() {
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
