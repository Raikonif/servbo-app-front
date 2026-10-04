"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { loginHref } from "@/lib/auth/redirect";
import {
  addFavorite,
  catalogKeys,
  getFavoriteIds,
  removeFavorite,
} from "@/lib/catalog";

// The signed-in customer's favorite product ids, loaded after the page
// renders; anonymous visitors never make the request.
export function useFavoriteIds() {
  const { data: session } = useSession();
  const signedIn = Boolean(session?.authenticated);
  const query = useQuery({
    queryKey: catalogKeys.favoriteIds,
    queryFn: getFavoriteIds,
    enabled: signedIn,
    staleTime: 60_000,
    select: (ids) => new Set(ids),
  });
  return { ...query, signedIn, userId: session?.user?.id ?? null };
}

// Optimistic toggle with rollback. Anonymous visitors go to sign in and come
// back to the page they were on.
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const { signedIn } = useFavoriteIds();

  const mutation = useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      favorite ? addFavorite(id) : removeFavorite(id),
    onMutate: async ({ id, favorite }) => {
      await queryClient.cancelQueries({ queryKey: catalogKeys.favoriteIds });
      const previous = queryClient.getQueryData<string[]>(
        catalogKeys.favoriteIds,
      );
      queryClient.setQueryData<string[]>(catalogKeys.favoriteIds, (ids = []) =>
        favorite ? [...new Set([...ids, id])] : ids.filter((x) => x !== id),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      queryClient.setQueryData(catalogKeys.favoriteIds, context?.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: catalogKeys.favoriteIds }),
  });

  const toggle = (id: string, favorite: boolean) => {
    if (!signedIn) {
      router.push(loginHref(pathname + window.location.search));
      return;
    }
    mutation.mutate({ id, favorite });
  };
  return { toggle, error: mutation.error, pending: mutation.isPending };
}
