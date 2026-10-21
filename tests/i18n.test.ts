import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/en";
import hi from "@/lib/i18n/hi";
import { CONDITION_CONTENT } from "@/lib/content/conditions";
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

describe("English/Hindi dictionaries", () => {
  it("have identical key structure, including array lengths", () => {
    expect(shape(hi)).toEqual(shape(en));
  });
  it("have no empty strings", () => {
    expect(strings(en).filter((s) => !s.trim())).toEqual([]);
    expect(strings(hi).filter((s) => !s.trim())).toEqual([]);
  });
  it("Hindi strings contain Devanagari where English has words", () => {
    const missing = strings(hi).filter((s) => /[a-z]{4,}/i.test(s) && !/[ऀ-ॿ]/.test(s));
    // Brand-only strings (e.g. "KneeTie") may legitimately stay in Latin script.
    expect(missing.filter((s) => !/KneeTie|FAST|Go!?$|^Run$|A–Z/.test(s))).toEqual([]);
  });
  it("taxonomy labels exist in both languages", () => {
    for (const x of [...CONDITIONS, ...SERVICES, ...STATES, ...STATES.flatMap((s) => s.cities)]) {
      expect(x.name.en.trim()).not.toBe("");
      expect(x.name.hi.trim()).not.toBe("");
    }
  });
});

describe("condition content", () => {
  it("exists for every condition in the taxonomy", () => {
    expect(CONDITION_CONTENT.map((c) => c.slug).sort()).toEqual(CONDITIONS.map((c) => c.slug).sort());
  });
  it("never claims review without a reviewer and date", () => {
    for (const c of CONDITION_CONTENT) {
      if (c.reviewStatus === "reviewed") {
        expect(c.reviewer).toBeTruthy();
        expect(c.reviewedAt).toBeTruthy();
      }
    }
  });
  it("includes red flags on every page", () => {
    for (const c of CONDITION_CONTENT) expect(c.redFlags.length).toBeGreaterThan(0);
  });
});
