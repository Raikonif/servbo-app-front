// Where to land after signing in. Only same-app paths: never "//evil.com" or
// an absolute URL, and never back into the auth pages themselves.
const AUTH_PATHS = ["/login", "/register", "/auth/callback"];
const STORAGE_KEY = "servbo.store.auth.next";

export const safeNext = (path: string | null | undefined, fallback = "/") =>
  typeof path === "string" &&
  path.startsWith("/") &&
  !path.startsWith("//") &&
  !AUTH_PATHS.some((p) => path.startsWith(p))
    ? path
    : fallback;

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
