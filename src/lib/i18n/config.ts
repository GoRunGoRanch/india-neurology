/** English, Hindi and the languages of the metro cities the stroke map covers. */
export const locales = ["en", "hi", "mr", "bn", "ta", "te", "kn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Each language's name in its own script, and in English for captions and the language menu. */
export const LANGUAGE_NAMES: Record<Locale, { native: string; en: string }> = {
  en: { native: "English", en: "English" },
  hi: { native: "हिन्दी", en: "Hindi" },
  mr: { native: "मराठी", en: "Marathi" },
  bn: { native: "বাংলা", en: "Bengali" },
  ta: { native: "தமிழ்", en: "Tamil" },
  te: { native: "తెలుగు", en: "Telugu" },
  kn: { native: "ಕನ್ನಡ", en: "Kannada" },
};

/** Characters of each language's script; text containing them gets an English caption. */
export const SCRIPT_PATTERN: Record<Exclude<Locale, "en">, string> = {
  hi: "[\\u0900-\\u097F]",
  mr: "[\\u0900-\\u097F]",
  bn: "[\\u0980-\\u09FF]",
  ta: "[\\u0B80-\\u0BFF]",
  te: "[\\u0C00-\\u0C7F]",
  kn: "[\\u0C80-\\u0CFF]",
};
