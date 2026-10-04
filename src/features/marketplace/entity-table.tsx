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
    <section className="rounded-lg border border-line bg-surface shadow-sm">
      <div className="border-b border-line p-5">
        <h1 className="text-2xl font-semibold text-fg">{title}</h1>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-normal text-muted">
            <tr>
              {columns.map((column) => (
                <th className="px-5 py-3 font-semibold" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
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
