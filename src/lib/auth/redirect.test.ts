import { describe, expect, it } from "vitest";
import { safeNext } from "./redirect";

describe("safeNext", () => {
  it("keeps app paths unprefixed", () => {
    expect(safeNext("/es/cart?x=1")).toBe("/cart?x=1");
    expect(safeNext("/en")).toBe("/");
    expect(safeNext("/cart")).toBe("/cart");
    expect(safeNext("/english-books")).toBe("/english-books");
  });

  it("never returns to the auth pages or leaves the site", () => {
    expect(safeNext("/en/login")).toBe("/");
    expect(safeNext("//evil.com")).toBe("/");
    expect(safeNext("https://evil.com")).toBe("/");
  });
});
