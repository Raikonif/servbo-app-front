import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { type Locale, OG_LOCALE, routing } from "@/i18n/routing";

// Canonical, hreflang and OpenGraph locale for an indexable page (openspec
// i18n-storefront D5). `path` is the unprefixed app path ("/pricing").
// metadataBase (root layout) turns these into absolute URLs.
export function localizedAlternates(
  locale: Locale,
  path: string,
): Pick<Metadata, "alternates"> & {
  openGraph: { locale: string; alternateLocale: string[]; url: string };
} {
  const href = (value: Locale) => getPathname({ href: path, locale: value });
  return {
    alternates: {
      canonical: href(locale),
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, href(l)])),
        "x-default": "/",
      },
    },
    openGraph: {
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => OG_LOCALE[l]),
      url: href(locale),
    },
  };
}

// Title, description and the tags above. Pages with their own OpenGraph
// fields (products) spread `openGraph` into theirs.
export function localizedMetadata(
  locale: Locale,
  path: string,
  { title, description }: { title?: string; description?: string },
): Metadata {
  const localized = localizedAlternates(locale, path);
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: localized.alternates,
    openGraph: {
      ...localized.openGraph,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    },
  };
}
