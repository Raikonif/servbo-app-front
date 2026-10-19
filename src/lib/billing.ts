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

// Credit prices, editable by staff (openspec seller-free-credits): every
// seller gets `free_credits` every `period_days` days (they reset, no carry
// over); publishing a product costs `publish_cost`, saving changes to a
// published product costs `edit_cost`, drafts are free.
export type CreditPricing = {
  free_credits: number;
  period_days: number;
  publish_cost: number;
  edit_cost: number;
};

// Free credits are spent first; paid credits (packs, bonus codes) never
// expire. `free_resets_at` is null for a user who is not a seller.
export type SellerCredits = {
  free: number;
  free_resets_at: string | null;
  paid: number;
  total: number;
};

export type PromotionKind = "bonus_credits" | "percent_off" | "amount_off";

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
  credits: SellerCredits;
  pricing: CreditPricing | null;
  products: { published: number; drafts: number };
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
  | "free_grant"
  | "free_reset"
  | "publish"
  | "edit"
  | "adjustment"
  // Legacy: seller access paid with credits before seller-free-credits.
  | "monthly_fee"
  | "product_slots";

// One line of the credit ledger: + for credits in, − for credits spent
// (kind labels: messages `credits.kind.*`).
// `amount` is the signed total, `free_amount` the part of it from or to the
// free credits; `balance_after` is the paid balance after the entry.
export type CreditEntry = {
  id: string;
  amount: number;
  free_amount: number;
  kind: CreditEntryKind | string;
  balance_after: number;
  free_balance_after: number;
  description: string;
  product: string | null;
  product_name: string | null;
  record: string | null;
  created_at: string;
};

// What a code does for the signed-in user (openspec subscription-promotions):
// a bonus code adds paid credits (claimed with redeemPromotion), a discount
// lowers the pack prices (sent along with the pack payment).
export type PromotionCheck = {
  code: string;
  kind: PromotionKind | string;
  name?: string;
  bonus_credits?: number | null;
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
  credits: { free: 0, free_resets_at: null, paid: 0, total: 0 },
  pricing: null,
  products: { published: 0, drafts: 0 },
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
// INVALID_PACK, PROMO_* (a bonus code is PROMO_INVALID here: redeem it),
// NO_QR_AVAILABLE (relay pool busy), PAYMENT_PROVIDER_ERROR, THROTTLED.
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

// Becomes a seller for free, with the free credits. Error: ALREADY_ACTIVE.
export const activateSeller = async () =>
  (await request<SellerSubscriptionState>(`${SUBSCRIPTION_PATH}activate/`, {
    method: "POST",
  })) ?? EMPTY_STATE;

// Claims a bonus-credits code: paid credits at once, no pack or QR. Errors:
// PROMO_INVALID, PROMO_EXHAUSTED, PROMO_ALREADY_USED, PROMO_NOT_ELIGIBLE,
// THROTTLED.
export const redeemPromotion = async (code: string) =>
  (await request<SellerSubscriptionState>("/api/billing/promotions/redeem/", {
    method: "POST",
    body: { code: code.trim() },
  })) ?? EMPTY_STATE;

// Nothing is used; errors are PROMO_* codes, THROTTLED after too many tries.
export const checkPromotion = async (code: string) =>
  request<PromotionCheck>("/api/billing/promotions/check/", {
    method: "POST",
    body: { code: code.trim() },
  });

export const isExpired = (expiresAt: string | null, now = Date.now()) =>
  expiresAt !== null && new Date(expiresAt).getTime() <= now;

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
