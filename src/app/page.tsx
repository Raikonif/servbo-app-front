import { ChevronLeft, ChevronRight, Grid2X2, WifiOff } from "lucide-react";
import Link from "next/link";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";
import { ProductGrid } from "@/features/marketplace/product-grid";
import { getCategories, getProducts } from "@/lib/catalog";

type HomeProps = {
  searchParams: Promise<{ page?: string; category?: string }>;
};

const toPositiveInt = (value?: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const catalogHref = (category?: number, page?: number) => {
  const params = new URLSearchParams();
  if (category) params.set("category", String(category));
  if (page && page > 1) params.set("page", String(page));
  return params.size ? `/?${params}` : "/";
};

export default async function Home({ searchParams }: HomeProps) {
  const query = await searchParams;
  const page = toPositiveInt(query.page) ?? 1;
  const category = toPositiveInt(query.category);

  const [products, categories] = await Promise.allSettled([
    getProducts({ page, category }),
    getCategories(),
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
  const chip = (active: boolean) =>
    `inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
      active
        ? "border-emerald-600 bg-emerald-600 text-white"
        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
    }`;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold">Catalog</h1>
        <p className="mt-1 text-sm text-slate-500">
          {data.count} {data.count === 1 ? "product" : "products"} from our
          sellers
        </p>
      </div>

      {categoryList.length ? (
        <nav
          aria-label="Categories"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          <Link className={chip(!category)} href="/">
            <Grid2X2 size={15} />
            All
          </Link>
          {categoryList.map((item) => (
            <Link
              className={chip(item.id === category)}
              href={catalogHref(item.id)}
              key={item.id}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      ) : null}

      <ProductGrid products={data.results} />

      {data.next || data.previous ? (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between gap-3 text-sm"
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
          <span className="text-slate-500">Page {page}</span>
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
    </main>
  );
}
