import { ArrowLeft, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SellerLink } from "@/features/marketplace/seller-link";
import { formatPrice, getProduct } from "@/lib/catalog";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id).catch(() => null);
  return { title: product ? product.name : "Product" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700"
        href="/"
      >
        <ArrowLeft size={16} />
        Back to catalog
      </Link>

      <article className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {product.brand}
            </p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight text-slate-950">
              {product.name}
            </h1>
          </div>
          <p className="text-3xl font-semibold text-emerald-700">
            {formatPrice(product.price, product.currency)}
          </p>
        </header>

        {product.categories_detail?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {product.categories_detail.map((category) => (
              <Link
                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 hover:text-emerald-700"
                href={`/?category=${category.id}`}
                key={category.id}
              >
                {category.name}
              </Link>
            ))}
          </div>
        ) : null}

        {product.description ? (
          <p className="whitespace-pre-line text-base leading-7 text-slate-600">
            {product.description}
          </p>
        ) : null}

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-slate-500">Stock</dt>
            <dd className="mt-1 font-semibold">
              {product.stock > 0
                ? `${product.stock} available`
                : "Out of stock"}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-slate-500">Seller</dt>
            <dd className="mt-1 font-semibold">
              <SellerLink
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline"
                sellerId={product.seller}
                showHint
              >
                <Store size={15} />
                {product.seller_name || "View seller"}
              </SellerLink>
            </dd>
          </div>
        </dl>
      </article>
    </main>
  );
}
