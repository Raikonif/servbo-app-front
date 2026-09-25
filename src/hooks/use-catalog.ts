"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSetSession } from "@/hooks/use-session";
import {
  catalogKeys,
  getSeller,
  getSellerProducts,
  updateProfile,
} from "@/lib/catalog";

// A 404 (not a seller) is final: don't retry it.
const retryUnlessNotFound = (count: number, error: Error) =>
  (error as { status?: number }).status !== 404 && count < 2;

export function useSeller(id: string) {
  return useQuery({
    queryKey: catalogKeys.seller(id),
    queryFn: () => getSeller(id),
    retry: retryUnlessNotFound,
  });
}

export function useSellerProducts(id: string, page: number) {
  return useQuery({
    queryKey: catalogKeys.sellerProducts(id, page),
    queryFn: () => getSellerProducts(id, page),
    placeholderData: (previous) => previous,
    retry: retryUnlessNotFound,
  });
}

export function useUpdateProfile(userId: string) {
  const setSession = useSetSession();
  return useMutation({
    mutationFn: (body: Parameters<typeof updateProfile>[1]) =>
      updateProfile(userId, body),
    onSuccess: (user) => {
      if (user) setSession(user);
    },
  });
}
