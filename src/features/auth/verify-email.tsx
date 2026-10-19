"use client";

import { BadgeCheck, CircleX, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { verifyEmail } from "@/lib/auth/client";
import { AuthError, authMessage } from "@/lib/auth/errors";
import { loginHref } from "@/lib/auth/redirect";
import { AuthShell } from "./auth-shell";
import { buttonStyles } from "./form-controls";

export function VerifyEmail() {
  const t = useTranslations("auth");
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
      <AuthShell title={t("verify.verifying")}>
        <LoaderCircle className="animate-spin text-accent-text" size={32} />
      </AuthShell>
    );
  }

  if (status === "failed") {
    return (
      <AuthShell subtitle={message} title={t("verify.failedTitle")}>
        <CircleX className="text-danger" size={40} />
        <Link className={buttonStyles.primary} href="/check-email">
          {t("verify.sendNewLink")}
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      subtitle={t("verify.verifiedSubtitle")}
      title={t("verify.verifiedTitle")}
    >
      <BadgeCheck className="text-accent-text" size={40} />
      <Link
        className={buttonStyles.primary}
        href={loginHref(searchParams.get("next") ?? "/")}
      >
        {t("signIn")}
      </Link>
    </AuthShell>
  );
}
