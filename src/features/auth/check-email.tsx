"use client";

import { LoaderCircle, MailCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { sendEmailVerification } from "@/lib/auth/client";
import { AuthError } from "@/lib/auth/errors";
import { loginHref, safeNext } from "@/lib/auth/redirect";
import { AuthShell } from "./auth-shell";
import { buttonStyles, Field, FormAlert } from "./form-controls";

// Landing after sign-up, and the place to resend the verification email.
export function CheckEmail() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [notice, setNotice] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(
    searchParams.get("send_failed")
      ? {
          tone: "error",
          text: "Your account was created, but we could not send the email. Resend it below.",
        }
      : null,
  );
  const [isPending, setIsPending] = useState(false);

  const handleResend = async (event: FormEvent) => {
    event.preventDefault();
    setIsPending(true);
    try {
      await sendEmailVerification(email);
      setNotice({ tone: "success", text: `We sent a new link to ${email}.` });
    } catch (err) {
      const error = err instanceof AuthError ? err : new AuthError("UNKNOWN");
      setNotice({
        tone: error.code === "ALREADY_VERIFIED" ? "success" : "error",
        text: error.message,
      });
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
      subtitle={
        <>
          We sent a verification link
          {email ? (
            <>
              {" "}
              to <strong className="text-slate-700">{email}</strong>
            </>
          ) : null}
          . Open it to activate your account (check your spam folder too).
        </>
      }
      title="Check your email"
    >
      <MailCheck className="text-emerald-600" size={40} />
      {notice ? <FormAlert tone={notice.tone}>{notice.text}</FormAlert> : null}
      <form className="space-y-3" onSubmit={(e) => void handleResend(e)}>
        <Field
          autoComplete="email"
          id="email"
          label="Didn’t get it? Resend to"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
        <button
          className={buttonStyles.secondary}
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : null}
          Resend verification email
        </button>
      </form>
    </AuthShell>
  );
}
