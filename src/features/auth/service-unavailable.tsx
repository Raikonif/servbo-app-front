"use client";

import { RefreshCcw, WifiOff } from "lucide-react";

// The session could not be checked (API down, offline). The user is NOT
// signed out: retrying resumes exactly where they were.
export function ServiceUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <WifiOff size={22} />
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-slate-950">
        We can’t reach the server
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Check your connection. You are still signed in; try again in a few
        seconds.
      </p>
      <button
        className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500"
        onClick={onRetry}
        type="button"
      >
        <RefreshCcw size={16} />
        Try again
      </button>
    </main>
  );
}
