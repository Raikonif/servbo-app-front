import type { Metadata } from "next";
import { clients } from "@/data/store";
import { EntityTable } from "@/features/marketplace/entity-table";
import { currencyFormatter } from "@/features/marketplace/format";

export const metadata: Metadata = {
  title: "Clients",
};

export default function ClientsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <EntityTable
        columns={["Client", "Segment", "Location", "Orders", "Value"]}
        getRowKey={(client) => client.id}
        items={clients}
        renderRow={(client) => (
          <>
            <td className="px-5 py-4">
              <p className="font-medium text-slate-950">{client.name}</p>
              <p className="mt-1 text-sm text-slate-500">{client.email}</p>
            </td>
            <td className="px-5 py-4 text-slate-600">{client.segment}</td>
            <td className="px-5 py-4 text-slate-600">{client.location}</td>
            <td className="px-5 py-4 text-slate-600">{client.orders}</td>
            <td className="px-5 py-4 font-medium text-slate-950">
              {currencyFormatter.format(client.lifetimeValue)}
            </td>
          </>
        )}
        title="Clients"
      />
    </main>
  );
}
