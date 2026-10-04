import { Store, WifiOff } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { StatusPage, statusLinkStyles } from "@/features/errors/status-page";
import { SellerLink } from "@/features/marketplace/seller-link";
import { getSellers, type Seller } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Sellers",
};

export default async function SellersPage() {
  // Always live data; also keeps the fetch out of the build-time prerender.
  await connection();
  let sellers: Seller[];
  try {
    sellers = await getSellers();
  } catch {
    return (
      <StatusPage
        description="The seller directory is unavailable right now. Try again in a few seconds."
        icon={<WifiOff size={22} />}
        title="We can’t reach the server"
      >
        <a className={statusLinkStyles.primary} href="/sellers">
          Try again
        </a>
      </StatusPage>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold">Sellers</h1>
        <p className="mt-1 text-sm text-muted">
          {sellers.length} {sellers.length === 1 ? "seller" : "sellers"} on
          Servbo
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
                  {seller.product_count}{" "}
                  {seller.product_count === 1 ? "product" : "products"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-line bg-surface p-8 text-center text-sm text-muted">
          No sellers yet.
        </div>
      )}
    </main>
  );
}
