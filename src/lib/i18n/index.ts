import en, { type Dictionary } from "./en";
import hi from "./hi";
import type { Locale } from "./config";

export * from "./config";
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { en, hi };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function formatDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    // ISO dates ("2026-10-26") parse as UTC midnight; format in UTC so they don't shift a day.
    timeZone: "UTC",
  });
}
