import { Store } from "lucide-react";
import Link from "next/link";
import {
  formatDateTime,
  formatPrice,
  type Product,
  productHref,
  wasModified,
} from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";
import { FavoriteButton } from "./favorite-button";
import { ProductGallery } from "./product-gallery";
import { SellerLink } from "./seller-link";

export const productTitleId = (id: string) => `product-title-${id}`;

// One server component for both the modal and the full page, so a shared
// link shows exactly what the modal showed. Everything here is in the HTML.
export function ProductDetail({ product }: { product: Product }) {
  const modified = wasModified(product);

  return (
    <article className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
      <ProductJsonLd product={product} />
      <div className="lg:sticky lg:top-0 lg:self-start">
        <ProductGallery
          images={product.images}
          name={product.name}
          productId={product.id}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            {product.brand}
          </p>
          <div className="flex items-start justify-between gap-4">
            <h1
              className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
              id={productTitleId(product.id)}
            >
              {product.name}
            </h1>
            <FavoriteButton
              className="shrink-0"
              productId={product.id}
              sellerId={product.seller}
            />
          </div>
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {formatPrice(product.price, product.currency)}
          </p>
        </header>

        {product.categories?.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {product.categories.map((category) => (
              <li key={category.id}>
                <Link
                  className="inline-flex rounded-full border border-line px-3 py-1 text-xs font-medium text-muted transition hover:border-accent hover:text-accent-text"
                  href={`/?category=${category.id}`}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {product.description ? (
          <p className="whitespace-pre-line text-base leading-7 text-muted">
            {product.description}
          </p>
        ) : null}

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line text-sm">
          <div className="bg-surface p-4">
            <dt className="text-xs text-muted">Stock</dt>
            <dd className="mt-1 font-medium">
              {product.stock > 0
                ? `${product.stock} available`
                : "Out of stock"}
            </dd>
          </div>
          <div className="bg-surface p-4">
            <dt className="text-xs text-muted">Seller</dt>
            <dd className="mt-1 font-medium">
              <SellerLink
                className="inline-flex items-center gap-1.5 text-accent-text hover:underline"
                sellerId={product.seller}
                showHint
              >
                <Store size={15} />
                {product.seller_name || "View seller"}
              </SellerLink>
            </dd>
          </div>
          <div className="bg-surface p-4">
            <dt className="text-xs text-muted">Uploaded</dt>
            <dd className="mt-1 font-medium">
              <time dateTime={product.created_at}>
                {formatDateTime(product.created_at)}
              </time>
            </dd>
          </div>
          <div className="bg-surface p-4">
            <dt className="text-xs text-muted">Last modified</dt>
            <dd className="mt-1 font-medium">
              {modified ? (
                <time dateTime={product.updated_at}>
                  {formatDateTime(product.updated_at)}
                </time>
              ) : (
                "Not modified"
              )}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

// schema.org Product for search engines (design D15). Same entity in the
// modal and on the page, both canonical to /products/<id>.
function ProductJsonLd({ product }: { product: Product }) {
  const images = [...product.images]
    .sort(
      (a, b) =>
        Number(b.is_main) - Number(a.is_main) || a.position - b.position,
    )
    .map((image) => image.url);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    ...(images.length ? { image: images } : {}),
    brand: { "@type": "Brand", name: product.brand },
    url: absoluteUrl(productHref(product.id)),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency.toUpperCase(),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: product.seller_name || "Seller",
      },
    },
  };
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be raw JSON; `<` is escaped below
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}
