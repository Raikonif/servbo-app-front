import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/catalog", async (original) => ({
  ...(await original<typeof import("@/lib/catalog")>()),
  getProducts: vi.fn(async () => ({
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        id: "p1",
        updated_at: "2026-10-01T00:00:00Z",
        main_image: null,
      },
    ],
  })),
}));
vi.mock("@/lib/site", () => ({
  absoluteUrl: (path: string) => new URL(path, "https://servbo.test").href,
}));

const { default: sitemap } = await import("./sitemap");

describe("sitemap", () => {
  it("lists every page in both languages with their alternates", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(urls).toEqual(
      expect.arrayContaining([
        "https://servbo.test/es",
        "https://servbo.test/en",
        "https://servbo.test/es/pricing",
        "https://servbo.test/en/sellers",
        "https://servbo.test/es/products/p1",
        "https://servbo.test/en/products/p1",
      ]),
    );
    const product = entries.find(
      (entry) => entry.url === "https://servbo.test/en/products/p1",
    );
    expect(product?.alternates?.languages).toEqual({
      es: "https://servbo.test/es/products/p1",
      en: "https://servbo.test/en/products/p1",
      "x-default": "https://servbo.test/",
    });
  });
});
