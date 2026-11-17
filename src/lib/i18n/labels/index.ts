import type { Locale } from "../config";
import bn from "./bn.json";
import kn from "./kn.json";
import mr from "./mr.json";
import ta from "./ta.json";
import te from "./te.json";

/** Labels written in source as { en, hi }; the other languages come from labels/<code>.json, keyed by English. */
export type BaseLabel = { en: string; hi: string };
export type Label = Record<Locale, string>;

const MAPS: Record<Exclude<Locale, "en" | "hi">, Record<string, string>> = { mr, bn, ta, te, kn };

export function localise(label: BaseLabel): Label {
  const out = { ...label } as Label;
  for (const [code, map] of Object.entries(MAPS)) out[code as Locale] = map[label.en] ?? label.en;
  return out;
}
