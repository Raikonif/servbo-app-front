import { request, type SessionUser } from "@/lib/auth/client";
import { type CatalogQuery, toApiParams } from "@/lib/catalog-query";

// Server components fetch public catalog data straight from the API:
// BACKEND_URL is the in-network address (e.g. backend:8000 in containers).
const SERVER_API_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8008";

export type Category = { id: number; name: string };

export type ProductImage = {
  id: string;
  url: string;
  position: number; // upload order
  is_main: boolean;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  currency: string;
  categories: Category[]; // the API returns full objects under `categories`
  description: string;
  price: string; // decimal string, e.g. "12.50"
  stock: number;
  seller: string;
  seller_name?: string;
  images: ProductImage[]; // upload order; exactly one is_main when non-empty
  main_image: string | null;
  created_at: string; // ISO 8601
  updated_at: string;
};

export type Seller = {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string;
  product_count: number;
  joined?: string;
};

export type Page<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export const catalogKeys = {
  favoriteIds: ["catalog", "favorite-ids"] as const,
  seller: (id: string) => ["catalog", "seller", id] as const,
  sellerProducts: (id: string, page: number) =>
    ["catalog", "seller-products", id, page] as const,
};

// DRF paginated list; tolerate a plain array (unpaginated endpoints).
const toPage = <T>(payload: T[] | Page<T> | null): Page<T> => {
  if (!payload) return { count: 0, next: null, previous: null, results: [] };
  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      next: null,
      previous: null,
      results: payload,
    };
  }
  return { ...payload, results: payload.results ?? [] };
};

// ---------- Server (public data) ----------

// Storefront data cache (openspec product-images-and-showcase D13): public
// reads are cached and tagged; the API revalidates the tags the moment a
// product changes (POST /api/revalidate), and REVALIDATE_SECONDS bounds
// staleness if that notification is ever lost. Only 200s are cached, so a
// 404 is never remembered.
const REVALIDATE_SECONDS = 300;

export const cacheTags = {
  products: "products",
  categories: "categories",
  product: (id: string) => `product:${id}`,
  seller: (id: string) => `seller:${id}`,
};

// Null on 404; any other failure throws so the page can show an error state.
async function serverGet<T>(path: string, tags: string[]): Promise<T | null> {
  const response = await fetch(new URL(path, SERVER_API_URL), {
    headers: { Accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS, tags },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return (await response.json()) as T;
}

// Search, filters, sort and page come from the address (catalog-query.ts);
// the API does the filtering. Each combination is its own cached fetch, all
// under the `products` tag, so a product change refreshes every one.
export async function getProducts(query: CatalogQuery): Promise<Page<Product>> {
  const params = toApiParams(query);
  return toPage(
    await serverGet<Page<Product> | Product[]>(
      `/api/products/${params.size ? `?${params}` : ""}`,
      [cacheTags.products],
    ),
  );
}

export const getProduct = (id: string) =>
  serverGet<Product>(`/api/products/${encodeURIComponent(id)}/`, [
    cacheTags.products,
    cacheTags.product(id),
  ]);

// Categories are paginated (20 per page); follow `next` for the full list.
export async function getCategories(): Promise<Category[]> {
  const categories: Category[] = [];
  let path: string | null = "/api/categories/";
  for (let i = 0; path && i < 10; i++) {
    const data: Page<Category> = toPage(
      await serverGet<Page<Category> | Category[]>(path, [
        cacheTags.categories,
      ]),
    );
    categories.push(...data.results);
    path = data.next
      ? new URL(data.next).pathname + new URL(data.next).search
      : null;
  }
  return categories;
}

// Product counts change with products, so the directory shares that tag.
export const getSellers = async () =>
  (await serverGet<Seller[]>("/api/sellers/", [cacheTags.products])) ?? [];

// ---------- Browser (signed-in data, cookies + CSRF) ----------

export const getSeller = async (id: string) =>
  request<Seller>(`/api/sellers/${encodeURIComponent(id)}/`, { raw: true });

export const getSellerProducts = async (sellerId: string, page = 1) =>
  toPage(
    await request<Page<Product> | Product[]>(
      `/api/products/get-seller-products/?${new URLSearchParams({
        seller_id: sellerId,
        page: String(page),
      })}`,
      { raw: true },
    ),
  );

// Favorites stay out of the cached, public catalog payload: one small
// personal request marks every card (design D5).
export const getFavoriteIds = async () =>
  (
    await request<{ product_ids: string[] }>("/api/favorites/product-ids/", {
      raw: true,
    })
  )?.product_ids ?? [];

export const addFavorite = (productId: string) =>
  request("/api/favorites/", {
    method: "POST",
    body: { product: productId },
    raw: true,
  });

export const removeFavorite = (productId: string) =>
  request(`/api/favorites/by-product/${encodeURIComponent(productId)}/`, {
    method: "DELETE",
    raw: true,
  });

export const updateProfile = (
  userId: string,
  body: { username: string; first_name: string; last_name: string },
) =>
  request<SessionUser>(`/api/users/${encodeURIComponent(userId)}/`, {
    method: "PUT",
    body,
  });

// ---------- Formatting ----------

export const formatPrice = (price: string, currency: string) => {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return `${price} ${currency}`;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

// Fixed locale and UTC: identical on server and client, so timestamps are in
// the cached HTML and never cause a hydration mismatch (design D12).
const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});
// dateStyle/timeStyle cannot be combined with timeZoneName.
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
export const formatDateTime = (iso: string) =>
  dateTimeFormat.format(new Date(iso));

// "Modified" only when the product changed after upload, not the same save.
export const wasModified = (
  product: Pick<Product, "created_at" | "updated_at">,
) =>
  new Date(product.updated_at).getTime() -
    new Date(product.created_at).getTime() >
  60_000;

// View-transition names shared by a card and the product detail, so the
// browser morphs one into the other (timing lives in globals.css, design D8).
export const productTransitionName = (part: "surface" | "image", id: string) =>
  `product-${part}-${id}`;

export const productHref = (productId: string) =>
  `/products/${encodeURIComponent(productId)}`;

export const sellerHref = (sellerId: string) =>
  `/sellers/${encodeURIComponent(sellerId)}`;
