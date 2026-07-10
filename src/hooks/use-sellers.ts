"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSellers, queryKeys } from "@/lib/api";

export function useSellers() {
  return useQuery({
    queryKey: queryKeys.sellers,
    queryFn: fetchSellers,
    refetchInterval: 30_000,
  });
}
