"use client";

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { sessionQueryKey, useSession } from "@/hooks/use-session";
import {
  billingKeys,
  getBillingRecords,
  getCreditEntries,
  getCreditPacks,
  getSellerSubscription,
  isExpired,
} from "@/lib/billing";

export function useCreditPacks() {
  return useQuery({
    queryKey: billingKeys.creditPacks,
    queryFn: getCreditPacks,
    staleTime: 5 * 60_000,
  });
}

// While a QR payment is pending, poll every 4 s so the payment step shows the
// credits as soon as the webhook (or an admin) confirms it. React Query
// pauses the interval while the tab is hidden.
const PENDING_POLL_MS = 4_000;
const EXPIRY_GRACE_MS = 2 * 60_000;

// Once access starts the backend reports is_seller; refetch the session so
// the header and menus pick up the new role. `enabled: false` for anonymous
// visitors (the endpoint needs a session).
export function useSellerSubscription({ enabled = true } = {}) {
  const queryClient = useQueryClient();
  const sessionIsSeller = useSession().data?.user?.is_seller;
  const query = useQuery({
    queryKey: billingKeys.sellerSubscription,
    queryFn: getSellerSubscription,
    enabled,
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

export function useCreditEntries(page = 1) {
  return useQuery({
    queryKey: [...billingKeys.creditEntries, page],
    queryFn: () => getCreditEntries(page),
    placeholderData: keepPreviousData,
  });
}
