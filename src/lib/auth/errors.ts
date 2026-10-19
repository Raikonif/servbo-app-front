import es from "../../../messages/es.json";

// Codes come from the backend `errors` field (and `?auth_error=` for Google).
// The texts live in messages/<locale>.json under `errors` and `fieldLabels`;
// the language provider swaps them in (setErrorMessages). AuthErrors are only
// created in the browser, where one visitor means one active language.
let MESSAGES: Record<string, string> = es.errors;
let FIELD_LABELS: Record<string, string> = es.fieldLabels;

export function setErrorMessages(
  messages: Record<string, string>,
  fieldLabels: Record<string, string>,
) {
  MESSAGES = messages;
  FIELD_LABELS = fieldLabels;
}

// Same rule as the backend's register serializer.
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const authMessage = (code: string) => MESSAGES[code] ?? MESSAGES.UNKNOWN;

export class AuthError extends Error {
  readonly code: string;
  // HTTP status of the failed response (undefined for network errors).
  readonly status?: number;
  // The error response body, for callers that need more than a message
  // (e.g. checkout's per-item `problems`).
  readonly payload?: unknown;

  // `detail` is a backend-provided message shown instead of the generic one
  // (e.g. Django's password validators for WEAK_PASSWORD).
  constructor(
    code: string,
    detail?: string,
    status?: number,
    payload?: unknown,
  ) {
    super(detail || authMessage(code));
    this.name = "AuthError";
    this.code = code in MESSAGES ? code : "UNKNOWN";
    this.status = status;
    this.payload = payload;
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

// First human-readable DRF validation message, e.g. "Email: Enter a valid
// email address." Used when the backend sent text instead of a known code.
export function detailFromErrors(errors: unknown): string | undefined {
  if (typeof errors === "string") return errors;
  if (!errors || typeof errors !== "object") return undefined;
  for (const [field, value] of Object.entries(errors)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first !== "string") continue;
    const label = Array.isArray(errors) ? undefined : FIELD_LABELS[field];
    return label ? `${label}: ${first}` : first;
  }
  return undefined;
}
