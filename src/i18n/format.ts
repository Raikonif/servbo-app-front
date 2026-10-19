import { useLocale } from "next-intl";
import { useMemo } from "react";
import { FORMAT_LOCALE, isLocale, type Locale, routing } from "./routing";

// Bolivian time on server and client alike, so rendered timestamps never
// cause a hydration mismatch (and match what Bolivian visitors expect).
const TIME_ZONE = "America/La_Paz";

const cache = new Map<Locale, Formatters>();

export type Formatters = ReturnType<typeof createFormatters>;

function createFormatters(locale: Locale) {
  const tag = FORMAT_LOCALE[locale];
  const number = new Intl.NumberFormat(tag);
  const date = new Intl.DateTimeFormat(tag, {
    dateStyle: "medium",
    timeZone: TIME_ZONE,
  });
  // dateStyle/timeStyle cannot be combined with timeZoneName.
  const dateTime = new Intl.DateTimeFormat(tag, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
    timeZoneName: "short",
  });

  // Bolivianos read "Bs 13" / "Bs 4,33" in either language; Intl would
  // print "BOB 13.00" in English.
  const amount = (value: number, currency: string, trimWhole: boolean) => {
    const code = currency.toUpperCase();
    const whole = trimWhole && Number.isInteger(value);
    if (code === "BOB") {
      return `Bs ${new Intl.NumberFormat(tag, {
        minimumFractionDigits: whole ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(value)}`;
    }
    try {
      return new Intl.NumberFormat(tag, {
        style: "currency",
        currency: code,
        ...(whole ? { minimumFractionDigits: 0 } : {}),
      }).format(value);
    } catch {
      return `${value.toFixed(2)} ${currency}`;
    }
  };

  return {
    locale,
    number: (value: number) => number.format(value),
    // Catalog prices: decimal strings such as "12.50".
    price: (price: string, currency: string) => {
      const value = Number(price);
      return Number.isFinite(value)
        ? amount(value, currency, false)
        : `${price} ${currency}`;
    },
    // Billing amounts in minor units (cents); whole amounts drop decimals.
    money: (minor: number, currency: string) =>
      amount(minor / 100, currency, true),
    date: (value: string | null | undefined) =>
      value ? date.format(new Date(value)) : "—",
    dateTime: (value: string) => dateTime.format(new Date(value)),
  };
}

export function formatters(locale: string): Formatters {
  const key = isLocale(locale) ? locale : routing.defaultLocale;
  let value = cache.get(key);
  if (!value) {
    value = createFormatters(key);
    cache.set(key, value);
  }
  return value;
}

// Client and server components alike (D4); server code outside React uses
// `formatters(await getLocale())`.
export function useFormat(): Formatters {
  const locale = useLocale();
  return useMemo(() => formatters(locale), [locale]);
}
