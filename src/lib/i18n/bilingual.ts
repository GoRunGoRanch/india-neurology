import { CARE_CONTENT } from "../content/care";
import { site } from "../site";
import { CONDITIONS, FACILITY_TYPES, SERVICES, SPECIALTIES, STATES } from "../taxonomy";
import en from "./en";
import hi from "./hi";

const DEVANAGARI = /[ऀ-ॿ]/;

/** Walks two parallel structures and collects [hindi, english] string pairs. */
function parallel(e: unknown, h: unknown, out: Map<string, string>) {
  if (typeof e === "string" && typeof h === "string") {
    if (DEVANAGARI.test(h) && !out.has(h.trim())) out.set(h.trim(), e.trim());
  } else if (Array.isArray(e) && Array.isArray(h)) {
    e.forEach((x, i) => parallel(x, h[i], out));
  } else if (e && h && typeof e === "object" && typeof h === "object") {
    for (const k of Object.keys(e)) parallel((e as Record<string, unknown>)[k], (h as Record<string, unknown>)[k], out);
  }
}

/** Finds every {en, hi} label in a structure (taxonomy, content) and pairs them. */
function labels(v: unknown, out: Map<string, string>) {
  if (Array.isArray(v)) v.forEach((x) => labels(x, out));
  else if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if ("en" in o && "hi" in o) parallel(o.en, o.hi, out);
    for (const x of Object.values(o)) labels(x, out);
  }
}

/** Every Hindi string the site can render, mapped to its English counterpart. */
export function hindiToEnglish(): [string, string][] {
  const out = new Map<string, string>();
  parallel(en, hi, out);
  labels([site.name, CONDITIONS, SERVICES, SPECIALTIES, FACILITY_TYPES, STATES, CARE_CONTENT], out);
  // Language names are written in their own script; give Hindi its English name.
  out.set("हिन्दी", "Hindi");
  return [...out.entries()];
}
