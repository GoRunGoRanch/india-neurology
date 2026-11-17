import { CARE_CONTENT } from "../content/care";
import { site } from "../site";
import { CONDITIONS, FACILITY_TYPES, SERVICES, SPECIALTIES, STATES } from "../taxonomy";
import { LANGUAGE_NAMES, SCRIPT_PATTERN, locales, type Locale } from "./config";
import en from "./en";
import { getDictionary } from "./index";

type Captioned = Exclude<Locale, "en">;

/** Walks two parallel structures and collects [translated, english] string pairs. */
function parallel(e: unknown, t: unknown, script: RegExp, out: Map<string, string>) {
  if (typeof e === "string" && typeof t === "string") {
    if (script.test(t) && !out.has(t.trim())) out.set(t.trim(), e.trim());
  } else if (Array.isArray(e) && Array.isArray(t)) {
    e.forEach((x, i) => parallel(x, t[i], script, out));
  } else if (e && t && typeof e === "object" && typeof t === "object") {
    for (const k of Object.keys(e)) parallel((e as Record<string, unknown>)[k], (t as Record<string, unknown>)[k], script, out);
  }
}

/** Finds every { en, <locale> } label in a structure (taxonomy, content) and pairs them. */
function labels(v: unknown, locale: Captioned, script: RegExp, out: Map<string, string>) {
  if (Array.isArray(v)) v.forEach((x) => labels(x, locale, script, out));
  else if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if ("en" in o && locale in o) parallel(o.en, o[locale], script, out);
    for (const x of Object.values(o)) labels(x, locale, script, out);
  }
}

/** Every string the site can render in this language, mapped to its English counterpart. */
export function toEnglish(locale: Captioned): [string, string][] {
  const script = new RegExp(SCRIPT_PATTERN[locale]);
  const out = new Map<string, string>();
  parallel(en, getDictionary(locale), script, out);
  labels([site.name, CONDITIONS, SERVICES, SPECIALTIES, FACILITY_TYPES, STATES, CARE_CONTENT], locale, script, out);
  // Language names in the language menu are written in their own scripts.
  for (const l of locales) if (script.test(LANGUAGE_NAMES[l].native)) out.set(LANGUAGE_NAMES[l].native, LANGUAGE_NAMES[l].en);
  return [...out.entries()];
}

/** Kept for the Hindi tests and callers. */
export const hindiToEnglish = () => toEnglish("hi");
