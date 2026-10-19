import { describe, expect, it } from "vitest";
import { localizedMetadata } from "./seo";

describe("localizedMetadata", () => {
  it("points the canonical to itself and lists every language", () => {
    const metadata = localizedMetadata("en", "/products/123", {
      title: "Lamp",
    });
    expect(metadata.alternates).toEqual({
      canonical: "/en/products/123",
      languages: {
        es: "/es/products/123",
        en: "/en/products/123",
        "x-default": "/",
      },
    });
    expect(metadata.openGraph).toMatchObject({
      locale: "en_US",
      alternateLocale: ["es_BO"],
      title: "Lamp",
    });
  });

  it("maps the home page to the bare language prefix", () => {
    const metadata = localizedMetadata("es", "/", {});
    expect(metadata.alternates?.canonical).toBe("/es");
  });
});
