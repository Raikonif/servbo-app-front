"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { sessionQueryKey, useSession } from "@/hooks/use-session";
import {
  billingKeys,
  getBillingRecords,
  getSellerPlans,
  getSellerSubscription,
  isExpired,
} from "@/lib/billing";

export function useSellerPlans() {
  return useQuery({
    queryKey: billingKeys.sellerPlans,
    queryFn: getSellerPlans,
    staleTime: 5 * 60_000,
  });
}

// While a QR payment is pending, poll every 5 s so the page flips to the
// seller state as soon as the webhook (or an admin) confirms it. React Query
// pauses the interval while the tab is hidden.
const PENDING_POLL_MS = 5_000;
const EXPIRY_GRACE_MS = 2 * 60_000;

// Once the payment is confirmed the backend reports is_seller; refetch the
// session so the header and menus pick up the new role.
export function useSellerSubscription() {
  const queryClient = useQueryClient();
  const sessionIsSeller = useSession().data?.user?.is_seller;
  const query = useQuery({
    queryKey: billingKeys.sellerSubscription,
    queryFn: getSellerSubscription,
    refetchInterval: (q) => {
      const pending = q.state.data?.pending_payment;
      // An expired QR can't be paid any more: stop until a new one is made,
      // after a grace period for a payment made right before the expiry.
      if (
        !pending ||
        isExpired(pending.expires_at, Date.now() - EXPIRY_GRACE_MS)
      )
        return false;
      return PENDING_POLL_MS;
    },
  });
  const isSeller = query.data?.is_seller;

  useEffect(() => {
    if (isSeller && sessionIsSeller === false) {
      void queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    }
  }, [isSeller, sessionIsSeller, queryClient]);

  return query;
}

export function useBillingRecords() {
  return useQuery({
    queryKey: billingKeys.records,
    queryFn: getBillingRecords,
  });
}
