import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/features/marketplace/product-detail";
import { getProduct, productHref } from "@/lib/catalog";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

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
  const { id } = await params;
  const product = await getProduct(id).catch(() => null);
  if (!product) return { title: "Product" };

  const description =
    summarize(product.description) || `${product.name} by ${product.brand}`;
  const images = product.main_image
    ? [{ url: product.main_image, alt: product.name }]
    : undefined;
  return {
    title: product.name,
    description,
    alternates: { canonical: productHref(product.id) },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: productHref(product.id),
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
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-accent-text"
        href="/"
      >
        <ArrowLeft size={16} />
        Back to catalog
      </Link>
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-6">
        <ProductDetail product={product} />
      </div>
    </main>
  );
}
