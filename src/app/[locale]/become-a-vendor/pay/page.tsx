import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { RequireSession } from "@/features/auth/require-session";
import { BecomeVendorPayPage } from "@/features/marketplace/become-vendor-pay-page";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/become-a-vendor/pay">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "pages.becomeVendorPay",
  });
  return {
    title: t("title"),
    robots: { index: false },
  };
}

export default async function BecomeVendorPayRoute({
  params,
}: PageProps<"/[locale]/become-a-vendor/pay">) {
  setRequestLocale((await params).locale);
  return (
    <RequireSession>
      {/* useSearchParams (?payment=) needs a Suspense boundary. */}
      <Suspense>
        <BecomeVendorPayPage />
      </Suspense>
    </RequireSession>
  );
}
