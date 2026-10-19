"use client";

import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { resetPassword } from "@/lib/auth/client";
import { AuthError, authMessage, PASSWORD_REGEX } from "@/lib/auth/errors";
import { AuthShell } from "./auth-shell";
import { buttonStyles, Field, FormAlert } from "./form-controls";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<AuthError | null>(null);
  const [isPending, setIsPending] = useState(false);

  const requestNewLink = (
    <Link className="font-medium underline" href="/forgot-password">
      {t("reset.requestNewLink")}
    </Link>
  );

  if (!token) {
    return (
      <AuthShell title={t("reset.incompleteTitle")}>
        <FormAlert action={requestNewLink}>
          {authMessage("INVALID_TOKEN")}
        </FormAlert>
      </AuthShell>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmation) {
      setError(new AuthError("PASSWORD_MISMATCH"));
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError(new AuthError("INVALID_PASSWORD_FORMAT"));
      return;
    }
    setError(null);
    setIsPending(true);
    try {
      await resetPassword(token, password, confirmation);
      router.replace("/login?reset=1");
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError("UNKNOWN"));
      setIsPending(false);
    }
  };

  return (
    <AuthShell title={t("reset.title")}>
      {error ? (
        <FormAlert
          action={error.code === "INVALID_TOKEN" ? requestNewLink : null}
        >
          {error.message}
        </FormAlert>
      ) : null}
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
        <Field
          autoComplete="new-password"
          id="password"
          label={t("reset.newPassword")}
          minLength={8}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
        <Field
          autoComplete="new-password"
          id="confirmation"
          label={t("reset.confirmNewPassword")}
          minLength={8}
          onChange={(e) => setConfirmation(e.target.value)}
          required
          type="password"
          value={confirmation}
        />
        <p className="text-xs text-muted">{t("passwordHint")}</p>
        <button
          className={buttonStyles.primary}
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : null}
          {t("reset.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
