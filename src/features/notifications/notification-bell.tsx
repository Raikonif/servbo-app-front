"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { useNow } from "@/hooks/use-now";
import { formatDate } from "@/lib/catalog";
import { type NotificationItem, notificationPath } from "@/lib/notifications";
import { orderKeys } from "@/lib/orders";

// Header bell with the unread count and a panel of the latest buyer
// notifications (openspec order-fulfillment D6). Signed-in users only.
export function NotificationBell() {
  const { signedIn, notifications, unread, isPending, isError } =
    useNotifications();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const headingId = useId();

  // Escape closes and gives focus back to the bell; a click or focus
  // outside closes. Opening moves focus into the panel.
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const onOutside = (event: Event) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("focusin", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("focusin", onOutside);
    };
  }, [open]);

  if (!signedIn) return null;

  const openItem = (item: NotificationItem) => {
    setOpen(false);
    if (!item.read_at) markOne.mutate(item.id);
    // The order changed since it was cached: show it fresh.
    void queryClient.invalidateQueries({ queryKey: orderKeys.all });
  };

  return (
    <div className="relative" ref={root}>
      <button
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        aria-label={
          unread ? `Notifications, ${unread} unread` : "Notifications"
        }
        className="relative inline-flex size-10 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg aria-expanded:bg-surface-2 aria-expanded:text-fg"
        onClick={() => setOpen((value) => !value)}
        ref={button}
        type="button"
      >
        <Bell size={19} />
        {unread ? (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-semibold text-white tabular-nums"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        // Phones: full width under the header; larger screens: anchored to
        // the bell.
        <div
          aria-labelledby={headingId}
          className="fixed inset-x-4 top-16 z-40 flex max-h-[calc(100dvh-5rem)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-lg)] outline-none sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96"
          id={panelId}
          ref={panel}
          role="dialog"
          tabIndex={-1}
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold" id={headingId}>
              Notifications
            </h2>
            {unread ? (
              <button
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-accent-text transition hover:bg-surface-2 disabled:opacity-60"
                disabled={markAll.isPending}
                onClick={() => {
                  markAll.mutate();
                  // The button disappears; keep focus inside the panel.
                  panel.current?.focus();
                }}
                type="button"
              >
                <CheckCheck size={14} /> Mark all as read
              </button>
            ) : null}
          </div>

          {isPending ? (
            <div className="m-4 h-24 animate-pulse rounded-xl bg-surface-2" />
          ) : isError && !notifications.length ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Could not load notifications.
            </p>
          ) : !notifications.length ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto mb-2 text-subtle" size={22} />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="mt-1 text-xs text-muted">
                Order updates from sellers show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line overflow-y-auto overscroll-contain">
              {notifications.map((item) => (
                <li key={item.id}>
                  <Link
                    className={`flex gap-3 px-4 py-3 transition hover:bg-surface-2/60 focus-visible:bg-surface-2/60 focus-visible:outline-none ${
                      item.read_at ? "" : "bg-accent-soft/30"
                    }`}
                    href={notificationPath(item)}
                    onClick={() => openItem(item)}
                  >
                    <span
                      aria-hidden
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        item.read_at ? "bg-transparent" : "bg-accent"
                      }`}
                    />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="flex items-baseline justify-between gap-3">
                        <span
                          className={
                            item.read_at ? "font-medium" : "font-semibold"
                          }
                        >
                          {item.title}
                        </span>
                        <When iso={item.created_at} />
                      </span>
                      {item.body ? (
                        <span className="mt-0.5 line-clamp-2 block text-muted">
                          {item.body}
                        </span>
                      ) : null}
                      {item.read_at ? null : (
                        <span className="sr-only"> (unread)</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

// "now", "5 min", "3 h", "2 d", then the date.
function When({ iso }: { iso: string }) {
  const now = useNow(60_000);
  const at = new Date(iso).getTime();
  const minutes = now === null ? null : Math.floor((now - at) / 60_000);
  const label =
    minutes === null || minutes >= 7 * 1440
      ? formatDate(iso)
      : minutes < 1
        ? "now"
        : minutes < 60
          ? `${minutes} min`
          : minutes < 1440
            ? `${Math.floor(minutes / 60)} h`
            : `${Math.floor(minutes / 1440)} d`;
  return (
    <time className="shrink-0 text-xs text-muted tabular-nums" dateTime={iso}>
      {label}
    </time>
  );
}
