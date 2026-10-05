import { request } from "@/lib/auth/client";
import type { Page } from "@/lib/catalog";

// Verified reviews (openspec verified-reviews). Only a delivered order can be
// reviewed: each product once and its seller once. Averages travel on the
// cached product / seller payloads; the lists are read here, in the browser,
// because they carry personal flags (can_edit) and change more often.

export type ReviewKind = "product" | "seller";

export type Review = {
  id: string;
  kind: ReviewKind;
  rating: number; // 1–5
  comment: string;
  author: { id: string; name: string };
  product: { id: string | null; name: string } | null; // null for seller reviews
  order?: string; // only for the author or the reviewed seller
  created_at: string;
  updated_at: string;
  editable_until: string; // created_at + 30 days
  can_edit: boolean; // the signed-in author, within the window
  reply: string; // "" when the seller has not answered
  replied_at: string | null;
  hidden: boolean; // hidden by staff; only ever reaches its author
};

// GET /api/orders/<id>/reviews/: what the buyer can still rate in a
// delivered order, and what they already wrote for it.
export type OrderReviews = {
  products: { product: string; name: string }[];
  seller: boolean;
  reviews: Review[];
};

export const MAX_COMMENT = 1000;
export const MAX_REPORT_REASON = 500;

export const reviewKeys = {
  all: ["reviews"] as const,
  product: (id: string) => ["reviews", "product", id] as const,
  seller: (id: string) => ["reviews", "seller", id] as const,
  order: (id: string) => ["reviews", "order", id] as const,
};

const EMPTY_PAGE: Page<Review> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

// Public, newest first, 20 per page.
export const getProductReviews = async (productId: string, page = 1) =>
  (await request<Page<Review>>(
    `/api/products/${encodeURIComponent(productId)}/reviews/?page=${page}`,
    { raw: true },
  )) ?? EMPTY_PAGE;

export const getSellerReviews = async (sellerId: string, page = 1) =>
  (await request<Page<Review>>(
    `/api/sellers/${encodeURIComponent(sellerId)}/reviews/?page=${page}`,
    { raw: true },
  )) ?? EMPTY_PAGE;

export const getOrderReviews = async (orderId: string) =>
  (await request<OrderReviews>(
    `/api/orders/${encodeURIComponent(orderId)}/reviews/`,
    { raw: true },
  )) ?? { products: [], seller: false, reviews: [] };

export type NewReview = {
  order: string;
  kind: ReviewKind;
  product?: string; // required for kind "product"
  rating: number;
  comment: string;
};

export const createReview = (body: NewReview) =>
  request<Review>("/api/reviews/", { method: "POST", body, raw: true });

export const updateReview = (
  id: string,
  body: { rating?: number; comment?: string },
) =>
  request<Review>(`/api/reviews/${encodeURIComponent(id)}/`, {
    method: "PATCH",
    body,
    raw: true,
  });

export const deleteReview = (id: string) =>
  request(`/api/reviews/${encodeURIComponent(id)}/`, {
    method: "DELETE",
    raw: true,
  });

// Once per user and review; never the author's own.
export const reportReview = (id: string, reason: string) =>
  request<{ detail: string }>(
    `/api/reviews/${encodeURIComponent(id)}/report/`,
    { method: "POST", body: { reason }, raw: true },
  );

// "4.5" → 4.5; null/garbage → null.
export const ratingNumber = (avg: string | null | undefined) => {
  if (avg === null || avg === undefined) return null;
  const value = Number(avg);
  return Number.isFinite(value) ? value : null;
};

export const reviewCountLabel = (count: number) =>
  `${count} ${count === 1 ? "review" : "reviews"}`;
