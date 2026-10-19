import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequireSession } from "@/features/auth/require-session";
import { ProfileView } from "@/features/marketplace/profile-view";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/profile">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.profile" });
  return {
    title: t("title"),
  };
}

export default async function ProfilePage({
  params,
}: PageProps<"/[locale]/profile">) {
  setRequestLocale((await params).locale);
  return (
    <RequireSession>
      <ProfileView />
    </RequireSession>
  );
}
