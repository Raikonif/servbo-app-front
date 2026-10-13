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
  order_code: string | null;
  // Seller-access notices (e.g. "credits_added", "subscription_expired") point here instead of an order.
  subscription: string | null;
  link: string | null; // absolute: `${FRONTEND_URL}/orders/<id>` or `/become-a-vendor`
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

// Seller-access notices without a usable link (credits added, access
// renewed or ended…) open the credits page.
const ACCESS_KINDS = new Set([
  "credits_added",
  "access_renewed",
  "subscription_paid",
  "subscription_ending",
  "subscription_expired",
]);

// The API links to the storefront by absolute URL; navigate by its path so
// the router stays client-side. Creator-app links (/dashboard/…) stay
// absolute. Falls back to /become-a-vendor for access notices, else orders.
export const notificationPath = (notification: NotificationItem) => {
  try {
    const url = new URL(notification.link ?? "");
    if (url.pathname.startsWith("/dashboard")) return url.href;
    return `${url.pathname}${url.search}`;
  } catch {
    if (notification.subscription || ACCESS_KINDS.has(notification.kind)) {
      return "/become-a-vendor";
    }
    return notification.order
      ? `/orders/${encodeURIComponent(notification.order)}`
      : "/orders";
  }
};
