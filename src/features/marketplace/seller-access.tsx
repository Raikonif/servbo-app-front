"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  Lightbulb,
  Minus,
  Plus,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  type AccessMode,
  accessCost,
  activateAccess,
  billingKeys,
  CREATOR_URL,
  formatDate,
  MAX_SLOTS,
  modeLabel,
  plural,
  type SellerSubscription,
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

// Shows a state returned by a billing mutation without a refetch; the
// receipts and the credit history may have changed with it.
export function useShowBillingState() {
  const queryClient = useQueryClient();
  return (state: SellerSubscriptionState) => {
    queryClient.setQueryData<SellerSubscriptionState>(
      billingKeys.sellerSubscription,
      state,
    );
    void queryClient.invalidateQueries({ queryKey: billingKeys.records });
    void queryClient.invalidateQueries({ queryKey: billingKeys.creditEntries });
  };
}

export function BalanceBadge({ balance }: { balance: number }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold uppercase text-accent-text">
      <Coins size={14} />
      {plural(balance, "credit")}
    </p>
  );
}

const clampSlots = (value: number, min: number) =>
  Math.min(Math.max(Math.round(value) || 0, min), MAX_SLOTS);

// Spend credits on seller access (openspec seller-credits): Monthly with
// unlimited products, or Per product with a slot count. Shown while the user
// has credits and no running access, here and on the payment step.
export function ModeChooser({
  state,
  title = "Choose how to use your credits",
}: {
  state: SellerSubscriptionState;
  title?: string;
}) {
  const queryClient = useQueryClient();
  const showState = useShowBillingState();
  const pricing = state.pricing;
  const balance = state.wallet.balance;
  // Never fewer slots than products already listed.
  const minSlots = Math.min(Math.max(state.products_used, 1), MAX_SLOTS);
  const [mode, setMode] = useState<AccessMode>(() =>
    pricing && balance < pricing.monthly_fee ? "per_product" : "monthly",
  );
  const [slots, setSlots] = useState(minSlots);
  const activate = useMutation({
    mutationFn: activateAccess,
    onSuccess: showState,
    // Prices or the balance may have changed: show the current ones.
    onError: () =>
      void queryClient.invalidateQueries({
        queryKey: billingKeys.sellerSubscription,
      }),
  });

  if (!pricing) return null;
  const count = clampSlots(slots, minSlots);
  const monthlyCost = pricing.monthly_fee;
  const perProductCost = accessCost(pricing, "per_product", count);
  const cost = mode === "monthly" ? monthlyCost : perProductCost;
  const short = balance < cost;
  const products = plural(count, "product");
  const hint =
    perProductCost < monthlyCost
      ? `For ${products}, Per product is cheaper: ${perProductCost} vs ${monthlyCost} credits.`
      : perProductCost === monthlyCost
        ? `For ${products} both cost ${monthlyCost} credits, and Monthly has no product limit.`
        : `For ${products}, Monthly is cheaper: ${monthlyCost} vs ${perProductCost} credits, with no product limit.`;
  const option =
    "flex cursor-pointer items-start gap-3 rounded-lg border border-line p-4 hover:border-accent has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:ring-2 has-focus-visible:ring-accent";

  return (
    <section className={card}>
      <BalanceBadge balance={balance} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (short || activate.isPending) return;
          activate.mutate(
            mode === "monthly" ? { mode } : { mode, slots: count },
          );
        }}
      >
        <fieldset className="mt-4">
          <legend className="text-xl font-semibold text-fg">{title}</legend>
          <p className="mt-1 text-sm leading-6 text-muted">
            Seller access lasts {pricing.period_days} days and renews from your
            balance when it ends.
          </p>
          <div className="mt-4 space-y-3">
            <label className={option}>
              <input
                checked={mode === "monthly"}
                className="mt-1 size-4 shrink-0 accent-accent"
                name="access-mode"
                onChange={() => setMode("monthly")}
                type="radio"
                value="monthly"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-fg">Monthly</span>
                <span className="block text-sm text-muted">
                  Unlimited products for {pricing.period_days} days
                </span>
              </span>
              <span className="shrink-0 text-right font-semibold text-fg">
                {monthlyCost}
                <span className="block text-xs font-medium text-muted">
                  credits
                </span>
              </span>
            </label>
            <label className={option}>
              <input
                checked={mode === "per_product"}
                className="mt-1 size-4 shrink-0 accent-accent"
                name="access-mode"
                onChange={() => setMode("per_product")}
                type="radio"
                value="per_product"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-fg">Per product</span>
                <span className="block text-sm text-muted">
                  {plural(pricing.product_fee, "credit")} per product for{" "}
                  {pricing.period_days} days
                </span>
              </span>
              <span className="shrink-0 text-right font-semibold text-fg">
                {perProductCost}
                <span className="block text-xs font-medium text-muted">
                  credits
                </span>
              </span>
            </label>
          </div>
        </fieldset>
        {mode === "per_product" ? (
          <div className="mt-4 rounded-lg border border-line p-4">
            <label className="text-sm font-medium text-fg" htmlFor="slot-count">
              Products you can post
            </label>
            <div className="mt-2 flex items-center gap-2">
              <button
                aria-label="One product less"
                className="inline-flex size-11 items-center justify-center rounded-md border border-line text-fg hover:border-accent disabled:opacity-40"
                disabled={count <= minSlots}
                onClick={() => setSlots(count - 1)}
                type="button"
              >
                <Minus size={16} />
              </button>
              <input
                className="min-h-11 w-20 rounded-md border border-line bg-surface px-3 text-center font-semibold text-fg outline-none focus:border-accent"
                id="slot-count"
                inputMode="numeric"
                max={MAX_SLOTS}
                min={minSlots}
                onBlur={() => setSlots(count)}
                onChange={(event) => setSlots(Number(event.target.value))}
                type="number"
                value={slots || ""}
              />
              <button
                aria-label="One product more"
                className="inline-flex size-11 items-center justify-center rounded-md border border-line text-fg hover:border-accent disabled:opacity-40"
                disabled={count >= MAX_SLOTS}
                onClick={() => setSlots(count + 1)}
                type="button"
              >
                <Plus size={16} />
              </button>
              <span className="text-sm text-muted">
                = {plural(perProductCost, "credit")}
              </span>
            </div>
            {state.products_used > 0 ? (
              <p className="mt-2 text-xs text-muted">
                You have {plural(state.products_used, "product")}: choose at
                least {minSlots} or delete some first.
              </p>
            ) : null}
          </div>
        ) : null}
        <p className="mt-4 flex gap-2 text-sm leading-6 text-muted">
          <Lightbulb className="mt-1 shrink-0 text-accent-text" size={15} />
          {hint}
        </p>
        {activate.error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {activate.error.message}
          </p>
        ) : null}
        <button
          className={`mt-5 w-full ${primaryButton}`}
          disabled={short || activate.isPending}
          type="submit"
        >
          <Rocket size={17} />
          {activate.isPending
            ? "Activating…"
            : `Activate · ${plural(cost, "credit")}`}
        </button>
        {short ? (
          <p className="mt-3 text-sm text-muted">
            You need {plural(cost - balance, "more credit", "more credits")}.{" "}
            <Link
              className="font-medium text-accent-text hover:underline"
              href="/become-a-vendor#packs"
            >
              Buy credits
            </Link>
          </p>
        ) : null}
      </form>
    </section>
  );
}

