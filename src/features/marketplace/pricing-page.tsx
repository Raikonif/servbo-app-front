"use client";

import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSellerPlans } from "@/hooks/use-billing";
import { useSession } from "@/hooks/use-session";
import { loginHref } from "@/lib/auth/redirect";
import {
  formatMoney,
  INTERVAL_LABELS,
  intervalMonths,
  type SellerPlan,
} from "@/lib/billing";

const INCLUDED = [
  "Secure seller profile",
  "Unlimited product listings in the creator app",
  "Buyer message routing",
  "Pay by QR monthly, quarterly or yearly",
];

export function PricingPage() {
  const { data: plans, isPending, isError, refetch } = useSellerPlans();
  const signedIn = Boolean(useSession().data?.authenticated);
  const ctaHref = signedIn ? "/become-a-vendor" : loginHref("/become-a-vendor");
  const bestValueId = bestValuePlanId(plans ?? []);

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-accent-text">
              <Sparkles size={16} />
              Pricing
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-fg sm:text-5xl">
              Sell on Servbo with a simple seller plan.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Pick a period and pay by scanning a QR code. As soon as the
              payment is confirmed, your account is upgraded to seller.
            </p>
          </div>
          <aside className="rounded-lg border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-accent-text">
              <ShieldCheck size={17} />
              The seller plan includes
            </div>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {INCLUDED.map((item) => (
                <li className="flex gap-2" key={item}>
                  <Check
                    className="mt-0.5 shrink-0 text-accent-text"
                    size={16}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="mt-8">
          {isPending ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((key) => (
                <div
                  className="h-64 animate-pulse rounded-lg bg-surface-2"
                  key={key}
                />
              ))}
            </div>
          ) : isError ? (
            <article className="max-w-xl rounded-lg border border-line bg-surface p-5 shadow-sm">
              <p className="text-sm text-muted">
                We could not load the seller plans.
              </p>
              <button
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-line px-4 text-sm font-medium text-fg hover:border-accent hover:text-accent-text"
                onClick={() => void refetch()}
                type="button"
              >
                Try again
              </button>
            </article>
          ) : !plans?.length ? (
            <article className="max-w-xl rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-2xl font-semibold text-fg">
                Seller plans are not available yet
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                We are finishing the seller subscription. Check back shortly.
              </p>
            </article>
          ) : (
            <ul className="grid gap-4 md:grid-cols-3">
              {plans.slice(0, 3).map((plan) => (
                <li key={plan.id}>
                  <PlanCard
                    ctaHref={ctaHref}
                    highlighted={plan.id === bestValueId}
                    plan={plan}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

// Lowest per-month price, flagged only when there is more than one plan.
function bestValuePlanId(plans: SellerPlan[]) {
  if (plans.length < 2) return null;
  let best = plans[0];
  for (const plan of plans) {
    if (perMonth(plan) < perMonth(best)) best = plan;
  }
  return best.id;
}

const perMonth = (plan: SellerPlan) =>
  Math.round(plan.price_amount / intervalMonths(plan.interval));

function PlanCard({
  plan,
  highlighted,
  ctaHref,
}: {
  plan: SellerPlan;
  highlighted: boolean;
  ctaHref: string;
}) {
  const label = INTERVAL_LABELS[plan.interval];
  const months = intervalMonths(plan.interval);

  return (
    <article
      className={`flex h-full flex-col rounded-lg border bg-surface p-5 shadow-sm ${
        highlighted ? "border-accent ring-2 ring-accent/40" : "border-line"
      }`}
    >
      <p className="flex items-center justify-between gap-2 text-sm font-medium text-accent-text">
        {label?.adverb ?? plan.interval}
        {highlighted ? (
          <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-semibold">
            Best value
          </span>
        ) : null}
      </p>
      <h2 className="mt-1 text-2xl font-semibold text-fg">{plan.name}</h2>
      {plan.description ? (
        <p className="mt-3 text-sm leading-6 text-muted">{plan.description}</p>
      ) : null}
      <p className="mt-5 text-4xl font-semibold text-fg">
        {formatMoney(plan.price_amount, plan.currency)}
        <span className="text-sm font-medium text-muted">
          /{label?.period ?? plan.interval}
        </span>
      </p>
      <p className="mt-1 min-h-5 flex-1 text-sm text-muted">
        {months > 1
          ? `${formatMoney(perMonth(plan), plan.currency)}/month`
          : null}
      </p>
      <Link
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        href={ctaHref}
      >
        Become a seller
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}
