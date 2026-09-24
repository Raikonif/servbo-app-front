import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/features/marketplace/product-detail-page";
import { fetchMarketplaceProduct } from "@/lib/marketplace";
import { products, sellerProfiles } from "../../products";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

// Sample products are prebuilt; real catalog ids (UUIDs, linked from the home
// page) are resolved against the API on demand.
async function findProduct(id: string) {
  return (
    products.find((item) => item.id === id) ??
    (await fetchMarketplaceProduct(id))
  );
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await findProduct(id).catch(() => null);

  return {
    title: product ? product.title : "Product",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await findProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailPage
      product={product}
      seller={sellerProfiles[product.seller]}
    />
  );
}
