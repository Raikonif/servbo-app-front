import { request } from "@/lib/auth/client";
import { AuthError } from "@/lib/auth/errors";
import type { Page } from "@/lib/catalog";

export type OrderStatus = "pending_payment" | "confirmed" | "cancelled";
export type PaymentMethod = "qr" | "cash";
export type DeliveryMethod = "delivery" | "pickup";

export type OrderSummary = {
  id: string;
  code: string; // "OR-000123"
  status: OrderStatus;
  seller: { id: string; name: string };
  buyer: { id: string; name: string };
  currency: string;
  total: string;
  units: number;
  payment_method: PaymentMethod;
  delivery_method: DeliveryMethod;
  has_receipt: boolean;
  created_at: string;
};

export type OrderDetail = OrderSummary & {
  items: {
    product: string | null;
    product_name: string;
    unit_price: string;
    quantity: number;
    subtotal: string;
  }[];
  payment_qr_url: string | null; // only while a QR order awaits payment
  receipt_url: string | null;
  recipient_name: string;
  phone: string;
  address: string;
  reference: string;
  pickup_address: string;
  pickup_notes: string;
  buyer_note: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancelled_by: "buyer" | "seller" | "";
  cancel_reason: string;
  updated_at: string;
};

export type DeliveryDetails = {
  recipient_name: string;
  phone: string;
  address: string;
  reference: string;
};

export type CheckoutGroup = DeliveryDetails & {
  seller: string;
  payment_method: PaymentMethod;
  delivery_method: DeliveryMethod;
  note: string;
  items: { product: string; unit_price: string }[];
};

// 409: stock or price changed; nothing was created.
export type CheckoutProblem = {
  product: string;
  name: string;
  code: "unavailable" | "over_stock" | "price_changed";
  message: string;
  stock?: number;
  price?: string;
};

// 400: a choice is not possible, per seller and field.
export type CheckoutFieldErrors = Record<string, Record<string, string[]>>;

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly problems: CheckoutProblem[] = [],
    readonly fieldErrors: CheckoutFieldErrors = {},
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

export const orderKeys = {
  all: ["orders"] as const,
  list: (page: number) => ["orders", "list", page] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
  lastDelivery: ["orders", "last-delivery"] as const,
};

export async function placeOrders(groups: CheckoutGroup[]) {
  try {
    const data = await request<{ orders: OrderSummary[] }>("/api/checkout/", {
      method: "POST",
      body: { groups },
      raw: true,
    });
    return data?.orders ?? [];
  } catch (error) {
    if (!(error instanceof AuthError)) throw error;
    const payload = (error.payload ?? {}) as {
      problems?: CheckoutProblem[];
      groups?: CheckoutFieldErrors | string[];
    };
    if (error.status === 409 && payload.problems) {
      throw new CheckoutError(
        "Some items changed since you opened checkout.",
        payload.problems,
      );
    }
    if (error.status === 400 && payload.groups) {
      const groups = payload.groups;
      throw Array.isArray(groups)
        ? new CheckoutError(groups[0] ?? error.message)
        : new CheckoutError("Check the highlighted fields.", [], groups);
    }
    throw error;
  }
}

export const getOrders = async (page = 1) =>
  (await request<Page<OrderSummary>>(`/api/orders/?page=${page}`, {
    raw: true,
  })) ?? { count: 0, next: null, previous: null, results: [] };

export const getOrder = (id: string) =>
  request<OrderDetail>(`/api/orders/${encodeURIComponent(id)}/`, {
    raw: true,
  });

export const getLastDelivery = () =>
  request<DeliveryDetails | null>("/api/orders/last-delivery/", { raw: true });

export const uploadReceipt = (id: string, file: File) => {
  const body = new FormData();
  body.append("receipt", file);
  return request<OrderDetail>(
    `/api/orders/${encodeURIComponent(id)}/receipt/`,
    { method: "POST", body, raw: true },
  );
};

export const cancelOrder = (id: string) =>
  request<OrderDetail>(`/api/orders/${encodeURIComponent(id)}/cancel/`, {
    method: "POST",
    body: {},
    raw: true,
  });

export const orderHref = (id: string) => `/orders/${encodeURIComponent(id)}`;

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  qr: "QR to the seller",
  cash: "Cash",
};

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  delivery: "Delivery",
  pickup: "Pickup",
};
