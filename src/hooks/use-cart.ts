"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { loginHref } from "@/lib/auth/redirect";
import {
  addToCart,
  type Cart,
  cartKeys,
  EMPTY_CART,
  getCart,
  removeFromCart,
  setCartQuantity,
} from "@/lib/cart";

// The signed-in user's cart. Anonymous visitors have none and never ask.
export function useCart() {
  const { data: session } = useSession();
  const signedIn = Boolean(session?.authenticated);
  const query = useQuery({
    queryKey: cartKeys.cart,
    queryFn: getCart,
    enabled: signedIn,
    staleTime: 15_000,
  });
  return {
    ...query,
    cart: signedIn ? (query.data ?? EMPTY_CART) : EMPTY_CART,
    signedIn,
    userId: session?.user?.id ?? null,
  };
}

// Every cart call answers with the whole cart: it replaces the cache, so
// prices, stock and flags are the server's. The optimistic part only moves
// the badge and quantities so taps feel instant; errors roll back.
function useCartMutation<V>(
  call: (vars: V) => Promise<Cart>,
  optimistic: (cart: Cart, vars: V) => Cart,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: call,
    onMutate: async (vars: V) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.cart });
      const previous = queryClient.getQueryData<Cart>(cartKeys.cart);
      if (previous) {
        queryClient.setQueryData(cartKeys.cart, optimistic(previous, vars));
      }
      return { previous };
    },
    onError: (_error, _vars, context) => {
      queryClient.setQueryData(cartKeys.cart, context?.previous);
    },
    onSuccess: (cart) => queryClient.setQueryData(cartKeys.cart, cart),
  });
}

const mapItems = (
  cart: Cart,
  product: string,
  change: (quantity: number) => number,
): Cart => {
  let units = 0;
  const groups = cart.groups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) =>
          item.product === product
            ? { ...item, quantity: change(item.quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    }))
    .filter((group) => group.items.length);
  for (const group of groups)
    for (const item of group.items) units += item.quantity;
  return { groups, total_units: units };
};

export function useAddToCart() {
  const router = useRouter();
  const pathname = usePathname();
  const { signedIn } = useCart();
  const mutation = useCartMutation(
    ({ product, quantity }: { product: string; quantity: number }) =>
      addToCart(product, quantity),
    (cart, { quantity }) => ({
      ...cart,
      total_units: cart.total_units + quantity,
    }),
  );

  const add = (product: string, quantity = 1) => {
    if (!signedIn) {
      // Sign in, then come back to this product (spec: anonymous add).
      router.push(loginHref(pathname + window.location.search));
      return;
    }
    mutation.mutate({ product, quantity });
  };
  return { ...mutation, add };
}

export const useSetCartQuantity = () =>
  useCartMutation(
    ({ product, quantity }: { product: string; quantity: number }) =>
      setCartQuantity(product, quantity),
    (cart, { product, quantity }) => mapItems(cart, product, () => quantity),
  );

export const useRemoveFromCart = () =>
  useCartMutation(
    (product: string) => removeFromCart(product),
    (cart, product) => mapItems(cart, product, () => 0),
  );
