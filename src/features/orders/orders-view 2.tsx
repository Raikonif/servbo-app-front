"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronLeft, ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatDate, formatPrice } from "@/lib/catalog";
import {
  DELIVERY_LABELS,
  getOrders,
  orderHref,
  orderKeys,
  PAYMENT_LABELS,
} from "@/lib/orders";
import { StatusBadge } from "./order-badges";

// The buyer's orders, newest first. `?placed=OR-1,OR-2` is where checkout
// lands: a confirmation banner on top of the list.
export function OrdersView() {
  const params = useSearchParams();
  const placed = (params.get("placed") ?? "").split(",").filter(Boolean);
  const page = Math.max(1, Number(params.get("page")) || 1);
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: orderKeys.list(page),
    queryFn: () => getOrders(page),
  });

  return (
    <main className="mx-auto max-w-4xl px-4 pt-10 pb-24 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        My orders
      </h1>

      {placed.length ? (
        <div
          className="mt-6 flex gap-3 rounded-3xl border border-accent/40 bg-accent-soft p-5"
          role="status"
        >
          <CheckCircle2
            className="mt-0.5 shrink-0 text-accent-text"
            size={20}
          />
          <div>
            <p className="font-semibold text-accent-text">
              {placed.length === 1
                ? "Order placed"
                : `${placed.length} orders placed`}
              : {placed.join(", ")}
            </p>
            <p className="mt-1 text-sm text-muted">
              Open each order to see how to pay. QR orders: pay the seller's QR
              and attach your receipt. The seller confirms once they get the
              payment.
            </p>
          </div>
        </div>
      ) : null}

      {isPending ? (
        <div className="mt-8 h-48 animate-pulse rounded-3xl bg-surface-2" />
      ) : isError ? (
        <p className="mt-8 text-sm text-danger">
          {error.message}{" "}
          <button className="underline" onClick={() => refetch()} type="button">
            Try again
          </button>
        </p>
      ) : !data.results.length ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line-strong p-12 text-center">
          <Package className="mx-auto mb-3 text-subtle" size={24} />
          <p className="font-medium">No orders yet</p>
          <Link
            className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
            href="/"
          >
            Browse the catalog
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
            {data.results.map((order) => (
              <li key={order.id}>
                <Link
                  className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition hover:bg-surface-2/60 ${
                    placed.includes(order.code) ? "bg-accent-soft/40" : ""
                  }`}
                  href={orderHref(order.id)}
                >
                  <span className="font-semibold tabular-nums">
                    {order.code}
                  </span>
                  <StatusBadge status={order.status} />
                  <span className="ml-auto font-semibold tabular-nums">
                    {formatPrice(order.total, order.currency)}
                  </span>
                  <span className="w-full text-sm text-muted">
                    {order.seller.name} · {order.units}{" "}
                    {order.units === 1 ? "item" : "items"} ·{" "}
                    {PAYMENT_LABELS[order.payment_method]} ·{" "}
                    {DELIVERY_LABELS[order.delivery_method]} ·{" "}
                    {formatDate(order.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {data.next || data.previous ? (
            <nav
              aria-label="Pagination"
              className="mt-6 flex justify-between text-sm"
            >
              {data.previous ? (
                <Link
                  className="inline-flex items-center gap-1"
                  href={`/orders?page=${page - 1}`}
                >
                  <ChevronLeft size={16} /> Previous
                </Link>
              ) : (
                <span />
              )}
              {data.next ? (
                <Link
                  className="inline-flex items-center gap-1"
                  href={`/orders?page=${page + 1}`}
                >
                  Next <ChevronRight size={16} />
                </Link>
              ) : null}
            </nav>
          ) : null}
        </>
      )}
    </main>
  );
}
