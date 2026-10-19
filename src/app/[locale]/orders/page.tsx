import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { RequireSession } from "@/features/auth/require-session";
import { OrdersView } from "@/features/orders/orders-view";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/orders">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.orders" });
  return {
    title: t("title"),
    robots: { index: false },
  };
}

export default async function OrdersPage({
  params,
}: PageProps<"/[locale]/orders">) {
  setRequestLocale((await params).locale);
  return (
    <RequireSession>
      <Suspense>
        <OrdersView />
      </Suspense>
    </RequireSession>
  );
}
