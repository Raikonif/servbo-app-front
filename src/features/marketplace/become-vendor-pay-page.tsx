"use client";

import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CircleCheck,
  Clock3,
  Copy,
  RefreshCw,
  TimerOff,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useSellerSubscription } from "@/hooks/use-billing";
import { useNow } from "@/hooks/use-now";
import {
  CREATOR_URL,
  cancelPayment,
  formatDate,
  formatMoney,
  isExpired,
  isRunning,
  type LastPurchase,
  type PendingPayment,
  plural,
  type SellerSubscriptionState,
  startPackPayment,
} from "@/lib/billing";
import {
  BalanceBadge,
  card,
  ModeChooser,
  payHref,
  primaryButton,
  secondaryButton,
  useShowBillingState,
} from "./seller-access";

// The payment step (openspec subscription-payments "Customer buys a pack in
// the app"): the pending pack QR, polled until it is confirmed, then the
// credits and the mode chooser. Anything else goes back to /become-a-vendor.
export function BecomeVendorPayPage() {
  const router = useRouter();
  const paymentId = useSearchParams().get("payment");
  const subscription = useSellerSubscription();
  const showState = useShowBillingState();
  const state = subscription.data;
  const pending = state?.pending_payment ?? null;
  const last = state?.last_purchase ?? null;
  const view: "pending" | "paid" | "none" | null = !state
    ? null
    : pending && pending.id === paymentId
      ? "pending"
      : last && last.id === paymentId
        ? "paid"
        : "none";

  // Nothing to show for this id: the open payment if there is one (it was
  // replaced, or the link had no id), otherwise the packs.
  const redirectTo =
    view === "none"
      ? pending
        ? payHref(pending.id)
        : "/become-a-vendor"
      : null;
  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  const newQr = useMutation({
    // Same pack again: the backend replaces the expired QR and keeps its code.
    mutationFn: (packId: string) => startPackPayment({ packId }),
    onSuccess: showState,
  });
  const cancel = useMutation({
    mutationFn: cancelPayment,
    onSuccess: (next) => {
      router.replace("/become-a-vendor");
      showState(next);
    },
  });

  let content: ReactNode;
  if (subscription.isError && !state) {
    content = (
      <section className={card}>
        <p className="text-sm text-muted">We could not load your payment.</p>
        <button
          className={`mt-4 ${secondaryButton}`}
          onClick={() => void subscription.refetch()}
          type="button"
        >
          Try again
        </button>
      </section>
    );
  } else if (state && view === "pending" && pending) {
    content = (
      <PendingPaymentCard
        busy={newQr.isPending || cancel.isPending}
        error={newQr.error?.message ?? cancel.error?.message ?? null}
        onCancel={() => cancel.mutate()}
        onNewQr={
          pending.pack
            ? () => {
                if (pending.pack) newQr.mutate(pending.pack.id);
              }
            : null
        }
        onRefresh={() => void subscription.refetch()}
        payment={pending}
        refreshing={subscription.isFetching}
      />
    );
  } else if (state && view === "paid" && last) {
    content = <PaidView purchase={last} state={state} />;
  } else {
    content = <div className="h-96 animate-pulse rounded-lg bg-surface-2" />;
  }

  return (
    <main>
      <section className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent-text"
          href="/become-a-vendor"
        >
          <ArrowLeft size={16} />
          Back to credit packs
        </Link>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-fg">
          {view === "paid" ? "Payment confirmed" : "Pay your credit pack"}
        </h1>
        <div className="mt-6 space-y-6">{content}</div>
        <p className="mt-6 text-xs text-muted">
          Payment by QR only · you get a payment receipt, no tax invoice
          (factura) yet.
        </p>
      </section>
    </main>
  );
}

function PaidView({
  purchase,
  state,
}: {
  purchase: LastPurchase;
  state: SellerSubscriptionState;
}) {
  const running = isRunning(state.subscription) ? state.subscription : null;
  return (
    <>
      <section className={card}>
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
          <CircleCheck size={24} />
        </span>
        <h2 className="mt-4 text-2xl font-semibold text-fg" role="status">
          {plural(purchase.credits, "credit")} added
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {purchase.pack ? `${purchase.pack.name} pack` : "Credit pack"}
          {purchase.paid_at ? ` · paid ${formatDate(purchase.paid_at)}` : ""}.
          Your balance is now{" "}
          <span className="font-medium text-fg">
            {plural(state.wallet.balance, "credit")}
          </span>
          . Credits never expire.
        </p>
      </section>
      {running ? (
        <section className={card}>
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
            <BadgeCheck size={24} />
          </span>
          <h2 className="mt-4 text-xl font-semibold text-fg">
            You're a seller until {formatDate(running.current_period_end)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Your access renews from these credits when the period ends.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a className={primaryButton} href={CREATOR_URL}>
              Open the creator app
            </a>
            <Link className={secondaryButton} href="/become-a-vendor">
              Seller access
            </Link>
          </div>
        </section>
      ) : state.wallet.balance > 0 ? (
        <ModeChooser state={state} title="Now open your store" />
      ) : null}
    </>
  );
}

// "4:59" / "1:02:03" until the QR expires.
const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
    : `${minutes}:${seconds}`;
};

const row =
  "flex items-center justify-between gap-3 rounded-lg border border-line p-3";

