"use client";

import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAddToCart, useCart } from "@/hooks/use-cart";
import { cartHref } from "@/lib/cart";

const stepButton =
  "inline-flex size-10 items-center justify-center rounded-full text-fg transition hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent";

// Quantity + "Add to cart" (openspec cart-and-checkout D6). Hidden for the
// seller's own products; anonymous visitors are sent to sign in first.
export function AddToCart({
  productId,
  sellerId,
  stock,
  className = "",
}: {
  productId: string;
  sellerId: string;
  stock: number;
  className?: string;
}) {
  const { userId, cart } = useCart();
  const { add, isPending, isSuccess, error, reset } = useAddToCart();
  const [quantity, setQuantity] = useState(1);

  if (userId && userId === sellerId) return null;

  if (stock <= 0) {
    return (
      <button
        className={`h-11 w-full cursor-not-allowed rounded-full bg-surface-2 text-sm font-semibold text-muted ${className}`}
        disabled
        type="button"
      >
        Sold out
      </button>
    );
  }

  const inCart =
    cart.groups
      .flatMap((group) => group.items)
      .find((item) => item.product === productId)?.quantity ?? 0;
  const max = Math.max(1, stock - inCart);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <fieldset
          aria-label="Quantity"
          className="inline-flex shrink-0 items-center rounded-full border border-line"
        >
          <button
            aria-label="Decrease quantity"
            className={stepButton}
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            type="button"
          >
            <Minus size={16} />
          </button>
          <span
            aria-live="polite"
            className="w-8 text-center text-sm font-semibold tabular-nums"
          >
            {quantity}
          </span>
          <button
            aria-label="Increase quantity"
            className={stepButton}
            disabled={quantity >= max}
            onClick={() => setQuantity((q) => Math.min(max, q + 1))}
            type="button"
          >
            <Plus size={16} />
          </button>
        </fieldset>
        <button
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-fg px-4 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
          disabled={isPending || inCart >= stock}
          onClick={() => {
            reset();
            add(productId, quantity);
            setQuantity(1);
          }}
          type="button"
        >
          <ShoppingBag size={16} />
          {inCart >= stock
            ? "All units in your cart"
            : isPending
              ? "Adding…"
              : "Add to cart"}
        </button>
      </div>
      <p aria-live="polite" className="min-h-5 text-sm">
        {error ? (
          <span className="text-danger">{error.message}</span>
        ) : isSuccess ? (
          <span className="inline-flex items-center gap-1.5 text-accent-text">
            <Check size={14} />
            Added.{" "}
            <Link
              className="font-medium underline underline-offset-4"
              href={cartHref}
            >
              View cart
            </Link>
          </span>
        ) : inCart ? (
          <span className="text-muted">
            {inCart} in your cart ·{" "}
            <Link
              className="font-medium text-fg underline-offset-4 hover:underline"
              href={cartHref}
            >
              View cart
            </Link>
          </span>
        ) : null}
      </p>
    </div>
  );
}
