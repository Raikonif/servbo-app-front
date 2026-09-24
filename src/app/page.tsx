import { fetchMarketplaceProducts } from "@/lib/marketplace";
import { getMarketplaceData } from "./backend-data";
import { Marketplace } from "./marketplace";
import type { Product } from "./products";
import { products as fallbackProducts } from "./products";

async function loadMarketplaceProducts(): Promise<Product[]> {
  try {
    return await fetchMarketplaceProducts();
  } catch {
    return fallbackProducts;
  }
}

export default async function Home() {
  const { backendError, categories, sellerProfiles } =
    await getMarketplaceData();
  const products = await loadMarketplaceProducts();
  const finalCategories =
    products.length > fallbackProducts.length
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
