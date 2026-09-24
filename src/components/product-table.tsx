"use client";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Product, Seller } from "@/domain/store";
import { EntityTable } from "@/features/marketplace/entity-table";
import { currencyFormatter } from "@/features/marketplace/format";
import { useProducts } from "@/hooks/use-products";
import { useSellers } from "@/hooks/use-sellers";

type Props = {
  // undefined: the server could not load the catalog; the client fetches it.
  initialProducts?: Product[];
  initialSellers: Seller[];
};

export function ProductTable({ initialProducts, initialSellers }: Props) {
  const queryClient = new QueryClient();
  if (initialProducts) {
    queryClient.setQueryData(["products"], initialProducts);
  }
  queryClient.setQueryData(["sellers"], initialSellers);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductTableInner />
    </HydrationBoundary>
  );
}

function ProductTableInner() {
  const {
    data: products = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = useProducts();
  const { data: sellers = [] } = useSellers();

  const getSellerName = (sellerId: string) =>
    sellers.find((s) => s.id === sellerId)?.name ?? "Unassigned";

  return (
    <div className="space-y-4">
      {isError ? (
        <div
          className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p>
            {products.length
              ? "Showing the last loaded catalog: we can’t reach the server right now."
              : "We can’t load the catalog right now. We’ll keep retrying automatically."}
          </p>
          <button
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-amber-300 bg-white px-3 font-medium hover:bg-amber-100 disabled:opacity-60"
            disabled={isFetching}
            onClick={() => void refetch()}
            type="button"
          >
            {isFetching ? "Retrying…" : "Retry now"}
          </button>
        </div>
      ) : null}
      {isPending ? (
        <div
          aria-busy="true"
          className="h-64 animate-pulse rounded-lg border border-slate-200 bg-white"
        />
      ) : (
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
      )}
      {!isPending && !isError && products.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No products have been published yet.
        </p>
      ) : null}
    </div>
  );
}
