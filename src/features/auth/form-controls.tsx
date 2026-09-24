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
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
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
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="min-h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        id={id}
        {...props}
      />
    </label>
  );
}

const buttonBase =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

export const buttonStyles = {
  primary: `${buttonBase} bg-emerald-600 text-white hover:bg-emerald-500`,
  secondary: `${buttonBase} border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700`,
};
