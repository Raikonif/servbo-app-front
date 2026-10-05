import { request } from "@/lib/auth/client";
import type { Page } from "@/lib/catalog";

// In-app notifications (openspec order-notifications). The storefront only
// ever asks for the buyer audience; seller events live in the creator app.
const AUDIENCE = "buyer";

export type NotificationItem = {
  id: string;
  kind: string; // event name, e.g. "order_shipped"
  audience: "buyer" | "seller";
  title: string;
  body: string;
  order: string | null;
  order_code: string;
  link: string; // absolute: `${FRONTEND_URL}/orders/<id>` for buyers
  read_at: string | null;
  created_at: string;
};

export type NotificationPage = Page<NotificationItem> & { unread: number };

const EMPTY_PAGE: NotificationPage = {
  count: 0,
  next: null,
  previous: null,
  results: [],
  unread: 0,
};

export const notificationKeys = {
  all: ["notifications"] as const,
  list: ["notifications", AUDIENCE, 1] as const,
};

export const getNotifications = async (page = 1) =>
  (await request<NotificationPage>(
    `/api/notifications/?audience=${AUDIENCE}&page=${page}`,
    { raw: true },
  )) ?? EMPTY_PAGE;

type ReadResult = { updated: number; unread: number };

export const markNotificationsRead = (ids: string[]) =>
  request<ReadResult>("/api/notifications/read/", {
    method: "POST",
    body: { ids },
    raw: true,
  });

export const markAllNotificationsRead = () =>
  request<ReadResult>("/api/notifications/read/", {
    method: "POST",
    body: { all: true, audience: AUDIENCE },
    raw: true,
  });

// The API links to the storefront by absolute URL; navigate by its path so
// the router stays client-side. Falls back to the order page.
export const notificationPath = (notification: NotificationItem) => {
  try {
    const url = new URL(notification.link);
    return `${url.pathname}${url.search}`;
  } catch {
    return notification.order
      ? `/orders/${encodeURIComponent(notification.order)}`
      : "/orders";
  }
};
