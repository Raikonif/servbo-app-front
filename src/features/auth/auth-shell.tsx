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
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-fg">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        ) : null}
        <div className="mt-6 space-y-4">{children}</div>
        {footer ? (
          <div className="mt-6 border-t border-line pt-4 text-sm text-muted">
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
      <div className="h-40 animate-pulse rounded-md bg-surface-2" />
    </AuthShell>
  );
}
