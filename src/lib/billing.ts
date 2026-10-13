import { request } from "@/lib/auth/client";
import type { Page } from "@/lib/catalog";

export const CREATOR_URL =
  process.env.NEXT_PUBLIC_CREATOR_URL ?? "http://localhost:5178";

// A credit pack (openspec seller-credits): bought by QR, credits never expire.
export type CreditPack = {
  id: string;
  name: string;
  description: string;
  credits: number;
  price_amount: number;
  currency: string;
};

export type AccessMode = "monthly" | "per_product";

// Credit prices of seller access, editable in the admin.
export type CreditPricing = {
  monthly_fee: number; // credits for one period with unlimited products
  product_fee: number; // credits per product slot for one period
  period_days: number;
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
  // Set while the current period comes from a free-access code.
  promotion?: { code: string; free_until: string | null } | null;
  mode: AccessMode | string;
  // Null for the monthly mode (unlimited products).
  product_limit: number | null;
  auto_renew: boolean;
  next_mode: AccessMode | string;
  next_product_limit: number | null;
  // Credits the next renewal takes from the balance.
  renewal_cost: number;
};

export type PromotionKind = "free_access" | "percent_off" | "amount_off";

type PackRef = { id: string; name: string; credits: number };

export type PendingPayment = {
  id: string;
  amount_due: number;
  // The pack price before a discount code (equals amount_due without one).
  original_amount?: number;
  promotion?: { code: string; kind: PromotionKind | string } | null;
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
  // Null only for legacy plan payments.
  pack: PackRef | null;
  credits: number | null;
  // Null for the manual QR, which never expires.
  expires_at: string | null;
};

// The newest confirmed pack payment: the payment step's "credits added".
export type LastPurchase = {
  id: string;
  pack: PackRef | null;
  credits: number;
  amount_due: number;
  paid_at: string | null;
};

export type SellerSubscriptionState = {
  is_seller: boolean;
  wallet: { balance: number };
  pricing: CreditPricing | null;
  products_used: number;
  subscription: SellerSubscription | null;
  pending_payment: PendingPayment | null;
  last_purchase: LastPurchase | null;
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
  promotion_code?: string | null;
  original_amount?: number;
  pack_name?: string | null;
  credits?: number | null;
};

export type CreditEntryKind =
  | "purchase"
  | "promotion"
  | "monthly_fee"
  | "product_slots"
  | "adjustment";

// One line of the credit ledger: + for credits in, − for credits spent.
export type CreditEntry = {
  id: string;
  amount: number;
  kind: CreditEntryKind | string;
  balance_after: number;
  description: string;
  record: string | null;
  created_at: string;
};

export const CREDIT_ENTRY_LABELS: Record<string, string> = {
  purchase: "Pack purchase",
  promotion: "Promotion",
  monthly_fee: "Monthly access",
  product_slots: "Product slots",
  adjustment: "Adjustment",
};

// What a code does for the signed-in user (openspec subscription-promotions).
export type PromotionCheck = {
  code: string;
  kind: PromotionKind | string;
  name: string;
  free_until?: string | null;
  // Discounts: every active pack, with null when the code does not cover it.
  packs?: {
    id: string;
    price_amount: number;
    discounted_amount: number | null;
  }[];
};

export const billingKeys = {
  creditPacks: ["billing", "credit-packs"] as const,
  sellerSubscription: ["billing", "seller-subscription"] as const,
  records: ["billing", "records"] as const,
  creditEntries: ["billing", "credit-entries"] as const,
};

// Active packs, cheapest first; public (the pricing page lists them too).
export const getCreditPacks = async (): Promise<CreditPack[]> =>
  (await request<CreditPack[]>("/api/billing/credit-packs/")) ?? [];

const EMPTY_STATE: SellerSubscriptionState = {
  is_seller: false,
  wallet: { balance: 0 },
  pricing: null,
  products_used: 0,
  subscription: null,
  pending_payment: null,
  last_purchase: null,
};

const SUBSCRIPTION_PATH = "/api/billing/seller-subscription/";

export const getSellerSubscription = async () =>
  (await request<SellerSubscriptionState>(SUBSCRIPTION_PATH)) ?? EMPTY_STATE;

