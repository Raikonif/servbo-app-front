import { request } from "@/lib/auth/client";

// Server-side cart (openspec cart-and-checkout). Always read live from the
// API: prices and stock are current, problems are flagged per item.

export type CartItem = {
  product: string;
  name: string;
  image: string | null;
  unit_price: string; // decimal string
  currency: string;
  quantity: number;
  stock: number;
  subtotal: string;
  unavailable: boolean; // deleted, sold out or seller lapsed
  over_stock: boolean; // quantity > stock
};

export type Pickup = { address: string; notes: string };

export type CartGroup = {
  seller: { id: string; name: string };
  accepts_qr: boolean;
  pickup: Pickup | null;
  items: CartItem[];
  subtotals: { currency: string; amount: string }[];
  can_checkout: boolean;
};

export type Cart = { groups: CartGroup[]; total_units: number };

export const EMPTY_CART: Cart = { groups: [], total_units: 0 };

export const cartKeys = { cart: ["cart"] as const };

const cartRequest = async (
  path: string,
  init: { method?: string; body?: unknown } = {},
) => (await request<Cart>(path, { ...init, raw: true })) ?? EMPTY_CART;

export const getCart = () => cartRequest("/api/cart/");

export const addToCart = (product: string, quantity: number) =>
  cartRequest("/api/cart/items/", {
    method: "POST",
    body: { product, quantity },
  });

export const setCartQuantity = (product: string, quantity: number) =>
  cartRequest(`/api/cart/items/${encodeURIComponent(product)}/`, {
    method: "PATCH",
    body: { quantity },
  });

export const removeFromCart = (product: string) =>
  cartRequest(`/api/cart/items/${encodeURIComponent(product)}/`, {
    method: "DELETE",
  });

export const cartHref = "/cart";
