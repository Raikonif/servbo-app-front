"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { sendResetPassword } from "@/lib/auth/client";
import { AuthError } from "@/lib/auth/errors";
import { AuthShell } from "./auth-shell";
import { buttonStyles, Field, FormAlert } from "./form-controls";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<AuthError | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      await sendResetPassword(email);
      setSentTo(email);
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError("UNKNOWN"));
    }
    setIsPending(false);
  };

  return (
    <AuthShell
      footer={
        <Link className="font-medium text-emerald-700" href="/login">
          Back to sign in
        </Link>
      }
      subtitle="We’ll email you a link to choose a new password."
      title="Reset your password"
    >
      {sentTo ? (
        <FormAlert tone="success">
          Check {sentTo}: the link arrives in a few minutes.
        </FormAlert>
      ) : null}
      {error ? (
        <FormAlert
          action={
            error.code === "EMAIL_NOT_VERIFIED" ? (
              <Link
                className="font-medium underline"
                href={`/check-email?email=${encodeURIComponent(email)}`}
              >
                Verify your email first
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
          Send reset link
        </button>
      </form>
    </AuthShell>
  );
}
