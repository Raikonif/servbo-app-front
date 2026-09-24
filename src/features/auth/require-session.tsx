"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useSession } from "@/hooks/use-session";
import { loginHref } from "@/lib/auth/redirect";
import { ServiceUnavailable } from "./service-unavailable";

// Client-side gate for personal pages. The check runs in the browser because
// the refresh cookie is scoped to the API's /api/auth/session/ path: only the
// session endpoint can tell "expired access token" from "signed out".
export function RequireSession({ children }: { children: ReactNode }) {
  const { data: session, isError, refetch } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isAnonymous = session ? !session.authenticated : false;
  const signedOut = Boolean(session?.signedOut);

  useEffect(() => {
    if (isAnonymous) router.replace(signedOut ? "/" : loginHref(pathname));
  }, [isAnonymous, signedOut, pathname, router]);

  if (session?.authenticated) return children;
  if (!session && isError) {
    return <ServiceUnavailable onRetry={() => void refetch()} />;
  }

  return (
    <main
      aria-busy="true"
      className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8"
    >
      <p className="text-sm text-slate-500">
        {isAnonymous ? "Redirecting to sign in…" : "Checking your session…"}
      </p>
      <div className="h-40 animate-pulse rounded-lg bg-slate-200/70" />
      <div className="h-64 animate-pulse rounded-lg bg-slate-200/50" />
    </main>
  );
}
