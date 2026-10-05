"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { useSession, useSetSession } from "@/hooks/use-session";
import { signIn, startGoogleSignIn } from "@/lib/auth/client";
import { AuthError } from "@/lib/auth/errors";
import { leaveAuthPage, safeNext } from "@/lib/auth/redirect";
import { AuthShell } from "./auth-shell";
import { buttonStyles, Field, FormAlert } from "./form-controls";

const asAuthError = (error: unknown) =>
  error instanceof AuthError ? error : new AuthError("UNKNOWN");

export function LoginForm() {
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

  // Already signed in (e.g. back button, or another tab signed in).
  useEffect(() => {
    if (session?.authenticated) leaveAuthPage(next);
  }, [session?.authenticated, next]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending("password");
    try {
      setSession(await signIn(email, password));
      leaveAuthPage(next);
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
      await startGoogleSignIn(next);
    } catch (err) {
      setError(asAuthError(err));
      setPending(null);
    }
  };

  return (
    <AuthShell
      footer={
        <>
          New to Servbo?{" "}
          <Link
            className="font-medium text-accent-text"
            href={`/register?next=${encodeURIComponent(next)}`}
          >
            Create an account
          </Link>
        </>
      }
      subtitle="Use the same account as Servbo Creator."
      title="Sign in"
    >
      {passwordWasReset && !error ? (
        <FormAlert tone="success">
          Password updated. Sign in with your new password.
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
                Resend verification email
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
        <Field
          autoComplete="current-password"
          id="password"
          label="Password"
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
            Forgot your password?
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
          Sign in
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-subtle">
        <span className="h-px flex-1 bg-line" />
        OR
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
        Continue with Google
      </button>
    </AuthShell>
  );
}
