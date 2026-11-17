import { describe, expect, it } from "vitest";
import hi from "@/lib/i18n/hi";
import { hindiToEnglish } from "@/lib/i18n/bilingual";
import { STATES } from "@/lib/taxonomy";

function strings(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(strings);
  if (v && typeof v === "object") return Object.values(v).flatMap(strings);
  return [];
}

const pairs = new Map(hindiToEnglish());
const DEVANAGARI = /[ऀ-ॿ]/;

describe("English under every Hindi line", () => {
  it("every Hindi UI string has an English counterpart", () => {
    const missing = strings(hi).filter((s) => DEVANAGARI.test(s) && !pairs.has(s.trim()));
    expect(missing).toEqual([]);
  });
  it("every state, union territory and city name has English", () => {
    for (const s of STATES) {
      expect(pairs.get(s.name.hi)).toBe(s.name.en);
      for (const c of s.cities) expect(pairs.get(c.name.hi)).toBeTruthy();
    }
  });
  it("English captions contain no Hindi", () => {
    for (const en of pairs.values()) expect(DEVANAGARI.test(en)).toBe(false);
  });
  it("covers all 36 states and union territories", () => {
    expect(STATES).toHaveLength(36);
    expect(new Set(STATES.map((s) => s.code)).size).toBe(36);
  });
});
