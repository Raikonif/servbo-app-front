"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  FileImage,
  LoaderCircle,
  PackageCheck,
  Upload,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { RateOrder } from "@/features/reviews/rate-order";
import { useNow } from "@/hooks/use-now";
import { useFormat } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
import { AuthError } from "@/lib/auth/errors";
import {
  cancelOrder,
  getOrder,
  markReceived,
  type OrderDetail,
  orderKeys,
  uploadReceipt,
} from "@/lib/orders";
import { StatusBadge } from "./order-badges";

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

const bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

// One order for its buyer: progress, what to pay and how, receipt upload,
// "I received it" and cancel (openspec order-fulfillment D6).
export function OrderDetailView({ orderId }: { orderId: string }) {
  const t = useTranslations("orders");
  const format = useFormat();
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
          {missing ? t("detail.notFound") : error?.message}
        </p>
      </Shell>
    );
  }

  const pending = order.status === "pending_payment";
  const pickup = order.delivery_method === "pickup";
  const cash = order.payment_method === "cash";
  const total = format.price(order.total, order.currency);

  return (
    <Shell>
      <header className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight tabular-nums">
          {order.code}
        </h1>
        <StatusBadge status={order.status} />
      </header>
      <p className="mt-1 text-sm text-muted">
        {t("detail.placedBy", {
          date: format.dateTime(order.created_at),
          seller: order.seller.name,
        })}
      </p>

      <StatusTimeline order={order} />

      {order.status === "cancelled" ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-4 text-sm">
          {order.cancelled_at
            ? t("detail.cancelledOn", {
                by: order.cancelled_by,
                date: format.dateTime(order.cancelled_at),
              })
            : t("detail.cancelled", { by: order.cancelled_by })}
          {order.cancel_reason && order.cancelled_by !== "system" ? (
            <p className="mt-1 text-muted">
              {t("detail.reason", { reason: order.cancel_reason })}
            </p>
          ) : null}
        </div>
      ) : order.status === "confirmed" ? (
        <div className="mt-6 rounded-2xl border border-accent/40 bg-accent-soft p-4 text-sm text-accent-text">
          {cash
            ? t.rich("detail.confirmedCash", {
                total,
                pickup: pickup ? "yes" : "no",
                b: bold,
              })
            : order.confirmed_at
              ? t("detail.confirmedQrOn", {
                  date: format.dateTime(order.confirmed_at),
                  pickup: pickup ? "yes" : "no",
                })
              : t("detail.confirmedQr", { pickup: pickup ? "yes" : "no" })}
        </div>
      ) : order.status === "shipped" || order.status === "ready_for_pickup" ? (
        <div className="mt-6 rounded-2xl border border-accent/40 bg-accent-soft p-4 text-sm text-accent-text">
          {order.status === "shipped"
            ? t("detail.shipped")
            : order.pickup_address
              ? t("detail.readyAt", { address: order.pickup_address })
              : t("detail.ready")}
          {cash ? (
            <> {t.rich("detail.payCashOnArrival", { total, b: bold })}</>
          ) : null}
        </div>
      ) : order.status === "delivered" ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-4 text-sm">
          {order.delivered_at
            ? t("detail.deliveredOn", {
                date: format.dateTime(order.delivered_at),
              })
            : t("detail.delivered")}
          {order.delivered_by === "system" ? (
            <span className="text-muted">
              {" "}
              {t("detail.autoDelivered", { pickup: pickup ? "yes" : "no" })}
            </span>
          ) : null}
        </div>
      ) : null}

      {order.fulfilment_note ? (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-4 text-sm">
          <p className="text-xs text-muted">{t("detail.sellerNote")}</p>
          <p className="mt-1 whitespace-pre-line">{order.fulfilment_note}</p>
        </div>
      ) : null}

      {pending && order.expires_at ? (
        <PaymentDeadline expiresAt={order.expires_at} />
      ) : null}

      {pending && order.payment_method === "qr" ? (
        <PayByQr onUpdated={update} order={order} />
      ) : null}

      <section className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface">
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li
              className="flex justify-between gap-4 px-5 py-3 text-sm"
              key={`${item.product}-${item.product_name}`}
            >
              <span>
                {t("detail.line", {
                  quantity: item.quantity,
                  name: item.product_name,
                })}
                <span className="block text-xs text-muted tabular-nums">
                  {t("detail.each", {
                    price: format.price(item.unit_price, order.currency),
                  })}
                </span>
              </span>
              <span className="font-medium tabular-nums">
                {format.price(item.subtotal, order.currency)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-line bg-surface-2/50 px-5 py-3">
          <span className="text-sm text-muted">{t("detail.total")}</span>
          <span className="font-semibold tabular-nums">{total}</span>
        </div>
      </section>

      <dl className="mt-6 grid gap-px overflow-hidden rounded-3xl border border-line bg-line text-sm sm:grid-cols-2">
        <Fact
          label={t("detail.payment")}
          value={t(`payment.${order.payment_method}`)}
        />
        <Fact
          label={t(`delivery.${order.delivery_method}`)}
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
          <Fact label={t("detail.yourNote")} value={order.buyer_note} />
        ) : null}
      </dl>

      {order.status === "delivered" ? <RateOrder order={order} /> : null}

      {order.status === "shipped" || order.status === "ready_for_pickup" ? (
        <ConfirmReceived onUpdated={update} orderId={order.id} />
      ) : null}
      {order.buyer_can_cancel ? (
        <CancelOrder onUpdated={update} orderId={order.id} />
      ) : null}
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
  const t = useTranslations("orders.qr");
  const format = useFormat();
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
          alt={t("alt", { seller: order.seller.name })}
          className="aspect-square w-full rounded-2xl border border-line bg-white object-contain p-2"
          src={order.payment_qr_url}
        />
      ) : null}
      <div>
        <h2 className="font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted">
          {t.rich("instructions", {
            total: format.price(order.total, order.currency),
            code: order.code,
            b: (chunks) => <strong className="text-fg">{chunks}</strong>,
          })}
        </p>
        <p className="mt-2 text-xs text-muted">{t("direct")}</p>

        <div className="mt-4">
          {order.receipt_url ? (
            <a
              className="mb-3 flex w-fit items-center gap-1.5 text-sm font-medium text-accent-text underline-offset-4 hover:underline"
              href={order.receipt_url}
              rel="noreferrer"
              target="_blank"
            >
              <FileImage size={15} /> {t("receiptAttached")}
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
                setLocalError(t("tooLarge"));
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
            {order.receipt_url ? t("replace") : t("attach")}
          </button>
          <p aria-live="polite" className="mt-2 text-sm text-danger">
            {localError ?? upload.error?.message ?? ""}
          </p>
        </div>
      </div>
    </section>
  );
}

