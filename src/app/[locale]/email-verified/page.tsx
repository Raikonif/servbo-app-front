import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { AuthShellFallback } from "@/features/auth/auth-shell";
import { VerifyEmail } from "@/features/auth/verify-email";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/email-verified">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.emailVerified" });
  return {
    title: t("title"),
  };
}

// Reads the URL (next, token, auth_error), so it renders on the client.
export default async function Page({
  params,
}: PageProps<"/[locale]/email-verified">) {
  setRequestLocale((await params).locale);
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <VerifyEmail />
    </Suspense>
  );
}
