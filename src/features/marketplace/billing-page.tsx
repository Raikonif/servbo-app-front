"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Coins,
  Gift,
  Store,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  useBillingRecords,
  useCreditEntries,
  useSellerSubscription,
} from "@/hooks/use-billing";
import { useFormat } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
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
  const t = useTranslations("billing.status");
  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-semibold uppercase ${
        STATUS_STYLES[status] ?? "bg-surface-2 text-muted"
      }`}
    >
      {/* Statuses and methods come from the API; unknown ones show raw. */}
      {t.has(status as "paid") ? t(status as "paid") : status.replace("_", " ")}
    </span>
  );
}

export function BillingPage() {
  const t = useTranslations("billing");
  const tc = useTranslations("credits");
  const format = useFormat();
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
              {t("eyebrow")}
            </p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight text-fg">
              {t("title")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              {t("intro")}
              {pricing
                ? ` ${t("costs", {
                    publish: pricing.publish_cost,
                    edit: pricing.edit_cost,
                  })}`
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
                      {t("credits")}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-fg">
                      {tc("count", { count: credits?.total ?? 0 })}
                    </p>
                  </div>
                  {state?.is_seller ? <StatusBadge status="active" /> : null}
                </div>
                <p className="mt-3 text-sm text-accent-text">
                  {state?.is_seller
                    ? t("split", {
                        free: credits?.free ?? 0,
                        paid: credits?.paid ?? 0,
                      })
                    : t("freeToJoin")}
                </p>
                <Link
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent-text hover:text-accent-text"
                  href="/become-a-vendor"
                >
                  {state?.is_seller ? t("buyMore") : t("openStore")}
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </section>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            helper={state?.is_seller ? t("sellerAccount") : t("buyerAccount")}
            icon={Store}
            label={t("account")}
            value={state?.is_seller ? t("seller") : t("buyer")}
          />
          <StatCard
            helper={
              state?.is_seller && credits?.free_resets_at
                ? pricing
                  ? tc("resetsTo", {
                      count: pricing.free_credits,
                      date: format.date(credits.free_resets_at),
                    })
                  : tc("resetsOn", {
                      date: format.date(credits.free_resets_at),
                    })
                : t("freeHelper")
            }
            icon={Gift}
            label={tc("free")}
            value={format.number(credits?.free ?? 0)}
          />
          <StatCard
            helper={
              state?.pending_payment
                ? t("pendingPayment", {
                    reference: state.pending_payment.reference,
                  })
                : tc("neverExpire")
            }
            icon={Coins}
            label={tc("paid")}
            value={format.number(credits?.paid ?? 0)}
          />
        </section>

        {recordsQuery.isPending ? (
          <div className="h-64 animate-pulse rounded-lg bg-surface-2" />
        ) : recordsQuery.isError ? (
          <section className="rounded-lg border border-line bg-surface p-5 text-sm text-muted shadow-sm">
            {t("recordsError")}
          </section>
        ) : records.length === 0 ? (
          <section className="rounded-lg border border-line bg-surface p-5 text-sm text-muted shadow-sm">
            {t("recordsEmpty")}
          </section>
        ) : (
          <EntityTable
            columns={[
              t("columns.date"),
              t("columns.reference"),
              t("columns.pack"),
              t("columns.method"),
              t("columns.amount"),
              t("columns.status"),
            ]}
            getRowKey={(record) => record.id}
            items={records}
            renderRow={(record) => (
              <>
                <td className="px-5 py-4 text-muted">
                  {format.date(record.paid_at ?? record.created_at)}
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
                          {tc("count", { count: record.credits })}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-muted">
                  {t.has(`method.${record.payment_method}` as "method.qr")
                    ? t(`method.${record.payment_method}` as "method.qr")
                    : record.payment_method.replaceAll("_", " ")}
                </td>
                <td className="px-5 py-4 font-medium text-fg">
                  {record.payment_method === "promotion" &&
                  record.amount_due === 0 ? (
                    t("freeWithCode", { code: record.promotion_code ?? "—" })
                  ) : (
                    <>
                      {record.original_amount &&
                      record.original_amount > record.amount_due ? (
                        <s className="mr-1.5 font-normal text-muted">
                          {format.money(
                            record.original_amount,
                            record.currency,
                          )}
                        </s>
                      ) : null}
                      {format.money(
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
            title={t("paymentHistory")}
          />
        )}
        <CreditHistory />
        <p className="text-xs leading-5 text-muted">{t("footnote")}</p>
      </section>
    </main>
  );
}

function CreditHistory() {
  const t = useTranslations("billing");
  const tc = useTranslations("credits");
  const format = useFormat();
  const [page, setPage] = useState(1);
  const query = useCreditEntries(page);
  const data = query.data;

  if (query.isPending) {
    return <div className="h-48 animate-pulse rounded-lg bg-surface-2" />;
  }
  if (query.isError || !data) {
    return (
      <section className="rounded-lg border border-line bg-surface p-5 text-sm text-muted shadow-sm">
        {t("historyError")}
      </section>
    );
  }
  if (!data.results.length) {
    return (
      <section className="rounded-lg border border-line bg-surface p-5 text-sm text-muted shadow-sm">
        {t("historyEmpty")}
      </section>
    );
  }
  return (
    <div className="space-y-3">
      <EntityTable
        columns={[
          t("columns.date"),
          t("columns.activity"),
          t("columns.credits"),
          t("columns.free"),
          t("columns.paid"),
        ]}
        getRowKey={(entry) => entry.id}
        items={data.results}
        renderRow={(entry) => (
          <>
            <td className="px-5 py-4 text-muted">
              {format.date(entry.created_at)}
            </td>
            <td className="px-5 py-4 text-fg">
              <span className="font-medium">
                {tc.has(`kind.${entry.kind}` as "kind.publish")
                  ? tc(`kind.${entry.kind}` as "kind.publish")
                  : entry.kind}
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
              {format.number(Math.abs(entry.amount))}
            </td>
            <td className="px-5 py-4 text-muted">
              {format.number(entry.free_balance_after ?? 0)}
            </td>
            <td className="px-5 py-4 text-muted">
              {format.number(entry.balance_after)}
            </td>
          </>
        )}
        title={tc("history")}
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
            {t("newer")}
          </button>
          <span className="text-muted">{t("page", { page })}</span>
          <button
            className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line px-3 text-fg hover:border-accent disabled:opacity-40"
            disabled={!data.next || query.isFetching}
            onClick={() => setPage((current) => current + 1)}
            type="button"
          >
            {t("older")}
            <ChevronRight size={15} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
