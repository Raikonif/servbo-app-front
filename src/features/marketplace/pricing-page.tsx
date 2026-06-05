import { ArrowRight, Check, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import type { PricingPlan } from "@/data/billing";

type PricingPageProps = {
  plans: PricingPlan[];
};

export function PricingPage({ plans }: PricingPageProps) {
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
              Plans for sellers growing inside Servbo.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Mocked pricing for catalog capacity, marketplace visibility, and
              operational support. Choose the plan that matches your current
              seller workflow.
            </p>
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <ShieldCheck size={17} />
              All plans include
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Secure seller profiles</li>
              <li>Buyer message routing</li>
              <li>Servbo marketplace listing tools</li>
            </ul>
          </aside>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              className={`rounded-lg border bg-white p-5 shadow-sm ${
                plan.highlighted
                  ? "border-emerald-500 ring-2 ring-emerald-200"
                  : "border-slate-200"
              }`}
              key={plan.id}
            >
              <div className="flex min-h-40 flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">
                        {plan.audience}
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                        {plan.name}
                      </h2>
                    </div>
                    {plan.highlighted ? (
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold uppercase text-emerald-700">
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {plan.description}
                  </p>
                </div>
                <p className="text-4xl font-semibold text-slate-950">
                  Bs. {plan.price}
                  <span className="text-sm font-medium text-slate-500">
                    /{plan.interval}
                  </span>
                </p>
              </div>

              <Link
                className={`mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-medium ${
                  plan.highlighted
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                }`}
                href="/billing"
              >
                Choose {plan.name}
                <ArrowRight size={16} />
              </Link>

              <section className="mt-5 border-t border-slate-200 pt-5">
                <h3 className="text-sm font-semibold text-slate-950">
                  Features
                </h3>
                <ul className="mt-3 space-y-3 text-sm text-slate-600">
                  {plan.features.map((feature) => (
                    <li className="flex gap-2" key={feature}>
                      <Check
                        className="mt-0.5 shrink-0 text-emerald-600"
                        size={16}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-5 grid gap-2">
                {plan.limits.map((limit) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm"
                    key={limit.label}
                  >
                    <span className="text-slate-500">{limit.label}</span>
                    <span className="font-medium text-slate-950">
                      {limit.value}
                    </span>
                  </div>
                ))}
              </section>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[240px_1fr_auto] lg:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Gauge size={20} />
              </span>
              <div>
                <h2 className="font-semibold text-slate-950">
                  Need more capacity?
                </h2>
                <p className="text-sm text-slate-500">Custom limits</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Larger seller networks can request custom product caps, dedicated
              review queues, and expanded team access.
            </p>
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
              type="button"
            >
              Contact sales
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
