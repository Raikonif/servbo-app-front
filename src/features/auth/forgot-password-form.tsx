"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { sendResetPassword } from "@/lib/auth/client";
import { AuthError } from "@/lib/auth/errors";
import { loginHref, safeNext } from "@/lib/auth/redirect";
import { AuthShell } from "./auth-shell";
import { buttonStyles, Field, FormAlert } from "./form-controls";

export function ForgotPasswordForm() {
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
        <Link className="font-medium text-emerald-700" href={loginHref(next)}>
          Back to sign in
        </Link>
      }
      subtitle="We’ll email you a link to choose a new password."
      title="Reset your password"
    >
      {sent ? (
        <FormAlert tone="success">
          If an account exists for that email, we sent a link to reset your
          password. It arrives in a few minutes.
        </FormAlert>
      ) : null}
      {error ? <FormAlert>{error.message}</FormAlert> : null}
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
