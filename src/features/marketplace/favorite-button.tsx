"use client";

import { Heart } from "lucide-react";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/use-favorites";

// Personal state, loaded after render: never delays the page. Hidden on the
// seller's own products.
export function FavoriteButton({
  productId,
  sellerId,
  className = "",
}: {
  productId: string;
  sellerId: string;
  className?: string;
}) {
  const { data: ids, userId } = useFavoriteIds();
  const { toggle, error } = useToggleFavorite();
  if (userId && userId === sellerId) return null;

  const active = ids?.has(productId) ?? false;
  return (
    <button
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      className={`inline-flex size-10 items-center justify-center rounded-full bg-surface/90 shadow-sm ring-1 ring-line backdrop-blur transition hover:scale-105 hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent ${className}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(productId, !active);
      }}
      title={error ? "Couldn’t update favorites. Try again." : undefined}
      type="button"
    >
      <Heart
        className={
          error
            ? "text-danger"
            : active
              ? "fill-accent text-accent-text"
              : "text-muted"
        }
        size={18}
      />
    </button>
  );
}
