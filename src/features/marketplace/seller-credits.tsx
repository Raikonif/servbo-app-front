"use client";

import { ArrowRight, BadgeCheck, Coins, Rocket, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActivateSeller } from "@/hooks/use-billing";
import { useFormat } from "@/i18n/format";
import {
  CREATOR_URL,
  type CreditPricing,
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
  const t = useTranslations("credits");
  return (
    <p className="inline-flex items-center gap-2 rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold uppercase text-accent-text">
      <Coins size={14} />
      {t("count", { count: balance })}
    </p>
  );
}

// How many products a pack publishes at the current prices, for the
// `credits.packCoverage` message ("Publish up to 35 products…").
export function coveredProducts(
  credits: number,
  pricing: CreditPricing | null,
) {
  if (!pricing || pricing.publish_cost <= 0) return null;
  const products = Math.floor(credits / pricing.publish_cost);
  return products > 0 ? products : null;
}

const row =
  "flex items-center justify-between gap-3 rounded-lg border border-line p-3";

// A seller's credits (openspec seller-free-credits): the free ones with
// their reset date, the paid ones, and the way to the creator app.
export function SellerCreditsCard({
  state,
  title,
}: {
  state: SellerSubscriptionState;
  title?: string;
}) {
  const t = useTranslations("credits");
  const format = useFormat();
  const { credits, pricing, products } = state;
  return (
    <section className={card}>
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
        <BadgeCheck size={24} />
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-fg">
        {title ?? t("sellerCard.title")}
      </h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className={row}>
          <dt className="text-muted">{t("free")}</dt>
          <dd className="text-right font-medium text-fg">
            {t("count", { count: credits.free })}
            {credits.free_resets_at ? (
              <span className="block text-xs font-normal text-muted">
                {pricing
                  ? t("resetsTo", {
                      count: pricing.free_credits,
                      date: format.date(credits.free_resets_at),
                    })
                  : t("resetsOn", {
                      date: format.date(credits.free_resets_at),
                    })}
              </span>
            ) : null}
          </dd>
        </div>
        <div className={row}>
          <dt className="text-muted">{t("paid")}</dt>
          <dd className="text-right font-medium text-fg">
            {t("count", { count: credits.paid })}
            <span className="block text-xs font-normal text-muted">
              {t("neverExpire")}
            </span>
          </dd>
        </div>
        <div className={row}>
          <dt className="text-muted">{t("sellerCard.products")}</dt>
          <dd className="text-right font-medium text-fg">
            {t("sellerCard.productsValue", {
              published: products.published,
              drafts: products.drafts,
            })}
          </dd>
        </div>
      </dl>
      {pricing ? (
        <p className="mt-4 text-sm leading-6 text-muted">
          {t("sellerCard.costs", {
            publish: pricing.publish_cost,
            edit: pricing.edit_cost,
          })}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <a className={primaryButton} href={CREATOR_URL}>
          {t("openCreator")}
          <ArrowRight size={17} />
        </a>
        <a className={secondaryButton} href={CREATOR_BILLING_URL}>
          {t("history")}
        </a>
      </div>
    </section>
  );
}

// Becoming a seller is free: one click, then the seller state shows in
// place (no reload) with the link to the creator dashboard.
export function BecomeSellerCard({
  state,
  title,
}: {
  state: SellerSubscriptionState;
  title?: string;
}) {
  const t = useTranslations("credits.becomeSellerCard");
  const activate = useActivateSeller();
  const { pricing, credits } = state;
  return (
    <section className={card}>
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
        <Store size={24} />
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-fg">
        {title ?? t("title")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        {pricing
          ? t("intro", {
              count: pricing.free_credits,
              days: pricing.period_days,
            })
          : t("introDefault")}
        {credits.paid > 0
          ? ` ${t("paidWaiting", { count: credits.paid })}`
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
        {activate.isPending ? t("activating") : t("cta")}
      </button>
    </section>
  );
}
