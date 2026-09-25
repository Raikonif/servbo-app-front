import { request } from "@/lib/auth/client";

export const CREATOR_URL =
  process.env.NEXT_PUBLIC_CREATOR_URL ?? "http://localhost:5178";

export type SellerPlan = {
  id: string;
  name: string;
  description: string;
  price_amount: number;
  currency: string;
  interval: string;
  payment_instructions: string;
};

export type SellerSubscription = {
  id: string;
  name: string;
  status: "incomplete" | "active" | "canceled" | "past_due" | string;
  price_amount: number;
  currency: string;
  interval: string;
  current_period_start: string | null;
  current_period_end: string | null;
};

export type PendingPayment = {
  id: string;
  amount_due: number;
  currency: string;
  reference: string;
  qr_image_url: string | null;
  payment_instructions: string;
  created_at: string;
};

export type SellerSubscriptionState = {
  is_seller: boolean;
  subscription: SellerSubscription | null;
  pending_payment: PendingPayment | null;
};

export type BillingRecord = {
  id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  payment_method: string;
  status: string;
  bank_transfer_reference: string | null;
  paid_at: string | null;
  created_at: string;
};

export const billingKeys = {
  sellerPlan: ["billing", "seller-plan"] as const,
  sellerSubscription: ["billing", "seller-subscription"] as const,
  records: ["billing", "records"] as const,
};

// Null when the admin hasn't configured a plan yet (404 NO_PLAN).
export const getSellerPlan = async (): Promise<SellerPlan | null> => {
  try {
    return await request<SellerPlan>("/api/billing/seller-plan/");
  } catch (error) {
    if ((error as { code?: string }).code === "NO_PLAN") return null;
    throw error;
  }
};

const EMPTY_STATE: SellerSubscriptionState = {
  is_seller: false,
  subscription: null,
  pending_payment: null,
};

export const getSellerSubscription = async () =>
  (await request<SellerSubscriptionState>(
    "/api/billing/seller-subscription/",
  )) ?? EMPTY_STATE;

// Creates (or returns the existing) pending QR payment: first upgrade or renewal.
export const startSellerPayment = async () =>
  (await request<SellerSubscriptionState>("/api/billing/seller-subscription/", {
    method: "POST",
  })) ?? EMPTY_STATE;

type ListPayload<T> =
  | T[]
  | { results?: T[]; data?: T[] | { results?: T[] } | null };

// DRF paginated list; tolerate a plain array or the {data} envelope too.
export const getBillingRecords = async (): Promise<BillingRecord[]> => {
  const payload = await request<ListPayload<BillingRecord>>(
    "/api/billing/records/",
    { raw: true },
  );
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  const data = payload.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

export const formatMoney = (minor: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(2)} ${currency}`;
  }
};

export const formatDate = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(value))
    : "—";
