import { Store, WifiOff } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";
import { SellerLink } from "@/features/marketplace/seller-link";
import { RatingSummary } from "@/features/reviews/stars";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSellers, type Seller } from "@/lib/catalog";
import { ratingNumber } from "@/lib/reviews";
import { localizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sellers">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return localizedMetadata(locale as Locale, "/sellers", {
    title: t("pages.sellers.title"),
    description: t("seo.sellersDescription"),
  });
}

export default async function SellersPage({
  params,
}: PageProps<"/[locale]/sellers">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  // Always live data; also keeps the fetch out of the build-time prerender.
  await connection();
  let sellers: Seller[];
  try {
    sellers = await getSellers(locale);
  } catch {
    return (
      <StatusPage
        description={t("status.sellersUnavailable.description")}
        icon={<WifiOff size={22} />}
        title={t("status.sellersUnavailable.title")}
      >
        <a
          className={statusLinkStyles.primary}
          href={getPathname({ href: "/sellers", locale })}
        >
          {t("status.tryAgain")}
        </a>
      </StatusPage>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold">{t("pages.sellers.title")}</h1>
        <p className="mt-1 text-sm text-muted">
          {t("pages.sellers.count", { count: sellers.length })}
        </p>
      </div>

      {sellers.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map((seller) => (
            <li
              className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-sm"
              key={seller.id}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
                <Store size={18} />
              </span>
              <div className="min-w-0">
                <SellerLink
                  className="font-semibold text-fg hover:text-accent-text"
                  sellerId={seller.id}
                  showHint
                >
                  {seller.display_name}
                </SellerLink>
                <p className="text-sm text-muted">
                  {t("pages.sellers.productCount", {
                    count: seller.product_count,
                  })}
                </p>
                <RatingSummary
                  avg={ratingNumber(seller.rating_avg)}
                  className="text-xs"
                  count={seller.rating_count ?? 0}
                  emptyLabel={null}
                  size={12}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-line bg-surface p-8 text-center text-sm text-muted">
          {t("pages.sellers.empty")}
        </div>
      )}
    </main>
  );
}
