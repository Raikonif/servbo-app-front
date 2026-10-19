import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { AuthCallback } from "@/features/auth/auth-callback";
import { AuthShellFallback } from "@/features/auth/auth-shell";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/auth/callback">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.authCallback" });
  return {
    title: t("title"),
  };
}

// Reads the URL (next, token, auth_error), so it renders on the client.
export default async function Page({
  params,
}: PageProps<"/[locale]/auth/callback">) {
  setRequestLocale((await params).locale);
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <AuthCallback />
    </Suspense>
  );
}
