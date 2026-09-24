import type { ReactNode } from "react";

type StatusPageProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
};

export function StatusPage({
  icon,
  title,
  description,
  children,
}: StatusPageProps) {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        {icon}
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {children ? (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {children}
        </div>
      ) : null}
    </main>
  );
}

export const statusLinkStyles = {
  primary:
    "inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500",
  secondary:
    "inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700",
};
