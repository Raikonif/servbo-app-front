"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { displayName, useSession, useSetSession } from "@/hooks/use-session";
import { signOut } from "@/lib/auth/client";
import { AuthError } from "@/lib/auth/errors";
import { loginHref, safeNext } from "@/lib/auth/redirect";

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const setSession = useSetSession();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isPending) {
    return (
      <span className="h-8 w-24 animate-pulse rounded-full bg-surface-2" />
    );
  }

  if (!session?.authenticated || !session.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:text-fg sm:inline-flex"
          href={loginHref(pathname)}
        >
          Sign in
        </Link>
        <Link
          className="rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover"
          href={`/register?next=${encodeURIComponent(safeNext(pathname))}`}
        >
          <span className="sm:hidden">Sign up</span>
          <span className="hidden sm:inline">Create account</span>
        </Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    setError(null);
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      // The cookies are still valid: stay signed in and say so.
      setError(
        (err instanceof AuthError ? err : new AuthError("UNKNOWN")).message,
      );
      setIsSigningOut(false);
      return;
    }
    // Drop everything cached for this user, then publish the signed-out
    // session; personal pages send the user home (RequireSession).
    queryClient.clear();
    setSession(null);
    setIsSigningOut(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        className="inline-flex items-center gap-2 rounded-full py-1 pr-1 pl-1 text-sm font-medium text-fg transition hover:bg-surface-2 md:pr-3"
        href="/profile"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-fg text-bg">
          <UserRound size={16} />
        </span>
        <span className="hidden max-w-40 truncate md:inline">
          {displayName(session.user)}
        </span>
      </Link>
      <button
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1.5 text-sm font-medium text-muted transition hover:border-line-strong hover:text-fg disabled:opacity-60"
        disabled={isSigningOut}
        onClick={() => void handleSignOut()}
        type="button"
      >
        <LogOut aria-hidden size={15} />
        <span className="sr-only sm:not-sr-only">Sign out</span>
      </button>
      {error ? (
        <p className="max-w-56 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