type Step = { label: string; at: string | null; cancelled?: boolean };

// Placed → Paid (QR only) → Shipped / Ready for pickup → Delivered. A
// cancelled order shows the steps it reached and then who cancelled it.
function StatusTimeline({ order }: { order: OrderDetail }) {
  const t = useTranslations("orders.timeline");
  const format = useFormat();
  const pickup = order.delivery_method === "pickup";
  const steps: Step[] = [
    { label: t("placed"), at: order.created_at },
    ...(order.payment_method === "qr"
      ? [{ label: t("paid"), at: order.confirmed_at }]
      : []),
    pickup
      ? { label: t("ready"), at: order.ready_at }
      : { label: t("shipped"), at: order.shipped_at },
    { label: t("delivered"), at: order.delivered_at },
  ];
  const shown: Step[] =
    order.status === "cancelled"
      ? [
          ...steps.filter((step) => step.at),
          {
            label: t("cancelled", { by: order.cancelled_by }),
            at: order.cancelled_at,
            cancelled: true,
          },
        ]
      : steps;
  const current =
    order.status === "cancelled" ? -1 : shown.findIndex((step) => !step.at);

  return (
    <ol aria-label={t("label")} className="mt-6 grid gap-0">
      {shown.map((step, index) => {
        const done = Boolean(step.at) && !step.cancelled;
        const last = index === shown.length - 1;
        return (
          <li
            aria-current={index === current ? "step" : undefined}
            className="relative flex gap-3 pb-4 last:pb-0"
            key={step.label}
          >
            {last ? null : (
              <span
                aria-hidden
                className={`absolute top-4 bottom-0 left-[7px] w-px ${
                  done ? "bg-accent" : "bg-line"
                }`}
              />
            )}
            <span
              aria-hidden
              className={`relative mt-0.5 size-[15px] shrink-0 rounded-full border-2 ${
                step.cancelled
                  ? "border-danger bg-danger"
                  : done
                    ? "border-accent bg-accent"
                    : index === current
                      ? "border-accent bg-surface"
                      : "border-line-strong bg-surface"
              }`}
            />
            <span className="text-sm">
              <span
                className={
                  done || step.cancelled || index === current
                    ? "font-medium"
                    : "text-muted"
                }
              >
                {step.label}
              </span>
              {step.at ? (
                <span className="block text-xs text-muted">
                  {format.dateTime(step.at)}
                </span>
              ) : index === current ? (
                <span className="block text-xs text-muted">{t("next")}</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// Unpaid QR orders without a receipt are cancelled when `expires_at` passes.
function PaymentDeadline({ expiresAt }: { expiresAt: string }) {
  const t = useTranslations("orders.deadline");
  const format = useFormat();
  const now = useNow();
  const left = now === null ? null : new Date(expiresAt).getTime() - now;
  const urgent = left !== null && left < 12 * 3_600_000;
  const timeLeft = (ms: number) => {
    const { days, hours, minutes, total } = splitLeft(ms);
    if (days) return t("leftDays", { days, hours });
    return hours
      ? t("leftHours", { hours, minutes })
      : t("leftMinutes", { minutes: total });
  };
  return (
    <div
      className={`mt-6 rounded-2xl border p-4 text-sm ${
        urgent
          ? "border-warning/40 bg-warning-soft text-warning"
          : "border-line bg-surface"
      }`}
    >
      {t.rich("notice", { date: format.dateTime(expiresAt), b: bold })}
      {left === null ? null : left > 0 ? (
        <span className="mt-1 block font-medium tabular-nums">
          {timeLeft(left)}
        </span>
      ) : (
        <span className="mt-1 block font-medium">{t("timeUp")}</span>
      )}
    </div>
  );
}

// Minutes, hours and days left, split for the "2 d 3 h left" countdown.
const splitLeft = (ms: number) => {
  const total = Math.max(1, Math.floor(ms / 60_000));
  return {
    days: Math.floor(total / 1440),
    hours: Math.floor((total % 1440) / 60),
    minutes: total % 60,
    total,
  };
};

function ConfirmReceived({
  orderId,
  onUpdated,
}: {
  orderId: string;
  onUpdated: (o: OrderDetail | null) => void;
}) {
  const t = useTranslations("orders.received");
  const [confirming, setConfirming] = useState(false);
  const received = useMutation({
    mutationFn: () => markReceived(orderId),
    onSuccess: onUpdated,
  });

  return (
    <div className="mt-6">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>{t("question")}</span>
          <button
            className="rounded-full bg-accent px-4 py-2 font-semibold text-accent-fg disabled:opacity-60"
            disabled={received.isPending}
            onClick={() => received.mutate()}
            type="button"
          >
            {t("confirm")}
          </button>
          <button
            className="font-medium text-muted"
            onClick={() => setConfirming(false)}
            type="button"
          >
            {t("notYet")}
          </button>
        </div>
      ) : (
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-semibold text-bg transition hover:opacity-90"
          onClick={() => setConfirming(true)}
          type="button"
        >
          <PackageCheck size={16} /> {t("button")}
        </button>
      )}
      {received.error ? (
        <p className="mt-2 text-sm text-danger">{received.error.message}</p>
      ) : null}
    </div>
  );
}

function CancelOrder({
  orderId,
  onUpdated,
}: {
  orderId: string;
  onUpdated: (o: OrderDetail | null) => void;
}) {
  const t = useTranslations("orders.cancel");
  const [confirming, setConfirming] = useState(false);
  const cancel = useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: onUpdated,
  });

  return (
    <div className="mt-8 border-t border-line pt-6">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>{t("question")}</span>
          <button
            className="rounded-full bg-danger px-4 py-2 font-semibold text-white disabled:opacity-60"
            disabled={cancel.isPending}
            onClick={() => cancel.mutate()}
            type="button"
          >
            {t("confirm")}
          </button>
          <button
            className="font-medium text-muted"
            onClick={() => setConfirming(false)}
            type="button"
          >
            {t("keep")}
          </button>
        </div>
      ) : (
        <button
          className="text-sm font-medium text-danger underline-offset-4 hover:underline"
          onClick={() => setConfirming(true)}
          type="button"
        >
          {t("button")}
        </button>
      )}
      {cancel.error ? (
        <p className="mt-2 text-sm text-danger">{cancel.error.message}</p>
      ) : null}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("orders");
  return (
    <main className="mx-auto max-w-3xl px-4 pt-8 pb-24 sm:px-6">
      <Link
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
        href="/orders"
      >
        <ChevronLeft size={16} /> {t("title")}
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
