"use client";

import { LoaderCircle, MailCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Link } from "@/i18n/navigation";
import { sendEmailVerification } from "@/lib/auth/client";
import { AuthError } from "@/lib/auth/errors";
import { loginHref, safeNext } from "@/lib/auth/redirect";
import { AuthShell } from "./auth-shell";
import { buttonStyles, Field, FormAlert } from "./form-controls";

// Landing after sign-up, and the place to resend the verification email.
export function CheckEmail() {
  const t = useTranslations("auth");
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
          text: t("checkEmail.sendFailed"),
        }
      : null,
  );
  const [isPending, setIsPending] = useState(false);

  const handleResend = async (event: FormEvent) => {
    event.preventDefault();
    setIsPending(true);
    try {
      await sendEmailVerification(email);
      setNotice({
        tone: "success",
        text: t("checkEmail.resent"),
      });
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
        <Link className="font-medium text-accent-text" href={loginHref(next)}>
          {t("backToSignIn")}
        </Link>
      }
      subtitle={
        email
          ? t.rich("checkEmail.subtitle", {
              email,
              b: (chunks) => <strong className="text-fg">{chunks}</strong>,
            })
          : t("checkEmail.subtitleNoEmail")
      }
      title={t("checkEmail.title")}
    >
      <MailCheck className="text-accent-text" size={40} />
      {notice ? <FormAlert tone={notice.tone}>{notice.text}</FormAlert> : null}
      <form className="space-y-3" onSubmit={(e) => void handleResend(e)}>
        <Field
          autoComplete="email"
          id="email"
          label={t("checkEmail.resendLabel")}
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
          {t("checkEmail.resend")}
        </button>
      </form>
    </AuthShell>
  );
}
