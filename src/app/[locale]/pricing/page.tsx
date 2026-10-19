import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PricingPage } from "@/features/marketplace/pricing-page";
import type { Locale } from "@/i18n/routing";
import { localizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return localizedMetadata(locale as Locale, "/pricing", {
    title: t("pages.pricing.title"),
    description: t("seo.pricingDescription"),
  });
}

export default async function PricingRoute({
  params,
}: PageProps<"/[locale]/pricing">) {
  setRequestLocale((await params).locale);
  return <PricingPage />;
}
