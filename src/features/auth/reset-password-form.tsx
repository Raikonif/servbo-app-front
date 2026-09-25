"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { resetPassword } from "@/lib/auth/client";
import { AuthError, authMessage, PASSWORD_REGEX } from "@/lib/auth/errors";
import { AuthShell } from "./auth-shell";
import { buttonStyles, Field, FormAlert } from "./form-controls";

const requestNewLink = (
  <Link className="font-medium underline" href="/forgot-password">
    Request a new link
  </Link>
);

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<AuthError | null>(null);
  const [isPending, setIsPending] = useState(false);

  if (!token) {
    return (
      <AuthShell title="Incomplete link">
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
    <AuthShell title="Choose a new password">
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
          label="New password"
          minLength={8}
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
        <Field
          autoComplete="new-password"
          id="confirmation"
          label="Confirm new password"
          minLength={8}
          onChange={(e) => setConfirmation(e.target.value)}
          required
          type="password"
          value={confirmation}
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
          Update password
        </button>
      </form>
    </AuthShell>
  );
}
