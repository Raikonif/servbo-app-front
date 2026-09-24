import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShellFallback } from "@/features/auth/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

// Reads the URL (next, token, auth_error), so it renders on the client.
export default function Page() {
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <LoginForm />
    </Suspense>
  );
}
