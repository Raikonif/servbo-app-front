import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Store,
  Truck,
} from "lucide-react";
import Link from "next/link";
import type { Product, SellerProfile } from "@/app/products";

type ProductDetailPageProps = {
  product: Product;
  seller?: SellerProfile;
};

export function ProductDetailPage({ product, seller }: ProductDetailPageProps) {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700"
          href="/"
        >
          <ArrowLeft size={16} />
          Back to marketplace
        </Link>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <div
              className={`relative min-h-[420px] overflow-hidden rounded-lg bg-gradient-to-br shadow-sm ${product.imageClass}`}
            >
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <span className="rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-950 shadow-sm backdrop-blur">
                  {product.category}
                </span>
                <span className="rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-950 shadow-sm backdrop-blur">
                  {product.condition}
                </span>
              </div>
              <div className="absolute inset-x-5 bottom-5 rounded-lg bg-white/92 p-5 shadow-sm backdrop-blur">
                <p className="text-sm font-medium text-slate-500">
                  Listed price
                </p>
                <p className="mt-1 text-4xl font-semibold text-slate-950">
                  {product.price}
                </p>
              </div>
            </div>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">
                    {product.posted} · {product.stock}
                  </p>
                  <h1 className="mt-2 text-4xl font-semibold leading-tight text-slate-950">
                    {product.title}
                  </h1>
                </div>
                <button
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                  type="button"
                >
                  <Heart size={20} />
                  <span className="sr-only">Save product</span>
                </button>
              </div>

              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
                {product.description}
              </p>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ProductFact
                  icon={Store}
                  label="Seller"
                  value={product.seller}
                />
                <ProductFact
                  icon={MapPin}
                  label="Location"
                  value={product.location}
                />
                <ProductFact
                  icon={Star}
                  label="Rating"
                  value={`${product.rating}/5`}
                />
                <ProductFact
                  icon={Clock3}
                  label="Replies in"
                  value={product.repliesIn}
                />
              </dl>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">
                Product details
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {product.specs.map((spec) => (
                  <div
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700"
                    key={spec}
                  >
                    {spec}
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-950">
                    <ShieldCheck className="text-emerald-700" size={17} />
                    Buyer protection
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Contact the seller through Servbo before sharing payment or
                    delivery details.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-950">
                    <Truck className="text-emerald-700" size={17} />
                    Fulfillment
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Pickup and shipping terms are confirmed directly with the
                    seller.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${product.accent}`}
                >
                  <Store size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">
                    {seller?.name ?? product.seller}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {seller?.legalName ?? product.location}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {seller?.bio ??
                  "Seller profile details are being prepared for this listing."}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <SellerMetric
                  label="Sales"
                  value={String(seller?.completedSales ?? 0)}
                />
                <SellerMetric
                  label="Listings"
                  value={String(seller?.activeListings ?? 1)}
                />
                <SellerMetric label="Response" value={product.repliesIn} />
                <SellerMetric label="Rating" value={`${product.rating}/5`} />
              </div>

              <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900">
                <div className="flex items-center gap-2 font-medium">
                  <BadgeCheck size={16} />
                  {seller?.verification ?? "Identity reviewed"}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                Contact seller
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Ask about availability, delivery, or payment terms before
                committing to the listing.
              </p>
              <div className="mt-5 grid gap-2">
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500"
                  type="button"
                >
                  <MessageCircle size={17} />
                  Message seller
                </button>
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                  type="button"
                >
                  <Mail size={17} />
                  Email seller
                </button>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function ProductFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Store;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <dt className="flex items-center gap-2 text-sm text-slate-500">
        <Icon size={16} />
        {label}
      </dt>
      <dd className="mt-2 font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function SellerMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
