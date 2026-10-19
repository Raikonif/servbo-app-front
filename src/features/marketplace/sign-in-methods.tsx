"use client";

import { CheckCircle2, KeyRound, LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";
import { buttonStyles, Field, FormAlert } from "@/features/auth/form-controls";
import { useSetSession } from "@/hooks/use-session";
import {
  type SessionUser,
  setPassword,
  startGoogleLink,
} from "@/lib/auth/client";
import { AuthError } from "@/lib/auth/errors";

const asAuthError = (error: unknown) =>
  error instanceof AuthError ? error : new AuthError("UNKNOWN");

// Shown after a Google link attempt (?google=linked or ?auth_error=<code>),
// then dropped from the URL so a reload does not repeat it.
function useLinkResult() {
  const [result, setResult] = useState<"linked" | AuthError | null>(null);
  useEffect(() => {
    const url = new URL(window.location.href);
    const linked = url.searchParams.get("google") === "linked";
    const code = url.searchParams.get("auth_error");
    if (!linked && !code) return;
    setResult(linked ? "linked" : new AuthError(code ?? "google_failed"));
    url.searchParams.delete("google");
    url.searchParams.delete("auth_error");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, []);
  return result;
}

// How the account signs in (openspec account-sign-in-methods): Google and a password.
export function SignInMethods({ user }: { user: SessionUser }) {
  const t = useTranslations("account");
  const locale = useLocale();
  const linkResult = useLinkResult();
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<AuthError | null>(null);

  const handleLink = async () => {
    setLinkError(null);
    setLinking(true);
    try {
      // On success the browser leaves for Google, so the spinner stays up.
      await startGoogleLink(locale);
    } catch (err) {
      setLinkError(asAuthError(err));
      setLinking(false);
    }
  };

  const googleError =
    linkError ?? (linkResult instanceof AuthError ? linkResult : null);

  return (
    <section className="space-y-5 rounded-lg border border-line bg-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">{t("google")}</h3>
        {linkResult === "linked" ? (
          <FormAlert tone="success">{t("googleLinked")}</FormAlert>
        ) : null}
        {googleError ? <FormAlert>{googleError.message}</FormAlert> : null}
        {user.google.linked ? (
          <p className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="text-accent-text" size={16} />
            <span>
              {t("linked")}
              {user.google.email ? (
                <span className="text-muted"> · {user.google.email}</span>
              ) : null}
            </span>
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted">{t("linkHelp")}</p>
            <div className="sm:w-60">
              <button
                className={buttonStyles.secondary}
                disabled={linking}
                onClick={handleLink}
                type="button"
              >
                {linking ? (
                  <LoaderCircle className="animate-spin" size={16} />
                ) : null}
                {t("link")}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-line pt-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound size={16} />
          {t("password")}
        </h3>
        <PasswordForm
          hasPassword={user.has_password}
          key={String(user.has_password)}
        />
      </div>
    </section>
  );
}

const EMPTY = { current: "", next: "", confirmation: "" };

function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const t = useTranslations("account");
  const setSession = useSetSession();
  const [form, setForm] = useState(EMPTY);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [saved, setSaved] = useState(false);

  const update = (field: keyof typeof EMPTY) => (value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setPending(true);
    try {
      const user = await setPassword({
        ...(hasPassword ? { current_password: form.current } : {}),
        new_password: form.next,
        new_password_confirmation: form.confirmation,
      });
      setForm(EMPTY);
      setSaved(true);
      if (user) setSession(user);
    } catch (err) {
      const authError = asAuthError(err);
      setError(
        authError.code === "INVALID_CREDENTIALS"
          ? new AuthError("INVALID_CREDENTIALS", t("currentIncorrect"))
          : authError,
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <p className="text-sm text-muted">
        {hasPassword ? t("changeHelp") : t("addHelp")}
      </p>
      {error ? <FormAlert>{error.message}</FormAlert> : null}
      {saved ? (
        <FormAlert tone="success">
          {hasPassword ? t("changed") : t("added")}
        </FormAlert>
      ) : null}
      {hasPassword ? (
        <Field
          autoComplete="current-password"
          id="current_password"
          label={t("currentPassword")}
          onChange={(e) => update("current")(e.target.value)}
          required
          type="password"
          value={form.current}
        />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          autoComplete="new-password"
          id="new_password"
          label={t("newPassword")}
          minLength={8}
          onChange={(e) => update("next")(e.target.value)}
          required
          type="password"
          value={form.next}
        />
        <Field
          autoComplete="new-password"
          id="new_password_confirmation"
          label={t("confirmNewPassword")}
          minLength={8}
          onChange={(e) => update("confirmation")(e.target.value)}
          required
          type="password"
          value={form.confirmation}
        />
      </div>
      <p className="text-xs text-muted">{t("passwordHint")}</p>
      <div className="sm:w-48">
        <button
          className={buttonStyles.primary}
          disabled={pending}
          type="submit"
        >
          {pending ? <LoaderCircle className="animate-spin" size={16} /> : null}
          {hasPassword ? t("change") : t("add")}
        </button>
      </div>
    </form>
  );
}
