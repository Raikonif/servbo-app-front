import { LOCALE_COOKIE, type Locale, routing } from "@/i18n/routing";
import type { SessionUser } from "@/lib/auth/client";
import { updateProfile } from "@/lib/catalog";

// Remembers a choice for "/" (openspec i18n-storefront): same attributes as
// next-intl's own cookie (src/i18n/routing.ts).
export function rememberLocale(locale: Locale) {
  // biome-ignore lint/suspicious/noDocumentCookie: a plain first-party preference cookie, read by the proxy
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

// After signing in, a language saved on the account wins over the page's.
export const signInLocale = (
  user: { language?: string | null } | null | undefined,
  current: string,
): Locale => {
  const saved = user?.language;
  if (saved && (routing.locales as readonly string[]).includes(saved)) {
    return saved as Locale;
  }
  return current as Locale;
};

// Signing in applies the account's saved language (openspec i18n-storefront).
// An account without one yet keeps the page's language, saved on it; that
// save is best effort and never blocks signing in.
export async function applyAccountLanguage(
  user: SessionUser,
  locale: string,
): Promise<Locale> {
  const target = signInLocale(user, locale);
  if (user.language) {
    rememberLocale(target);
  } else {
    // Awaited so the page load that follows does not cancel the request.
    await updateProfile(user.id, { language: locale }).catch(() => undefined);
  }
  return target;
}

// A full page load (kept apart so tests can observe it).
export const loadPage = (url: string) => window.location.assign(url);
