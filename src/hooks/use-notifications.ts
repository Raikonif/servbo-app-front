"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
  type NotificationPage,
  notificationKeys,
} from "@/lib/notifications";

// The latest buyer notifications and the unread count. Polls every minute
// while the tab is visible (React Query pauses intervals in the background)
// and on focus; anonymous visitors never ask.
export function useNotifications() {
  const { data: session } = useSession();
  const signedIn = Boolean(session?.authenticated);
  const query = useQuery({
    queryKey: notificationKeys.list,
    queryFn: () => getNotifications(1),
    enabled: signedIn,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
  return {
    ...query,
    signedIn,
    notifications: signedIn ? (query.data?.results ?? []) : [],
    unread: signedIn ? (query.data?.unread ?? 0) : 0,
  };
}

// Marks read in the cache right away (dot and badge), then takes the
// server's unread count; errors roll back.
function useMarkRead<V>(
  call: (vars: V) => Promise<{ unread: number } | null>,
  isTarget: (id: string, vars: V) => boolean,
) {
  const queryClient = useQueryClient();
  const key = notificationKeys.list;
  return useMutation({
    mutationFn: call,
    onMutate: async (vars: V) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationPage>(key);
      if (previous) {
        const now = new Date().toISOString();
        let marked = 0;
        const results = previous.results.map((item) => {
          if (item.read_at || !isTarget(item.id, vars)) return item;
          marked += 1;
          return { ...item, read_at: now };
        });
        queryClient.setQueryData<NotificationPage>(key, {
          ...previous,
          results,
          unread: Math.max(0, previous.unread - marked),
        });
      }
      return { previous };
    },
    onError: (_error, _vars, context) => {
      queryClient.setQueryData(key, context?.previous);
    },
    onSuccess: (result) => {
      if (!result) return;
      queryClient.setQueryData<NotificationPage>(key, (page) =>
        page ? { ...page, unread: result.unread } : page,
      );
    },
  });
}

export const useMarkNotificationRead = () =>
  useMarkRead(
    (id: string) => markNotificationsRead([id]),
    (itemId, id) => itemId === id,
  );

export const useMarkAllNotificationsRead = () =>
  useMarkRead<void>(
    () => markAllNotificationsRead(),
    () => true,
  );
