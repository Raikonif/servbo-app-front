"use client";

import {
  AlertTriangle,
  ImageIcon,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCart,
  useRemoveFromCart,
  useSetCartQuantity,
} from "@/hooks/use-cart";
import type { CartGroup, CartItem } from "@/lib/cart";
import { formatPrice, productHref } from "@/lib/catalog";

export const checkoutHref = (sellerId?: string) =>
  sellerId ? `/checkout?seller=${encodeURIComponent(sellerId)}` : "/checkout";

// The cart grouped by seller (openspec cart-and-checkout, shopping-cart
// spec). Rendered inside RequireSession.
export function CartView() {
  const { cart, isPending, isError, error, refetch } = useCart();

  return (
    <main className="mx-auto max-w-4xl px-4 pt-10 pb-24 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Your cart
      </h1>

      {isPending ? (
        <div className="mt-8 h-48 animate-pulse rounded-3xl bg-surface-2" />
      ) : isError ? (
        <div className="mt-8 rounded-3xl border border-danger/30 bg-danger-soft p-6 text-sm text-danger">
          {error.message}{" "}
          <button
            className="font-medium underline"
            onClick={() => refetch()}
            type="button"
          >
            Try again
          </button>
        </div>
      ) : !cart.groups.length ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line-strong p-12 text-center">
          <ShoppingBag className="mx-auto mb-3 text-subtle" size={24} />
          <p className="font-medium">Your cart is empty</p>
          <Link
            className="mt-4 inline-flex min-h-10 items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg"
            href="/"
          >
            Browse the catalog
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-muted">
            Each seller ships and gets paid separately: you will place one order
            per seller.
          </p>
          <div className="mt-8 flex flex-col gap-6">
            {cart.groups.map((group) => (
              <SellerGroup group={group} key={group.seller.id} />
            ))}
          </div>
          {cart.groups.length > 1 &&
          cart.groups.every((group) => group.can_checkout) ? (
            <div className="mt-8 flex justify-end">
              <Link
                className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover"
                href={checkoutHref()}
              >
                Check out all {cart.groups.length} sellers
              </Link>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}

function SellerGroup({ group }: { group: CartGroup }) {
  return (
    <section
      aria-labelledby={`seller-${group.seller.id}`}
      className="overflow-hidden rounded-3xl border border-line bg-surface"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
        <h2 className="font-semibold" id={`seller-${group.seller.id}`}>
          {group.seller.name}
        </h2>
        <p className="text-xs text-muted">
          {[group.accepts_qr ? "QR" : null, "Cash"]
            .filter(Boolean)
            .join(" or ")}{" "}
          · {group.pickup ? "Delivery or pickup" : "Delivery"}
        </p>
      </header>

      <ul className="divide-y divide-line">
        {group.items.map((item) => (
          <CartLine item={item} key={item.product} />
        ))}
      </ul>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-5 py-4">
        <p className="text-sm">
          <span className="text-muted">Subtotal </span>
          <span className="font-semibold tabular-nums">
            {group.subtotals.length
              ? group.subtotals
                  .map((s) => formatPrice(s.amount, s.currency))
                  .join(" + ")
              : "—"}
          </span>
          <span className="block text-xs text-muted">
            Shipping is agreed with the seller.
          </span>
        </p>
        {group.can_checkout ? (
          <Link
            className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg transition hover:opacity-90"
            href={checkoutHref(group.seller.id)}
          >
            Check out this seller
          </Link>
        ) : (
          <p className="inline-flex items-center gap-1.5 text-sm text-warning">
            <AlertTriangle size={15} />
            Fix the marked items to check out
          </p>
        )}
      </footer>
    </section>
  );
}

function CartLine({ item }: { item: CartItem }) {
  const setQuantity = useSetCartQuantity();
  const remove = useRemoveFromCart();
  const busy = setQuantity.isPending || remove.isPending;
  const error = setQuantity.error ?? remove.error;

  return (
    <li className="flex gap-4 px-5 py-4">
      <Link
        className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-surface-2"
        href={productHref(item.product)}
      >
        {item.image ? (
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="80px"
            src={item.image}
            unoptimized
          />
        ) : (
          <ImageIcon
            className="absolute inset-0 m-auto text-subtle"
            size={20}
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <Link
            className="line-clamp-2 font-medium hover:underline"
            href={productHref(item.product)}
          >
            {item.name}
          </Link>
          <p className="shrink-0 font-semibold tabular-nums">
            {formatPrice(item.subtotal, item.currency)}
          </p>
        </div>
        <p className="text-xs text-muted tabular-nums">
          {formatPrice(item.unit_price, item.currency)} each
        </p>

        {item.unavailable ? (
          <p className="text-sm font-medium text-danger">
            No longer available — remove it to continue.
          </p>
        ) : item.over_stock ? (
          <p className="text-sm font-medium text-warning">
            Only {item.stock} left — lower the quantity.
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          {!item.unavailable ? (
            <fieldset
              aria-label={`Quantity of ${item.name}`}
              className="inline-flex items-center rounded-full border border-line"
            >
              <button
                aria-label="Decrease quantity"
                className="inline-flex size-9 items-center justify-center rounded-full transition hover:bg-surface-2 disabled:opacity-40"
                disabled={busy || item.quantity <= 1}
                onClick={() =>
                  setQuantity.mutate({
                    product: item.product,
                    quantity: Math.min(item.quantity - 1, item.stock),
                  })
                }
                type="button"
              >
                <Minus size={15} />
              </button>
              <span className="w-8 text-center text-sm font-semibold tabular-nums">
                {item.quantity}
              </span>
              <button
                aria-label="Increase quantity"
                className="inline-flex size-9 items-center justify-center rounded-full transition hover:bg-surface-2 disabled:opacity-40"
                disabled={busy || item.quantity >= item.stock}
                onClick={() =>
                  setQuantity.mutate({
                    product: item.product,
                    quantity: item.quantity + 1,
                  })
                }
                type="button"
              >
                <Plus size={15} />
              </button>
            </fieldset>
          ) : null}
          <button
            className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-danger"
            disabled={busy}
            onClick={() => remove.mutate(item.product)}
            type="button"
          >
            <Trash2 size={15} />
            Remove
          </button>
        </div>
        {error ? <p className="text-sm text-danger">{error.message}</p> : null}
      </div>
    </li>
  );
}
