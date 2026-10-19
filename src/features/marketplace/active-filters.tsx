import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/lib/catalog";
import {
  type CatalogQuery,
  DEFAULT_SORT,
  isFiltered,
  isPriceSort,
  refineHref,
} from "@/lib/catalog-query";

type Chip = { label: string; href: string };

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
  const t = useTranslations("catalog");
  const priceLabel = ({ min = "", max = "", currency }: CatalogQuery) => {
    const values = { min, max, currency: currency ?? "" };
    if (min && max) return t("active.priceRange", values);
    if (min) return t("active.priceFrom", values);
    return t("active.priceTo", values);
  };

  const chips: Chip[] = [];
  if (query.q) {
    chips.push({
      label: t("active.query", { q: query.q }),
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
      label: t("active.inStock"),
      href: refineHref(query, { inStock: false }),
    });
  }
  if (query.sort !== DEFAULT_SORT) {
    // A price sort compares one currency, so say which.
    const sort = t(`sort.${query.sort}`);
    chips.push({
      label: isPriceSort(query.sort)
        ? t("active.sortWithCurrency", {
            sort,
            currency: query.currency ?? "",
          })
        : sort,
      href: refineHref(query, { sort: DEFAULT_SORT }),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <p aria-live="polite" className="mr-1 text-muted tabular-nums">
        {t("active.count", { count })}
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
          <span className="sr-only">{t("active.remove")}</span>
        </Link>
      ))}
      {isFiltered(query) ? (
        <Link
          className="ml-1 font-medium text-muted underline-offset-4 hover:text-fg hover:underline"
          href="/"
          scroll={false}
        >
          {t("active.clearAll")}
        </Link>
      ) : null}
    </div>
  );
}
