import { getMarketplaceData } from "./backend-data";
import { Marketplace } from "./marketplace";

export default async function Home() {
  const { backendError, categories, products, sellerProfiles } =
    await getMarketplaceData();

  return (
    <Marketplace
      backendError={backendError}
      categories={categories}
      products={products}
      sellerProfiles={sellerProfiles}
    />
  );
}
