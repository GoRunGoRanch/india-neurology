import type { ClaimView, Facility, Provider } from "../types";
import delhi from "./delhi.json";
import type { ClaimStatus, PilotDataset } from "./types";

export const PILOT_DATASETS: PilotDataset[] = [delhi as PilotDataset];

// Research service codes → directory SERVICES codes.
const SERVICE_CODE: Record<string, string> = {
  stroke_unit: "stroke_unit",
  thrombolysis: "thrombolysis",
  thrombectomy: "thrombectomy",
  neurointerventional: "neurointerventional",
  neuro_icu: "neuro_icu",
  ct: "ct",
  mri: "mri",
  stroke_rehab: "stroke_rehab",
  "24x7_stroke": "stroke_24x7",
};

const STATE_CITY: Record<string, string> = { DL: "new-delhi" };

export const hospitalId = (key: string) => `dl-${key}`;
export const physicianId = (key: string) => `dl-dr-${key}`;

const SOURCE_TITLE = "Public source — awaiting clinician review";

function toListingStatus(s: ClaimStatus): Facility["verificationStatus"] {
  if (s === "verified") return "verified";
  if (s === "pending_review") return "pending";
  if (s === "disputed") return "rejected";
  return "unverified";
}

/** Latest reviewedAt across verified claims, or null — a record is only "reviewed" if a human approved something. */
function lastVerified(claims: ClaimView[]) {
  const dates = claims.filter((c) => c.status === "verified" && c.reviewedAt).map((c) => c.reviewedAt as string);
  return dates.sort().at(-1) ?? null;
}

function buildFacilities(ds: PilotDataset): Facility[] {
  return ds.hospitals.map((h) => {
    const evidenceFor = (field: string) => {
      const own = h.evidence.filter((e) => e.field === field);
      // The official site naming itself is the evidence for the hospital's name.
      return own.length || field !== "name" ? own : h.evidence.filter((e) => e.field === "website" || e.field === "address");
    };
    const fieldClaim = (field: string, value: string | null): ClaimView[] =>
      value ? [{ field, value, status: h.review.status, reviewedAt: h.review.reviewedAt, evidence: evidenceFor(field) }] : [];
    const services = h.services.filter((s) => SERVICE_CODE[s.code]);
    const claims: ClaimView[] = [
      ...fieldClaim("name", h.name),
      ...fieldClaim("address", h.address),
      ...fieldClaim("phone", h.officialPhone),
      ...fieldClaim("website", h.officialWebsite),
      ...services.map((s) => ({ field: `service:${SERVICE_CODE[s.code]}`, value: "available", status: s.status, reviewedAt: s.reviewedAt, evidence: s.evidence })),
    ];
    const strokeServices = ["stroke_unit", "thrombolysis", "thrombectomy", "stroke_24x7"];
    return {
      kind: "hospital",
      id: hospitalId(h.key),
      name: h.name,
      chain: h.chain,
      type: "hospital",
      stateCode: h.state,
      citySlug: STATE_CITY[h.state] ?? h.state.toLowerCase(),
      address: [h.address, h.pincode && !h.address?.includes(h.pincode) ? h.pincode : null].filter(Boolean).join(" ") || null,
      geo: null,
      phone: h.officialPhone,
      website: h.officialWebsite,
      services: services.map((s) => ({ code: SERVICE_CODE[s.code], available24x7: null, verified: s.status === "verified" })),
      conditions: services.some((s) => strokeServices.includes(SERVICE_CODE[s.code])) ? ["stroke"] : [],
      languages: [],
      accessibility: {},
      isDemo: false,
      isCandidate: true,
      verificationStatus: toListingStatus(h.review.status),
      lastVerifiedAt: lastVerified(claims),
      sourceTitle: SOURCE_TITLE,
      updatedAt: ds.generatedAt,
      claims,
    };
  });
}

function buildProviders(ds: PilotDataset): Provider[] {
  return ds.physicians.map((p) => {
    const affiliations = ds.affiliations.filter((a) => a.physicianKey === p.key);
    const procedure = ds.procedures.find((x) => x.physicianKey === p.key && x.procedure === "mechanical_thrombectomy");
    const claims: ClaimView[] = [
      { field: "name", value: p.name, status: p.review.status, reviewedAt: p.review.reviewedAt, evidence: p.evidence.filter((e) => e.field === "name" || !e.field), flags: p.flags },
      ...(p.designation ? [{ field: "designation", value: p.designation, status: p.review.status, reviewedAt: p.review.reviewedAt, evidence: p.evidence.filter((e) => e.field === "designation") }] : []),
      ...affiliations.map((a) => ({ field: `affiliation:${hospitalId(a.hospitalKey)}`, value: a.role ?? "", status: a.status, reviewedAt: a.reviewedAt, evidence: a.evidence, flags: a.flags })),
      ...(procedure ? [{ field: "procedure:mechanical_thrombectomy", value: "explicit_claim", status: procedure.status, reviewedAt: procedure.reviewedAt, evidence: procedure.evidence }] : []),
    ];
    const hospitals = affiliations.map((a) => ds.hospitals.find((h) => h.key === a.hospitalKey)).filter(Boolean);
    const state = hospitals[0]?.state ?? "DL";
    return {
      kind: "neurologist",
      id: physicianId(p.key),
      name: p.name,
      specialty: p.specialty,
      designation: p.designation,
      titles: p.titles,
      stateCode: state,
      citySlug: STATE_CITY[state] ?? state.toLowerCase(),
      facilityIds: affiliations.filter((a) => a.status !== "disputed").map((a) => hospitalId(a.hospitalKey)),
      // Degrees are shown only once verified; the candidate titles live in `titles` + claims.
      qualifications: [],
      conditions: [],
      languages: [],
      phone: null,
      website: p.profileUrl,
      teleconsult: null,
      geo: null,
      thrombectomyOperator: procedure?.status ?? null,
      isDemo: false,
      isCandidate: true,
      verificationStatus: toListingStatus(p.review.status),
      lastVerifiedAt: lastVerified(claims),
      sourceTitle: SOURCE_TITLE,
      updatedAt: ds.generatedAt,
      claims,
    };
  });
}

export const PILOT_FACILITIES: Facility[] = PILOT_DATASETS.flatMap(buildFacilities);
export const PILOT_PROVIDERS: Provider[] = PILOT_DATASETS.flatMap(buildProviders);
