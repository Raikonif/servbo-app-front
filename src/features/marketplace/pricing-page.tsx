"use client";

import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSellerPlan } from "@/hooks/use-billing";
import { useSession } from "@/hooks/use-session";
import { loginHref } from "@/lib/auth/redirect";
import { formatMoney } from "@/lib/billing";

const INCLUDED = [
  "Secure seller profile",
  "Unlimited product listings in the creator app",
  "Buyer message routing",
  "Pay monthly with a QR transfer",
];

export function PricingPage() {
  const { data: plan, isPending, isError, refetch } = useSellerPlan();
  const signedIn = Boolean(useSession().data?.authenticated);
  const ctaHref = signedIn ? "/become-a-vendor" : loginHref("/become-a-vendor");

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-emerald-700">
              <Sparkles size={16} />
              Pricing
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Sell on Servbo with one simple monthly plan.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Pay by scanning a QR code. Once an admin confirms your payment,
              your account is upgraded to seller.
            </p>
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <ShieldCheck size={17} />
              The seller plan includes
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {INCLUDED.map((item) => (
                <li className="flex gap-2" key={item}>
                  <Check
                    className="mt-0.5 shrink-0 text-emerald-600"
                    size={16}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="mt-8 max-w-xl">
          {isPending ? (
            <div className="h-64 animate-pulse rounded-lg bg-slate-200/70" />
          ) : isError ? (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-600">
                We could not load the seller plan.
              </p>
              <button
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                onClick={() => void refetch()}
                type="button"
              >
                Try again
              </button>
            </article>
          ) : !plan ? (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-950">
                Seller plans are coming soon
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                We are finishing the seller subscription. Check back shortly.
              </p>
            </article>
          ) : (
            <article className="rounded-lg border border-emerald-500 bg-white p-5 shadow-sm ring-2 ring-emerald-200">
              <p className="text-sm font-medium text-emerald-700">Sellers</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                {plan.name}
              </h2>
              {plan.description ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {plan.description}
                </p>
              ) : null}
              <p className="mt-5 text-4xl font-semibold text-slate-950">
                {formatMoney(plan.price_amount, plan.currency)}
                <span className="text-sm font-medium text-slate-500">
                  /{plan.interval}
                </span>
              </p>
              <Link
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500"
                href={ctaHref}
              >
                Become a seller
                <ArrowRight size={16} />
              </Link>
            </article>
          )}
        </section>
      </section>
    </main>
  );
}
