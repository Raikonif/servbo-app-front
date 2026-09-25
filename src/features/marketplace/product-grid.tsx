import { Package, Store } from "lucide-react";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/catalog";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        <Package className="mx-auto mb-2 text-slate-400" size={22} />
        No products to show yet.
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      className="flex h-full flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300"
      href={`/products/${encodeURIComponent(product.id)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-950">
            {product.name}
          </h3>
          <p className="text-sm text-slate-500">{product.brand}</p>
        </div>
        <p className="shrink-0 text-lg font-semibold text-emerald-700">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
      {product.categories_detail?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {product.categories_detail.map((category) => (
            <span
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
              key={category.id}
            >
              {category.name}
            </span>
          ))}
        </div>
      ) : null}
      <p className="mt-auto inline-flex items-center gap-1.5 text-sm text-slate-600">
        <Store size={15} />
        {product.seller_name || "Seller"}
      </p>
    </Link>
  );
}
