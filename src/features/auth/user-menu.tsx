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
    return <span className="h-10 w-28 animate-pulse rounded-md bg-slate-100" />;
  }

  if (!session?.authenticated || !session.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700"
          href={loginHref(pathname)}
        >
          Sign in
        </Link>
        <Link
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          href={`/register?next=${encodeURIComponent(safeNext(pathname))}`}
        >
          Create account
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
        className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700"
        href="/profile"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
          <UserRound size={16} />
        </span>
        <span className="max-w-40 truncate">{displayName(session.user)}</span>
      </Link>
      <button
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
        disabled={isSigningOut}
        onClick={() => void handleSignOut()}
        type="button"
      >
        <LogOut size={16} />
        Sign out
      </button>
      {error ? (
        <p className="max-w-56 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
