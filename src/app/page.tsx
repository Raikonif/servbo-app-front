import { getMarketplaceData } from "./backend-data";
import { Marketplace } from "./marketplace";
import type { Product } from "./products";
import { products as fallbackProducts, categories as fallbackCategories } from "./products";

const API_BASE = process.env.BACKEND_URL ?? "http://localhost:8000";

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

function categoryName(category: { id: number; name: string } | number | string): string {
  if (typeof category === "object" && category !== null && "name" in category) {
    return category.name;
  }
  return String(category);
}

function mapToMarketplaceProduct(p: ApiProduct, index: number): Product {
  const categories = p.categories_detail?.length
    ? p.categories_detail
    : p.categories?.map(categoryName) ?? [];

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

async function fetchMarketplaceProducts(): Promise<Product[]> {
  try {
    const res = await fetch(new URL("/api/products/", API_BASE), {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`/api/products/ returned ${res.status}`);
    const data: ApiProduct[] = await res.json();
    return data.map(mapToMarketplaceProduct);
  } catch {
    return fallbackProducts;
  }
}

export default async function Home() {
  const { backendError, categories, sellerProfiles } = await getMarketplaceData();
  const products = await fetchMarketplaceProducts();
  const finalCategories = products.length > fallbackProducts.length
    ? ["All", ...new Set(products.map((p) => p.category))]
    : categories;

  return (
    <Marketplace
      backendError={backendError}
      categories={finalCategories}
      products={products}
      sellerProfiles={sellerProfiles}
    />
  );
}
