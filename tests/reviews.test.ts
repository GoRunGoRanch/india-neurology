import { describe, expect, it } from "vitest";
import { PILOT_DATASETS, baseClaims, buildListings, evidenceHash, resolveClaims, type ReviewDecision } from "@/lib/data/pilot";

const ds = PILOT_DATASETS[0];
const claims = baseClaims(ds);
const NOW = new Date("2026-10-27T00:00:00Z");

function approve(id: string, extra: Partial<ReviewDecision> = {}): ReviewDecision {
  const c = claims.find((x) => x.id === id)!;
  return { claim_id: id, status: "verified", evidence_hash: evidenceHash(c.evidence), corrected_value: null, reviewer_name: "Dr Test", reviewed_at: "2026-10-26T10:00:00Z", ...extra };
}

// A physician with an affiliation to a hospital that has a name claim.
const aff = claims.find((c) => c.field.startsWith("affiliation:"))!;
const physicianName = claims.find((c) => c.recordId === aff.recordId && c.field === "name")!;
const hospitalName = claims.find((c) => c.recordId === aff.otherRecordId && c.field === "name")!;

describe("claim ids", () => {
  it("are unique and stable", () => {
    const ids = claims.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(baseClaims(ds).map((c) => c.id)).toEqual(ids);
  });
});

describe("resolveClaims", () => {
  it("applies an approval made on the current evidence", () => {
    const [r] = resolveClaims([hospitalName], [approve(hospitalName.id)], 180, NOW);
    expect(r.status).toBe("verified");
    expect(r.reviewer).toBe("Dr Test");
    expect(r.reviewedAt).toBe("2026-10-26");
  });
  it("marks an approval stale when the evidence has changed since", () => {
    const [r] = resolveClaims([hospitalName], [approve(hospitalName.id, { evidence_hash: "deadbeef" })], 180, NOW);
    expect(r.status).toBe("stale");
  });
  it("marks an approval stale after the re-verification interval", () => {
    const [r] = resolveClaims([hospitalName], [approve(hospitalName.id, { reviewed_at: "2026-01-01T00:00:00Z" })], 180, NOW);
    expect(r.status).toBe("stale");
  });
  it("shows a correction but keeps the researched value", () => {
    const [r] = resolveClaims([hospitalName], [approve(hospitalName.id, { corrected_value: "Corrected Name" })], 180, NOW);
    expect(r.value).toBe("Corrected Name");
    expect(r.originalValue).toBe(hospitalName.value);
  });
  it("leaves undecided claims as researched", () => {
    const [r] = resolveClaims([hospitalName], [], 180, NOW);
    expect(r.status).toBe(hospitalName.status);
    expect(r.reviewer).toBeNull();
  });
});

describe("published (verified-only) listings", () => {
  const build = (decisions: ReviewDecision[]) => buildListings(ds, resolveClaims(claims, decisions, 180, NOW), "verified");

  it("show nothing until a reviewer approves", () => {
    const { facilities, providers } = build([]);
    expect(facilities).toEqual([]);
    expect(providers).toEqual([]);
  });

  it("an approved affiliation appears on both the doctor and the hospital page", () => {
    const { facilities, providers } = build([approve(hospitalName.id), approve(physicianName.id), approve(aff.id)]);
    const doctor = providers.find((p) => p.id === aff.recordId)!;
    expect(facilities.map((f) => f.id)).toContain(aff.otherRecordId);
    expect(doctor.facilityIds).toContain(aff.otherRecordId);
  });

  it("an unapproved affiliation is not shown even when both records are approved", () => {
    const { providers } = build([approve(hospitalName.id), approve(physicianName.id)]);
    expect(providers.find((p) => p.id === aff.recordId)!.facilityIds).toEqual([]);
  });

  it("only approved claims are exposed", () => {
    const { facilities } = build([approve(hospitalName.id)]);
    for (const f of facilities) for (const c of f.claims ?? []) expect(c.status).toBe("verified");
    const f = facilities.find((x) => x.id === hospitalName.recordId)!;
    expect(f.services.every((s) => s.verified)).toBe(true);
  });

  it("a hospital's thrombectomy service never makes its doctors thrombectomy operators", () => {
    const service = claims.find((c) => c.field === "service:thrombectomy")!;
    const name = claims.find((c) => c.recordId === service.recordId && c.field === "name")!;
    const docs = claims.filter((c) => c.otherRecordId === service.recordId);
    const docNames = docs.map((a) => claims.find((c) => c.recordId === a.recordId && c.field === "name")!);
    const { providers } = build([approve(service.id), approve(name.id), ...docs.map((a) => approve(a.id)), ...docNames.map((n) => approve(n.id))]);
    for (const p of providers.filter((x) => x.facilityIds.includes(service.recordId))) {
      const explicit = claims.some((c) => c.recordId === p.id && c.field.startsWith("procedure:"));
      if (!explicit) expect(p.thrombectomyOperator).toBeNull();
    }
  });

  it("a withdrawn (disputed) claim disappears from the public view", () => {
    const { facilities } = build([approve(hospitalName.id, { status: "disputed" })]);
    expect(facilities.find((f) => f.id === hospitalName.recordId)).toBeUndefined();
  });
});
