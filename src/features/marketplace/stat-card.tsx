import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
};

export function StatCard({ helper, icon: Icon, label, value }: StatCardProps) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-fg">
            {value}
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">{helper}</p>
    </article>
  );
}
