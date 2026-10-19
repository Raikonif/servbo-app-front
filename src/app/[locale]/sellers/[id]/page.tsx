import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequireSession } from "@/features/auth/require-session";
import { SellerProfilePage } from "@/features/marketplace/seller-profile-page";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sellers/[id]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.seller" });
  return {
    title: t("title"),
  };
}

export default async function SellerPage({
  params,
}: PageProps<"/[locale]/sellers/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <RequireSession>
      <SellerProfilePage sellerId={id} />
    </RequireSession>
  );
}
