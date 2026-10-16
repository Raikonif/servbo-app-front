"use client";

import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCreditPacks, useSellerSubscription } from "@/hooks/use-billing";
import { useSession } from "@/hooks/use-session";
import { loginHref } from "@/lib/auth/redirect";
import {
  type CreditPack,
  type CreditPricing,
  formatMoney,
  packCoverage,
  plural,
} from "@/lib/billing";

const INCLUDED = [
  "Free seller account and profile",
  "Free credits every cycle to publish and update products",
  "Drafts are always free",
  "Buyer message routing",
  "Paid credits never expire · pay by QR",
];

export function PricingPage() {
  const { data: packs, isPending, isError, refetch } = useCreditPacks();
  const signedIn = Boolean(useSession().data?.authenticated);
  // Credit prices come with the signed-in user's seller state.
  const pricing = useSellerSubscription({ enabled: signedIn }).data?.pricing;
  const ctaHref = signedIn ? "/become-a-vendor" : loginHref("/become-a-vendor");
  const bestValueId = bestValuePackId(packs ?? []);

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
              Sell on Servbo for free.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Becoming a seller costs nothing: every{" "}
              {pricing?.period_days ?? 30} days you get{" "}
              {pricing
                ? plural(pricing.free_credits, "free credit")
                : "free credits"}
              . Publishing a product costs{" "}
              {pricing ? plural(pricing.publish_cost, "credit") : "a credit"}{" "}
              and saving changes to a published product costs{" "}
              {pricing ? plural(pricing.edit_cost, "credit") : "a credit"}.
              Drafts are free. Need more? Buy a credit pack by scanning a QR
              code: paid credits never expire and are spent after the free ones.
            </p>
          </div>
          <aside className="rounded-lg border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-accent-text">
              <ShieldCheck size={17} />
              Every seller gets
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
                We could not load the credit packs.
              </p>
              <button
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-line px-4 text-sm font-medium text-fg hover:border-accent hover:text-accent-text"
                onClick={() => void refetch()}
                type="button"
              >
                Try again
              </button>
            </article>
          ) : !packs?.length ? (
            <article className="max-w-xl rounded-lg border border-line bg-surface p-5 shadow-sm">
              <h2 className="text-2xl font-semibold text-fg">
                Credit packs are not available yet
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                We are getting the seller packs ready. Check back shortly.
              </p>
            </article>
          ) : (
            <ul className="grid gap-4 md:grid-cols-3">
              {packs.slice(0, 3).map((pack) => (
                <li key={pack.id}>
                  <PackCard
                    ctaHref={ctaHref}
                    highlighted={pack.id === bestValueId}
                    pack={pack}
                    pricing={pricing ?? null}
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

// Most credits per boliviano, flagged only when there is more than one pack.
function bestValuePackId(packs: CreditPack[]) {
  if (packs.length < 2) return null;
  let best = packs[0];
  for (const pack of packs) {
    if (perCredit(pack) < perCredit(best)) best = pack;
  }
  return best.id;
}

const perCredit = (pack: CreditPack) =>
  pack.credits ? pack.price_amount / pack.credits : Number.POSITIVE_INFINITY;

function PackCard({
  pack,
  pricing,
  highlighted,
  ctaHref,
}: {
  pack: CreditPack;
  pricing: CreditPricing | null;
  highlighted: boolean;
  ctaHref: string;
}) {
  const coverage = packCoverage(pack.credits, pricing);

  return (
    <article
      className={`flex h-full flex-col rounded-lg border bg-surface p-5 shadow-sm ${
        highlighted ? "border-accent ring-2 ring-accent/40" : "border-line"
      }`}
    >
      <p className="flex items-center justify-between gap-2 text-sm font-medium text-accent-text">
        {plural(pack.credits, "credit")}
        {highlighted ? (
          <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-semibold">
            Best value
          </span>
        ) : null}
      </p>
      <h2 className="mt-1 text-2xl font-semibold text-fg">{pack.name}</h2>
      {pack.description ? (
        <p className="mt-3 text-sm leading-6 text-muted">{pack.description}</p>
      ) : null}
      <p className="mt-5 text-4xl font-semibold text-fg">
        {formatMoney(pack.price_amount, pack.currency)}
      </p>
      <p className="mt-1 min-h-5 flex-1 text-sm text-muted">{coverage}</p>
      <Link
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        href={ctaHref}
      >
        Buy credits
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}
