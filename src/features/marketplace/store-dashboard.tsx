import {
  BadgeDollarSign,
  Boxes,
  PackageCheck,
  Store,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type { Client, Product, Seller, StoreStats } from "@/domain/store";
import { currencyFormatter } from "./format";
import { StatCard } from "./stat-card";

type StoreDashboardProps = {
  clients: Client[];
  products: Product[];
  sellers: Seller[];
  stats: StoreStats;
};

export function StoreDashboard({
  clients,
  products,
  sellers,
  stats,
}: StoreDashboardProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
            Store operations
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            A practical foundation for catalog, client, and seller workflows.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            This first approach keeps data contracts, page routes, and reusable
            UI separate so the app can later connect to authentication, a
            database, and transactional APIs without reshaping the whole tree.
          </p>
        </div>
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Next implementation targets
          </h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>1. Replace seeded data with repository functions.</p>
            <p>2. Add seller and client detail routes.</p>
            <p>3. Gate management actions behind auth roles.</p>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          helper="Visible listings"
          icon={PackageCheck}
          label="Active products"
          value={String(stats.activeProducts)}
        />
        <StatCard
          helper="Known buyers"
          icon={UsersRound}
          label="Clients"
          value={String(stats.clients)}
        />
        <StatCard
          helper="Marketplace supply"
          icon={Store}
          label="Sellers"
          value={String(stats.sellers)}
        />
        <StatCard
          helper="Across all products"
          icon={Boxes}
          label="Inventory"
          value={String(stats.inventoryUnits)}
        />
        <StatCard
          helper="Seed client value"
          icon={BadgeDollarSign}
          label="Revenue"
          value={currencyFormatter.format(stats.estimatedRevenue)}
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <PreviewList
          href="/products"
          items={products.map((product) => ({
            meta: `${product.category} - ${currencyFormatter.format(product.price)}`,
            name: product.name,
          }))}
          title="Products"
        />
        <PreviewList
          href="/clients"
          items={clients.map((client) => ({
            meta: `${client.segment} - ${client.orders} orders`,
            name: client.name,
          }))}
          title="Clients"
        />
        <PreviewList
          href="/sellers"
          items={sellers.map((seller) => ({
            meta: `${seller.location} - ${seller.rating}/5`,
            name: seller.name,
          }))}
          title="Sellers"
        />
      </section>
    </main>
  );
}

function PreviewList({
  href,
  items,
  title,
}: {
  href: string;
  items: Array<{ meta: string; name: string }>;
  title: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <Link className="text-sm font-medium text-emerald-700" href={href}>
          View all
        </Link>
      </div>
      <div className="mt-4 divide-y divide-slate-100">
        {items.map((item) => (
          <div className="py-3" key={item.name}>
            <p className="font-medium text-slate-950">{item.name}</p>
            <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
