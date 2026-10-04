"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useTransition } from "react";
import {
  type CatalogQuery,
  CURRENCIES,
  type Currency,
  DEFAULT_CURRENCY,
  parseCatalogQuery,
  refineHref,
  SORTS,
  sheetFilterCount,
} from "@/lib/catalog-query";

const control =
  "min-h-10 rounded-full border border-line bg-surface px-3.5 text-sm text-fg outline-none transition focus:border-accent focus:ring-4 focus:ring-accent-soft";

// Price range, stock and sort (openspec catalog-search-and-filters D7): an
// inline toolbar from lg up, a bottom sheet below. Both are GET forms, so
// they work without JavaScript; with it the address is built clean (no empty
// fields) and sort/stock apply as soon as they change on the toolbar.
export function CatalogFilters({ query }: { query: CatalogQuery }) {
  const sheet = useRef<HTMLDialogElement>(null);
  const active = sheetFilterCount(query);

  return (
    <>
      <div className="hidden lg:block">
        <FiltersForm query={query} variant="toolbar" />
      </div>

      <button
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-fg transition hover:border-line-strong lg:hidden"
        onClick={() => sheet.current?.showModal()}
        type="button"
      >
        <SlidersHorizontal size={16} />
        Filters
        {active ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-fg px-1.5 text-xs text-bg tabular-nums">
            <span className="sr-only">, </span>
            {active}
            <span className="sr-only"> active</span>
          </span>
        ) : null}
      </button>

      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is a pointer shortcut; Escape and the close button cover keyboards. */}
      <dialog
        aria-labelledby="filters-sheet-title"
        className="filters-sheet lg:hidden"
        onClick={(event) => {
          // A click on the backdrop (outside the panel) closes the sheet.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        ref={sheet}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
          <h2 className="text-base font-semibold" id="filters-sheet-title">
            Filters
          </h2>
          <button
            aria-label="Close filters"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
            onClick={() => sheet.current?.close()}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <FiltersForm
          onApplied={() => sheet.current?.close()}
          query={query}
          variant="sheet"
        />
      </dialog>
    </>
  );
}

function FiltersForm({
  query,
  variant,
  onApplied,
}: {
  query: CatalogQuery;
  variant: "toolbar" | "sheet";
  onApplied?: () => void;
}) {
  const id = useId();
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [, startTransition] = useTransition();
  const toolbar = variant === "toolbar";

  // Read the form back through the address parser: one set of rules for
  // what is valid, and a clean URL.
  const apply = () => {
    if (!form.current) return;
    const data = new FormData(form.current);
    const next = parseCatalogQuery(
      Object.fromEntries(
        [...data.entries()].map(([key, value]) => [key, String(value)]),
      ),
    );
    startTransition(() => {
      router.push(
        refineHref(query, {
          min: next.min,
          max: next.max,
          currency: next.currency,
          inStock: next.inStock,
          sort: next.sort,
        }),
        { scroll: false },
      );
    });
    onApplied?.();
  };

  const field = (name: string) => `${id}-${name}`;

  return (
    <form
      action="/"
      // Remount on address change so defaults follow Back and removed chips.
      key={`${query.min}-${query.max}-${query.currency}-${query.inStock}-${query.sort}`}
      className={
        toolbar
          ? "flex flex-wrap items-end gap-3"
          : "flex flex-col gap-5 px-5 pt-2 pb-5"
      }
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
      ref={form}
    >
      {query.q ? <input name="q" type="hidden" value={query.q} /> : null}
      {query.categories.length ? (
        <input
          name="category"
          type="hidden"
          value={query.categories.join(",")}
        />
      ) : null}

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-xs font-medium text-muted">Price</legend>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={field("min")}>
            Minimum price
          </label>
          <input
            className={`${control} w-24`}
            defaultValue={query.min}
            id={field("min")}
            inputMode="decimal"
            min={0}
            name="min"
            placeholder="Min"
            step="0.01"
            type="number"
          />
          <span aria-hidden className="text-subtle">
            –
          </span>
          <label className="sr-only" htmlFor={field("max")}>
            Maximum price
          </label>
          <input
            className={`${control} w-24`}
            defaultValue={query.max}
            id={field("max")}
            inputMode="decimal"
            min={0}
            name="max"
            placeholder="Max"
            step="0.01"
            type="number"
          />
          <label className="sr-only" htmlFor={field("currency")}>
            Currency
          </label>
          <select
            className={control}
            defaultValue={query.currency ?? DEFAULT_CURRENCY}
            id={field("currency")}
            name="currency"
          >
            {CURRENCIES.map((currency: Currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <label
        className={`inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm text-fg ${
          toolbar ? "" : "justify-between"
        }`}
        htmlFor={field("stock")}
      >
        <input
          className="size-4 accent-[var(--accent-hover)]"
          defaultChecked={query.inStock}
          id={field("stock")}
          name="in_stock"
          onChange={toolbar ? apply : undefined}
          type="checkbox"
          value="true"
        />
        In stock only
      </label>

      <div className="flex flex-col gap-1.5">
        <label
          className="text-xs font-medium text-muted"
          htmlFor={field("sort")}
        >
          Sort by
        </label>
        <select
          className={control}
          defaultValue={query.sort}
          id={field("sort")}
          name="sort"
          onChange={toolbar ? apply : undefined}
        >
          {Object.entries(SORTS).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <button
        className={
          toolbar
            ? "min-h-10 rounded-full border border-line px-4 text-sm font-medium text-fg transition hover:border-accent hover:text-accent-text"
            : "min-h-12 rounded-full bg-accent px-4 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover"
        }
        type="submit"
      >
        {toolbar ? "Apply price" : "Apply"}
      </button>
    </form>
  );
}
