import { ChevronLeft, ChevronRight, SearchX, WifiOff } from "lucide-react";
import Link from "next/link";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";
import { ActiveFilters } from "@/features/marketplace/active-filters";
import { CatalogFilters } from "@/features/marketplace/catalog-filters";
import { CatalogSearch } from "@/features/marketplace/catalog-search";
import { ProductGrid } from "@/features/marketplace/product-grid";
import { ProductPanel } from "@/features/marketplace/product-panel";
import { getCategories, getProduct, getProducts } from "@/lib/catalog";
import {
  catalogHref,
  isFiltered,
  parseCatalogQuery,
  refineHref,
} from "@/lib/catalog-query";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  // Search, filters, sort, page and selection all come from the address
  // (openspec catalog-search-and-filters D6); bad values are dropped.
  const query = parseCatalogQuery(await searchParams);
  const { page } = query;

  const [products, categories, selected] = await Promise.allSettled([
    getProducts(query),
    getCategories(),
    query.product ? getProduct(query.product) : Promise.resolve(null),
  ]);

  if (products.status === "rejected") {
    return (
      <StatusPage
        description="The catalog is unavailable right now. Try again in a few seconds."
        icon={<WifiOff size={22} />}
        title="We can’t reach the catalog"
      >
        <a className={statusLinkStyles.primary} href={catalogHref(query)}>
          Try again
        </a>
      </StatusPage>
    );
  }

  const data = products.value;
  const categoryList =
    categories.status === "fulfilled" ? categories.value : [];
  // Unknown or failed selection: just the catalog, no panel.
  const product = selected.status === "fulfilled" ? selected.value : null;

  const chip = (active: boolean) =>
    `inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
      active
        ? "bg-fg text-bg"
        : "border border-line text-muted hover:border-line-strong hover:text-fg"
    }`;

  // Category chips toggle: several can be on at once (any of them matches).
  const toggleCategory = (id: number) =>
    refineHref(query, {
      categories: query.categories.includes(id)
        ? query.categories.filter((c) => c !== id)
        : [...query.categories, id].sort((a, b) => a - b),
    });

  return (
    <main
      className={`mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8 ${
        product
          ? "lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-8"
          : ""
      }`}
    >
      {/* Left: heading, filters, grid. Right (when selected): the panel,
          starting level with the heading so it always fits the window. */}
      <div className="min-w-0">
        <header className="flex flex-col gap-6">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-accent-text uppercase">
              <span className="size-1.5 rounded-full bg-accent" />
              Marketplace
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Catalog
            </h1>
            <p className="mt-2 text-muted">Products from independent sellers</p>
          </div>

          <div className="flex items-center gap-3">
            <CatalogSearch query={query} />
          </div>

          {categoryList.length ? (
            <nav
              aria-label="Categories"
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
            >
              <Link
                aria-current={!query.categories.length ? "page" : undefined}
                className={chip(!query.categories.length)}
                href={refineHref(query, { categories: [] })}
                scroll={false}
              >
                All
              </Link>
              {categoryList.map((item) => {
                const on = query.categories.includes(item.id);
                return (
                  <Link
                    aria-pressed={on}
                    className={chip(on)}
                    href={toggleCategory(item.id)}
                    key={item.id}
                    role="button"
                    scroll={false}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          ) : null}

          <div className="flex flex-col gap-4">
            <CatalogFilters query={query} />
            <ActiveFilters
              categories={categoryList}
              count={data.count}
              query={query}
            />
          </div>
        </header>

        <div className="mt-8">
          <ProductGrid
            emptyState={
              isFiltered(query) ? <NoMatches q={query.q} /> : undefined
            }
            products={data.results}
            selectHref={(id) =>
              // Clicking the selected card again closes the panel.
              catalogHref(query, {
                product: id === product?.id ? undefined : id,
              })
            }
            selectedId={product?.id}
          />

          {data.next || data.previous ? (
            <nav
              aria-label="Pagination"
              className="mt-10 flex items-center justify-between gap-3 text-sm"
            >
              {data.previous ? (
                <Link
                  className={statusLinkStyles.secondary}
                  href={catalogHref(query, {
                    page: page - 1,
                    product: undefined,
                  })}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-muted tabular-nums">Page {page}</span>
              {data.next ? (
                <Link
                  className={statusLinkStyles.secondary}
                  href={catalogHref(query, {
                    page: page + 1,
                    product: undefined,
                  })}
                >
                  Next
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </div>
      </div>

      {product ? (
        <ProductPanel
          closeHref={catalogHref(query, { product: undefined })}
          key={product.id}
          product={product}
        />
      ) : null}
    </main>
  );
}

function NoMatches({ q }: { q?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line-strong p-12 text-center">
      <SearchX className="mx-auto mb-3 text-subtle" size={24} />
      <p className="font-medium text-fg">
        {q ? `No products match “${q}”` : "No products match these filters"}
      </p>
      <p className="mt-1 text-sm text-muted">
        Try another word, fewer categories or a wider price range.
      </p>
      <Link className={`${statusLinkStyles.secondary} mt-5`} href="/">
        Clear filters
      </Link>
    </div>
  );
}
