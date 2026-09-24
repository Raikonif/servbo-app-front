"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { sessionQueryKey } from "@/hooks/use-session";
import { getSession } from "@/lib/auth/client";
import { consumeNext } from "@/lib/auth/redirect";
import { AuthShell } from "./auth-shell";

// Google sends the browser here after the backend set the session cookies.
// Confirm the session, then continue where the user was headed; on any
// failure fall back to the login with a visible reason.
export function AuthCallback() {
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
        (session) =>
          router.replace(
            session.authenticated ? next : "/login?auth_error=google_failed",
          ),
        () => router.replace("/login?auth_error=NETWORK_ERROR"),
      );
  }, [queryClient, router]);

  return (
    <AuthShell title="Signing you in…">
      <LoaderCircle className="animate-spin text-emerald-600" size={32} />
    </AuthShell>
  );
}
