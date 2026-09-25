"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSession } from "@/hooks/use-session";
import { loginHref } from "@/lib/auth/redirect";
import { sellerHref } from "@/lib/catalog";

// Seller profiles need an account: anonymous visitors go through sign-in.
export function SellerLink({
  sellerId,
  children,
  className,
  showHint = false,
}: {
  sellerId: string;
  children: ReactNode;
  className?: string;
  showHint?: boolean;
}) {
  const { data: session } = useSession();
  const href = sellerHref(sellerId);
  const isAnonymous = session ? !session.authenticated : false;

  return (
    <span className="inline-flex flex-col">
      <Link className={className} href={isAnonymous ? loginHref(href) : href}>
        {children}
      </Link>
      {showHint && isAnonymous ? (
        <span className="text-xs text-slate-500">
          Sign in to see the seller profile
        </span>
      ) : null}
    </span>
  );
}
