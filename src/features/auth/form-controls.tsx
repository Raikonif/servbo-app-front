import type { ComponentProps, ReactNode } from "react";

export function FormAlert({
  children,
  action,
  tone = "error",
}: {
  children: ReactNode;
  action?: ReactNode;
  tone?: "error" | "success";
}) {
  const colors =
    tone === "error"
      ? "border-danger/30 bg-danger-soft text-danger"
      : "border-accent/40 bg-accent-soft text-accent-text";
  return (
    <div
      className={`rounded-md border px-3 py-2 text-sm ${colors}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <p>{children}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function Field({
  label,
  id,
  ...props
}: { label: string; id: string } & ComponentProps<"input">) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-fg">{label}</span>
      <input
        className="min-h-11 w-full rounded-md border border-line px-3 text-sm text-fg outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent-soft"
        id={id}
        {...props}
      />
    </label>
  );
}

const buttonBase =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

export const buttonStyles = {
  primary: `${buttonBase} bg-accent text-accent-fg hover:bg-accent-hover`,
  secondary: `${buttonBase} border border-line text-fg hover:border-accent hover:text-accent-text`,
};
