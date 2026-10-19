// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import proxy from "./proxy";

const visit = (path: string, headers: Record<string, string> = {}) =>
  proxy(new NextRequest(new URL(path, "https://servbo.test"), { headers }));

const location = (response: Response) =>
  new URL(response.headers.get("location") ?? "").pathname;

describe("the root picks the language", () => {
  it("follows Accept-Language for a first-time visitor", () => {
    const response = visit("/", { "accept-language": "en-US,en;q=0.9" });
    expect(location(response)).toBe("/en");
  });

  it("falls back to Spanish for other languages", () => {
    const response = visit("/", { "accept-language": "pt-BR" });
    expect(location(response)).toBe("/es");
  });

  it("lets the remembered choice beat the system", () => {
    const response = visit("/", {
      "accept-language": "en-US,en;q=0.9",
      cookie: "NEXT_LOCALE=es",
    });
    expect(location(response)).toBe("/es");
  });
});

describe("one address per language", () => {
  it("renders prefixed pages whatever the browser prefers", () => {
    const response = visit("/en/pricing", { "accept-language": "es-BO" });
    expect(response.headers.get("location")).toBeNull();
    expect(
      response.headers.get("x-middleware-request-x-next-intl-locale"),
    ).toBe("en");
  });

  it("moves old unprefixed addresses to Spanish with a 308", () => {
    const response = visit("/products/123?x=1", { "accept-language": "en" });
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://servbo.test/es/products/123?x=1",
    );
  });

  it("keeps email links working before the API prefixes them", () => {
    const response = visit("/reset-password?token=abc");
    expect(response.headers.get("location")).toBe(
      "https://servbo.test/es/reset-password?token=abc",
    );
  });
});
