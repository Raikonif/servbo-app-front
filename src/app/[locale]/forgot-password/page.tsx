import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { AuthShellFallback } from "@/features/auth/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/forgot-password">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "pages.forgotPassword",
  });
  return {
    title: t("title"),
  };
}

// Reads the URL (next), so it renders on the client.
export default async function Page({
  params,
}: PageProps<"/[locale]/forgot-password">) {
  setRequestLocale((await params).locale);
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
