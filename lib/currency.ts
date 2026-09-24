/*
  Currency.

  Until now every amount in this product was formatted as US dollars by two
  module-level Intl formatters. That was invisible while the only users were
  in one place, and it is the first thing a freelancer in Bogotá or São Paulo
  would notice — a tracker that prints your income in the wrong symbol is not
  a tracker you trust with your income.

  ONE CURRENCY PER ACCOUNT, NOT PER PROJECT

  Per-project currency looks more flexible and is worse. The dashboard adds
  amounts together — unpaid invoices, monthly earnings, the forecast — and
  summing mixed currencies requires conversion, which requires live rates,
  which this project has already argued against keeping (see FX_DATE in
  lib/pricing/tiers.ts: a stated rate with a date is more honest than a live
  one nobody checks).

  The alternative — summing across currencies without converting — produces a
  total that means nothing while looking authoritative. So: one currency per
  account, no conversion, no invented rates. Multi-currency is deferred until
  there is a user who needs it and a defensible answer for the rate.

  LOCALE, NOT JUST SYMBOL

  Formatting is regional, not just a prefix. 1.234,56 and 1,234.56 are the
  same number to different readers, so each currency carries the locale its
  users actually read, and fraction digits come from Intl's own data rather
  than being forced — Chilean pesos have no cents, and printing two would be
  wrong rather than merely unusual.
*/

export type CurrencyCode =
  | "USD"
  | "MXN"
  | "COP"
  | "ARS"
  | "BRL"
  | "CLP"
  | "PEN"
  | "UYU"
  | "CAD"
  | "EUR"
  | "GBP";

export const CURRENCY_CODES: CurrencyCode[] = [
  "USD",
  "MXN",
  "COP",
  "ARS",
  "BRL",
  "CLP",
  "PEN",
  "UYU",
  "CAD",
  "EUR",
  "GBP",
];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

type CurrencyMeta = { label: string; locale: string };

/* Ordered for the picker: the focus markets first, then the rest. */
export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USD: { label: "US dollar", locale: "en-US" },
  MXN: { label: "Mexican peso", locale: "es-MX" },
  COP: { label: "Colombian peso", locale: "es-CO" },
  ARS: { label: "Argentine peso", locale: "es-AR" },
  BRL: { label: "Brazilian real", locale: "pt-BR" },
  CLP: { label: "Chilean peso", locale: "es-CL" },
  PEN: { label: "Peruvian sol", locale: "es-PE" },
  UYU: { label: "Uruguayan peso", locale: "es-UY" },
  CAD: { label: "Canadian dollar", locale: "en-CA" },
  EUR: { label: "Euro", locale: "de-DE" },
  GBP: { label: "Pound sterling", locale: "en-GB" },
};

/*
  SIX OF THESE RENDER AS "$".

  USD, MXN, CAD, CLP, UYU and ARS all print a bare dollar sign in their own
  locale, which is exactly what their readers expect — a Mexican freelancer
  seeing "MX$1,234" on their own dashboard would find it foreign, not
  clearer. Inside one account the symbol is unambiguous because the user
  chose the currency.

  It stops being unambiguous the moment a figure leaves the account, so the
  CSV export names the currency in its column headers rather than relying on
  the symbol. That is the only place a number is read by someone who did not
  pick the setting.
*/

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === "string" && (CURRENCY_CODES as string[]).includes(v);
}

/*
  Intl.NumberFormat construction is expensive and these are called once per
  table cell, so formatters are built once and kept.
*/
const cache = new Map<string, Intl.NumberFormat>();

function formatter(code: CurrencyCode, whole: boolean): Intl.NumberFormat {
  const key = `${code}:${whole}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const meta = CURRENCIES[code] ?? CURRENCIES[DEFAULT_CURRENCY];
  const made = new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: code,
    // Fraction digits come from Intl's own data for every currency except the
    // "whole" variant, which is a deliberate display choice on the summary
    // cards where cents are visual noise.
    ...(whole ? { maximumFractionDigits: 0 } : {}),
  });
  cache.set(key, made);
  return made;
}

/**
 * Format an amount in a currency.
 *
 * An unknown code falls back to the default rather than throwing. This runs
 * over a preferences object a user can edit, and a page that fails to render
 * because someone typed "DOLLARS" is worse than one that shows dollars.
 */
export function formatMoney(
  amount: number,
  code: CurrencyCode = DEFAULT_CURRENCY,
  options: { whole?: boolean } = {},
): string {
  const safe = isCurrencyCode(code) ? code : DEFAULT_CURRENCY;
  const value = Number.isFinite(amount) ? amount : 0;
  return formatter(safe, options.whole ?? false).format(value);
}
