import type { Product, ProductStatus, Seller } from "@/domain/store";

export const queryKeys = {
  products: ["products"] as const,
  sellers: ["sellers"] as const,
  seller: (id: string) => ["seller", id] as const,
  product: (id: string) => ["product", id] as const,
};

const API_BASE = process.env.BACKEND_URL ?? "http://localhost:8000";

type PaginatedResponse<T> = {
  results?: T[];
  data?: T[];
};

// API response types (based on backend-data.ts ApiProduct shape)
type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  currency?: string;
  categories?: Array<ApiProductCategory | number | string>;
  categories_detail?: Array<{ id: number; name: string }>;
  description: string;
  price: string | number;
  stock?: number;
  inventory?: number;
  seller: string;
  sellerId?: string;
  status?: string;
  tags?: string[];
};

type ApiProductCategory = { id: number; name: string } | number | string;

type ApiSeller = {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_seller?: boolean;
};

function readList<T>(payload: T[] | PaginatedResponse<T>): T[] {
  if (Array.isArray(payload)) return payload;
  if ("results" in payload && Array.isArray(payload.results)) return payload.results;
  if ("data" in payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function normalizeProduct(p: ApiProduct): Product {
  // Determine status from the status field or default to "active"
  let status: ProductStatus = "active";
  if (p.status === "draft") status = "draft";
  else if (p.status === "archived") status = "archived";

  // Handle price - API returns as string (e.g., "42000" for $420.00 in cents) or number
  let price: number;
  if (typeof p.price === "string") {
    price = Number(p.price);
  } else {
    price = p.price;
  }

  // If price looks like cents (large number), convert to dollars
  if (price > 100000) {
    price = price / 100;
  }

  // Get category from categories_detail or categories
  let category = "Uncategorized";
  if (p.categories_detail && p.categories_detail.length > 0) {
    category = p.categories_detail[0].name;
  } else if (Array.isArray(p.categories) && p.categories.length > 0) {
    const first = p.categories[0];
    if (typeof first === "object" && first !== null && "name" in first) {
      category = first.name;
    } else {
      category = String(first);
    }
  }

  // seller field is the seller UUID
  const sellerId = p.sellerId ?? p.seller ?? "";

  return {
    id: p.id,
    name: p.name,
    slug: p.slug ?? p.id,
    category,
    price,
    inventory: p.inventory ?? p.stock ?? 0,
    status,
    sellerId,
    description: p.description,
    tags: p.tags ?? [],
  };
}

function normalizeSeller(s: ApiSeller): Seller {
  const fullName = ([s.first_name, s.last_name].filter(Boolean).join(" ") || s.username) ?? "Unknown Seller";
  return {
    id: s.id,
    name: fullName,
    email: "",
    location: "",
    rating: 0,
    responseTime: "N/A",
    verified: s.is_seller ?? false,
  };
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(new URL(path, API_BASE), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchProducts(): Promise<Product[]> {
  const data = await apiFetch<ApiProduct[] | PaginatedResponse<ApiProduct>>("/api/products/");
  return readList(data).map(normalizeProduct);
}

export async function fetchSellers(): Promise<Seller[]> {
  const data = await apiFetch<ApiSeller[] | PaginatedResponse<ApiSeller>>("/api/sellers/");
  return readList(data).map(normalizeSeller);
}
