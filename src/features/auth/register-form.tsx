"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { sendEmailVerification, signUp } from "@/lib/auth/client";
import { AuthError, PASSWORD_REGEX } from "@/lib/auth/errors";
import { loginHref, safeNext } from "@/lib/auth/redirect";
import { AuthShell } from "./auth-shell";
import { buttonStyles, Field, FormAlert } from "./form-controls";

export function RegisterForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmation: "",
  });
  const [error, setError] = useState<AuthError | null>(null);
  const [isPending, setIsPending] = useState(false);

  const update = (field: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirmation) {
      setError(new AuthError("PASSWORD_MISMATCH"));
      return;
    }
    if (!PASSWORD_REGEX.test(form.password)) {
      setError(new AuthError("INVALID_PASSWORD_FORMAT"));
      return;
    }

    setError(null);
    setIsPending(true);
    try {
      await signUp({
        email: form.email,
        username: form.username.trim(),
        password: form.password,
        password_confirmation: form.confirmation,
      });
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError("UNKNOWN"));
      setIsPending(false);
      return;
    }

    // The account exists now: a failed email must not block the user, the
    // next page lets them resend it.
    const sent = await sendEmailVerification(form.email).then(
      () => true,
      () => false,
    );
    const params = new URLSearchParams({ email: form.email, next });
    if (!sent) params.set("send_failed", "1");
    router.replace(`/check-email?${params}`);
  };

  return (
    <AuthShell
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-medium text-emerald-700" href={loginHref(next)}>
            Sign in
          </Link>
        </>
      }
      subtitle="Sign up to save products and manage your purchases."
      title="Create your account"
    >
      {error ? (
        <FormAlert
          action={
            error.code === "EMAIL_ALREADY_EXISTS" ? (
              <Link className="font-medium underline" href={loginHref(next)}>
                Go to sign in
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
          label="Email"
          onChange={(e) => update("email")(e.target.value)}
          required
          type="email"
          value={form.email}
        />
        <Field
          autoComplete="username"
          id="username"
          label="Username"
          onChange={(e) => update("username")(e.target.value)}
          required
          value={form.username}
        />
        <Field
          autoComplete="new-password"
          id="password"
          label="Password"
          onChange={(e) => update("password")(e.target.value)}
          required
          type="password"
          value={form.password}
        />
        <Field
          autoComplete="new-password"
          id="confirmation"
          label="Confirm password"
          onChange={(e) => update("confirmation")(e.target.value)}
          required
          type="password"
          value={form.confirmation}
        />
        <p className="text-xs text-slate-500">
          At least 8 characters, with an uppercase letter, a lowercase letter
          and a number.
        </p>
        <button
          className={buttonStyles.primary}
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : null}
          Create account
        </button>
      </form>
    </AuthShell>
  );
}
