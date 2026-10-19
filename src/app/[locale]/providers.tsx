"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLocale, useMessages } from "next-intl";
import { useEffect, useState } from "react";
import { sessionQueryKey } from "@/hooks/use-session";
import {
  ANONYMOUS_SESSION,
  type Session,
  setApiLanguage,
  setSessionExpiredHandler,
} from "@/lib/auth/client";
import { setErrorMessages } from "@/lib/auth/errors";

export function Providers({ children }: { children: React.ReactNode }) {
  // Browser API calls and error texts follow the page language. Set during
  // render (idempotent module state) so the first queries already use it.
  const locale = useLocale();
  const messages = useMessages() as {
    errors: Record<string, string>;
    fieldLabels: Record<string, string>;
  };
  setApiLanguage(locale);
  setErrorMessages(messages.errors, messages.fieldLabels);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 25_000, // 25s — stale just before 30s refetch
            gcTime: 5 * 60_000, // keep cache 5min after unmount
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 2,
          },
        },
      }),
  );

  useEffect(
    () =>
      setSessionExpiredHandler(() =>
        queryClient.setQueryData<Session>(sessionQueryKey, ANONYMOUS_SESSION),
      ),
    [queryClient],
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
