import type { Metadata } from "next";
import { fetchProducts, fetchSellers } from "@/lib/api";
import { ProductTable } from "@/components/product-table";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage() {
  const [products, sellers] = await Promise.all([
    fetchProducts(),
    fetchSellers(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductTable initialProducts={products} initialSellers={sellers} />
    </main>
  );
}
