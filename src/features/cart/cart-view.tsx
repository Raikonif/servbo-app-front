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
import { useTranslations } from "next-intl";
import {
  useCart,
  useRemoveFromCart,
  useSetCartQuantity,
} from "@/hooks/use-cart";
import { useFormat } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
import type { CartGroup, CartItem } from "@/lib/cart";
import { productHref } from "@/lib/catalog";

export const checkoutHref = (sellerId?: string) =>
  sellerId ? `/checkout?seller=${encodeURIComponent(sellerId)}` : "/checkout";

// The cart grouped by seller (openspec cart-and-checkout, shopping-cart
// spec). Rendered inside RequireSession.
export function CartView() {
  const t = useTranslations("cart");
  const { cart, isPending, isError, error, refetch } = useCart();

  return (
    <main className="mx-auto max-w-4xl px-4 pt-10 pb-24 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("title")}
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
            {t("tryAgain")}
          </button>
        </div>
      ) : !cart.groups.length ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line-strong p-12 text-center">
          <ShoppingBag className="mx-auto mb-3 text-subtle" size={24} />
          <p className="font-medium">{t("empty")}</p>
          <Link
            className="mt-4 inline-flex min-h-10 items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg"
            href="/"
          >
            {t("browse")}
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-muted">{t("perSeller")}</p>
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
                {t("checkoutAll", { count: cart.groups.length })}
              </Link>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}

function SellerGroup({ group }: { group: CartGroup }) {
  const t = useTranslations("cart");
  const format = useFormat();
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
          {t("options", {
            payment: group.accepts_qr ? "qrOrCash" : "cash",
            delivery: group.pickup ? "both" : "delivery",
          })}
        </p>
      </header>

      <ul className="divide-y divide-line">
        {group.items.map((item) => (
          <CartLine item={item} key={item.product} />
        ))}
      </ul>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-5 py-4">
        <p className="text-sm">
          <span className="text-muted">{t("subtotal")} </span>
          <span className="font-semibold tabular-nums">
            {group.subtotals.length
              ? group.subtotals
                  .map((s) => format.price(s.amount, s.currency))
                  .join(" + ")
              : "—"}
          </span>
          <span className="block text-xs text-muted">
            {t("shippingAgreed")}
          </span>
        </p>
        {group.can_checkout ? (
          <Link
            className="inline-flex min-h-11 items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg transition hover:opacity-90"
            href={checkoutHref(group.seller.id)}
          >
            {t("checkoutSeller")}
          </Link>
        ) : (
          <p className="inline-flex items-center gap-1.5 text-sm text-warning">
            <AlertTriangle size={15} />
            {t("fixItems")}
          </p>
        )}
      </footer>
    </section>
  );
}

function CartLine({ item }: { item: CartItem }) {
  const t = useTranslations("cart");
  const format = useFormat();
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
            {format.price(item.subtotal, item.currency)}
          </p>
        </div>
        <p className="text-xs text-muted tabular-nums">
          {t("each", { price: format.price(item.unit_price, item.currency) })}
        </p>

        {item.unavailable ? (
          <p className="text-sm font-medium text-danger">{t("unavailable")}</p>
        ) : item.over_stock ? (
          <p className="text-sm font-medium text-warning">
            {t("overStock", { count: item.stock })}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          {!item.unavailable ? (
            <fieldset
              aria-label={t("quantityOf", { name: item.name })}
              className="inline-flex items-center rounded-full border border-line"
            >
              <button
                aria-label={t("decrease")}
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
                aria-label={t("increase")}
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
            {t("remove")}
          </button>
        </div>
        {error ? <p className="text-sm text-danger">{error.message}</p> : null}
      </div>
    </li>
  );
}
