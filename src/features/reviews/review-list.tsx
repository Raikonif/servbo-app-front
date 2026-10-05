"use client";

import { Flag, LoaderCircle, MessageSquareReply } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useReportReview, useReviewList } from "@/hooks/use-reviews";
import { useSession } from "@/hooks/use-session";
import { loginHref } from "@/lib/auth/redirect";
import { formatDate } from "@/lib/catalog";
import { MAX_REPORT_REASON, type Review } from "@/lib/reviews";
import { Stars } from "./stars";

// Public reviews of a product or a seller, newest first, 20 at a time.
// Loaded in the browser after the page renders (the summary above it is in
// the server HTML), so personal bits like "Report" never touch the cache.
export function ReviewList({
  kind,
  id,
  emptyText = "No reviews yet.",
}: {
  kind: "product" | "seller";
  id: string;
  emptyText?: string;
}) {
  const reviews = useReviewList(kind, id);

  if (reviews.isPending) {
    return (
      <div aria-busy="true" className="space-y-3">
        <div className="h-20 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-20 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    );
  }
  if (reviews.isError) {
    return (
      <p className="rounded-2xl border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
        We could not load the reviews.{" "}
        <button
          className="font-medium underline"
          onClick={() => void reviews.refetch()}
          type="button"
        >
          Try again
        </button>
      </p>
    );
  }

  const items = reviews.data.pages.flatMap((page) => page.results);
  if (!items.length) return <p className="text-sm text-muted">{emptyText}</p>;

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-line">
        {items.map((review) => (
          <li className="py-4 first:pt-0" key={review.id}>
            <ReviewItem review={review} />
          </li>
        ))}
      </ul>
      {reviews.hasNextPage ? (
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium transition hover:border-line-strong hover:bg-surface-2 disabled:opacity-60"
          disabled={reviews.isFetchingNextPage}
          onClick={() => void reviews.fetchNextPage()}
          type="button"
        >
          {reviews.isFetchingNextPage ? (
            <LoaderCircle className="animate-spin" size={15} />
          ) : null}
          Load more reviews
        </button>
      ) : null}
    </div>
  );
}

export function ReviewItem({
  review,
  showProduct = false,
  canReport = true,
}: {
  review: Review;
  showProduct?: boolean;
  canReport?: boolean;
}) {
  return (
    <article className="space-y-2 text-sm">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Stars size={14} value={review.rating} />
        <span className="font-medium">{review.author.name}</span>
        <time
          className="text-xs text-muted tabular-nums"
          dateTime={review.created_at}
        >
          {formatDate(review.created_at)}
        </time>
        {review.hidden ? (
          <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
            Hidden by moderators
          </span>
        ) : null}
      </header>
      {showProduct && review.product ? (
        <p className="text-xs text-muted">{review.product.name}</p>
      ) : null}
      {review.comment ? (
        <p className="whitespace-pre-line leading-6">{review.comment}</p>
      ) : null}
      {review.reply ? (
        <div className="rounded-2xl border border-line bg-surface-2/60 p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <MessageSquareReply aria-hidden size={13} />
            Reply from the seller
            {review.replied_at ? (
              <time className="font-normal" dateTime={review.replied_at}>
                · {formatDate(review.replied_at)}
              </time>
            ) : null}
          </p>
          <p className="mt-1 whitespace-pre-line leading-6">{review.reply}</p>
        </div>
      ) : null}
      {canReport ? <ReportReview review={review} /> : null}
    </article>
  );
}

// Signed-in users other than the author report once, with a reason.
// Anonymous visitors go to sign in and come back here.
function ReportReview({ review }: { review: Review }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const report = useReportReview();
  const fieldId = `report-${review.id}`;

  if (session?.user?.id === review.author.id) return null;
  if (report.isSuccess) {
    return (
      <p className="text-xs text-muted" role="status">
        {report.data?.detail ?? "Thanks, we will look at it."}
      </p>
    );
  }

  const trigger =
    "inline-flex items-center gap-1 text-xs text-muted transition hover:text-fg";
  if (!session?.authenticated) {
    return (
      <Link
        className={trigger}
        href={loginHref(
          pathname +
            (typeof window === "undefined" ? "" : window.location.search),
        )}
      >
        <Flag aria-hidden size={12} /> Report
      </Link>
    );
  }
  if (!open) {
    return (
      <button className={trigger} onClick={() => setOpen(true)} type="button">
        <Flag aria-hidden size={12} /> Report
      </button>
    );
  }
  return (
    <form
      className="space-y-2 rounded-2xl border border-line p-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (reason.trim()) {
          report.mutate({ id: review.id, reason: reason.trim() });
        }
      }}
    >
      <label className="block text-xs font-medium" htmlFor={fieldId}>
        Why should moderators look at this review?
      </label>
      <textarea
        className="block w-full rounded-xl border border-line bg-surface p-2 text-sm outline-none focus:border-accent"
        id={fieldId}
        maxLength={MAX_REPORT_REASON}
        onChange={(event) => setReason(event.target.value)}
        required
        rows={2}
        value={reason}
      />
      <div className="flex items-center gap-3">
        <button
          className="rounded-full bg-fg px-4 py-1.5 text-xs font-semibold text-bg disabled:opacity-60"
          disabled={report.isPending || !reason.trim()}
          type="submit"
        >
          Send report
        </button>
        <button
          className="text-xs font-medium text-muted"
          onClick={() => {
            setOpen(false);
            report.reset();
          }}
          type="button"
        >
          Cancel
        </button>
      </div>
      {report.error ? (
        <p className="text-xs text-danger" role="alert">
          {report.error.message}
        </p>
      ) : null}
    </form>
  );
}
