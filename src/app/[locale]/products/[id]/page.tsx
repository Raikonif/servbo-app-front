import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductDetail } from "@/features/marketplace/product-detail";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProduct, productHref } from "@/lib/catalog";
import { localizedAlternates } from "@/lib/seo";

type ProductPageProps = PageProps<"/[locale]/products/[id]">;

// ISR (design D13): nothing is prerendered at build; each product page is
// rendered on first request, then served from cache until the API
// revalidates its tags (or 300 s pass).
export async function generateStaticParams() {
  return [];
}

const summarize = (text: string, max = 160) => {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
};

// Shares the cached getProduct fetch with the page: no extra API call.
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "pages.product" });
  const product = await getProduct(id, locale).catch(() => null);
  if (!product) return { title: t("title") };

  const description =
    summarize(product.description) ||
    t("byBrand", { name: product.name, brand: product.brand });
  // Canonical, hreflang es/en/x-default and the OpenGraph locale and URL.
  const localized = localizedAlternates(
    locale as Locale,
    productHref(product.id),
  );
  const images = product.main_image
    ? [{ url: product.main_image, alt: product.name }]
    : undefined;
  return {
    title: product.name,
    description,
    alternates: localized.alternates,
    openGraph: {
      ...localized.openGraph,
      type: "website",
      title: product.name,
      description,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.product");
  const product = await getProduct(id, locale);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-accent-text"
        href="/"
      >
        <ArrowLeft size={16} />
        {t("backToCatalog")}
      </Link>
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <ProductDetail product={product} />
      </div>
    </main>
  );
}
