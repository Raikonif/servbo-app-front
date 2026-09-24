import { AuthError, codeFromErrors } from "./errors";
import { rememberNext } from "./redirect";

// BFF: the backend keeps the session in httpOnly cookies shared with the
// creator app. The browser only sends them (credentials: "include") and echoes
// Django's CSRF cookie on unsafe requests. No token ever reaches JavaScript.
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export type SessionUser = {
  id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  is_seller: boolean;
  is_client: boolean;
  is_staff: boolean;
  is_email_verified: boolean;
  created_at: string;
};

export type Session = {
  authenticated: boolean;
  user: SessionUser | null;
  // Set locally when the user signs out on purpose, so guards send them home
  // instead of back to the login.
  signedOut?: boolean;
};

export const ANONYMOUS_SESSION: Session = { authenticated: false, user: null };

type Envelope<T> = { data?: T | null; errors?: unknown };

const readCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1] ?? null;

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T | null> {
  const method = init.method ?? "GET";
  const csrf = readCookie("csrftoken");
  let response: Response;
  try {
    response = await fetch(new URL(path, BACKEND_URL), {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(method !== "GET" && csrf
          ? { "X-CSRFToken": decodeURIComponent(csrf) }
          : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new AuthError("NETWORK_ERROR");
  }

  if (response.status === 429) throw new AuthError("THROTTLED");
  const payload = (await response
    .json()
    .catch(() => null)) as Envelope<T> | null;
  if (!response.ok) throw new AuthError(codeFromErrors(payload?.errors));
  return payload?.data ?? null;
}

// Always 200 for anonymous visitors too: an error means "API unreachable",
// never "signed out". Also renews an expired access cookie and seeds CSRF.
export const getSession = async (): Promise<Session> =>
  (await request<Session>("/api/auth/session/")) ?? ANONYMOUS_SESSION;

export const signIn = async (email: string, password: string) => {
  const user = await request<SessionUser>("/api/auth/session/", {
    method: "POST",
    body: { email: email.trim(), password },
  });
  if (!user) throw new AuthError("UNKNOWN");
  return user;
};

export const signOut = () =>
  request("/api/auth/session/", { method: "DELETE" });

export const signUp = (payload: {
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
}) =>
  request<SessionUser>("/api/users/", {
    method: "POST",
    body: { ...payload, email: payload.email.trim().toLowerCase() },
  });

// Links in these emails open this storefront (frontend: "store").
export const sendEmailVerification = (email: string) =>
  request("/api/auth/send-email-verification/", {
    method: "POST",
    body: { email: email.trim().toLowerCase(), frontend: "store" },
  });

export const verifyEmail = (token: string) =>
  request("/api/auth/verify-email/", { method: "POST", body: { token } });

export const sendResetPassword = (email: string) =>
  request("/api/auth/send-reset-password/", {
    method: "POST",
    body: { email: email.trim().toLowerCase(), frontend: "store" },
  });

export const resetPassword = (
  token: string,
  password: string,
  confirmation: string,
) =>
  request("/api/auth/confirm-reset-password/", {
    method: "POST",
    body: {
      token,
      new_password: password,
      new_password_confirmation: confirmation,
    },
  });

// The Google login view is POST-only and CSRF-protected, and must be a real
// browser navigation (it answers with a 302 to Google), hence a hidden form.
// Failures come back as /login?auth_error=<code>.
export async function startGoogleSignIn(next: string) {
  if (!readCookie("csrftoken")) {
    try {
      await fetch(new URL("/api/auth/csrf/", BACKEND_URL), {
        credentials: "include",
      });
    } catch {
      throw new AuthError("NETWORK_ERROR");
    }
  }
  const csrf = readCookie("csrftoken");
  if (!csrf) throw new AuthError("google_failed");

  rememberNext(next);

  const form = document.createElement("form");
  form.method = "POST";
  form.action = new URL("/api/auth/login/google-oauth2/", BACKEND_URL).href;
  form.style.display = "none";
  for (const [name, value] of [
    ["csrfmiddlewaretoken", decodeURIComponent(csrf)],
    ["frontend", "store"],
  ]) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
