import { request, type SessionUser } from "@/lib/auth/client";

// Server components fetch public catalog data straight from the API:
// BACKEND_URL is the in-network address (e.g. backend:8000 in containers).
const SERVER_API_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8008";

export type Category = { id: number; name: string };

export type Product = {
  id: string;
  name: string;
  brand: string;
  currency: string;
  categories_detail: Category[];
  description: string;
  price: string; // decimal string, e.g. "12.50"
  stock: number;
  seller: string;
  seller_name?: string;
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

// Null on 404; any other failure throws so the page can show an error state.
async function serverGet<T>(path: string): Promise<T | null> {
  const response = await fetch(new URL(path, SERVER_API_URL), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return (await response.json()) as T;
}

export async function getProducts({
  page = 1,
  category,
}: {
  page?: number;
  category?: number;
} = {}): Promise<Page<Product>> {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  // The API ignores this filter today; results are also filtered below.
  if (category) params.set("categories", String(category));
  const query = params.size ? `?${params}` : "";
  const data = toPage(
    await serverGet<Page<Product> | Product[]>(`/api/products/${query}`),
  );
  if (!category) return data;
  const results = data.results.filter((product) =>
    product.categories_detail?.some((c) => c.id === category),
  );
  // Unpaginated response: the filtered list is the whole catalog.
  return data.next || data.previous
    ? { ...data, results }
    : { ...data, count: results.length, results };
}

export const getProduct = (id: string) =>
  serverGet<Product>(`/api/products/${encodeURIComponent(id)}/`);

// Categories are paginated (20 per page); follow `next` for the full list.
export async function getCategories(): Promise<Category[]> {
  const categories: Category[] = [];
  let path: string | null = "/api/categories/";
  for (let i = 0; path && i < 10; i++) {
    const data: Page<Category> = toPage(
      await serverGet<Page<Category> | Category[]>(path),
    );
    categories.push(...data.results);
    path = data.next
      ? new URL(data.next).pathname + new URL(data.next).search
      : null;
  }
  return categories;
}

export const getSellers = async () =>
  (await serverGet<Seller[]>("/api/sellers/")) ?? [];

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

export const sellerHref = (sellerId: string) =>
  `/sellers/${encodeURIComponent(sellerId)}`;
