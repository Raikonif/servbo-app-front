import { defineRouting } from "next-intl/routing";

// Every page lives under /es or /en (openspec i18n-storefront D1). Only the
// bare "/" detects the language: NEXT_LOCALE cookie, then Accept-Language,
// then Spanish. Unprefixed paths go to /es (src/proxy.ts).
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
  // A year, so a visitor's choice outlives the browser session.
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
  // hreflang comes from each page's metadata (lib/seo.ts), which knows the
  // indexable pages; the header would also tag private ones.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];

export const LOCALE_COOKIE = "NEXT_LOCALE";

// Formats per language (D4): Bolivian Spanish and US English.
export const FORMAT_LOCALE: Record<Locale, string> = {
  es: "es-BO",
  en: "en-US",
};

// OpenGraph locales.
export const OG_LOCALE: Record<Locale, string> = { es: "es_BO", en: "en_US" };

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" &&
  (routing.locales as readonly string[]).includes(value);
