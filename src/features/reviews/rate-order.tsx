"use client";

import { LoaderCircle, Pencil, Store, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import {
  useCreateReview,
  useDeleteReview,
  useOrderReviews,
  useUpdateReview,
} from "@/hooks/use-reviews";
import { formatDate } from "@/lib/catalog";
import type { OrderDetail } from "@/lib/orders";
import { MAX_COMMENT, type Review } from "@/lib/reviews";
import { ReviewItem } from "./review-list";
import { StarsInput } from "./stars";

// "Rate your purchase" on a delivered order (openspec verified-reviews D7):
// one form per product not reviewed yet, one for the seller, then the
// buyer's own reviews with edit/delete while the 30-day window is open.
export function RateOrder({ order }: { order: OrderDetail }) {
  // Only mounted for delivered orders; earlier ones have nothing to rate.
  const state = useOrderReviews(order.id);
  const create = useCreateReview(order.id, order.seller.id);

  if (state.isPending) {
    return <div className="mt-6 h-40 animate-pulse rounded-3xl bg-surface-2" />;
  }
  if (state.isError) {
    return (
      <p className="mt-6 text-sm text-danger">
        We could not load your reviews.{" "}
        <button
          className="font-medium underline"
          onClick={() => void state.refetch()}
          type="button"
        >
          Try again
        </button>
      </p>
    );
  }

  const { products, seller, reviews } = state.data;
  if (!products.length && !seller && !reviews.length) return null;

  return (
    <section
      aria-labelledby="rate-order"
      className="mt-6 space-y-4 rounded-3xl border border-line bg-surface p-5"
    >
      <div>
        <h2 className="font-semibold" id="rate-order">
          Rate your purchase
        </h2>
        <p className="mt-1 text-sm text-muted">
          Reviews are public and show your name. You can change them for 30
          days.
        </p>
      </div>

      {products.map((item) => (
        <ReviewForm
          key={item.product}
          onSubmit={(rating, comment) =>
            create.mutateAsync({
              kind: "product",
              product: item.product,
              rating,
              comment,
            })
          }
          submitLabel="Post review"
          title={item.name}
        />
      ))}
      {seller ? (
        <ReviewForm
          icon={<Store aria-hidden size={15} />}
          onSubmit={(rating, comment) =>
            create.mutateAsync({ kind: "seller", rating, comment })
          }
          submitLabel="Rate seller"
          title={`The seller: ${order.seller.name}`}
        />
      ) : null}

      {reviews.length ? (
        <div className="space-y-3 border-t border-line pt-4">
          <h3 className="text-sm font-medium text-muted">Your reviews</h3>
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id}>
                <MyReview review={review} sellerId={order.seller.id} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function MyReview({ review, sellerId }: { review: Review; sellerId: string }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const update = useUpdateReview(sellerId);
  const remove = useDeleteReview(sellerId);
  const subject =
    review.kind === "seller" ? "Seller" : (review.product?.name ?? "Product");

  if (editing) {
    return (
      <ReviewForm
        initialComment={review.comment}
        initialRating={review.rating}
        onCancel={() => setEditing(false)}
        onSubmit={async (rating, comment) => {
          await update.mutateAsync({ id: review.id, rating, comment });
          setEditing(false);
        }}
        submitLabel="Save changes"
        title={subject}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-line p-4">
      <p className="mb-2 text-xs font-medium text-muted">{subject}</p>
      <ReviewItem canReport={false} review={review} />
      {review.can_edit ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-xs text-muted">
            You can edit until {formatDate(review.editable_until)}
          </span>
          {confirming ? (
            <span className="flex flex-wrap items-center gap-3">
              <span>Delete this review?</span>
              <button
                className="rounded-full bg-danger px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                disabled={remove.isPending}
                onClick={() => remove.mutate(review.id)}
                type="button"
              >
                Yes, delete
              </button>
              <button
                className="text-xs font-medium text-muted"
                onClick={() => setConfirming(false)}
                type="button"
              >
                Keep it
              </button>
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <button
                className="inline-flex items-center gap-1 font-medium text-accent-text"
                onClick={() => setEditing(true)}
                type="button"
              >
                <Pencil aria-hidden size={13} /> Edit
              </button>
              <button
                className="inline-flex items-center gap-1 font-medium text-danger"
                onClick={() => setConfirming(true)}
                type="button"
              >
                <Trash2 aria-hidden size={13} /> Delete
              </button>
            </span>
          )}
        </div>
      ) : null}
      {remove.error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {remove.error.message}
        </p>
      ) : null}
    </div>
  );
}

// Stars (required) + optional comment. `onSubmit` rejects with the API's
// message, which is shown under the form.
function ReviewForm({
  title,
  icon,
  submitLabel,
  onSubmit,
  onCancel,
  initialRating = 0,
  initialComment = "",
}: {
  title: string;
  icon?: React.ReactNode;
  submitLabel: string;
  onSubmit: (rating: number, comment: string) => Promise<unknown>;
  onCancel?: () => void;
  initialRating?: number;
  initialComment?: string;
}) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const commentId = useId();

  return (
    <form
      className="space-y-3 rounded-2xl border border-line p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!rating) {
          setError("Choose from 1 to 5 stars.");
          return;
        }
        setPending(true);
        setError(null);
        try {
          await onSubmit(rating, comment.trim());
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setPending(false);
        }
      }}
    >
      <p className="flex items-center gap-1.5 text-sm font-medium">
        {icon}
        {title}
      </p>
      <StarsInput
        disabled={pending}
        label={`Your rating for ${title}`}
        onChange={(value) => {
          setRating(value);
          setError(null);
        }}
        value={rating}
      />
      <div>
        <label className="text-xs text-muted" htmlFor={commentId}>
          Comment (optional)
        </label>
        <textarea
          className="mt-1 block w-full rounded-xl border border-line bg-surface p-2.5 text-sm outline-none focus:border-accent disabled:opacity-60"
          disabled={pending}
          id={commentId}
          maxLength={MAX_COMMENT}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          value={comment}
        />
        <p className="mt-1 text-right text-xs text-muted tabular-nums">
          {comment.length}/{MAX_COMMENT}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-fg px-5 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? <LoaderCircle className="animate-spin" size={15} /> : null}
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            className="text-sm font-medium text-muted"
            disabled={pending}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>
      <p aria-live="polite" className="text-sm text-danger">
        {error ?? ""}
      </p>
    </form>
  );
}
