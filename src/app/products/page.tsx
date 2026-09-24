import type { Metadata } from "next";
import { ProductTable } from "@/components/product-table";
import { fetchProducts, fetchSellers } from "@/lib/api";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage() {
  // A backend outage must not take the page down: the table renders what it
  // has and keeps retrying in the browser.
  const [products, sellers] = await Promise.allSettled([
    fetchProducts(),
    fetchSellers(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductTable
        initialProducts={
          products.status === "fulfilled" ? products.value : undefined
        }
        initialSellers={sellers.status === "fulfilled" ? sellers.value : []}
      />
    </main>
  );
}
