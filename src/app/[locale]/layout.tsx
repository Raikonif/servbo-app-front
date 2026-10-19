import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StoreHeader } from "@/features/marketplace/store-header";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";
import { themeScript } from "@/lib/theme";
import { Providers } from "./providers";
import "../globals.css";

// Both languages are prerendered where pages are static.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    // Resolves relative canonical/Open Graph URLs to absolute ones.
    metadataBase: siteUrl,
    title: { default: t("siteName"), template: t("titleTemplate") },
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    // suppressHydrationWarning: the theme script sets data-theme before React
    // hydrates, which is intentional and limited to this element.
    <html
      className="scroll-smooth"
      data-scroll-behavior="smooth"
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, first-party script; must run before paint to avoid a theme flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg font-sans text-fg antialiased">
        <NextIntlClientProvider>
          <Providers>
            {/* Inside Providers: the header reads the session. */}
            <StoreHeader />
            {children}
            {/* @modal slot: the product detail intercepted over the page. */}
            {modal}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
