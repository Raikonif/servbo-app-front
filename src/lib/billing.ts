import { request } from "@/lib/auth/client";

export const CREATOR_URL =
  process.env.NEXT_PUBLIC_CREATOR_URL ?? "http://localhost:5178";

export type PlanInterval = "month" | "quarter" | "year";

export type SellerPlan = {
  id: string;
  name: string;
  description: string;
  price_amount: number;
  currency: string;
  interval: PlanInterval | string;
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
  // Received so far: relay payments can arrive in parts (amount_paid < amount_due).
  amount_paid: number;
  // "manual_qr" | "cucu" | "relay_qr"
  provider: string;
  currency: string;
  reference: string;
  // An https URL or a `data:image/png;base64,…` URI (provider-generated QR).
  qr_image_url: string | null;
  payment_instructions: string;
  created_at: string;
  plan: { id: string; name: string; interval: PlanInterval | string } | null;
  // Null for the manual QR, which never expires.
  expires_at: string | null;
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
  sellerPlans: ["billing", "seller-plans"] as const,
  sellerSubscription: ["billing", "seller-subscription"] as const,
  records: ["billing", "records"] as const,
};

// Active plans ordered month, quarter, year; empty until an admin adds one.
export const getSellerPlans = async (): Promise<SellerPlan[]> =>
  (await request<SellerPlan[]>("/api/billing/seller-plans/")) ?? [];

const EMPTY_STATE: SellerSubscriptionState = {
  is_seller: false,
  subscription: null,
  pending_payment: null,
};

export const getSellerSubscription = async () =>
  (await request<SellerSubscriptionState>(
    "/api/billing/seller-subscription/",
  )) ?? EMPTY_STATE;

// Creates the pending QR payment for a plan (first upgrade or renewal). The
// same plan with an unexpired QR returns that one; another plan, or an expired
// QR, cancels it and makes a new one. Errors: INVALID_PLAN, PAYMENT_PROVIDER_ERROR,
// NO_QR_AVAILABLE (relay: every pooled QR is busy, retry in a few minutes).
export const startSellerPayment = async (planId: string) =>
  (await request<SellerSubscriptionState>("/api/billing/seller-subscription/", {
    method: "POST",
    body: { plan_id: planId },
  })) ?? EMPTY_STATE;

const INTERVAL_MONTHS: Record<string, number> = {
  month: 1,
  quarter: 3,
  year: 12,
};

export const INTERVAL_LABELS: Record<
  string,
  { period: string; adverb: string }
> = {
  month: { period: "month", adverb: "Monthly" },
  quarter: { period: "3 months", adverb: "Quarterly" },
  year: { period: "year", adverb: "Yearly" },
};

export const isExpired = (expiresAt: string | null, now = Date.now()) =>
  expiresAt !== null && new Date(expiresAt).getTime() <= now;

export const intervalMonths = (interval: string) =>
  INTERVAL_MONTHS[interval] ?? 1;

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

// Bolivianos read as "Bs 13" / "Bs 4.33"; Intl would print "BOB 13.00".
export const formatMoney = (minor: number, currency: string) => {
  if (currency.toUpperCase() === "BOB") {
    const whole = Number.isInteger(minor / 100);
    return `Bs ${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(minor / 100)}`;
  }
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
