"use client";

import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { applyAccountLanguage } from "@/features/i18n/language";
import { useSession, useSetSession } from "@/hooks/use-session";
import { Link } from "@/i18n/navigation";
import { signIn, startGoogleSignIn } from "@/lib/auth/client";
import { AuthError } from "@/lib/auth/errors";
import { leaveAuthPage, safeNext } from "@/lib/auth/redirect";
import { AuthShell } from "./auth-shell";
import { buttonStyles, Field, FormAlert } from "./form-controls";

const asAuthError = (error: unknown) =>
  error instanceof AuthError ? error : new AuthError("UNKNOWN");

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  // Set by the backend when the Google round-trip fails (canceled, denied...).
  const redirectError = searchParams.get("auth_error");
  const passwordWasReset = searchParams.get("reset") === "1";

  const { data: session } = useSession();
  const setSession = useSetSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<"password" | "google" | null>(null);
  const [error, setError] = useState<AuthError | null>(
    redirectError ? new AuthError(redirectError) : null,
  );

  // Set once this form signed the user in: it picks the language to land in,
  // so the "already signed in" effect below must not navigate as well.
  const signingIn = useRef(false);

  // Already signed in (e.g. back button, or another tab signed in).
  useEffect(() => {
    if (session?.authenticated && !signingIn.current) {
      leaveAuthPage(next, locale);
    }
  }, [session?.authenticated, next, locale]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending("password");
    try {
      const user = await signIn(email, password);
      signingIn.current = true;
      setSession(user);
      leaveAuthPage(next, await applyAccountLanguage(user, locale));
    } catch (err) {
      setError(asAuthError(err));
      setPending(null);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setPending("google");
    try {
      // On success the browser leaves the page, so the spinner stays up.
      await startGoogleSignIn(next, locale);
    } catch (err) {
      setError(asAuthError(err));
      setPending(null);
    }
  };

  return (
    <AuthShell
      footer={t.rich("login.newHere", {
        link: (chunks) => (
          <Link
            className="font-medium text-accent-text"
            href={`/register?next=${encodeURIComponent(next)}`}
          >
            {chunks}
          </Link>
        ),
      })}
      subtitle={t("login.subtitle")}
      title={t("login.title")}
    >
      {passwordWasReset && !error ? (
        <FormAlert tone="success">{t("login.passwordReset")}</FormAlert>
      ) : null}
      {error ? (
        <FormAlert
          action={
            error.code === "EMAIL_NOT_VERIFIED" ? (
              <Link
                className="font-medium underline"
                href={`/check-email?email=${encodeURIComponent(email)}`}
              >
                {t("login.resendVerification")}
              </Link>
            ) : null
          }
        >
          {error.message}
        </FormAlert>
      ) : null}

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
        <Field
          autoComplete="current-password"
          id="password"
          label={t("password")}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
        <div className="flex justify-end">
          <Link
            className="text-sm font-medium text-accent-text"
            href={`/forgot-password?next=${encodeURIComponent(next)}`}
          >
            {t("login.forgot")}
          </Link>
        </div>
        <button
          className={buttonStyles.primary}
          disabled={pending !== null}
          type="submit"
        >
          {pending === "password" ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : null}
          {t("signIn")}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-subtle">
        <span className="h-px flex-1 bg-line" />
        {t("login.or")}
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        className={buttonStyles.secondary}
        disabled={pending !== null}
        onClick={() => void handleGoogle()}
        type="button"
      >
        {pending === "google" ? (
          <LoaderCircle className="animate-spin" size={16} />
        ) : null}
        {t("login.google")}
      </button>
    </AuthShell>
  );
}
