import {
  ArrowRight,
  CreditCard,
  Download,
  ReceiptText,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type { BillingAccount, PricingPlan } from "@/data/billing";

type BillingPageProps = {
  account: BillingAccount;
  plans: PricingPlan[];
};

export function BillingPage({ account, plans }: BillingPageProps) {
  const currentPlan =
    plans.find((plan) => plan.id === account.currentPlanId) ?? plans[0];

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
              Billing
            </p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight text-slate-950">
              Subscription and invoices
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Review the mocked workspace subscription, payment method, invoice
              history, and current plan usage for {account.company}.
            </p>
          </div>
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-emerald-800">
                  Current plan
                </p>
                <p className="mt-1 text-3xl font-semibold text-slate-950">
                  {currentPlan.name}
                </p>
              </div>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold uppercase text-emerald-700">
                {account.subscription.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-emerald-900">
              Renews {account.subscription.renewalDate}
            </p>
          </section>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {account.metrics.map((metric) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={metric.label}
            >
              <p className="text-sm font-medium text-slate-500">
                {metric.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{metric.helper}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
                <div className="flex items-center gap-2">
                  <ReceiptText className="text-emerald-700" size={20} />
                  <h2 className="text-lg font-semibold text-slate-950">
                    Invoice history
                  </h2>
                </div>
                <button
                  className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                  type="button"
                >
                  <Download size={15} />
                  Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Invoice</th>
                      <th className="px-5 py-3 font-semibold">Date</th>
                      <th className="px-5 py-3 font-semibold">Method</th>
                      <th className="px-5 py-3 font-semibold">Amount</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {account.invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-5 py-4 font-medium text-slate-950">
                          {invoice.number}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {invoice.date}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {invoice.method}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-950">
                          {invoice.amount}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold uppercase text-emerald-700">
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <UsersRound className="text-emerald-700" size={20} />
                <h2 className="text-lg font-semibold text-slate-950">
                  Plan usage
                </h2>
              </div>
              <div className="mt-5 space-y-5">
                {account.usage.map((item) => (
                  <UsageBar
                    key={item.label}
                    label={item.label}
                    limit={item.limit}
                    unit={item.unit}
                    used={item.used}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="text-emerald-700" size={20} />
                <h2 className="text-lg font-semibold text-slate-950">
                  Payment method
                </h2>
              </div>
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-300">
                  {account.paymentMethod.brand}
                </p>
                <p className="mt-6 text-2xl font-semibold tracking-normal">
                  •••• •••• •••• {account.paymentMethod.last4}
                </p>
                <div className="mt-5 flex justify-between gap-3 text-sm text-slate-300">
                  <span>{account.paymentMethod.holder}</span>
                  <span>{account.paymentMethod.expires}</span>
                </div>
              </div>
              <button
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                type="button"
              >
                Update payment method
              </button>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Billing profile
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <BillingFact label="Company" value={account.company} />
                <BillingFact label="Owner" value={account.owner} />
                <BillingFact label="Email" value={account.email} />
                <BillingFact label="Tax ID" value={account.taxId} />
              </dl>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <ShieldCheck size={17} />
                Billing controls
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Change plans, review pricing, and prepare the workspace for
                higher listing volume.
              </p>
              <Link
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500"
                href="/pricing"
              >
                View pricing
                <ArrowRight size={16} />
              </Link>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function BillingFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-950">{value}</dd>
    </div>
  );
}

function UsageBar({
  label,
  limit,
  unit,
  used,
}: {
  label: string;
  limit: number;
  unit: string;
  used: number;
}) {
  const percentage = Math.min(Math.round((used / limit) * 100), 100);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="font-medium text-slate-950">{label}</p>
        <p className="text-slate-500">
          {used} / {limit} {unit}
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
