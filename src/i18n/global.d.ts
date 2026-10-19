import type messages from "../../messages/es.json";

// Typed keys: a missing or misspelled message key fails `tsc`. The locale
// stays a string: route params are, and the layout rejects unknown ones.
declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages;
  }
}
