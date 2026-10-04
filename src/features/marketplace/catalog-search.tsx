"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { type CatalogQuery, refineHref } from "@/lib/catalog-query";

const TYPING_PAUSE_MS = 350;

// Catalogue search (openspec catalog-search-and-filters D7). Without
// JavaScript it is a plain GET form; with it, results follow typing after a
// pause (replacing history, not adding an entry per keystroke) and Enter
// pushes a history entry.
export function CatalogSearch({ query }: { query: CatalogQuery }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [value, setValue] = useState(query.q ?? "");
  const [pending, startTransition] = useTransition();

  // Follow the address (a removed chip, Back) — but never overwrite what
  // the visitor is typing.
  useEffect(() => {
    if (document.activeElement !== input.current) setValue(query.q ?? "");
  }, [query.q]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (text: string, mode: "push" | "replace") => {
    clearTimeout(timer.current);
    const q = text.trim() || undefined;
    if (q === query.q) return;
    startTransition(() => {
      router[mode](refineHref(query, { q }), { scroll: false });
    });
  };

  return (
    <search className="w-full max-w-xl">
      <form
        action="/"
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          go(value, "push");
        }}
      >
        <label className="sr-only" htmlFor="catalog-search">
          Search products
        </label>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-subtle"
          size={18}
        />
        <input
          autoComplete="off"
          className="min-h-12 w-full rounded-full border border-line bg-surface pr-12 pl-11 text-sm text-fg shadow-sm outline-none transition placeholder:text-subtle focus:border-accent focus:ring-4 focus:ring-accent-soft [&::-webkit-search-cancel-button]:hidden"
          enterKeyHint="search"
          id="catalog-search"
          maxLength={100}
          name="q"
          onChange={(event) => {
            const text = event.target.value;
            setValue(text);
            clearTimeout(timer.current);
            timer.current = setTimeout(
              () => go(text, "replace"),
              TYPING_PAUSE_MS,
            );
          }}
          placeholder="Search products, brands…"
          ref={input}
          type="search"
          value={value}
        />
        {/* Without JavaScript the form submits these too; they keep the
          current categories and filters. */}
        {query.categories.length ? (
          <input
            name="category"
            type="hidden"
            value={query.categories.join(",")}
          />
        ) : null}
        {query.min ? (
          <input name="min" type="hidden" value={query.min} />
        ) : null}
        {query.max ? (
          <input name="max" type="hidden" value={query.max} />
        ) : null}
        {query.currency ? (
          <input name="currency" type="hidden" value={query.currency} />
        ) : null}
        {query.inStock ? (
          <input name="in_stock" type="hidden" value="true" />
        ) : null}
        {query.sort !== "newest" ? (
          <input name="sort" type="hidden" value={query.sort} />
        ) : null}
        {value ? (
          <button
            aria-label="Clear search"
            className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
            onClick={() => {
              setValue("");
              go("", "push");
              input.current?.focus();
            }}
            type="button"
          >
            <X size={16} />
          </button>
        ) : null}
        <span aria-live="polite" className="sr-only">
          {pending ? "Searching…" : ""}
        </span>
      </form>
    </search>
  );
}
