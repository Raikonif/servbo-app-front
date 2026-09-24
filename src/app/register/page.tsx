import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShellFallback } from "@/features/auth/auth-shell";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

// Reads the URL (next, token, auth_error), so it renders on the client.
export default function Page() {
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <RegisterForm />
    </Suspense>
  );
}
