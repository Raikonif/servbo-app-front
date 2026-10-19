import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { AuthShellFallback } from "@/features/auth/auth-shell";
import { CheckEmail } from "@/features/auth/check-email";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/check-email">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.checkEmail" });
  return {
    title: t("title"),
  };
}

// Reads the URL (next, token, auth_error), so it renders on the client.
export default async function Page({
  params,
}: PageProps<"/[locale]/check-email">) {
  setRequestLocale((await params).locale);
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <CheckEmail />
    </Suspense>
  );
}
