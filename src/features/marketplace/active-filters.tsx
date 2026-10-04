import { X } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/lib/catalog";
import {
  type CatalogQuery,
  DEFAULT_SORT,
  isFiltered,
  isPriceSort,
  refineHref,
  SORTS,
} from "@/lib/catalog-query";

type Chip = { label: string; href: string };

const priceLabel = ({ min, max, currency }: CatalogQuery) => {
  if (min && max) return `${min}–${max} ${currency}`;
  if (min) return `From ${min} ${currency}`;
  return `Up to ${max} ${currency}`;
};

// Result count plus one removable chip per active filter (openspec
// catalog-search-and-filters, "Active filters and result count").
export function ActiveFilters({
  query,
  count,
  categories,
}: {
  query: CatalogQuery;
  count: number;
  categories: Category[];
}) {
  const chips: Chip[] = [];
  if (query.q) {
    chips.push({
      label: `“${query.q}”`,
      href: refineHref(query, { q: undefined }),
    });
  }
  for (const id of query.categories) {
    const name = categories.find((c) => c.id === id)?.name ?? `#${id}`;
    chips.push({
      label: name,
      href: refineHref(query, {
        categories: query.categories.filter((c) => c !== id),
      }),
    });
  }
  if (query.min || query.max) {
    chips.push({
      label: priceLabel(query),
      href: refineHref(query, { min: undefined, max: undefined }),
    });
  }
  if (query.inStock) {
    chips.push({
      label: "In stock",
      href: refineHref(query, { inStock: false }),
    });
  }
  if (query.sort !== DEFAULT_SORT) {
    // A price sort compares one currency, so say which.
    const suffix = isPriceSort(query.sort) ? ` (${query.currency})` : "";
    chips.push({
      label: `${SORTS[query.sort].label}${suffix}`,
      href: refineHref(query, { sort: DEFAULT_SORT }),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <p aria-live="polite" className="mr-1 text-muted tabular-nums">
        {count} {count === 1 ? "product" : "products"}
      </p>
      {chips.map((chip) => (
        <Link
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-accent-soft py-1 pr-2 pl-3 font-medium text-accent-text transition hover:bg-accent/25"
          href={chip.href}
          key={chip.href}
          scroll={false}
        >
          {chip.label}
          <X aria-hidden size={14} />
          <span className="sr-only">(remove filter)</span>
        </Link>
      ))}
      {isFiltered(query) ? (
        <Link
          className="ml-1 font-medium text-muted underline-offset-4 hover:text-fg hover:underline"
          href="/"
          scroll={false}
        >
          Clear all
        </Link>
      ) : null}
    </div>
  );
}
