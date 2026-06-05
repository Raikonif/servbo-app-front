import type { Metadata } from "next";
import { sellers } from "@/data/store";
import { EntityTable } from "@/features/marketplace/entity-table";

export const metadata: Metadata = {
  title: "Sellers",
};

export default function SellersPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <EntityTable
        columns={["Seller", "Location", "Rating", "Response", "Status"]}
        getRowKey={(seller) => seller.id}
        items={sellers}
        renderRow={(seller) => (
          <>
            <td className="px-5 py-4">
              <p className="font-medium text-slate-950">{seller.name}</p>
              <p className="mt-1 text-sm text-slate-500">{seller.email}</p>
            </td>
            <td className="px-5 py-4 text-slate-600">{seller.location}</td>
            <td className="px-5 py-4 text-slate-600">{seller.rating}/5</td>
            <td className="px-5 py-4 text-slate-600">{seller.responseTime}</td>
            <td className="px-5 py-4">
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700">
                {seller.verified ? "verified" : "pending"}
              </span>
            </td>
          </>
        )}
        title="Sellers"
      />
    </main>
  );
}
