import { describe, expect, it } from "vitest";
import { PILOT_DATASETS, PILOT_FACILITIES, PILOT_PROVIDERS } from "@/lib/data/pilot";
import { SERVICES, SPECIALTIES } from "@/lib/taxonomy";

const BLOCKED = /linkedin\.|practo\.|justdial\.|lybrate\.|credihealth\./;
const all = PILOT_DATASETS.flatMap((ds) => [
  ...ds.hospitals.flatMap((h) => [...h.evidence, ...h.services.flatMap((s) => s.evidence)]),
  ...ds.physicians.flatMap((p) => p.evidence),
  ...ds.affiliations.flatMap((a) => a.evidence),
  ...ds.procedures.flatMap((x) => x.evidence),
]);
const reviews = PILOT_DATASETS.flatMap((ds) => [
  ...ds.hospitals.flatMap((h) => [h.review, ...h.services]),
  ...ds.physicians.map((p) => p.review),
  ...ds.affiliations,
  ...ds.procedures,
]);

describe("pilot research data", () => {
  it("every piece of evidence has a permitted http(s) source and a checked date", () => {
    for (const e of all) {
      expect(e.url).toMatch(/^https?:\/\//);
      expect(e.url).not.toMatch(BLOCKED);
      expect(e.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.excerpt.trim()).not.toBe("");
    }
  });

  it("keeps excerpts short (source-attribution, not reproduction)", () => {
    for (const e of all) expect(e.excerpt.split(/\s+/).length).toBeLessThanOrEqual(31);
  });

  it("never marks a claim verified without a named reviewer and date", () => {
    for (const r of reviews) {
      if (r.status === "verified") {
        expect(r.reviewer).toBeTruthy();
        expect(r.reviewedAt).toBeTruthy();
      }
    }
  });

  it("services and procedure claims always carry evidence", () => {
    for (const ds of PILOT_DATASETS) {
      for (const h of ds.hospitals) for (const s of h.services) expect(s.evidence.length).toBeGreaterThan(0);
      for (const x of ds.procedures) expect(x.evidence.length).toBeGreaterThan(0);
    }
  });

  it("affiliations reference real records in both directions", () => {
    for (const ds of PILOT_DATASETS) {
      const h = new Set(ds.hospitals.map((x) => x.key));
      const p = new Set(ds.physicians.map((x) => x.key));
      for (const a of ds.affiliations) {
        expect(h.has(a.hospitalKey)).toBe(true);
        expect(p.has(a.physicianKey)).toBe(true);
      }
    }
  });

  it("does not infer a doctor's thrombectomy practice from the hospital", () => {
    for (const p of PILOT_PROVIDERS) {
      const hasClaim = p.claims?.some((c) => c.field === "procedure:mechanical_thrombectomy");
      expect(Boolean(p.thrombectomyOperator)).toBe(Boolean(hasClaim));
    }
  });

  it("candidate listings are flagged, never demo, never 'verified' at listing level without review", () => {
    for (const l of [...PILOT_FACILITIES, ...PILOT_PROVIDERS]) {
      expect(l.isCandidate).toBe(true);
      expect(l.isDemo).toBe(false);
      if (l.verificationStatus === "verified") expect(l.lastVerifiedAt).toBeTruthy();
    }
  });

  it("uses known service and specialty codes", () => {
    const services = new Set(SERVICES.map((s) => s.code));
    const specialties = new Set(SPECIALTIES.map((s) => s.code));
    for (const f of PILOT_FACILITIES) for (const s of f.services) expect(services.has(s.code)).toBe(true);
    for (const p of PILOT_PROVIDERS) expect(specialties.has(p.specialty)).toBe(true);
  });
});
