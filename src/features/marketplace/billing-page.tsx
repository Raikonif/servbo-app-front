"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Coins,
  Gift,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  useBillingRecords,
  useCreditEntries,
  useSellerSubscription,
} from "@/hooks/use-billing";
import {
  CREDIT_ENTRY_LABELS,
  formatDate,
  formatMoney,
  plural,
} from "@/lib/billing";
import { EntityTable } from "./entity-table";
import { StatCard } from "./stat-card";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-accent-soft text-accent-text",
  paid: "bg-accent-soft text-accent-text",
  pending: "bg-warning-soft text-warning",
  incomplete: "bg-warning-soft text-warning",
  past_due: "bg-danger-soft text-danger",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-semibold uppercase ${
        STATUS_STYLES[status] ?? "bg-surface-2 text-muted"
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
  const credits = state?.credits;
  const pricing = state?.pricing ?? null;
  const records = recordsQuery.data ?? [];

  return (
    <main>
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-accent-text">
              Billing
            </p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight text-fg">
              Credits and payments
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Your credits, how they were spent and the receipts of your QR
              payments.
              {pricing
                ? ` Publishing a product costs ${plural(pricing.publish_cost, "credit")}, saving changes to a published product ${plural(pricing.edit_cost, "credit")}; drafts are free.`
                : ""}
            </p>
          </div>
          <section className="rounded-lg border border-accent/40 bg-accent-soft p-5">
            {subscriptionQuery.isPending ? (
              <div className="h-20 animate-pulse rounded-lg bg-accent-soft" />
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-accent-text">
                      Credits
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-fg">
                      {plural(credits?.total ?? 0, "credit")}
                    </p>
                  </div>
                  {state?.is_seller ? <StatusBadge status="active" /> : null}
                </div>
                <p className="mt-3 text-sm text-accent-text">
                  {state?.is_seller
                    ? `${credits?.free ?? 0} free · ${credits?.paid ?? 0} paid`
                    : "Becoming a seller is free"}
                </p>
                <Link
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent-text hover:text-accent-text"
                  href="/become-a-vendor"
                >
                  {state?.is_seller
                    ? "Buy more credits"
                    : "Open your store for free"}
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
            helper={
              state?.is_seller && credits?.free_resets_at
                ? `Back to ${pricing?.free_credits ?? "full"} on ${formatDate(credits.free_resets_at)}`
                : "Given to every seller each cycle"
            }
            icon={Gift}
            label="Free credits"
            value={(credits?.free ?? 0).toLocaleString("en-US")}
          />
          <StatCard
            helper={
              state?.pending_payment
                ? `Pending payment ${state.pending_payment.reference}`
                : "Never expire"
            }
            icon={Coins}
            label="Paid credits"
            value={(credits?.paid ?? 0).toLocaleString("en-US")}
          />
        </section>

        {recordsQuery.isPending ? (
          <div className="h-64 animate-pulse rounded-lg bg-surface-2" />
        ) : recordsQuery.isError ? (
          <section className="rounded-lg border border-line bg-surface p-5 text-sm text-muted shadow-sm">
            We could not load your payment history.
          </section>
        ) : records.length === 0 ? (
          <section className="rounded-lg border border-line bg-surface p-5 text-sm text-muted shadow-sm">
            No payments yet.
          </section>
        ) : (
          <EntityTable
            columns={[
              "Date",
              "Reference",
              "Pack",
              "Method",
              "Amount",
              "Status",
            ]}
            getRowKey={(record) => record.id}
            items={records}
            renderRow={(record) => (
              <>
                <td className="px-5 py-4 text-muted">
                  {formatDate(record.paid_at ?? record.created_at)}
                </td>
                <td className="px-5 py-4 font-mono font-medium text-fg">
                  {record.bank_transfer_reference || "—"}
                </td>
                <td className="px-5 py-4 text-fg">
                  {record.pack_name ? (
                    <>
                      {record.pack_name}
                      {record.credits ? (
                        <span className="block text-xs text-muted">
                          {plural(record.credits, "credit")}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-muted">
                  {record.payment_method.replaceAll("_", " ")}
                </td>
                <td className="px-5 py-4 font-medium text-fg">
                  {record.payment_method === "promotion" &&
                  record.amount_due === 0 ? (
                    `Free (code ${record.promotion_code ?? "—"})`
                  ) : (
                    <>
                      {record.original_amount &&
                      record.original_amount > record.amount_due ? (
                        <s className="mr-1.5 font-normal text-muted">
                          {formatMoney(record.original_amount, record.currency)}
                        </s>
                      ) : null}
                      {formatMoney(
                        record.status === "paid"
                          ? record.amount_paid
                          : record.amount_due,
                        record.currency,
                      )}
                      {record.promotion_code ? (
                        <span className="ml-2 rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-xs text-accent-text">
                          {record.promotion_code}
                        </span>
                      ) : null}
                    </>
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
        <CreditHistory />
        <p className="text-xs leading-5 text-muted">
          Credit packs are paid by QR only. These entries are payment receipts:
          no tax invoice (factura) is issued yet.
        </p>
      </section>
    </main>
  );
}

function CreditHistory() {
  const [page, setPage] = useState(1);
  const query = useCreditEntries(page);
  const data = query.data;

  if (query.isPending) {
    return <div className="h-48 animate-pulse rounded-lg bg-surface-2" />;
  }
  if (query.isError || !data) {
    return (
      <section className="rounded-lg border border-line bg-surface p-5 text-sm text-muted shadow-sm">
        We could not load your credit history.
      </section>
    );
  }
  if (!data.results.length) {
    return (
      <section className="rounded-lg border border-line bg-surface p-5 text-sm text-muted shadow-sm">
        No credit activity yet.
      </section>
    );
  }
  return (
    <div className="space-y-3">
      <EntityTable
        columns={["Date", "Activity", "Credits", "Free", "Paid"]}
        getRowKey={(entry) => entry.id}
        items={data.results}
        renderRow={(entry) => (
          <>
            <td className="px-5 py-4 text-muted">
              {formatDate(entry.created_at)}
            </td>
            <td className="px-5 py-4 text-fg">
              <span className="font-medium">
                {CREDIT_ENTRY_LABELS[entry.kind] ?? entry.kind}
              </span>
              {entry.product_name || entry.description ? (
                <span className="block text-xs text-muted">
                  {entry.product_name ?? entry.description}
                </span>
              ) : null}
            </td>
            <td
              className={`px-5 py-4 font-semibold ${
                entry.amount > 0 ? "text-accent-text" : "text-fg"
              }`}
            >
              {entry.amount > 0 ? "+" : entry.amount < 0 ? "−" : ""}
              {Math.abs(entry.amount).toLocaleString("en-US")}
            </td>
            <td className="px-5 py-4 text-muted">
              {(entry.free_balance_after ?? 0).toLocaleString("en-US")}
            </td>
            <td className="px-5 py-4 text-muted">
              {entry.balance_after.toLocaleString("en-US")}
            </td>
          </>
        )}
        title="Credit history"
      />
      {data.next || data.previous ? (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button
            className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line px-3 text-fg hover:border-accent disabled:opacity-40"
            disabled={!data.previous || query.isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            type="button"
          >
            <ChevronLeft size={15} />
            Newer
          </button>
          <span className="text-muted">Page {page}</span>
          <button
            className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line px-3 text-fg hover:border-accent disabled:opacity-40"
            disabled={!data.next || query.isFetching}
            onClick={() => setPage((current) => current + 1)}
            type="button"
          >
            Older
            <ChevronRight size={15} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
