import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Account, auth and API routes are private or useless to crawlers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/profile",
        "/billing",
        "/become-a-vendor",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/check-email",
        "/email-verified",
        "/sellers/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
