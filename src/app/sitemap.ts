import type { MetadataRoute } from "next";
import { getProducts, productHref } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

// Public pages plus every live product (design D15). Product fetches are
// tagged `products`, so the sitemap refreshes with every product change.
// Seller profiles require sign-in, so they are not listed.
const MAX_PAGES = 250; // 20 per page: 5,000 products, far below the 50k cap

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/sellers"), changeFrequency: "weekly" },
    { url: absoluteUrl("/pricing"), changeFrequency: "monthly" },
  ];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const data = await getProducts({ page });
      for (const product of data.results) {
        entries.push({
          url: absoluteUrl(productHref(product.id)),
          lastModified: product.updated_at,
          ...(product.main_image ? { images: [product.main_image] } : {}),
        });
      }
      if (!data.next) break;
    }
  } catch {
    // API unreachable (e.g. during a container image build): serve the
    // static pages now; the 300 s revalidate adds products once it is up.
  }
  return entries;
}
