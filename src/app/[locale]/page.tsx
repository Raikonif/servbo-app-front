import { ChevronLeft, ChevronRight, SearchX, WifiOff } from "lucide-react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";
import { ActiveFilters } from "@/features/marketplace/active-filters";
import { CatalogFilters } from "@/features/marketplace/catalog-filters";
import { CatalogSearch } from "@/features/marketplace/catalog-search";
import { ProductGrid } from "@/features/marketplace/product-grid";
import { ProductPanel } from "@/features/marketplace/product-panel";
import { getPathname, Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCategories, getProduct, getProducts } from "@/lib/catalog";
import {
  catalogHref,
  isFiltered,
  parseCatalogQuery,
  refineHref,
} from "@/lib/catalog-query";
import { localizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return localizedMetadata(locale as Locale, "/", {
    title: t("pages.home.title"),
    description: t("seo.homeDescription"),
  });
}

export default async function Home({
  params,
  searchParams,
}: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.home");
  // Search, filters, sort, page and selection all come from the address
  // (openspec catalog-search-and-filters D6); bad values are dropped.
  const query = parseCatalogQuery(await searchParams);
  const { page } = query;

  const [products, categories, selected] = await Promise.allSettled([
    getProducts(query, locale),
    getCategories(locale),
    query.product ? getProduct(query.product, locale) : Promise.resolve(null),
  ]);

  if (products.status === "rejected") {
    const s = await getTranslations("status");
    return (
      <StatusPage
        description={s("catalogUnavailable.description")}
        icon={<WifiOff size={22} />}
        title={s("catalogUnavailable.title")}
      >
        {/* A full reload, so the catalog fetch runs again. */}
        <a
          className={statusLinkStyles.primary}
          href={getPathname({ href: catalogHref(query), locale })}
        >
          {s("tryAgain")}
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
              {t("eyebrow")}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-2 text-muted">{t("subtitle")}</p>
          </div>

          <div className="flex items-center gap-3">
            <CatalogSearch query={query} />
          </div>

          {categoryList.length ? (
            <nav
              aria-label={t("categoriesLabel")}
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
            >
              <Link
                aria-current={!query.categories.length ? "page" : undefined}
                className={chip(!query.categories.length)}
                href={refineHref(query, { categories: [] })}
                scroll={false}
              >
                {t("allCategories")}
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
              aria-label={t("paginationLabel")}
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
                  {t("previous")}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-muted tabular-nums">
                {t("page", { page })}
              </span>
              {data.next ? (
                <Link
                  className={statusLinkStyles.secondary}
                  href={catalogHref(query, {
                    page: page + 1,
                    product: undefined,
                  })}
                >
                  {t("next")}
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
  const t = useTranslations("pages.home");
  return (
    <div className="rounded-3xl border border-dashed border-line-strong p-12 text-center">
      <SearchX className="mx-auto mb-3 text-subtle" size={24} />
      <p className="font-medium text-fg">
        {q ? t("noMatchesQuery", { q }) : t("noMatchesFilters")}
      </p>
      <p className="mt-1 text-sm text-muted">{t("noMatchesHint")}</p>
      <Link className={`${statusLinkStyles.secondary} mt-5`} href="/">
        {t("clearFilters")}
      </Link>
    </div>
  );
}
