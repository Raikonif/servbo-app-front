import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/site";

// Account, auth and API routes are private or useless to crawlers. Pages
// live under /es and /en, so each private path is listed per language.
const PRIVATE_PATHS = [
  "/auth/",
  "/profile",
  "/billing",
  "/cart",
  "/checkout",
  "/orders",
  "/become-a-vendor",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/check-email",
  "/email-verified",
  "/sellers/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        ...routing.locales.flatMap((locale) =>
          PRIVATE_PATHS.map((path) => `/${locale}${path}`),
        ),
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
