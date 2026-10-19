import {
  type MessageFormatElement,
  parse,
} from "@formatjs/icu-messageformat-parser";
import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

type Tree = { [key: string]: string | Tree };

const keys = (tree: Tree, prefix = ""): string[] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string"
      ? [`${prefix}${key}`]
      : keys(value, `${prefix}${key}.`),
  );

// ICU arguments ({name}, {count, plural, ...}) and rich-text tags must
// match between languages. Parsing also catches broken ICU syntax.
const names = (elements: MessageFormatElement[]): string[] =>
  elements.flatMap((element) => {
    const own = "value" in element && element.type !== 0 ? [element.value] : [];
    const nested =
      "options" in element
        ? Object.values(element.options).flatMap((o) => names(o.value))
        : "children" in element
          ? names(element.children)
          : [];
    return [...own, ...nested].map(String);
  });

const args = (text: string) => [...new Set(names(parse(text)))].sort();

const lookup = (tree: Tree, key: string) =>
  key
    .split(".")
    .reduce<string | Tree>(
      (node, part) => (node as Tree)[part],
      tree,
    ) as string;

describe("messages", () => {
  it("has the same keys in Spanish and English", () => {
    expect(keys(en as Tree).sort()).toEqual(keys(es as Tree).sort());
  });

  it("uses the same arguments in both languages", () => {
    for (const key of keys(es as Tree)) {
      expect([key, ...args(lookup(en as Tree, key))]).toEqual([
        key,
        ...args(lookup(es as Tree, key)),
      ]);
    }
  });

  it("has no empty texts", () => {
    for (const tree of [es, en] as Tree[]) {
      for (const key of keys(tree))
        expect([key, lookup(tree, key)]).not.toEqual([key, ""]);
    }
  });
});
