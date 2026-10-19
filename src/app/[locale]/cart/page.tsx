import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequireSession } from "@/features/auth/require-session";
import { CartView } from "@/features/cart/cart-view";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cart">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.cart" });
  return {
    title: t("title"),
    robots: { index: false },
  };
}

export default async function CartPage({
  params,
}: PageProps<"/[locale]/cart">) {
  setRequestLocale((await params).locale);
  return (
    <RequireSession>
      <CartView />
    </RequireSession>
  );
}
