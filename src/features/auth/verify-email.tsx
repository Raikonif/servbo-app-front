"use client";

import { BadgeCheck, CircleX, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { verifyEmail } from "@/lib/auth/client";
import { AuthError, authMessage } from "@/lib/auth/errors";
import { loginHref } from "@/lib/auth/redirect";
import { AuthShell } from "./auth-shell";
import { buttonStyles } from "./form-controls";

export function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "verified" | "failed">(
    token ? "verifying" : "failed",
  );
  const [message, setMessage] = useState(authMessage("INVALID_TOKEN"));
  const hasRun = useRef(false);

  useEffect(() => {
    // Strict Mode runs effects twice; the link must be consumed once.
    if (!token || hasRun.current) return;
    hasRun.current = true;
    verifyEmail(token).then(
      () => setStatus("verified"),
      (err: unknown) => {
        setMessage(
          (err instanceof AuthError ? err : new AuthError("UNKNOWN")).message,
        );
        setStatus("failed");
      },
    );
  }, [token]);

  if (status === "verifying") {
    return (
      <AuthShell title="Verifying your email…">
        <LoaderCircle className="animate-spin text-emerald-600" size={32} />
      </AuthShell>
    );
  }

  if (status === "failed") {
    return (
      <AuthShell subtitle={message} title="We couldn’t verify your email">
        <CircleX className="text-red-500" size={40} />
        <Link className={buttonStyles.primary} href="/check-email">
          Send a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      subtitle="Thanks for confirming your address. You can sign in now."
      title="Email verified"
    >
      <BadgeCheck className="text-emerald-600" size={40} />
      <Link
        className={buttonStyles.primary}
        href={loginHref(searchParams.get("next") ?? "/")}
      >
        Sign in
      </Link>
    </AuthShell>
  );
}
