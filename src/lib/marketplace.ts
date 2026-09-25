import { cache } from "react";
import type { Product } from "@/app/products";

// Server-side access to the public catalog, mapped to the marketplace card
// shape. Shared by the home page and the product detail route.
const API_BASE = process.env.BACKEND_URL ?? "http://localhost:8008";

type ApiProduct = {
  id: string;
  name: string;
  brand?: string;
  currency?: string;
  categories?: Array<{ id: number; name: string } | number | string>;
  categories_detail?: Array<{ id: number; name: string }>;
  description: string;
  price: string | number;
  stock?: number;
  seller: string;
};

const IMAGE_CLASSES = [
  "from-lime-200 via-lime-500 to-emerald-700",
  "from-white via-lime-400 to-slate-700",
  "from-lime-100 via-green-400 to-lime-700",
  "from-lime-300 via-emerald-500 to-slate-800",
  "from-lime-200 via-lime-400 to-slate-900",
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function categoryName(
  category: { id: number; name: string } | number | string,
): string {
  if (typeof category === "object" && category !== null && "name" in category) {
    return category.name;
  }
  return String(category);
}

export function mapToMarketplaceProduct(p: ApiProduct, index: number): Product {
  const categories = p.categories_detail?.length
    ? p.categories_detail
    : (p.categories?.map(categoryName) ?? []);

  const priceNum = typeof p.price === "string" ? Number(p.price) : p.price;
  const priceStr = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: p.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(priceNum);

  return {
    id: p.id,
    title: p.name,
    seller: p.seller, // seller UUID — Marketplace will show fallback profile
    category: categoryName(categories[0] ?? "Uncategorized"),
    price: priceStr,
    location: "",
    rating: 5,
    repliesIn: "Profile",
    condition: p.brand ?? "Not specified",
    description: p.description,
    imageClass: IMAGE_CLASSES[index % IMAGE_CLASSES.length],
    accent: "bg-lime-100 text-lime-900 dark:bg-lime-400 dark:text-slate-950",
    stock: `${p.stock ?? 0} available`,
    posted: "Recently",
    specs: [
      `Brand: ${p.brand ?? "N/A"}`,
      `Currency: ${p.currency ?? "USD"}`,
      `Stock: ${p.stock ?? 0}`,
    ],
  };
}

export async function fetchMarketplaceProducts(): Promise<Product[]> {
  const res = await fetch(new URL("/api/products/", API_BASE), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`/api/products/ returned ${res.status}`);
  const data: ApiProduct[] = await res.json();
  return data.map(mapToMarketplaceProduct);
}

// `null` means "does not exist" (→ 404 page); a thrown error means the API is
// unavailable (→ error page with retry). Memoized so metadata and page share
// one request.
export const fetchMarketplaceProduct = cache(
  async (id: string): Promise<Product | null> => {
    if (!UUID_RE.test(id)) return null;
    const res = await fetch(new URL(`/api/products/${id}/`, API_BASE), {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`/api/products/${id}/ returned ${res.status}`);
    const product: ApiProduct = await res.json();
    const index = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return mapToMarketplaceProduct(product, index);
  },
);
