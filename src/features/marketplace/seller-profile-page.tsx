"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Store,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ServiceUnavailable } from "@/features/auth/service-unavailable";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";
import { useSeller, useSellerProducts } from "@/hooks/use-catalog";
import { formatDate } from "@/lib/billing";
import { ProductGrid } from "./product-grid";

const isNotFound = (error: unknown) =>
  (error as { status?: number } | null)?.status === 404;

export function SellerProfilePage({ sellerId }: { sellerId: string }) {
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
          description="This account is not a seller or no longer exists."
          icon={<UserX size={22} />}
          title="Seller not found"
        >
          <Link className={statusLinkStyles.primary} href="/sellers">
            See all sellers
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
        All sellers
      </Link>

      <section className="flex items-center gap-4 rounded-lg border border-line bg-surface p-6 shadow-sm">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
          <Store size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
          <p className="text-sm text-muted">
            {profile.username ? `@${profile.username} · ` : ""}
            {profile.product_count}{" "}
            {profile.product_count === 1 ? "product" : "products"}
            {profile.joined ? ` · Joined ${formatDate(profile.joined)}` : ""}
          </p>
        </div>
      </section>

      {/*
       * PLACEHOLDER — next phase: seller ratings, comments and favorites.
       * No UI yet; this is where the rating summary, the comment list and the
       * "favorite seller" action will go.
       */}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Products</h2>
        {products.isPending ? (
          <div className="h-40 animate-pulse rounded-lg bg-surface-2" />
        ) : products.isError ? (
          <p className="rounded-lg border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
            We could not load this seller’s products.{" "}
            <button
              className="font-medium underline"
              onClick={() => void products.refetch()}
              type="button"
            >
              Try again
            </button>
          </p>
        ) : (
          <ProductGrid products={data?.results ?? []} />
        )}

        {data && (data.next || data.previous) ? (
          <nav
            aria-label="Pagination"
            className="flex items-center justify-between gap-3 text-sm"
          >
            <button
              className={`${statusLinkStyles.secondary} disabled:opacity-50`}
              disabled={!data.previous}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="text-muted">Page {page}</span>
            <button
              className={`${statusLinkStyles.secondary} disabled:opacity-50`}
              disabled={!data.next}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </nav>
        ) : null}
      </section>
    </main>
  );
}
