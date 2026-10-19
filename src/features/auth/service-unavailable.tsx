"use client";

import { RefreshCcw, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

// The session could not be checked (API down, offline). The user is NOT
// signed out: retrying resumes exactly where they were.
export function ServiceUnavailable({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("auth.unavailable");
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
        <WifiOff size={22} />
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-fg">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("body")}</p>
      <button
        className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        onClick={onRetry}
        type="button"
      >
        <RefreshCcw size={16} />
        {t("retry")}
      </button>
    </main>
  );
}
