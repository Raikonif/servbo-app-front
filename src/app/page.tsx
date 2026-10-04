import { ChevronLeft, ChevronRight, WifiOff } from "lucide-react";
import Link from "next/link";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";
import { ProductGrid } from "@/features/marketplace/product-grid";
import { ProductPanel } from "@/features/marketplace/product-panel";
import { getCategories, getProduct, getProducts } from "@/lib/catalog";

type HomeProps = {
  searchParams: Promise<{ page?: string; category?: string; product?: string }>;
};

const toPositiveInt = (value?: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

// A UUID or nothing: never forward arbitrary input to the API.
const toProductId = (value?: string) =>
  value && /^[0-9a-f-]{36}$/i.test(value) ? value : undefined;

const catalogHref = (category?: number, page?: number, product?: string) => {
  const params = new URLSearchParams();
  if (category) params.set("category", String(category));
  if (page && page > 1) params.set("page", String(page));
  if (product) params.set("product", product);
  return params.size ? `/?${params}` : "/";
};

export default async function Home({ searchParams }: HomeProps) {
  const query = await searchParams;
  const page = toPositiveInt(query.page) ?? 1;
  const category = toPositiveInt(query.category);
  const productId = toProductId(query.product);

  const [products, categories, selected] = await Promise.allSettled([
    getProducts({ page, category }),
    getCategories(),
    productId ? getProduct(productId) : Promise.resolve(null),
  ]);

  if (products.status === "rejected") {
    return (
      <StatusPage
        description="The catalog is unavailable right now. Try again in a few seconds."
        icon={<WifiOff size={22} />}
        title="We can’t reach the catalog"
      >
        <a
          className={statusLinkStyles.primary}
          href={catalogHref(category, page)}
        >
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
            <p className="mt-2 text-muted">
              {data.count} {data.count === 1 ? "product" : "products"} from
              independent sellers
            </p>
          </div>

          {categoryList.length ? (
            <nav
              aria-label="Categories"
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
            >
              <Link
                aria-current={!category ? "page" : undefined}
                className={chip(!category)}
                href="/"
              >
                All
              </Link>
              {categoryList.map((item) => (
                <Link
                  aria-current={item.id === category ? "page" : undefined}
                  className={chip(item.id === category)}
                  href={catalogHref(item.id)}
                  key={item.id}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          ) : null}
        </header>

        <div className="mt-8">
          <ProductGrid
            products={data.results}
            selectHref={(id) =>
              // Clicking the selected card again closes the panel.
              catalogHref(category, page, id === product?.id ? undefined : id)
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
                  href={catalogHref(category, page - 1)}
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
                  href={catalogHref(category, page + 1)}
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
          closeHref={catalogHref(category, page)}
          key={product.id}
          product={product}
        />
      ) : null}
    </main>
  );
}
