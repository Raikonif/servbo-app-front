import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequireSession } from "@/features/auth/require-session";
import { OrderDetailView } from "@/features/orders/order-detail-view";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/orders/[id]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.order" });
  return {
    title: t("title"),
    robots: { index: false },
  };
}

export default async function OrderPage({
  params,
}: PageProps<"/[locale]/orders/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <RequireSession>
      <OrderDetailView orderId={id} />
    </RequireSession>
  );
}
