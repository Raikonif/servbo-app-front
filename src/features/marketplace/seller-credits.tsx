"use client";

import { ArrowRight, BadgeCheck, Coins, Rocket, Store } from "lucide-react";
import { useActivateSeller } from "@/hooks/use-billing";
import {
  CREATOR_URL,
  type CreditPricing,
  formatDate,
  plural,
  type SellerSubscriptionState,
} from "@/lib/billing";

export const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60";
export const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line px-5 text-sm font-medium text-fg hover:border-accent hover:text-accent-text disabled:opacity-60";
export const card = "rounded-lg border border-line bg-surface p-6 shadow-sm";

export const CREATOR_BILLING_URL = `${CREATOR_URL}/dashboard/billing`;

// The payment step for a pack payment (pending or just confirmed).
export const payHref = (paymentId: string) =>
  `/become-a-vendor/pay?payment=${encodeURIComponent(paymentId)}`;

export function BalanceBadge({ balance }: { balance: number }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold uppercase text-accent-text">
      <Coins size={14} />
      {plural(balance, "credit")}
    </p>
  );
}

// "Publishing a product costs 1 credit and saving changes to a published
// product costs 1 credit. Drafts are free."
export const costsText = (pricing: CreditPricing) =>
  `Publishing a product costs ${plural(pricing.publish_cost, "credit")} and saving changes to a published product costs ${plural(pricing.edit_cost, "credit")}. Drafts are free.`;

const row =
  "flex items-center justify-between gap-3 rounded-lg border border-line p-3";

// A seller's credits (openspec seller-free-credits): the free ones with
// their reset date, the paid ones, and the way to the creator app.
export function SellerCreditsCard({
  state,
  title = "You're a seller",
}: {
  state: SellerSubscriptionState;
  title?: string;
}) {
  const { credits, pricing, products } = state;
  return (
    <section className={card}>
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
        <BadgeCheck size={24} />
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-fg">{title}</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className={row}>
          <dt className="text-muted">Free credits</dt>
          <dd className="text-right font-medium text-fg">
            {plural(credits.free, "credit")}
            {credits.free_resets_at ? (
              <span className="block text-xs font-normal text-muted">
                {pricing
                  ? `Back to ${pricing.free_credits} on ${formatDate(credits.free_resets_at)}`
                  : `Reset on ${formatDate(credits.free_resets_at)}`}
              </span>
            ) : null}
          </dd>
        </div>
        <div className={row}>
          <dt className="text-muted">Paid credits</dt>
          <dd className="text-right font-medium text-fg">
            {plural(credits.paid, "credit")}
            <span className="block text-xs font-normal text-muted">
              Never expire
            </span>
          </dd>
        </div>
        <div className={row}>
          <dt className="text-muted">Products</dt>
          <dd className="text-right font-medium text-fg">
            {products.published} published · {plural(products.drafts, "draft")}
          </dd>
        </div>
      </dl>
      {pricing ? (
        <p className="mt-4 text-sm leading-6 text-muted">
          {costsText(pricing)} Free credits are spent first.
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <a className={primaryButton} href={CREATOR_URL}>
          Open the creator dashboard
          <ArrowRight size={17} />
        </a>
        <a className={secondaryButton} href={CREATOR_BILLING_URL}>
          Credit history
        </a>
      </div>
    </section>
  );
}

// Becoming a seller is free: one click, then the seller state shows in
// place (no reload) with the link to the creator dashboard.
export function BecomeSellerCard({
  state,
  title = "Start selling for free",
}: {
  state: SellerSubscriptionState;
  title?: string;
}) {
  const activate = useActivateSeller();
  const { pricing, credits } = state;
  return (
    <section className={card}>
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
        <Store size={24} />
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-fg">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        {pricing
          ? `Open your store at no cost and get ${plural(pricing.free_credits, "free credit")} every ${pricing.period_days} days.`
          : "Open your store at no cost and get free credits every month."}
        {credits.paid > 0
          ? ` Your ${plural(credits.paid, "paid credit")} will be waiting for you.`
          : ""}
      </p>
      {activate.error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {activate.error.message}
        </p>
      ) : null}
      <button
        className={`mt-5 w-full ${primaryButton}`}
        disabled={activate.isPending}
        onClick={() => activate.mutate()}
        type="button"
      >
        <Rocket size={17} />
        {activate.isPending ? "Activating…" : "Become a seller for free"}
      </button>
    </section>
  );
}
