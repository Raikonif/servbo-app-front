// Absolute public base of the storefront: canonical URLs, Open Graph, JSON-LD
// and the sitemap. Server-only and read at runtime, so one image serves every
// environment (SITE_URL in .env / docker-compose.yml).
// On Vercel it falls back to the project's production domain.
export const siteUrl = new URL(
  process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3003"),
);

export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
