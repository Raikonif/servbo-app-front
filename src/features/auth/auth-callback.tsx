"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { applyAccountLanguage } from "@/features/i18n/language";
import { sessionQueryKey } from "@/hooks/use-session";
import { useRouter } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/client";
import { consumeNext, leaveAuthPage } from "@/lib/auth/redirect";
import { AuthShell } from "./auth-shell";

// Google sends the browser here after the backend set the session cookies.
// Confirm the session, then continue where the user was headed; on any
// failure fall back to the login with a visible reason.
export function AuthCallback() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const next = consumeNext();

    queryClient
      .fetchQuery({
        queryKey: sessionQueryKey,
        queryFn: getSession,
        staleTime: 0,
      })
      .then(
        async (session) => {
          if (!session.authenticated || !session.user) {
            router.replace("/login?auth_error=google_failed");
            return;
          }
          leaveAuthPage(next, await applyAccountLanguage(session.user, locale));
        },
        () => router.replace("/login?auth_error=NETWORK_ERROR"),
      );
  }, [queryClient, router, locale]);

  return (
    <AuthShell title={t("callback.title")}>
      <LoaderCircle className="animate-spin text-accent-text" size={32} />
    </AuthShell>
  );
}
