"use client";

import { ArrowRight, CalendarClock, ReceiptText, Store } from "lucide-react";
import Link from "next/link";
import { useBillingRecords, useSellerSubscription } from "@/hooks/use-billing";
import { formatDate, formatMoney } from "@/lib/billing";
import { EntityTable } from "./entity-table";
import { StatCard } from "./stat-card";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  incomplete: "bg-amber-50 text-amber-700",
  past_due: "bg-red-50 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-semibold uppercase ${
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function BillingPage() {
  const subscriptionQuery = useSellerSubscription();
  const recordsQuery = useBillingRecords();
  const state = subscriptionQuery.data;
  const subscription = state?.subscription ?? null;
  const records = recordsQuery.data ?? [];

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
              Billing
            </p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight text-slate-950">
              Subscription and payments
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Your seller subscription and the history of your QR payments.
            </p>
          </div>
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            {subscriptionQuery.isPending ? (
              <div className="h-20 animate-pulse rounded-lg bg-emerald-100" />
            ) : subscription ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-emerald-800">
                      Current plan
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                      {subscription.name}
                    </p>
                  </div>
                  <StatusBadge status={subscription.status} />
                </div>
                <p className="mt-3 text-sm text-emerald-900">
                  {formatMoney(
                    subscription.price_amount,
                    subscription.currency,
                  )}
                  /{subscription.interval} · until{" "}
                  {formatDate(subscription.current_period_end)}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-emerald-800">
                  No subscription yet
                </p>
                <Link
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-600"
                  href="/become-a-vendor"
                >
                  Become a seller
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </section>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            helper={state?.is_seller ? "Seller account" : "Buyer account"}
            icon={Store}
            label="Account"
            value={state?.is_seller ? "Seller" : "Buyer"}
          />
          <StatCard
            helper="Current period start"
            icon={CalendarClock}
            label="Period start"
            value={formatDate(subscription?.current_period_start)}
          />
          <StatCard
            helper={
              state?.pending_payment
                ? `Pending payment ${state.pending_payment.reference}`
                : "Renew from Become a seller"
            }
            icon={ReceiptText}
            label="Period end"
            value={formatDate(subscription?.current_period_end)}
          />
        </section>

        {recordsQuery.isPending ? (
          <div className="h-64 animate-pulse rounded-lg bg-slate-200/70" />
        ) : recordsQuery.isError ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            We could not load your payment history.
          </section>
        ) : records.length === 0 ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            No payments yet.
          </section>
        ) : (
          <EntityTable
            columns={["Date", "Reference", "Method", "Amount", "Status"]}
            getRowKey={(record) => record.id}
            items={records}
            renderRow={(record) => (
              <>
                <td className="px-5 py-4 text-slate-600">
                  {formatDate(record.paid_at ?? record.created_at)}
                </td>
                <td className="px-5 py-4 font-mono font-medium text-slate-950">
                  {record.bank_transfer_reference || "—"}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {record.payment_method.replaceAll("_", " ")}
                </td>
                <td className="px-5 py-4 font-medium text-slate-950">
                  {formatMoney(
                    record.status === "paid"
                      ? record.amount_paid
                      : record.amount_due,
                    record.currency,
                  )}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={record.status} />
                </td>
              </>
            )}
            title="Payment history"
          />
        )}
      </section>
    </main>
  );
}
