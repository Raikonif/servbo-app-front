"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useSession, useSetSession } from "@/hooks/use-session";
import { getPathname, usePathname } from "@/i18n/navigation";
import { type Locale, routing } from "@/i18n/routing";
import { updateProfile } from "@/lib/catalog";
import { loadPage, rememberLocale } from "./language";

// Opens the same page in the other language, remembers the choice for "/"
// and saves it on the account when signed in (openspec i18n-storefront).
// A full load rather than a soft navigation: every server component and the
// product modal re-render in the new language at once.
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("language");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const user = useSession().data?.user;
  const setSession = useSetSession();
  const [pending, setPending] = useState(false);

  const choose = async (next: Locale) => {
    if (next === locale || pending) return;
    setPending(true);
    rememberLocale(next);
    if (user && user.language !== next) {
      try {
        const updated = await updateProfile(user.id, { language: next });
        if (updated) setSession(updated);
      } catch {
        // The cookie still carries the choice; the account keeps the old one.
      }
    }
    const { search, hash } = window.location;
    loadPage(getPathname({ href: pathname, locale: next }) + search + hash);
  };

  return (
    <fieldset
      aria-busy={pending}
      className="inline-flex items-center gap-0.5 rounded-full border border-line bg-surface-2 p-0.5"
    >
      <legend className="sr-only">{t("label")}</legend>
      {compact ? null : (
        <Languages aria-hidden className="mx-1 text-muted" size={14} />
      )}
      {routing.locales.map((value) => (
        <button
          aria-label={t(value)}
          aria-pressed={value === locale}
          className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-semibold uppercase transition ${
            value === locale
              ? "bg-surface text-fg shadow-soft"
              : "text-muted hover:text-fg"
          }`}
          disabled={pending}
          key={value}
          lang={value}
          onClick={() => choose(value)}
          title={t(value)}
          type="button"
        >
          {value}
        </button>
      ))}
    </fieldset>
  );
}
