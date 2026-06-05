import type { ReactNode } from "react";

type EntityTableProps<T> = {
  columns: string[];
  getRowKey: (item: T) => string;
  items: T[];
  renderRow: (item: T) => ReactNode;
  title: string;
};

export function EntityTable<T>({
  columns,
  getRowKey,
  items,
  renderRow,
  title,
}: EntityTableProps<T>) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
            <tr>
              {columns.map((column) => (
                <th className="px-5 py-3 font-semibold" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr className="align-top" key={getRowKey(item)}>
                {renderRow(item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