// What happens at the end of the period (openspec seller-credits renewal).
export function renewalText(
  subscription: SellerSubscription,
  balance: number,
): string {
  const end = formatDate(subscription.current_period_end);
  if (!subscription.auto_renew) {
    return `Auto-renew is off: your access ends on ${end}.`;
  }
  const next = modeLabel(
    subscription.next_mode,
    subscription.next_product_limit,
  );
  if (balance >= subscription.renewal_cost) {
    return `Renews on ${end} for ${plural(subscription.renewal_cost, "credit")} (${next}).`;
  }
  return `Renewing on ${end} takes ${plural(subscription.renewal_cost, "credit")} (${next}) and you have ${balance}: your access ends then unless you add credits.`;
}

// The running seller access: balance, mode, period end and renewal.
export function SellerAccessCard({
  state,
  subscription,
}: {
  state: SellerSubscriptionState;
  subscription: SellerSubscription;
}) {
  const perProduct = subscription.mode === "per_product";
  const free = subscription.promotion;
  const rows: [string, string][] = [
    ["Credits", plural(state.wallet.balance, "credit")],
    [
      "Mode",
      perProduct
        ? `Per product · ${state.products_used} of ${subscription.product_limit ?? 0} used`
        : "Monthly · unlimited products",
    ],
    [
      free ? "Free until" : "Access until",
      free
        ? `${formatDate(free.free_until ?? subscription.current_period_end)} (code ${free.code})`
        : formatDate(subscription.current_period_end),
    ],
  ];

  return (
    <section className={card}>
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
        <BadgeCheck size={24} />
      </span>
      <h2 className="mt-4 text-2xl font-semibold text-fg">You're a seller</h2>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div
            className="flex items-center justify-between gap-3 rounded-lg border border-line p-3"
            key={label}
          >
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-medium text-fg">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm leading-6 text-muted">
        {renewalText(subscription, state.wallet.balance)}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a className={primaryButton} href={CREATOR_URL}>
          Open the creator app
          <ArrowRight size={17} />
        </a>
        <a className={secondaryButton} href={CREATOR_BILLING_URL}>
          Manage access
        </a>
      </div>
    </section>
  );
}
