import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="flex min-h-[calc(100vh-81px)] items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        ) : null}
        <div className="mt-6 space-y-4">{children}</div>
        {footer ? (
          <div className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
            {footer}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export function AuthShellFallback() {
  return (
    <AuthShell title="Loading…">
      <div className="h-40 animate-pulse rounded-md bg-slate-100" />
    </AuthShell>
  );
}
