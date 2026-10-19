import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProducts, productHref } from "@/lib/catalog";
import { parseCatalogQuery } from "@/lib/catalog-query";
import { absoluteUrl } from "@/lib/site";

// Public pages plus every live product (design D15), one entry per language
// with its hreflang alternates (openspec i18n-storefront D7). Product fetches
// are tagged `products`, so the sitemap refreshes with every product change.
// Seller profiles require sign-in, so they are not listed.
const MAX_PAGES = 250; // 20 per page: 5,000 products, far below the 50k cap

type Entry = Omit<MetadataRoute.Sitemap[number], "url" | "alternates">;

// The same page in every language, each listing all of them.
function localized(href: string, entry: Entry): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      absoluteUrl(getPathname({ href, locale })),
    ]),
  );
  const alternates = {
    languages: { ...languages, "x-default": absoluteUrl("/") },
  };
  return routing.locales.map((locale) => ({
    url: languages[locale],
    alternates,
    ...entry,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    ...localized("/", { changeFrequency: "daily", priority: 1 }),
    ...localized("/sellers", { changeFrequency: "weekly" }),
    ...localized("/pricing", { changeFrequency: "monthly" }),
  ];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const data = await getProducts(
        parseCatalogQuery({ page: String(page) }),
        routing.defaultLocale,
      );
      for (const product of data.results) {
        entries.push(
          ...localized(productHref(product.id), {
            lastModified: product.updated_at,
            ...(product.main_image ? { images: [product.main_image] } : {}),
          }),
        );
      }
      if (!data.next) break;
    }
  } catch {
    // API unreachable (e.g. during a container image build): serve the
    // static pages now; the 300 s revalidate adds products once it is up.
  }
  return entries;
}
