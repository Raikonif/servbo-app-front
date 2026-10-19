"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Store,
  UserX,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ServiceUnavailable } from "@/features/auth/service-unavailable";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";
import { ReviewsSection } from "@/features/reviews/reviews-section";
import { RatingSummary } from "@/features/reviews/stars";
import { useSeller, useSellerProducts } from "@/hooks/use-catalog";
import { useFormat } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
import { ratingNumber } from "@/lib/reviews";
import { ProductGrid } from "./product-grid";

const isNotFound = (error: unknown) =>
  (error as { status?: number } | null)?.status === 404;

export function SellerProfilePage({ sellerId }: { sellerId: string }) {
  const t = useTranslations("catalog.seller");
  const format = useFormat();
  const [page, setPage] = useState(1);
  const seller = useSeller(sellerId);
  const products = useSellerProducts(sellerId, page);

  if (seller.isPending) {
    return (
      <main
        aria-busy="true"
        className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="h-28 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-64 animate-pulse rounded-lg bg-surface-2" />
      </main>
    );
  }

  if (seller.isError || !seller.data) {
    if (isNotFound(seller.error) || !seller.data) {
      return (
        <StatusPage
          description={t("notFoundBody")}
          icon={<UserX size={22} />}
          title={t("notFoundTitle")}
        >
          <Link className={statusLinkStyles.primary} href="/sellers">
            {t("seeAll")}
          </Link>
        </StatusPage>
      );
    }
    return <ServiceUnavailable onRetry={() => void seller.refetch()} />;
  }

  const profile = seller.data;
  const data = products.data;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-accent-text"
        href="/sellers"
      >
        <ArrowLeft size={16} />
        {t("allSellers")}
      </Link>

      <section className="flex items-center gap-4 rounded-lg border border-line bg-surface p-6 shadow-sm">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
          <Store size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
          <p className="text-sm text-muted">
            {profile.username ? `@${profile.username} · ` : ""}
            {t("productCount", { count: profile.product_count })}
            {profile.joined
              ? ` · ${t("joined", { date: format.date(profile.joined) })}`
              : ""}
          </p>
          <RatingSummary
            avg={ratingNumber(profile.rating_avg)}
            className="mt-1 text-sm"
            count={profile.rating_count ?? 0}
          />
        </div>
      </section>

      {/* Seller reviews: about the seller (service, delivery), not a product. */}
      <section className="rounded-lg border border-line bg-surface p-6 shadow-sm">
        <ReviewsSection
          id={profile.id}
          kind="seller"
          ratingAvg={profile.rating_avg}
          ratingCount={profile.rating_count ?? 0}
          title={t("reviews")}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t("products")}</h2>
        {products.isPending ? (
          <div className="h-40 animate-pulse rounded-lg bg-surface-2" />
        ) : products.isError ? (
          <p className="rounded-lg border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
            {t("loadError")}{" "}
            <button
              className="font-medium underline"
              onClick={() => void products.refetch()}
              type="button"
            >
              {t("tryAgain")}
            </button>
          </p>
        ) : (
          <ProductGrid products={data?.results ?? []} />
        )}

        {data && (data.next || data.previous) ? (
          <nav
            aria-label={t("pagination")}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <button
              className={`${statusLinkStyles.secondary} disabled:opacity-50`}
              disabled={!data.previous}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              <ChevronLeft size={16} />
              {t("previous")}
            </button>
            <span className="text-muted">{t("page", { page })}</span>
            <button
              className={`${statusLinkStyles.secondary} disabled:opacity-50`}
              disabled={!data.next}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              {t("next")}
              <ChevronRight size={16} />
            </button>
          </nav>
        ) : null}
      </section>
    </main>
  );
}
