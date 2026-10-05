"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { cartHref } from "@/lib/cart";

// Header cart with the number of units (openspec cart-and-checkout D6).
export function CartLink() {
  const { cart } = useCart();
  const units = cart.total_units;
  return (
    <Link
      aria-label={
        units ? `Cart, ${units} ${units === 1 ? "item" : "items"}` : "Cart"
      }
      className="relative inline-flex size-10 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
      href={cartHref}
    >
      <ShoppingBag size={19} />
      {units ? (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-fg tabular-nums"
        >
          {units > 99 ? "99+" : units}
        </span>
      ) : null}
    </Link>
  );
}