function PendingPaymentCard({
  payment,
  refreshing,
  busy,
  error,
  onRefresh,
  onNewQr,
  onCancel,
}: {
  payment: PendingPayment;
  refreshing: boolean;
  busy: boolean;
  error: string | null;
  onRefresh: () => void;
  // Null for a legacy payment without a pack: cancel and pick a pack instead.
  onNewQr: (() => void) | null;
  onCancel: () => void;
}) {
  const [copied, setCopied] = useState(false);
  // Null on the server and the first client render: no hydration mismatch.
  const now = useNow(1000);
  const expiresAt = payment.expires_at;
  const expired = now !== null && isExpired(expiresAt, now);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payment.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the code is still visible to copy by hand.
    }
  };
  // Relay QRs carry their code as the glosa: the payer types nothing.
  const relay = payment.provider === "relay_qr";
  const partial =
    payment.amount_paid > 0 && payment.amount_paid < payment.amount_due;
  const credits = payment.credits ?? payment.pack?.credits ?? null;

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {expired ? (
          <p className="inline-flex items-center gap-2 rounded-md bg-danger-soft px-2 py-1 text-xs font-semibold uppercase text-danger">
            <TimerOff size={14} />
            QR expired
          </p>
        ) : (
          <p className="inline-flex items-center gap-2 rounded-md bg-warning-soft px-2 py-1 text-xs font-semibold uppercase text-warning">
            <Clock3 size={14} />
            Waiting for payment
          </p>
        )}
        {credits ? <BalanceBadge balance={credits} /> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-muted" role="status">
        {expired
          ? "This QR can no longer be paid. Get a new one to continue."
          : "Your credits are added as soon as the payment is confirmed. This page updates on its own."}
      </p>
      {expired ? (
        onNewQr ? (
          <button
            className={`mt-5 w-full ${primaryButton}`}
            disabled={busy}
            onClick={onNewQr}
            type="button"
          >
            <RefreshCw className={busy ? "animate-spin" : ""} size={16} />
            {busy ? "Preparing QR…" : "QR expired — get a new one"}
          </button>
        ) : null
      ) : payment.qr_image_url ? (
        // A storage/provider URL or a data URI: a plain <img> handles both
        // without configuring next/image hosts.
        // biome-ignore lint/performance/noImgElement: see above
        <img
          alt={`QR code to pay ${formatMoney(payment.amount_due, payment.currency)}, reference ${payment.reference}`}
          className="mx-auto mt-5 aspect-square w-full max-w-72 rounded-lg border border-line bg-white object-contain"
          src={payment.qr_image_url}
        />
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <dl className="mt-5 space-y-3 text-sm">
        {payment.pack ? (
          <div className={row}>
            <dt className="text-muted">Pack</dt>
            <dd className="text-right font-medium text-fg">
              {payment.pack.name}
              {credits ? (
                <span className="text-muted">
                  {" "}
                  · {plural(credits, "credit")}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
        <div className={row}>
          <dt className="text-muted">Amount</dt>
          <dd className="text-lg font-semibold text-fg">
            {formatMoney(payment.amount_due, payment.currency)}
          </dd>
        </div>
        {payment.promotion ? (
          <div className={row}>
            <dt className="text-muted">Code</dt>
            <dd className="text-right font-medium text-fg">
              {payment.promotion.code}
              {payment.original_amount &&
              payment.original_amount > payment.amount_due ? (
                <span className="text-muted">
                  {" "}
                  · was {formatMoney(payment.original_amount, payment.currency)}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
        {partial ? (
          <div className={row}>
            <dt className="text-muted">Received</dt>
            <dd className="text-right font-medium text-fg" role="status">
              {formatMoney(payment.amount_paid, payment.currency)} of{" "}
              {formatMoney(payment.amount_due, payment.currency)}
            </dd>
          </div>
        ) : null}
        {expiresAt && !expired ? (
          <div className={row}>
            <dt className="text-muted">Expires in</dt>
            <dd className="font-mono font-semibold text-fg" role="timer">
              {now === null
                ? "—"
                : formatCountdown(new Date(expiresAt).getTime() - now)}
            </dd>
          </div>
        ) : null}
        <div className="rounded-lg border border-accent/40 bg-accent-soft p-3">
          <dt className="text-accent-text">
            {relay
              ? "QR code — pay this exact QR without changing the amount or the note (glosa)"
              : "Reference — write it in the payment note"}
          </dt>
          <dd className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-2xl font-semibold tracking-wider text-fg">
              {payment.reference}
            </span>
            {relay ? null : (
              <button
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-accent/60 bg-surface px-3 text-sm font-medium text-accent-text hover:bg-accent-soft"
                onClick={() => void copy()}
                type="button"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </dd>
        </div>
      </dl>
      {payment.payment_instructions ? (
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted">
          {payment.payment_instructions}
        </p>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          className={secondaryButton}
          disabled={refreshing}
          onClick={onRefresh}
          type="button"
        >
          <RefreshCw className={refreshing ? "animate-spin" : ""} size={16} />
          Refresh status
        </button>
        <button
          className={secondaryButton}
          disabled={busy}
          onClick={onCancel}
          type="button"
        >
          <X size={16} />
          Cancel payment
        </button>
      </div>
    </section>
  );
}
