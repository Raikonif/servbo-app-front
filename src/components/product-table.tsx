"use client";

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { useProducts } from "@/hooks/use-products";
import { useSellers } from "@/hooks/use-sellers";
import { EntityTable } from "@/features/marketplace/entity-table";
import { currencyFormatter } from "@/features/marketplace/format";
import { fetchProducts, fetchSellers } from "@/lib/api";
import type { Product, Seller } from "@/domain/store";

type Props = {
  initialProducts: Product[];
  initialSellers: Seller[];
};

export function ProductTable({ initialProducts, initialSellers }: Props) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(["products"], initialProducts);
  queryClient.setQueryData(["sellers"], initialSellers);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductTableInner />
    </HydrationBoundary>
  );
}

function ProductTableInner() {
  const { data: products = [] } = useProducts();
  const { data: sellers = [] } = useSellers();

  const getSellerName = (sellerId: string) =>
    sellers.find((s) => s.id === sellerId)?.name ?? "Unassigned";

  return (
    <EntityTable
      columns={["Product", "Seller", "Price", "Inventory", "Status"]}
      getRowKey={(p) => p.id}
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
  );
}
