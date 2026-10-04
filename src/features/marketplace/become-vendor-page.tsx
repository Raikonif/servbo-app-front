"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock3,
  Copy,
  QrCode,
  RefreshCw,
  Store,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { useSellerPlan, useSellerSubscription } from "@/hooks/use-billing";
import {
  billingKeys,
  CREATOR_URL,
  formatDate,
  formatMoney,
  type PendingPayment,
  type SellerSubscriptionState,
  startSellerPayment,
} from "@/lib/billing";

const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line px-5 text-sm font-medium text-fg hover:border-accent hover:text-accent-text disabled:opacity-60";
const card = "rounded-lg border border-line bg-surface p-6 shadow-sm";

export function BecomeVendorPage() {
  const queryClient = useQueryClient();
  const subscription = useSellerSubscription();
  const plan = useSellerPlan();
  const pay = useMutation({
    mutationFn: startSellerPayment,
    onSuccess: (state) =>
      queryClient.setQueryData<SellerSubscriptionState>(
        billingKeys.sellerSubscription,
        state,
      ),
  });

  const state = subscription.data;
  const active =
    state?.is_seller && state.subscription?.status === "active"
      ? state.subscription
      : null;
  const pending = state?.pending_payment ?? null;

  let content: ReactNode;
  if (subscription.isPending) {
    content = <div className="h-64 animate-pulse rounded-lg bg-surface-2" />;
  } else if (subscription.isError) {
    content = (
      <section className={card}>
        <p className="text-sm text-muted">
          We could not load your seller status.
        </p>
        <button
          className={`mt-4 ${secondaryButton}`}
          onClick={() => void subscription.refetch()}
          type="button"
        >
          Try again
        </button>
      </section>
    );
  } else if (pending) {
    content = (
      <PendingPaymentCard
        payment={pending}
        refreshing={subscription.isFetching}
        onRefresh={() => void subscription.refetch()}
      />
    );
  } else if (active) {
    content = (
      <section className={card}>
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
          <BadgeCheck size={24} />
        </span>
        <h2 className="mt-4 text-2xl font-semibold text-fg">You're a seller</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Your {active.name} subscription is active until{" "}
          <span className="font-medium text-fg">
            {formatDate(active.current_period_end)}
          </span>
          .
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a className={primaryButton} href={CREATOR_URL}>
            Open the creator app
            <ArrowRight size={17} />
          </a>
          <button
            className={secondaryButton}
            disabled={pay.isPending}
            onClick={() => pay.mutate()}
            type="button"
          >
            <RefreshCw size={16} />
            {pay.isPending ? "Preparing…" : "Renew"}
          </button>
        </div>
        {pay.error ? (
          <p className="mt-3 text-sm text-danger">{pay.error.message}</p>
        ) : null}
      </section>
    );
  } else {
    content = (
      <section className={card}>
        {plan.isPending ? (
          <div className="h-24 animate-pulse rounded-lg bg-surface-2" />
        ) : plan.data ? (
          <>
            <p className="text-sm font-medium text-accent-text">
              {plan.data.name}
            </p>
            <p className="mt-2 text-4xl font-semibold text-fg">
              {formatMoney(plan.data.price_amount, plan.data.currency)}
              <span className="text-sm font-medium text-muted">
                /{plan.data.interval}
              </span>
            </p>
            {plan.data.description ? (
              <p className="mt-3 text-sm leading-6 text-muted">
                {plan.data.description}
              </p>
            ) : null}
            <button
              className={`mt-6 w-full ${primaryButton}`}
              disabled={pay.isPending}
              onClick={() => pay.mutate()}
              type="button"
            >
              <QrCode size={17} />
              {pay.isPending ? "Preparing QR…" : "Pay with QR"}
            </button>
            {pay.error ? (
              <p className="mt-3 text-sm text-danger">{pay.error.message}</p>
            ) : null}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-fg">
              Seller plans are coming soon
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {plan.isError
                ? "We could not load the seller plan. Try again later."
                : "We are finishing the seller subscription. Check back shortly."}
            </p>
          </>
        )}
      </section>
    );
  }

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-accent-text">
            <Store size={16} />
            Become a seller
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-fg sm:text-5xl">
            Open your store on Servbo.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
            Pay the monthly seller subscription with a QR transfer. An admin
            verifies the payment and activates your seller account, then you
            manage your products from the creator app.
          </p>
          <ol className="mt-8 space-y-3 text-sm text-muted">
            {[
              "Generate your QR payment",
              "Pay it from your bank app, writing the reference in the note",
              "Wait for an admin to confirm the payment",
            ].map((step, index) => (
              <li className="flex items-center gap-3" key={step}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fg text-xs font-semibold text-bg">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <Link
            className="mt-8 inline-flex text-sm font-medium text-accent-text hover:text-accent-text"
            href="/billing"
          >
            View billing history
          </Link>
        </div>
        <div>{content}</div>
      </section>
    </main>
  );
}

function PendingPaymentCard({
  payment,
  refreshing,
  onRefresh,
}: {
  payment: PendingPayment;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payment.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the code is still visible to copy by hand.
    }
  };

  return (
    <section className={card}>
      <p className="inline-flex items-center gap-2 rounded-md bg-warning-soft px-2 py-1 text-xs font-semibold uppercase text-warning">
        <Clock3 size={14} />
        Waiting for confirmation
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">
        An admin will activate your seller account after verifying the payment.
      </p>
      {payment.qr_image_url ? (
        // External S3 URL: a plain <img> avoids configuring next/image hosts.
        // biome-ignore lint/performance/noImgElement: see above
        <img
          alt="QR code to pay the seller subscription"
          className="mx-auto mt-5 aspect-square w-full max-w-72 rounded-lg border border-line object-contain"
          src={payment.qr_image_url}
        />
      ) : null}
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
          <dt className="text-muted">Amount</dt>
          <dd className="text-lg font-semibold text-fg">
            {formatMoney(payment.amount_due, payment.currency)}
          </dd>
        </div>
        <div className="rounded-lg border border-accent/40 bg-accent-soft p-3">
          <dt className="text-accent-text">
            Reference — write it in the payment note
          </dt>
          <dd className="mt-2 flex items-center justify-between gap-3">
            <span className="font-mono text-2xl font-semibold tracking-wider text-fg">
              {payment.reference}
            </span>
            <button
              className="inline-flex min-h-9 items-center gap-2 rounded-md border border-accent/60 bg-surface px-3 text-sm font-medium text-accent-text hover:bg-accent-soft"
              onClick={() => void copy()}
              type="button"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </dd>
        </div>
      </dl>
      {payment.payment_instructions ? (
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted">
          {payment.payment_instructions}
        </p>
      ) : null}
      <button
        className={`mt-5 w-full ${secondaryButton}`}
        disabled={refreshing}
        onClick={onRefresh}
        type="button"
      >
        <RefreshCw className={refreshing ? "animate-spin" : ""} size={16} />
        Refresh status
      </button>
    </section>
  );
}
