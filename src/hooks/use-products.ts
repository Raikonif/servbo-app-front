"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProducts, queryKeys } from "@/lib/api";

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: fetchProducts,
    refetchInterval: 30_000,
  });
}
