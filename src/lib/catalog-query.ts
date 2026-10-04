// Catalogue search, filters, sort and page live in the address (openspec
// catalog-search-and-filters D6). One parser and one serializer so every
// link — chips, pagination, the side panel — keeps the rest of the query.

export const CURRENCIES = ["BOB", "USD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const DEFAULT_CURRENCY: Currency = "BOB";

export const SORTS = {
  newest: { label: "Newest", ordering: "newest" },
  price_asc: { label: "Price: low to high", ordering: "price" },
  price_desc: { label: "Price: high to low", ordering: "-price" },
  name: { label: "Name", ordering: "name" },
} as const;
export type Sort = keyof typeof SORTS;
export const DEFAULT_SORT: Sort = "newest";

export type CatalogQuery = {
  q?: string;
  categories: number[]; // sorted, unique
  min?: string; // decimal string, e.g. "50" or "12.5"
  max?: string;
  // Only set when it matters: with a price bound or a price sort, since
  // prices compare within one currency (design D3).
  currency?: Currency;
  inStock: boolean;
  sort: Sort;
  page: number;
  product?: string; // selected card (side panel)
};

type RawParams = Record<string, string | string[] | undefined>;

const MAX_QUERY_LENGTH = 100;
const PRICE = /^\d{1,8}(\.\d{1,2})?$/;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const positiveInt = (value?: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const price = (value?: string) =>
  value && PRICE.test(value.trim()) ? String(Number(value.trim())) : undefined;

export const isPriceSort = (sort: Sort) =>
  sort === "price_asc" || sort === "price_desc";

// Anything malformed is dropped: a bad link still shows the catalogue.
export function parseCatalogQuery(params: RawParams): CatalogQuery {
  const q = first(params.q)?.trim().slice(0, MAX_QUERY_LENGTH) || undefined;

  // `category` may repeat (?category=1&category=2) or be comma-separated.
  const rawCategories = [params.category].flat().filter(Boolean) as string[];
  const categories = [
    ...new Set(
      rawCategories
        .flatMap((value) => value.split(","))
        .map((value) => positiveInt(value))
        .filter((id): id is number => id !== undefined),
    ),
  ].sort((a, b) => a - b);

  const min = price(first(params.min));
  let max = price(first(params.max));
  if (min && max && Number(min) > Number(max)) max = undefined;

  const rawSort = first(params.sort);
  const sort: Sort = rawSort && rawSort in SORTS ? (rawSort as Sort) : "newest";

  const rawCurrency = first(params.currency)?.toUpperCase();
  const currency =
    min || max || isPriceSort(sort)
      ? (CURRENCIES.find((c) => c === rawCurrency) ?? DEFAULT_CURRENCY)
      : undefined;

  const product = first(params.product);

  return {
    q,
    categories,
    min,
    max,
    currency,
    inStock: first(params.in_stock) === "true",
    sort,
    page: positiveInt(first(params.page)) ?? 1,
    product: product && /^[0-9a-f-]{36}$/i.test(product) ? product : undefined,
  };
}

// Filter or sort changes go back to page 1 and drop the selection unless
// the override says otherwise.
export type QueryChange = Partial<CatalogQuery>;

export function catalogHref(query: CatalogQuery, change: QueryChange = {}) {
  const next = { ...query, ...change };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.categories.length) params.set("category", next.categories.join(","));
  if (next.min) params.set("min", next.min);
  if (next.max) params.set("max", next.max);
  if (next.currency && (next.min || next.max || isPriceSort(next.sort))) {
    params.set("currency", next.currency);
  }
  if (next.inStock) params.set("in_stock", "true");
  if (next.sort !== DEFAULT_SORT) params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  if (next.product) params.set("product", next.product);
  return params.size ? `/?${params}` : "/";
}

// A change to what is shown: back to page 1, no selection.
export const refineHref = (query: CatalogQuery, change: QueryChange) =>
  catalogHref(query, { page: 1, product: undefined, ...change });

export function toApiParams(query: CatalogQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set("search", query.q);
  if (query.categories.length) {
    params.set("categories", query.categories.join(","));
  }
  if (query.currency) params.set("currency", query.currency);
  if (query.min) params.set("min_price", query.min);
  if (query.max) params.set("max_price", query.max);
  if (query.inStock) params.set("in_stock", "true");
  if (query.sort !== DEFAULT_SORT) {
    params.set("ordering", SORTS[query.sort].ordering);
  }
  if (query.page > 1) params.set("page", String(query.page));
  return params;
}

export const isFiltered = (query: CatalogQuery) =>
  Boolean(
    query.q ||
      query.categories.length ||
      query.min ||
      query.max ||
      query.inStock ||
      query.sort !== DEFAULT_SORT,
  );

// What the "Filters (n)" button counts: the controls inside the sheet.
export const sheetFilterCount = (query: CatalogQuery) =>
  (query.min || query.max ? 1 : 0) +
  (query.inStock ? 1 : 0) +
  (query.sort !== DEFAULT_SORT ? 1 : 0);
