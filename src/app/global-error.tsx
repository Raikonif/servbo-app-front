"use client"; // Error boundaries must be Client Components

import { useEffect, useState } from "react";
import "./globals.css";

// Outside the [locale] layout, so no next-intl provider: a tiny inline
// dictionary, picked from the URL prefix, the page language or the browser.
const TEXT = {
  es: {
    title: "Algo salió mal",
    description: "La tienda no pudo cargarse. Inténtalo de nuevo.",
    retry: "Inténtalo de nuevo",
    reload: "Recargar la tienda",
  },
  en: {
    title: "Something went wrong",
    description: "The store could not load. Please try again.",
    retry: "Try again",
    reload: "Reload the store",
  },
};

type Lang = keyof typeof TEXT;

function detectLang(): Lang {
  const prefix = window.location.pathname.split("/")[1];
  const candidates = [
    prefix,
    document.documentElement.lang,
    ...(navigator.languages ?? [navigator.language]),
  ];
  for (const value of candidates) {
    const lang = value?.slice(0, 2).toLowerCase();
    if (lang === "es" || lang === "en") return lang;
  }
  return "es";
}

// Last resort when the root layout itself fails; it replaces the whole
// document, so it brings its own <html>/<body>.
export default function GlobalError({ retry }: { retry: () => void }) {
  // Spanish on the server render; the browser picks the language on mount.
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => setLang(detectLang()), []);
  const text = TEXT[lang];

  return (
    <html lang={lang}>
      <body className="bg-surface-2 font-sans text-fg antialiased">
        <title>{`${text.title} | Servbo Store`}</title>
        <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold">{text.title}</h1>
          <p className="mt-2 text-sm text-muted">{text.description}</p>
          <div className="mt-6 flex gap-2">
            <button
              className="min-h-10 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
              onClick={() => retry()}
              type="button"
            >
              {text.retry}
            </button>
            {/* A full reload, not <Link>: the app shell itself failed. "/"
                picks the language again. */}
            <a
              className="inline-flex min-h-10 items-center rounded-md border border-line px-4 text-sm font-medium"
              href="/"
            >
              {text.reload}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
