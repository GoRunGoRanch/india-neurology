import { describe, expect, it } from "vitest";
import { DEMO_FACILITIES, DEMO_PROVIDERS } from "@/lib/data/demo/records";
import { CONDITIONS, LANGUAGES, SERVICES, findCity } from "@/lib/taxonomy";

const records = [...DEMO_PROVIDERS, ...DEMO_FACILITIES];

// The brief forbids fabricated listings. These checks keep demo data obviously fake.
describe("demo data cannot pass as real listings", () => {
  it.each(records.map((r) => [r.id, r]))("%s is labelled demo", (_id, r) => {
    expect(r.isDemo).toBe(true);
    expect(r.name.startsWith("Demo ")).toBe(true);
    expect(r.id.startsWith("demo-")).toBe(true);
    expect(r.phone).toBeNull();
    expect(r.website).toBeNull();
    expect(r.verificationStatus).not.toBe("verified");
    expect(r.lastVerifiedAt).toBeNull();
    expect(r.geo?.verified).toBe(false);
  });

  it("no demo qualification is marked verified or has a registration number", () => {
    for (const p of DEMO_PROVIDERS) {
      for (const q of p.qualifications) {
        expect(q.verified).toBe(false);
        expect(q.registrationNumber).toBeNull();
      }
    }
  });

  it("no demo service is marked verified", () => {
    for (const f of DEMO_FACILITIES) expect(f.services.every((s) => !s.verified)).toBe(true);
  });
});

describe("demo data references valid taxonomy", () => {
  const conditionSlugs = new Set(CONDITIONS.map((c) => c.slug));
  const serviceCodes = new Set(SERVICES.map((s) => s.code));
  const languageCodes = new Set(LANGUAGES.map((l) => l.code));
  const facilityIds = new Set(DEMO_FACILITIES.map((f) => f.id));

  it("uses known cities, conditions, languages, services and facility ids", () => {
    for (const r of records) {
      expect(findCity(r.stateCode, r.citySlug)).toBeDefined();
      r.conditions.forEach((c) => expect(conditionSlugs.has(c)).toBe(true));
      r.languages.forEach((l) => expect(languageCodes.has(l)).toBe(true));
    }
    DEMO_FACILITIES.forEach((f) => f.services.forEach((s) => expect(serviceCodes.has(s.code)).toBe(true)));
    DEMO_PROVIDERS.forEach((p) => p.facilityIds.forEach((id) => expect(facilityIds.has(id)).toBe(true)));
  });

  it("has unique ids", () => {
    expect(new Set(records.map((r) => r.id)).size).toBe(records.length);
  });
});
