import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequireSession } from "@/features/auth/require-session";
import { BillingPage } from "@/features/marketplace/billing-page";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/billing">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.billing" });
  return {
    title: t("title"),
  };
}

export default async function BillingRoute({
  params,
}: PageProps<"/[locale]/billing">) {
  setRequestLocale((await params).locale);
  return (
    <RequireSession>
      <BillingPage />
    </RequireSession>
  );
}
