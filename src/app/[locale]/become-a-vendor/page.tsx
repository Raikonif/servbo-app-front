import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequireSession } from "@/features/auth/require-session";
import { BecomeVendorPage } from "@/features/marketplace/become-vendor-page";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/become-a-vendor">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.becomeVendor" });
  return {
    title: t("title"),
  };
}

export default async function BecomeVendorRoute({
  params,
}: PageProps<"/[locale]/become-a-vendor">) {
  setRequestLocale((await params).locale);
  return (
    <RequireSession>
      <BecomeVendorPage />
    </RequireSession>
  );
}
