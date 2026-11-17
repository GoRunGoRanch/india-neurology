import { describe, expect, it } from "vitest";
import { toEnglish } from "@/lib/i18n/bilingual";
import { SCRIPT_PATTERN, getDictionary, locales, type Locale } from "@/lib/i18n";
import en from "@/lib/i18n/en";
import source from "@/lib/i18n/labels/_source.json";
import { site } from "@/lib/site";
import { CONDITIONS, SERVICES, STATES } from "@/lib/taxonomy";

function shape(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(shape);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)]));
  return typeof v;
}
function strings(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(strings);
  if (v && typeof v === "object") return Object.values(v).flatMap(strings);
  return [];
}

const others = locales.filter((l): l is Exclude<Locale, "en"> => l !== "en");

describe.each(others)("%s", (l) => {
  const dict = getDictionary(l);
  const script = new RegExp(SCRIPT_PATTERN[l]);
  const pairs = new Map(toEnglish(l));

  it("has the English key structure and no empty strings", () => {
    expect(shape(dict)).toEqual(shape(en));
    expect(strings(dict).filter((s) => !s.trim())).toEqual([]);
  });
  it("keeps the emergency numbers wherever English has them", () => {
    const e = strings(en), t = strings(dict);
    e.forEach((s, i) => {
      for (const n of ["108", "112"]) if (s.includes(n)) expect(t[i], s).toContain(n);
    });
  });
  it("has English for every translated UI string", () => {
    expect(strings(dict).filter((s) => script.test(s) && !pairs.has(s.trim()))).toEqual([]);
  });
  it("translates every state, city, condition and service, and the site name", () => {
    for (const x of [...CONDITIONS, ...SERVICES, ...STATES, ...STATES.flatMap((s) => s.cities)]) {
      // Pure acronyms (MRI, EEG) may stay in Latin letters; everything else is translated.
      if (!/^[A-Z]{2,}\b/.test(x.name.en)) expect(script.test(x.name[l]), `${x.name.en} in ${l}`).toBe(true);
    }
    expect(site.name[l]).toContain("KneeTie");
  });
  it("English captions contain none of the script", () => {
    for (const e of pairs.values()) expect(script.test(e)).toBe(false);
  });
});

it("label source lists every taxonomy label", () => {
  const keys = new Set(Object.keys(source));
  for (const x of [...CONDITIONS, ...SERVICES, ...STATES, ...STATES.flatMap((s) => s.cities)]) expect(keys.has(x.name.en)).toBe(true);
});
