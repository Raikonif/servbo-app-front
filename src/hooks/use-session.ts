"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ANONYMOUS_SESSION,
  getSession,
  type Session,
  type SessionUser,
} from "@/lib/auth/client";

export const sessionQueryKey = ["session"] as const;

// Single source of truth for "who is signed in" on the storefront.
export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: getSession,
    staleTime: 5 * 60_000,
    refetchInterval: false,
  });
}

export function useSetSession() {
  const queryClient = useQueryClient();
  return (user: SessionUser | null) =>
    queryClient.setQueryData<Session>(
      sessionQueryKey,
      user
        ? { authenticated: true, user }
        : { ...ANONYMOUS_SESSION, signedOut: true },
    );
}

export const displayName = (user: SessionUser) =>
  [user.first_name, user.last_name].filter(Boolean).join(" ") ||
  user.username ||
  user.email;
