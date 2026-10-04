import { ArrowUpRight, ImageIcon, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  formatDate,
  formatPrice,
  type Product,
  productHref,
  wasModified,
} from "@/lib/catalog";
import { ClampedText } from "./clamped-text";
import { FavoriteButton } from "./favorite-button";
import { Morph } from "./product-transition";

// Cards in the first row load their image eagerly; the rest lazily.
const EAGER_CARDS = 3;

export function ProductGrid({
  products,
  selectedId,
  selectHref,
}: {
  products: Product[];
  selectedId?: string;
  // Where clicking a card goes. The catalog selects into its side panel
  // (`/?product=<id>`); without it (e.g. seller pages) a card opens the
  // full-window detail directly.
  selectHref?: (id: string) => string;
}) {
  if (!products.length) {
    return (
      <div className="rounded-3xl border border-dashed border-line-strong p-12 text-center text-sm text-muted">
        <Package className="mx-auto mb-3 text-subtle" size={24} />
        No products to show yet.
      </div>
    );
  }

  // Never more than 3 columns; 2 while the side panel takes the right.
  return (
    <ul
      className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${
        selectedId ? "" : "xl:grid-cols-3"
      }`}
    >
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            eager={index < EAGER_CARDS}
            href={selectHref ? selectHref(product.id) : productHref(product.id)}
            product={product}
            selected={product.id === selectedId}
          />
        </li>
      ))}
    </ul>
  );
}

function ProductCard({
  product,
  href,
  selected,
  eager,
}: {
  product: Product;
  href: string;
  selected: boolean;
  eager: boolean;
}) {
  const modified = wasModified(product);
  const stamp = modified ? product.updated_at : product.created_at;

  return (
    <Morph id={product.id} owner="card" part="surface">
      <article
        className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-surface transition duration-300 ${
          selected
            ? "border-accent shadow-float ring-4 ring-accent/15"
            : "border-line hover:-translate-y-0.5 hover:border-line-strong hover:shadow-float"
        }`}
      >
        <Morph id={product.id} owner="card" part="image">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
            {product.main_image ? (
              <Image
                alt={product.name}
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                fetchPriority={eager ? "high" : "auto"}
                fill
                loading={eager ? "eager" : "lazy"}
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                src={product.main_image}
                unoptimized
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-subtle">
                <ImageIcon size={30} strokeWidth={1.5} />
                <span className="text-xs">No photo yet</span>
              </div>
            )}
          </div>
        </Morph>
        <FavoriteButton
          className="absolute top-3 right-3 z-10"
          productId={product.id}
          sellerId={product.seller}
        />
        {selected ? (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-fg">
            Selected
          </span>
        ) : null}

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="min-w-0 text-[17px] font-semibold leading-snug tracking-tight">
              {/* Stretched link: the whole card is the target, while the
                  favorite button and "See more" stay their own controls. */}
              <Link
                aria-current={selected ? "true" : undefined}
                className="line-clamp-2 after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none after:focus-visible:outline-2 after:focus-visible:outline-accent"
                href={href}
                scroll={false}
              >
                {product.name}
              </Link>
            </h3>
            <p className="shrink-0 text-[17px] font-semibold tracking-tight tabular-nums">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>

          {product.categories?.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {product.categories.map((category) => (
                <li
                  className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-muted"
                  key={category.id}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          ) : null}

          {product.description ? (
            <ClampedText
              className="text-sm leading-6 text-muted"
              href={productHref(product.id)}
              lines={3}
              productId={product.id}
              text={product.description}
            />
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-xs text-muted">
            <span className="truncate">{product.seller_name || "Seller"}</span>
            <time className="shrink-0 tabular-nums" dateTime={stamp}>
              {modified ? "Modified" : "Uploaded"} {formatDate(stamp)}
            </time>
          </div>
        </div>
      </article>
    </Morph>
  );
}

// "See more" → the full-window detail (a real link above any stretched card
// link). `data-see-more` lets the modal return focus here on close.
export function SeeMoreLink({
  productId,
  className = "",
  children = "See more",
}: {
  productId: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      className={`relative z-10 inline-flex items-center justify-center gap-1.5 ${className}`}
      data-see-more={productId}
      href={productHref(productId)}
      scroll={false}
    >
      {children}
      <ArrowUpRight aria-hidden size={16} />
    </Link>
  );
}
