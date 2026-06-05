import type { Metadata } from "next";
import { getSellerName, products } from "@/data/store";
import { EntityTable } from "@/features/marketplace/entity-table";
import { currencyFormatter } from "@/features/marketplace/format";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <EntityTable
        columns={["Product", "Seller", "Price", "Inventory", "Status"]}
        getRowKey={(product) => product.id}
        items={products}
        renderRow={(product) => (
          <>
            <td className="px-5 py-4">
              <p className="font-medium text-slate-950">{product.name}</p>
              <p className="mt-1 max-w-xl text-sm text-slate-500">
                {product.description}
              </p>
            </td>
            <td className="px-5 py-4 text-slate-600">
              {getSellerName(product.sellerId)}
            </td>
            <td className="px-5 py-4 font-medium text-slate-950">
              {currencyFormatter.format(product.price)}
            </td>
            <td className="px-5 py-4 text-slate-600">{product.inventory}</td>
            <td className="px-5 py-4">
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold uppercase text-emerald-700">
                {product.status}
              </span>
            </td>
          </>
        )}
        title="Products"
      />
    </main>
  );
}
