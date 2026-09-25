// Codes come from the backend `errors` field (and `?auth_error=` for Google).
const MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Incorrect email or password.",
  PASSWORD_NOT_SET:
    "This account was created with Google. Use “Continue with Google”.",
  EMAIL_NOT_VERIFIED:
    "Your email is not verified yet. Check your inbox or resend the link.",
  ACCOUNT_DISABLED: "Your account is disabled. Contact support.",
  EMAIL_ALREADY_EXISTS:
    "An account with this email already exists. Sign in or reset your password.",
  INVALID_PASSWORD_FORMAT:
    "Use at least 8 characters with an uppercase letter, a lowercase letter and a number.",
  PASSWORD_MISMATCH: "Passwords do not match.",
  WEAK_PASSWORD: "This password is too weak. Choose a stronger one.",
  VALIDATION_ERROR: "Some fields are invalid. Check them and try again.",
  SESSION_EXPIRED: "Your session has expired. Sign in again.",
  INVALID_TOKEN: "This link is invalid or has expired. Request a new one.",
  NOT_FOUND: "We could not find an account with that email.",
  ALREADY_VERIFIED: "Your email is already verified. You can sign in.",
  EMAIL_SENDING_FAILED:
    "We could not send the email. Try again in a few minutes.",
  google_canceled: "Google sign-in was canceled.",
  google_failed: "We could not sign you in with Google. Please try again.",
  NO_PLAN: "Seller plans are coming soon.",
  NETWORK_ERROR:
    "We could not reach the server. Check your connection and try again.",
  THROTTLED: "Too many attempts. Wait a minute and try again.",
  UNKNOWN: "Something went wrong. Please try again.",
};

// Same rule as the backend's register serializer.
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const authMessage = (code: string) => MESSAGES[code] ?? MESSAGES.UNKNOWN;

export class AuthError extends Error {
  readonly code: string;

  // `detail` is a backend-provided message shown instead of the generic one
  // (e.g. Django's password validators for WEAK_PASSWORD).
  constructor(code: string, detail?: string) {
    super(detail || authMessage(code));
    this.name = "AuthError";
    this.code = code in MESSAGES ? code : "UNKNOWN";
  }
}

// `errors` is either a code string or DRF field errors ({ field: ["CODE" | "text"] }).
export function codeFromErrors(errors: unknown): string {
  if (typeof errors === "string" && errors in MESSAGES) return errors;
  if (errors && typeof errors === "object") {
    for (const value of Object.values(errors)) {
      const first = Array.isArray(value) ? value[0] : value;
      if (typeof first === "string" && first in MESSAGES) return first;
    }
  }
  return "UNKNOWN";
}
