"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, FileImage, LoaderCircle, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { AuthError } from "@/lib/auth/errors";
import { formatDateTime, formatPrice } from "@/lib/catalog";
import {
  cancelOrder,
  DELIVERY_LABELS,
  getOrder,
  type OrderDetail,
  orderKeys,
  PAYMENT_LABELS,
  uploadReceipt,
} from "@/lib/orders";
import { StatusBadge } from "./order-badges";

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

// One order for its buyer: what to pay and how, receipt upload, cancel.
export function OrderDetailView({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const {
    data: order,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrder(orderId),
    retry: (count, err) =>
      !(err instanceof AuthError && err.status === 404) && count < 2,
  });
  const update = (next: OrderDetail | null) => {
    if (next) queryClient.setQueryData(orderKeys.detail(orderId), next);
    void queryClient.invalidateQueries({ queryKey: orderKeys.all });
  };

  if (isPending) {
    return (
      <Shell>
        <div className="mt-8 h-64 animate-pulse rounded-3xl bg-surface-2" />
      </Shell>
    );
  }
  if (isError || !order) {
    const missing = error instanceof AuthError && error.status === 404;
    return (
      <Shell>
        <p className="mt-8 text-muted">
          {missing ? "We could not find this order." : error?.message}
        </p>
      </Shell>
    );
  }

  const pending = order.status === "pending_payment";

  return (
    <Shell>
      <header className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight tabular-nums">
          {order.code}
        </h1>
        <StatusBadge status={order.status} />
      </header>
      <p className="mt-1 text-sm text-muted">
        Placed {formatDateTime(order.created_at)} · Seller {order.seller.name}
      </p>

      {order.status === "cancelled" ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-4 text-sm">
          Cancelled by {order.cancelled_by === "seller" ? "the seller" : "you"}
          {order.cancelled_at
            ? ` on ${formatDateTime(order.cancelled_at)}`
            : ""}
          .
          {order.cancel_reason ? (
            <p className="mt-1 text-muted">Reason: {order.cancel_reason}</p>
          ) : null}
        </div>
      ) : order.status === "confirmed" ? (
        <div className="mt-6 rounded-2xl border border-accent/40 bg-accent-soft p-4 text-sm text-accent-text">
          The seller confirmed your payment
          {order.confirmed_at
            ? ` on ${formatDateTime(order.confirmed_at)}`
            : ""}
          .
        </div>
      ) : null}

      {pending && order.payment_method === "qr" ? (
        <PayByQr onUpdated={update} order={order} />
      ) : pending ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-4 text-sm">
          Pay <strong>{formatPrice(order.total, order.currency)}</strong> in
          cash{" "}
          {order.delivery_method === "pickup"
            ? "when you pick up"
            : "on delivery"}
          . The seller confirms when they receive it.
        </div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface">
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li
              className="flex justify-between gap-4 px-5 py-3 text-sm"
              key={`${item.product}-${item.product_name}`}
            >
              <span>
                {item.quantity} × {item.product_name}
                <span className="block text-xs text-muted tabular-nums">
                  {formatPrice(item.unit_price, order.currency)} each
                </span>
              </span>
              <span className="font-medium tabular-nums">
                {formatPrice(item.subtotal, order.currency)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-line bg-surface-2/50 px-5 py-3">
          <span className="text-sm text-muted">
            Total (shipping agreed with the seller)
          </span>
          <span className="font-semibold tabular-nums">
            {formatPrice(order.total, order.currency)}
          </span>
        </div>
      </section>

      <dl className="mt-6 grid gap-px overflow-hidden rounded-3xl border border-line bg-line text-sm sm:grid-cols-2">
        <Fact label="Payment" value={PAYMENT_LABELS[order.payment_method]} />
        <Fact
          label={DELIVERY_LABELS[order.delivery_method]}
          value={
            order.delivery_method === "pickup" ? (
              <>
                {order.pickup_address}
                {order.pickup_notes ? (
                  <span className="block text-muted">{order.pickup_notes}</span>
                ) : null}
              </>
            ) : (
              <>
                {order.recipient_name} · {order.phone}
                <span className="block text-muted">
                  {order.address}
                  {order.reference ? ` (${order.reference})` : ""}
                </span>
              </>
            )
          }
        />
        {order.buyer_note ? (
          <Fact label="Your note" value={order.buyer_note} />
        ) : null}
      </dl>

      {pending ? <CancelOrder onUpdated={update} orderId={order.id} /> : null}
    </Shell>
  );
}

function PayByQr({
  order,
  onUpdated,
}: {
  order: OrderDetail;
  onUpdated: (o: OrderDetail | null) => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const upload = useMutation({
    mutationFn: (receipt: File) => uploadReceipt(order.id, receipt),
    onSuccess: onUpdated,
  });

  return (
    <section className="mt-6 grid gap-5 rounded-3xl border border-line bg-surface p-5 sm:grid-cols-[220px_1fr]">
      {order.payment_qr_url ? (
        // biome-ignore lint/performance/noImgElement: presigned, expiring URL; next/image would cache it.
        <img
          alt={`Payment QR of ${order.seller.name}`}
          className="aspect-square w-full rounded-2xl border border-line bg-white object-contain p-2"
          src={order.payment_qr_url}
        />
      ) : null}
      <div>
        <h2 className="font-semibold">Pay with QR</h2>
        <p className="mt-1 text-sm text-muted">
          Scan the seller's QR with your banking app and pay exactly{" "}
          <strong className="text-fg">
            {formatPrice(order.total, order.currency)}
          </strong>
          . Add <strong className="text-fg">{order.code}</strong> as the payment
          reference.
        </p>
        <p className="mt-2 text-xs text-muted">
          You pay the seller directly; ServBo does not hold the money.
        </p>

        <div className="mt-4">
          {order.receipt_url ? (
            <a
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-text underline-offset-4 hover:underline"
              href={order.receipt_url}
              rel="noreferrer"
              target="_blank"
            >
              <FileImage size={15} /> Receipt attached — view
            </a>
          ) : null}
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            id="receipt"
            onChange={(event) => {
              const chosen = event.target.files?.[0];
              event.target.value = "";
              if (!chosen) return;
              if (chosen.size > MAX_RECEIPT_BYTES) {
                setLocalError("The image must be 5 MB or smaller.");
                return;
              }
              setLocalError(null);
              upload.mutate(chosen);
            }}
            ref={file}
            type="file"
          />
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
            disabled={upload.isPending}
            onClick={() => file.current?.click()}
            type="button"
          >
            {upload.isPending ? (
              <LoaderCircle className="animate-spin" size={16} />
            ) : (
              <Upload size={16} />
            )}
            {order.receipt_url ? "Replace receipt" : "Attach receipt"}
          </button>
          <p aria-live="polite" className="mt-2 text-sm text-danger">
            {localError ?? upload.error?.message ?? ""}
          </p>
        </div>
      </div>
    </section>
  );
}

function CancelOrder({
  orderId,
  onUpdated,
}: {
  orderId: string;
  onUpdated: (o: OrderDetail | null) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const cancel = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: onUpdated,
  });

  return (
    <div className="mt-8 border-t border-line pt-6">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>
            Cancel this order? The items go back to the seller's stock.
          </span>
          <button
            className="rounded-full bg-danger px-4 py-2 font-semibold text-white disabled:opacity-60"
            disabled={cancel.isPending}
            onClick={() => cancel.mutate()}
            type="button"
          >
            Yes, cancel
          </button>
          <button
            className="font-medium text-muted"
            onClick={() => setConfirming(false)}
            type="button"
          >
            Keep it
          </button>
        </div>
      ) : (
        <button
          className="text-sm font-medium text-danger underline-offset-4 hover:underline"
          onClick={() => setConfirming(true)}
          type="button"
        >
          Cancel order
        </button>
      )}
      {cancel.error ? (
        <p className="mt-2 text-sm text-danger">{cancel.error.message}</p>
      ) : null}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-8 pb-24 sm:px-6">
      <Link
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
        href="/orders"
      >
        <ChevronLeft size={16} /> My orders
      </Link>
      {children}
    </main>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-surface p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
