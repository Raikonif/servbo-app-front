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
  Repeat,
  Store,
  TimerOff,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, type ReactNode, useState } from "react";
import { useSellerPlans, useSellerSubscription } from "@/hooks/use-billing";
import { useNow } from "@/hooks/use-now";
import {
  billingKeys,
  CREATOR_URL,
  formatDate,
  formatMoney,
  INTERVAL_LABELS,
  intervalMonths,
  isExpired,
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
  const plans = useSellerPlans();
  // Picker open over the QR (switch plan) or the seller card (renew).
  const [choosing, setChoosing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const pay = useMutation({
    mutationFn: startSellerPayment,
    onSuccess: (state) => {
      queryClient.setQueryData<SellerSubscriptionState>(
        billingKeys.sellerSubscription,
        state,
      );
      setChoosing(false);
    },
  });

  const state = subscription.data;
  const active =
    state?.is_seller && state.subscription?.status === "active"
      ? state.subscription
      : null;
  const pending = state?.pending_payment ?? null;

  // The pending payment went away (confirmed by the webhook or an admin):
  // close the picker so the seller state shows without a reload.
  const pendingId = pending?.id ?? null;
  const [seenPendingId, setSeenPendingId] = useState(pendingId);
  if (pendingId !== seenPendingId) {
    setSeenPendingId(pendingId);
    if (!pendingId) setChoosing(false);
  }

  const planId =
    selectedPlanId ?? pending?.plan?.id ?? plans.data?.[0]?.id ?? null;
  const choosePlan = (
    <PlanPicker
      busy={pay.isPending}
      error={pay.error?.message ?? null}
      onCancel={
        choosing
          ? () => {
              setChoosing(false);
              pay.reset();
            }
          : undefined
      }
      onRetry={() => void plans.refetch()}
      onSelect={setSelectedPlanId}
      onSubmit={() => {
        if (planId) pay.mutate(planId);
      }}
      plans={plans}
      selectedId={planId}
      title={
        active ? "Renew your plan" : pending ? "Switch plan" : "Choose a plan"
      }
    />
  );

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
  } else if (choosing) {
    content = choosePlan;
  } else if (pending) {
    content = (
      <PendingPaymentCard
        busy={pay.isPending}
        error={pay.error?.message ?? null}
        onNewQr={() => {
          // Same plan again: the backend replaces the expired QR.
          if (pending.plan) pay.mutate(pending.plan.id);
          else setChoosing(true);
        }}
        onRefresh={() => void subscription.refetch()}
        onSwitchPlan={() => {
          pay.reset();
          setSelectedPlanId(pending.plan?.id ?? null);
          setChoosing(true);
        }}
        payment={pending}
        refreshing={subscription.isFetching}
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
            onClick={() => {
              pay.reset();
              setChoosing(true);
            }}
            type="button"
          >
            <RefreshCw size={16} />
            Renew
          </button>
        </div>
      </section>
    );
  } else {
    content = choosePlan;
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
            Choose a monthly, quarterly or yearly plan and pay it with a QR
            transfer. Your seller account is activated as soon as the payment is
            confirmed, then you manage your products from the creator app.
          </p>
          <ol className="mt-8 space-y-3 text-sm text-muted">
            {[
              "Choose a plan and get your QR",
              "Pay it from your bank app before it expires",
              "Your seller account activates once the payment is confirmed",
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

type PlansQuery = ReturnType<typeof useSellerPlans>;

function PlanPicker({
  plans,
  selectedId,
  onSelect,
  onSubmit,
  onCancel,
  onRetry,
  busy,
  error,
  title,
}: {
  plans: PlansQuery;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  onRetry: () => void;
  busy: boolean;
  error: string | null;
  title: string;
}) {
  if (plans.isPending) {
    return (
      <section className={card}>
        <div className="h-48 animate-pulse rounded-lg bg-surface-2" />
      </section>
    );
  }
  if (plans.isError) {
    return (
      <section className={card}>
        <p className="text-sm text-muted">
          We could not load the seller plans.
        </p>
        <button
          className={`mt-4 ${secondaryButton}`}
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
      </section>
    );
  }
  if (!plans.data.length) {
    return (
      <section className={card}>
        <h2 className="text-2xl font-semibold text-fg">
          Seller plans are not available yet
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          We are finishing the seller subscription. Check back shortly.
        </p>
      </section>
    );
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className={card}>
      <form onSubmit={submit}>
        <fieldset>
          <legend className="text-xl font-semibold text-fg">{title}</legend>
          <div className="mt-4 space-y-3">
            {plans.data.map((plan) => {
              const label = INTERVAL_LABELS[plan.interval];
              const months = intervalMonths(plan.interval);
              return (
                <label
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-4 hover:border-accent has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:ring-2 has-focus-visible:ring-accent"
                  key={plan.id}
                >
                  <input
                    checked={plan.id === selectedId}
                    className="mt-1 size-4 shrink-0 accent-accent"
                    name="seller-plan"
                    onChange={() => onSelect(plan.id)}
                    type="radio"
                    value={plan.id}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-fg">
                      {plan.name}
                    </span>
                    <span className="block text-sm text-muted">
                      {label?.adverb ?? plan.interval}
                      {months > 1
                        ? ` · ${formatMoney(
                            Math.round(plan.price_amount / months),
                            plan.currency,
                          )}/month`
                        : null}
                    </span>
                  </span>
                  <span className="shrink-0 text-right font-semibold text-fg">
                    {formatMoney(plan.price_amount, plan.currency)}
                    <span className="block text-xs font-medium text-muted">
                      /{label?.period ?? plan.interval}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        {error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <button
          className={`mt-5 w-full ${primaryButton}`}
          disabled={busy || !selectedId}
          type="submit"
        >
          <QrCode size={17} />
          {busy ? "Preparing QR…" : "Get QR"}
        </button>
        {onCancel ? (
          <button
            className={`mt-3 w-full ${secondaryButton}`}
            disabled={busy}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </form>
    </section>
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

function PendingPaymentCard({
  payment,
  refreshing,
  busy,
  error,
  onRefresh,
  onNewQr,
  onSwitchPlan,
}: {
  payment: PendingPayment;
  refreshing: boolean;
  busy: boolean;
  error: string | null;
  onRefresh: () => void;
  onNewQr: () => void;
  onSwitchPlan: () => void;
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
  const interval = payment.plan
    ? INTERVAL_LABELS[payment.plan.interval]
    : undefined;
  // Relay QRs carry their code as the glosa: the payer types nothing.
  const relay = payment.provider === "relay_qr";
  const partial =
    payment.amount_paid > 0 && payment.amount_paid < payment.amount_due;

  return (
    <section className={card}>
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
      <p className="mt-3 text-sm leading-6 text-muted" role="status">
        {expired
          ? "This QR can no longer be paid. Get a new one to continue."
          : "Your seller account is activated as soon as the payment is confirmed. This page updates on its own."}
      </p>
      {expired ? (
        <button
          className={`mt-5 w-full ${primaryButton}`}
          disabled={busy}
          onClick={onNewQr}
          type="button"
        >
          <RefreshCw className={busy ? "animate-spin" : ""} size={16} />
          {busy ? "Preparing QR…" : "QR expired — get a new one"}
        </button>
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
        <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
          <dt className="text-muted">Amount</dt>
          <dd className="text-lg font-semibold text-fg">
            {formatMoney(payment.amount_due, payment.currency)}
          </dd>
        </div>
        {payment.plan ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
            <dt className="text-muted">Plan</dt>
            <dd className="text-right font-medium text-fg">
              {payment.plan.name}
              {interval ? (
                <span className="text-muted"> · {interval.adverb}</span>
              ) : null}
            </dd>
          </div>
        ) : null}
        {partial ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
            <dt className="text-muted">Received</dt>
            <dd className="text-right font-medium text-fg" role="status">
              {formatMoney(payment.amount_paid, payment.currency)} of{" "}
              {formatMoney(payment.amount_due, payment.currency)}
            </dd>
          </div>
        ) : null}
        {expiresAt && !expired ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
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
              ? "QR code — pay this exact QR without changing the amount or the note"
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
          onClick={onSwitchPlan}
          type="button"
        >
          <Repeat size={16} />
          Switch plan
        </button>
      </div>
    </section>
  );
}
