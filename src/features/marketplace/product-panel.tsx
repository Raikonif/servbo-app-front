import { ImageIcon, Images, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddToCart } from "@/features/cart/add-to-cart";
import { ReviewsSection } from "@/features/reviews/reviews-section";
import { RatingSummary } from "@/features/reviews/stars";
import {
  formatDate,
  formatPrice,
  type Product,
  wasModified,
} from "@/lib/catalog";
import { ratingNumber } from "@/lib/reviews";
import { FavoriteButton } from "./favorite-button";
import { PanelKeys } from "./panel-keys";
import { SeeMoreLink } from "./product-grid";
import { Morph } from "./product-transition";

const panelTitleId = (id: string) => `panel-title-${id}`;

// The selected product beside the catalog (openspec D16): a sticky column
// from lg up, a standard (non-modal) bottom sheet below. Server-rendered from
// ?product=<id>, so a shared link opens with it. "See more" leads to the
// full-window detail.
export function ProductPanel({
  product,
  closeHref,
}: {
  product: Product;
  closeHref: string;
}) {
  const modified = wasModified(product);
  const photos = product.images.length;

  return (
    <>
      <PanelKeys closeHref={closeHref} />
      <Morph id={product.id} owner="panel" part="surface">
        <aside
          aria-labelledby={panelTitleId(product.id)}
          className="product-panel fixed inset-x-0 bottom-0 z-40 flex max-h-[82dvh] flex-col overflow-hidden rounded-t-[28px] border border-line bg-surface shadow-float lg:sticky lg:top-24 lg:z-auto lg:max-h-[calc(100dvh-7rem)] lg:rounded-3xl"
        >
          {/* Sheet grabber (visual only) on small screens. */}
          <span
            aria-hidden
            className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line-strong lg:hidden"
          />
          <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-2 lg:pt-4">
            <span className="text-xs font-semibold tracking-wide text-muted uppercase">
              Product
            </span>
            <Link
              aria-label="Close details"
              className="inline-flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
              href={closeHref}
              scroll={false}
            >
              <X size={18} />
            </Link>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
            <Morph id={product.id} owner="panel" part="image">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2">
                {product.main_image ? (
                  <Image
                    alt={product.name}
                    className="object-cover"
                    fetchPriority="high"
                    fill
                    loading="eager"
                    sizes="(min-width: 1024px) 400px, 100vw"
                    src={product.main_image}
                    unoptimized
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-subtle">
                    <ImageIcon size={32} strokeWidth={1.5} />
                  </div>
                )}
                {photos > 1 ? (
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-surface/85 px-2.5 py-1 text-xs font-medium backdrop-blur">
                    <Images aria-hidden size={13} />
                    {photos} photos
                  </span>
                ) : null}
              </div>
            </Morph>

            <div className="mt-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted">
                  {product.brand}
                </p>
                <h2
                  className="mt-1 text-xl font-semibold leading-tight tracking-tight"
                  id={panelTitleId(product.id)}
                >
                  {product.name}
                </h2>
              </div>
              <FavoriteButton
                className="shrink-0"
                productId={product.id}
                sellerId={product.seller}
              />
            </div>

            <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
              {formatPrice(product.price, product.currency)}
            </p>
            <RatingSummary
              avg={ratingNumber(product.rating_avg)}
              className="mt-1 text-sm"
              count={product.rating_count}
            />

            {product.categories?.length ? (
              <ul className="mt-4 flex flex-wrap gap-1.5">
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
              <p className="mt-4 line-clamp-4 text-sm leading-6 text-muted">
                {product.description}
              </p>
            ) : null}

            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line text-sm">
              <PanelFact label="Seller" value={product.seller_name || "—"} />
              <PanelFact
                label="Stock"
                value={
                  product.stock > 0 ? `${product.stock} available` : "Sold out"
                }
              />
              <PanelFact
                label={modified ? "Modified" : "Uploaded"}
                value={
                  <time
                    dateTime={
                      modified ? product.updated_at : product.created_at
                    }
                  >
                    {formatDate(
                      modified ? product.updated_at : product.created_at,
                    )}
                  </time>
                }
              />
              <PanelFact
                label="Photos"
                value={photos ? String(photos) : "None"}
              />
            </dl>

            <div className="mt-6 border-t border-line pt-5">
              <ReviewsSection
                compact
                id={product.id}
                kind="product"
                ratingAvg={product.rating_avg}
                ratingCount={product.rating_count}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-line p-4">
            <AddToCart
              productId={product.id}
              sellerId={product.seller}
              stock={product.stock}
            />
            <SeeMoreLink
              className="h-11 w-full rounded-full border border-line text-sm font-semibold text-fg transition hover:border-line-strong hover:bg-surface-2"
              productId={product.id}
            >
              See more
            </SeeMoreLink>
          </div>
        </aside>
      </Morph>
    </>
  );
}

function PanelFact({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-surface p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 truncate font-medium">{value}</dd>
    </div>
  );
}
