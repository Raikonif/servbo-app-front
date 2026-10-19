"use client";

import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Clock3,
  Copy,
  RefreshCw,
  TimerOff,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";
import {
  useSellerSubscription,
  useShowBillingState,
} from "@/hooks/use-billing";
import { useNow } from "@/hooks/use-now";
import { useFormat } from "@/i18n/format";
import { Link, useRouter } from "@/i18n/navigation";
import {
  CREATOR_URL,
  cancelPayment,
  isExpired,
  type LastPurchase,
  type PendingPayment,
  type SellerSubscriptionState,
  startPackPayment,
} from "@/lib/billing";
import {
  BalanceBadge,
  BecomeSellerCard,
  CREATOR_BILLING_URL,
  card,
  payHref,
  primaryButton,
  secondaryButton,
} from "./seller-credits";

// The payment step (openspec subscription-payments "Customer buys a pack in
// the app"): the pending pack QR, polled until it is confirmed, then the
// new balance (and, for a non-seller, the become-a-seller button). Anything else goes back to /become-a-vendor.
export function BecomeVendorPayPage() {
  const t = useTranslations("becomeSeller.pay");
  const tc = useTranslations("credits");
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
        <p className="text-sm text-muted">{t("loadError")}</p>
        <button
          className={`mt-4 ${secondaryButton}`}
          onClick={() => void subscription.refetch()}
          type="button"
        >
          {tc("tryAgain")}
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
          {t("back")}
        </Link>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-fg">
          {view === "paid" ? t("confirmed") : t("title")}
        </h1>
        <div className="mt-6 space-y-6">{content}</div>
        <p className="mt-6 text-xs text-muted">{t("footnote")}</p>
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
  const t = useTranslations("becomeSeller.pay");
  const tc = useTranslations("credits");
  const format = useFormat();
  const { credits } = state;
  const pack = purchase.pack
    ? tc("packName", { name: purchase.pack.name })
    : t("creditPack");
  return (
    <>
      <section className={card}>
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
          <CircleCheck size={24} />
        </span>
        <h2 className="mt-4 text-2xl font-semibold text-fg" role="status">
          {t("added", { count: purchase.credits })}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {purchase.paid_at
            ? t("purchased", { pack, date: format.date(purchase.paid_at) })
            : t("purchasedNoDate", { pack })}
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className={row}>
            <dt className="text-muted">{tc("paid")}</dt>
            <dd className="font-medium text-fg">
              {tc("count", { count: credits.paid })}
            </dd>
          </div>
          {state.is_seller ? (
            <div className={row}>
              <dt className="text-muted">{tc("free")}</dt>
              <dd className="text-right font-medium text-fg">
                {tc("count", { count: credits.free })}
                {credits.free_resets_at ? (
                  <span className="block text-xs font-normal text-muted">
                    {tc("resetsOn", {
                      date: format.date(credits.free_resets_at),
                    })}
                  </span>
                ) : null}
              </dd>
            </div>
          ) : null}
          <div className={row}>
            <dt className="text-muted">{t("total")}</dt>
            <dd className="text-lg font-semibold text-fg">
              {tc("count", { count: credits.total })}
            </dd>
          </div>
        </dl>
        {state.is_seller ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <a className={primaryButton} href={CREATOR_URL}>
              {tc("openCreator")}
              <ArrowRight size={17} />
            </a>
            <a className={secondaryButton} href={CREATOR_BILLING_URL}>
              {tc("history")}
            </a>
          </div>
        ) : null}
      </section>
      {state.is_seller ? null : (
        <BecomeSellerCard state={state} title={t("openStoreTitle")} />
      )}
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
  const t = useTranslations("becomeSeller");
  const tc = useTranslations("credits");
  const format = useFormat();
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
            {t("qrExpired")}
          </p>
        ) : (
          <p className="inline-flex items-center gap-2 rounded-md bg-warning-soft px-2 py-1 text-xs font-semibold uppercase text-warning">
            <Clock3 size={14} />
            {t("pay.waiting")}
          </p>
        )}
        {credits ? <BalanceBadge balance={credits} /> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-muted" role="status">
        {expired ? t("pay.expiredText") : t("pay.waitingText")}
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
            {busy ? t("pay.preparingQr") : t("pay.newQr")}
          </button>
        ) : null
      ) : payment.qr_image_url ? (
        // A storage/provider URL or a data URI: a plain <img> handles both
        // without configuring next/image hosts.
        // biome-ignore lint/performance/noImgElement: see above
        <img
          alt={t("pay.qrAlt", {
            amount: format.money(payment.amount_due, payment.currency),
            reference: payment.reference,
          })}
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
            <dt className="text-muted">{t("pay.pack")}</dt>
            <dd className="text-right font-medium text-fg">
              {payment.pack.name}
              {credits ? (
                <span className="text-muted">
                  {" "}
                  · {tc("count", { count: credits })}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
        <div className={row}>
          <dt className="text-muted">{t("pay.amount")}</dt>
          <dd className="text-lg font-semibold text-fg">
            {format.money(payment.amount_due, payment.currency)}
          </dd>
        </div>
        {payment.promotion ? (
          <div className={row}>
            <dt className="text-muted">{t("pay.code")}</dt>
            <dd className="text-right font-medium text-fg">
              {payment.promotion.code}
              {payment.original_amount &&
              payment.original_amount > payment.amount_due ? (
                <span className="text-muted">
                  {" "}
                  ·{" "}
                  {t("pay.was", {
                    amount: format.money(
                      payment.original_amount,
                      payment.currency,
                    ),
                  })}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
        {partial ? (
          <div className={row}>
            <dt className="text-muted">{t("pay.received")}</dt>
            <dd className="text-right font-medium text-fg" role="status">
              {t("pay.receivedValue", {
                paid: format.money(payment.amount_paid, payment.currency),
                due: format.money(payment.amount_due, payment.currency),
              })}
            </dd>
          </div>
        ) : null}
        {expiresAt && !expired ? (
          <div className={row}>
            <dt className="text-muted">{t("pay.expiresIn")}</dt>
            <dd className="font-mono font-semibold text-fg" role="timer">
              {now === null
                ? "—"
                : formatCountdown(new Date(expiresAt).getTime() - now)}
            </dd>
          </div>
        ) : null}
        <div className="rounded-lg border border-accent/40 bg-accent-soft p-3">
          <dt className="text-accent-text">
            {relay ? t("pay.relayLabel") : t("pay.referenceLabel")}
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
                {copied ? t("pay.copied") : t("pay.copy")}
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
          {t("pay.refresh")}
        </button>
        <button
          className={secondaryButton}
          disabled={busy}
          onClick={onCancel}
          type="button"
        >
          <X size={16} />
          {t("cancel")}
        </button>
      </div>
    </section>
  );
}