// Creates the pending QR payment for a pack. The same pack with an unexpired
// QR returns that one; another pack, or an expired QR, cancels it and makes a
// new one. A discount code lowers this one payment; a 100% code adds the
// credits at once (no pending payment, a new last_purchase). Errors:
// INVALID_PACK, PROMO_*, NO_QR_AVAILABLE (relay pool busy),
// PAYMENT_PROVIDER_ERROR, THROTTLED.
export const startPackPayment = async ({
  packId,
  promoCode,
}: {
  packId: string;
  promoCode?: string | null;
}) =>
  (await request<SellerSubscriptionState>(SUBSCRIPTION_PATH, {
    method: "POST",
    body: promoCode
      ? { pack_id: packId, promo_code: promoCode }
      : { pack_id: packId },
  })) ?? EMPTY_STATE;

// Cancels the open pack payment (its QR is released).
export const cancelPayment = async () =>
  (await request<SellerSubscriptionState>(`${SUBSCRIPTION_PATH}payment/`, {
    method: "DELETE",
  })) ?? EMPTY_STATE;

// Starts seller access now, paid from the balance. Errors:
// INSUFFICIENT_CREDITS, ALREADY_ACTIVE, INVALID_MODE, INVALID_SLOTS.
export const activateAccess = async ({
  mode,
  slots,
}: {
  mode: AccessMode;
  slots?: number;
}) =>
  (await request<SellerSubscriptionState>(`${SUBSCRIPTION_PATH}activate/`, {
    method: "POST",
    body: mode === "per_product" ? { mode, slots } : { mode },
  })) ?? EMPTY_STATE;

// A free-access code: seller access at once until its date, no pack or QR.
export const activatePromotion = async (code: string) =>
  (await request<SellerSubscriptionState>(SUBSCRIPTION_PATH, {
    method: "POST",
    body: { promo_code: code },
  })) ?? EMPTY_STATE;

// Nothing is used; errors are PROMO_* codes, THROTTLED after too many tries.
export const checkPromotion = async (code: string) =>
  request<PromotionCheck>("/api/billing/promotions/check/", {
    method: "POST",
    body: { code: code.trim() },
  });

export const isExpired = (expiresAt: string | null, now = Date.now()) =>
  expiresAt !== null && new Date(expiresAt).getTime() <= now;

// Seller access is running: active and its period has not ended yet.
export const isRunning = (
  subscription: SellerSubscription | null | undefined,
  now = Date.now(),
): subscription is SellerSubscription =>
  Boolean(
    subscription &&
      subscription.status === "active" &&
      subscription.current_period_end &&
      new Date(subscription.current_period_end).getTime() > now,
  );

// Credits for one period in a mode (per product: one slot each).
export const accessCost = (
  pricing: CreditPricing,
  mode: AccessMode,
  slots = 1,
) => (mode === "monthly" ? pricing.monthly_fee : pricing.product_fee * slots);

export const MAX_SLOTS = 100;

export const modeLabel = (mode: string, slots?: number | null) =>
  mode === "per_product"
    ? `Per product${slots ? ` · ${slots} ${slots === 1 ? "slot" : "slots"}` : ""}`
    : "Monthly";

export const plural = (count: number, one: string, many = `${one}s`) =>
  `${count.toLocaleString("en-US")} ${count === 1 ? one : many}`;

// What a pack buys at the current prices: "≈ 1 month" and "7 products".
export function packCoverage(credits: number, pricing: CreditPricing | null) {
  if (!pricing) return null;
  const months = Math.floor(credits / pricing.monthly_fee);
  const products = Math.floor(credits / pricing.product_fee);
  const parts = [];
  if (months > 0) parts.push(`≈ ${plural(months, "month")} unlimited`);
  if (products > 0) parts.push(`${plural(products, "product")} for a month`);
  return parts.join(" · or ") || null;
}

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

export const getCreditEntries = async (page = 1) =>
  (await request<Page<CreditEntry>>(
    `/api/billing/credit-entries/?page=${page}`,
    { raw: true },
  )) ?? { count: 0, next: null, previous: null, results: [] };

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
