import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { RequireSession } from "@/features/auth/require-session";
import { CheckoutView } from "@/features/cart/checkout-view";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/checkout">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.checkout" });
  return {
    title: t("title"),
    robots: { index: false },
  };
}

export default async function CheckoutPage({
  params,
}: PageProps<"/[locale]/checkout">) {
  setRequestLocale((await params).locale);
  return (
    <RequireSession>
      {/* useSearchParams (?seller=) needs a Suspense boundary. */}
      <Suspense>
        <CheckoutView />
      </Suspense>
    </RequireSession>
  );
}
