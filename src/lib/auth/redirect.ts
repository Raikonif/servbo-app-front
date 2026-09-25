// Where to land after signing in. Only same-app paths: never "//evil.com" or
// an absolute URL, and never back into the auth pages themselves.
const AUTH_PATHS = ["/login", "/register", "/auth/callback"];
const STORAGE_KEY = "servbo.store.auth.next";

// Resolved against a fixed dummy origin so it also works during SSR: anything
// that escapes it ("/\\evil.com", "https:…", "javascript:…") is rejected.
const BASE = "http://localhost";
// Backslashes, whitespace and control characters get normalized by browsers.
const UNSAFE_CHARS = /[\\\s\p{Cc}]/u;

export function safeNext(path: string | null | undefined, fallback = "/") {
  if (typeof path !== "string" || !path.startsWith("/")) return fallback;
  if (path.startsWith("//") || UNSAFE_CHARS.test(path)) return fallback;
  let url: URL;
  try {
    url = new URL(path, BASE);
  } catch {
    return fallback;
  }
  if (url.origin !== BASE) return fallback;
  if (AUTH_PATHS.some((p) => url.pathname.startsWith(p))) return fallback;
  return url.pathname + url.search + url.hash;
}

export const loginHref = (next: string) =>
  `/login?next=${encodeURIComponent(safeNext(next))}`;

// Google leaves the site, so the destination survives the round-trip here.
export const rememberNext = (path: string) =>
  sessionStorage.setItem(STORAGE_KEY, safeNext(path));

export const consumeNext = () => {
  const path = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  return safeNext(path);
};
