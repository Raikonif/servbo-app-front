"use client"; // Error boundaries must be Client Components

import "./globals.css";

// Last resort when the root layout itself fails; it replaces the whole
// document, so it brings its own <html>/<body>.
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans text-slate-950 antialiased">
        <title>Something went wrong | Servbo Store</title>
        <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-500">
            The store could not load. Please try again.
          </p>
          <div className="mt-6 flex gap-2">
            <button
              className="min-h-10 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white"
              onClick={() => retry()}
              type="button"
            >
              Try again
            </button>
            {/* A full reload, not <Link>: the app shell itself failed. */}
            <a
              className="inline-flex min-h-10 items-center rounded-md border border-slate-200 px-4 text-sm font-medium"
              href="/"
            >
              Reload the store
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
