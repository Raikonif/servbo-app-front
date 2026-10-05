"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { catalogKeys } from "@/lib/catalog";
import {
  createReview,
  deleteReview,
  getOrderReviews,
  getProductReviews,
  getSellerReviews,
  type NewReview,
  reportReview,
  reviewKeys,
  updateReview,
} from "@/lib/reviews";

// DRF `next` is an absolute URL; the following page number is all we need.
const nextPage = (next: string | null, current: number) =>
  next ? current + 1 : undefined;

// Public review list ("Load more" appends the next page).
export function useReviewList(kind: "product" | "seller", id: string) {
  return useInfiniteQuery({
    queryKey:
      kind === "product" ? reviewKeys.product(id) : reviewKeys.seller(id),
    queryFn: ({ pageParam }) =>
      kind === "product"
        ? getProductReviews(id, pageParam)
        : getSellerReviews(id, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, _all, current) => nextPage(last.next, current),
    staleTime: 60_000,
  });
}

export function useOrderReviews(orderId: string) {
  return useQuery({
    queryKey: reviewKeys.order(orderId),
    queryFn: () => getOrderReviews(orderId),
  });
}

// After any write: the order's own state, every public list, and the
// seller's profile (its average). The product's average lives in the
// server-rendered, tag-cached payload; the API revalidates that tag, and the
// router refresh drops this tab's copy of those pages.
function useAfterReviewWrite(sellerId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  return () => {
    void queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    void queryClient.invalidateQueries({
      queryKey: catalogKeys.seller(sellerId),
    });
    router.refresh();
  };
}

// One mutation per form, so each shows its own pending state and error.
export function useCreateReview(orderId: string, sellerId: string) {
  const onSuccess = useAfterReviewWrite(sellerId);
  return useMutation({
    mutationFn: (body: Omit<NewReview, "order">) =>
      createReview({ ...body, order: orderId }),
    onSuccess,
  });
}

export function useUpdateReview(sellerId: string) {
  const onSuccess = useAfterReviewWrite(sellerId);
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      rating: number;
      comment: string;
    }) => updateReview(id, body),
    onSuccess,
  });
}

export function useDeleteReview(sellerId: string) {
  const onSuccess = useAfterReviewWrite(sellerId);
  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess,
  });
}

export function useReportReview() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reportReview(id, reason),
  });
}
