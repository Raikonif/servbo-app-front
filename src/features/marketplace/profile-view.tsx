"use client";

import { LoaderCircle, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { buttonStyles, Field, FormAlert } from "@/features/auth/form-controls";
import { LanguageSwitcher } from "@/features/i18n/language-switcher";
import { useUpdateProfile } from "@/hooks/use-catalog";
import { displayName, useSession } from "@/hooks/use-session";
import { useFormat } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
import type { SessionUser } from "@/lib/auth/client";
import { AuthError } from "@/lib/auth/errors";
import { CREATOR_URL } from "@/lib/billing";
import { SignInMethods } from "./sign-in-methods";

const roleKeys = (user: SessionUser) =>
  [
    user.is_staff ? "staff" : null,
    user.is_seller ? "seller" : null,
    user.is_client ? "buyer" : null,
  ].filter(Boolean) as ("staff" | "seller" | "buyer")[];

// Rendered inside RequireSession: the session user is always present.
export function ProfileView() {
  const user = useSession().data?.user;
  if (!user) return null;
  // Keyed by account so the form resets if a different user signs in.
  return <Profile key={user.id} user={user} />;
}

function Profile({ user }: { user: SessionUser }) {
  const t = useTranslations("profile");
  const format = useFormat();
  const [form, setForm] = useState({
    username: user.username ?? "",
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
  });
  const [saved, setSaved] = useState(false);
  const mutation = useUpdateProfile(user.id);

  const update = (field: keyof typeof form) => (value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSaved(false);
    mutation.mutate(
      {
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      },
      { onSuccess: () => setSaved(true) },
    );
  };

  const error = mutation.error
    ? mutation.error instanceof AuthError
      ? mutation.error
      : new AuthError("UNKNOWN")
    : null;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex items-center gap-4 rounded-lg border border-line bg-surface p-6 shadow-sm">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-fg text-bg">
          <UserRound size={24} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">
            {displayName(user)}
          </h1>
          <p className="truncate text-sm text-muted">{user.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roleKeys(user).map((role) => (
              <span
                className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-text"
                key={role}
              >
                {t(`roles.${role}`)}
              </span>
            ))}
            {!user.is_email_verified ? (
              <span className="rounded-md bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
                {t("emailNotVerified")}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-muted">
            {t("memberSince", { date: format.date(user.created_at) })}
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-line bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{t("details")}</h2>
        {error ? <FormAlert>{error.message}</FormAlert> : null}
        {saved ? <FormAlert tone="success">{t("updated")}</FormAlert> : null}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field
            autoComplete="username"
            id="username"
            label={t("username")}
            maxLength={50}
            onChange={(e) => update("username")(e.target.value)}
            value={form.username}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              autoComplete="given-name"
              id="first_name"
              label={t("firstName")}
              onChange={(e) => update("first_name")(e.target.value)}
              value={form.first_name}
            />
            <Field
              autoComplete="family-name"
              id="last_name"
              label={t("lastName")}
              onChange={(e) => update("last_name")(e.target.value)}
              value={form.last_name}
            />
          </div>
          <div className="sm:w-48">
            <button
              className={buttonStyles.primary}
              disabled={mutation.isPending}
              type="submit"
            >
              {mutation.isPending ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : null}
              {t("save")}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3 rounded-lg border border-line bg-surface p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">{t("languageTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("languageHelp")}</p>
        </div>
        <LanguageSwitcher />
      </section>

      <SignInMethods user={user} />

      <section className="flex flex-wrap gap-2">
        <Link className={`${buttonStyles.secondary} sm:w-auto`} href="/billing">
          {t("billing")}
        </Link>
        {user.is_seller ? (
          <a className={`${buttonStyles.primary} sm:w-auto`} href={CREATOR_URL}>
            {t("openCreator")}
          </a>
        ) : (
          <Link
            className={`${buttonStyles.primary} sm:w-auto`}
            href="/become-a-vendor"
          >
            {t("becomeSeller")}
          </Link>
        )}
      </section>
    </main>
  );
}
