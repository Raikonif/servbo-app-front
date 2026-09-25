"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { sessionQueryKey, useSession } from "@/hooks/use-session";
import {
  billingKeys,
  getBillingRecords,
  getSellerPlan,
  getSellerSubscription,
} from "@/lib/billing";

export function useSellerPlan() {
  return useQuery({
    queryKey: billingKeys.sellerPlan,
    queryFn: getSellerPlan,
    staleTime: 5 * 60_000,
  });
}

// Once an admin confirms the payment the backend reports is_seller; refetch
// the session so the header and menus pick up the new role.
export function useSellerSubscription() {
  const queryClient = useQueryClient();
  const sessionIsSeller = useSession().data?.user?.is_seller;
  const query = useQuery({
    queryKey: billingKeys.sellerSubscription,
    queryFn: getSellerSubscription,
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
