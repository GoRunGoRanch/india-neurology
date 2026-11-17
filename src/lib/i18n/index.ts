import bn from "./bn";
import type { Locale } from "./config";
import en, { type Dictionary } from "./en";
import hi from "./hi";
import kn from "./kn";
import mr from "./mr";
import ta from "./ta";
import te from "./te";

export * from "./config";
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { en, hi, mr, bn, ta, te, kn };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * English pages: "16 Nov 2026". Other languages: "16/11/2026", which reads the same in every
 * language, so the line's English caption stays complete.
 */
export function formatDate(iso: string, locale: Locale) {
  const numeric = locale !== "en";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: numeric ? "2-digit" : "numeric",
    month: numeric ? "2-digit" : "short",
    year: "numeric",
    // ISO dates ("2026-10-26") parse as UTC midnight; format in UTC so they don't shift a day.
    timeZone: "UTC",
  });
}
