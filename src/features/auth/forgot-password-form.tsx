"use client";

import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Link } from "@/i18n/navigation";
import { sendResetPassword } from "@/lib/auth/client";
import { AuthError } from "@/lib/auth/errors";
import { loginHref, safeNext } from "@/lib/auth/redirect";
import { AuthShell } from "./auth-shell";
import { buttonStyles, Field, FormAlert } from "./form-controls";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const next = safeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [error, setError] = useState<AuthError | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      await sendResetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError("UNKNOWN"));
    }
    setIsPending(false);
  };

  return (
    <AuthShell
      footer={
        <Link className="font-medium text-accent-text" href={loginHref(next)}>
          {t("backToSignIn")}
        </Link>
      }
      subtitle={t("forgot.subtitle")}
      title={t("forgot.title")}
    >
      {sent ? <FormAlert tone="success">{t("forgot.sent")}</FormAlert> : null}
      {error ? <FormAlert>{error.message}</FormAlert> : null}
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
        <Field
          autoComplete="email"
          id="email"
          label={t("email")}
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
        <button
          className={buttonStyles.primary}
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : null}
          {t("forgot.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
