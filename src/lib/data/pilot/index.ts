import type { ClaimView, Facility, Provider } from "../types";
import delhi from "./delhi.json";
import type { ClaimStatus, Evidence, PilotDataset } from "./types";

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
const STROKE_SERVICES = ["stroke_unit", "thrombolysis", "thrombectomy", "stroke_24x7"];
const STATE_CITY: Record<string, string> = { DL: "new-delhi" };
const SOURCE_TITLE = "Public source — awaiting clinician review";
const VERIFIED_SOURCE_TITLE = "Public source, reviewed by a clinician";

export const hospitalId = (key: string) => `dl-${key}`;
export const physicianId = (key: string) => `dl-dr-${key}`;

/** A reviewer decision as stored in Supabase `public_claim_reviews`. */
export interface ReviewDecision {
  claim_id: string;
  status: ClaimStatus;
  evidence_hash: string;
  corrected_value: string | null;
  reviewer_name: string;
  reviewed_at: string;
}

/** Stable, order-independent fingerprint of the evidence a reviewer saw (FNV-1a). */
export function evidenceHash(evidence: Evidence[]) {
  const text = evidence.map((e) => `${e.url}\n${e.excerpt}`).sort().join("\n\n");
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** A research claim before any reviewer decision is applied. */
export interface BaseClaim {
  id: string; // `${pilot}/${local id}`
  pilot: string;
  /** Record the claim belongs to, for grouping: hospital or physician listing id. */
  recordId: string;
  recordName: string;
  recordKind: "hospital" | "neurologist";
  field: string;
  value: string;
  status: ClaimStatus;
  evidence: Evidence[];
  flags: string[];
  /** Hospital an affiliation points to (affiliation claims only). */
  otherRecordId?: string;
}

/** Every individual claim in a dataset, each with its own stable id. */
export function baseClaims(ds: PilotDataset): BaseClaim[] {
  const out: BaseClaim[] = [];
  const id = (local: string) => `${ds.pilot}/${local}`;
  for (const h of ds.hospitals) {
    const rec = { pilot: ds.pilot, recordId: hospitalId(h.key), recordName: h.name, recordKind: "hospital" as const };
    const fieldEvidence = (field: string) => {
      const own = h.evidence.filter((e) => e.field === field);
      // The official site naming itself is the evidence for the hospital's name.
      return own.length || field !== "name" ? own : h.evidence.filter((e) => e.field === "website" || e.field === "address");
    };
    const fields: [string, string | null][] = [["name", h.name], ["address", h.address], ["phone", h.officialPhone], ["website", h.officialWebsite]];
    for (const [field, value] of fields) {
      if (value) out.push({ ...rec, id: id(`h:${h.key}:${field}`), field, value, status: h.review.status, evidence: fieldEvidence(field), flags: [] });
    }
    for (const s of h.services) {
      const code = SERVICE_CODE[s.code];
      if (code) out.push({ ...rec, id: id(`h:${h.key}:service:${code}`), field: `service:${code}`, value: "available", status: s.status, evidence: s.evidence, flags: [] });
    }
  }
  for (const p of ds.physicians) {
    const rec = { pilot: ds.pilot, recordId: physicianId(p.key), recordName: p.name, recordKind: "neurologist" as const };
    out.push({ ...rec, id: id(`p:${p.key}:name`), field: "name", value: p.name, status: p.review.status, evidence: p.evidence.filter((e) => e.field === "name" || !e.field), flags: p.flags });
    if (p.designation) {
      out.push({ ...rec, id: id(`p:${p.key}:designation`), field: "designation", value: p.designation, status: p.review.status, evidence: p.evidence.filter((e) => e.field === "designation"), flags: [] });
    }
    for (const a of ds.affiliations.filter((x) => x.physicianKey === p.key)) {
      out.push({ ...rec, id: id(`a:${p.key}:${a.hospitalKey}`), field: `affiliation:${hospitalId(a.hospitalKey)}`, value: a.role ?? "", status: a.status, evidence: a.evidence, flags: a.flags, otherRecordId: hospitalId(a.hospitalKey) });
    }
    for (const x of ds.procedures.filter((y) => y.physicianKey === p.key)) {
      out.push({ ...rec, id: id(`x:${p.key}:${x.procedure}`), field: `procedure:${x.procedure}`, value: "explicit_claim", status: x.status, evidence: x.evidence, flags: [] });
    }
  }
  return out;
}

export interface ResolvedClaim extends BaseClaim {
  reviewer: string | null;
  reviewedAt: string | null;
  /** Value the research found, when a reviewer corrected it. */
  originalValue: string | null;
}

/**
 * Applies reviewer decisions. A decision only holds for the evidence it was made on: if the
 * evidence changed, or the decision is older than maxAgeDays, the claim becomes "stale".
 */
export function resolveClaims(claims: BaseClaim[], decisions: ReviewDecision[], maxAgeDays: number, now = new Date()): ResolvedClaim[] {
  const byId = new Map(decisions.map((d) => [d.claim_id, d]));
  return claims.map((c) => {
    const d = byId.get(c.id);
    if (!d) return { ...c, reviewer: null, reviewedAt: null, originalValue: null };
    const ageDays = (now.getTime() - new Date(d.reviewed_at).getTime()) / 86_400_000;
    const changed = d.evidence_hash !== evidenceHash(c.evidence);
    const status: ClaimStatus = d.status === "verified" && (changed || ageDays > maxAgeDays) ? "stale" : d.status;
    const corrected = d.corrected_value && d.corrected_value !== c.value ? d.corrected_value : null;
    return {
      ...c,
      status,
      value: corrected ?? c.value,
      originalValue: corrected ? c.value : null,
      reviewer: d.reviewer_name,
      reviewedAt: d.reviewed_at.slice(0, 10),
    };
  });
}

function toListingStatus(s: ClaimStatus | undefined): Facility["verificationStatus"] {
  if (s === "verified") return "verified";
  if (s === "pending_review") return "pending";
  if (s === "disputed") return "rejected";
  return "unverified";
}

function view(c: ResolvedClaim): ClaimView {
  return { field: c.field, value: c.value, status: c.status, reviewedAt: c.reviewedAt, evidence: c.evidence, flags: c.flags, reviewer: c.reviewer, originalValue: c.originalValue };
}

function lastVerified(claims: ResolvedClaim[]) {
  return claims.filter((c) => c.status === "verified" && c.reviewedAt).map((c) => c.reviewedAt as string).sort().at(-1) ?? null;
}

/**
 * "all": every candidate claim (private pilot builds).
 * "verified": only approved claims; a record appears only once its name is approved, and a
 * doctor–hospital link only once the affiliation and both records are approved.
 */
export type Visibility = "all" | "verified";

export function buildListings(ds: PilotDataset, resolved: ResolvedClaim[], visibility: Visibility) {
  const shown = (c: ResolvedClaim) => visibility === "all" || c.status === "verified";
  const forRecord = (id: string) => resolved.filter((c) => c.recordId === id);
  const get = (claims: ResolvedClaim[], field: string) => claims.find((c) => c.field === field && shown(c) && c.status !== "disputed");

  const facilities: Facility[] = [];
  for (const h of ds.hospitals) {
    const claims = forRecord(hospitalId(h.key));
    const name = claims.find((c) => c.field === "name");
    if (visibility === "verified" && name?.status !== "verified") continue;
    const visible = claims.filter(shown);
    const services = visible.filter((c) => c.field.startsWith("service:") && c.status !== "disputed").map((c) => c.field.slice(8));
    facilities.push({
      kind: "hospital",
      id: hospitalId(h.key),
      name: name?.value ?? h.name,
      chain: h.chain,
      type: "hospital",
      stateCode: h.state,
      citySlug: STATE_CITY[h.state] ?? h.state.toLowerCase(),
      address: get(claims, "address")?.value ?? null,
      geo: null,
      phone: get(claims, "phone")?.value ?? null,
      website: get(claims, "website")?.value ?? null,
      services: services.map((code) => ({ code, available24x7: null, verified: claims.some((c) => c.field === `service:${code}` && c.status === "verified") })),
      conditions: services.some((code) => STROKE_SERVICES.includes(code)) ? ["stroke"] : [],
      languages: [],
      accessibility: {},
      isDemo: false,
      isCandidate: visibility === "all",
      verificationStatus: toListingStatus(name?.status),
      lastVerifiedAt: lastVerified(claims),
      sourceTitle: visibility === "all" ? SOURCE_TITLE : VERIFIED_SOURCE_TITLE,
      updatedAt: ds.generatedAt,
      claims: visible.map(view),
    });
  }
  const facilityIds = new Set(facilities.map((f) => f.id));

  const providers: Provider[] = [];
  for (const p of ds.physicians) {
    const claims = forRecord(physicianId(p.key));
    const name = claims.find((c) => c.field === "name");
    if (visibility === "verified" && name?.status !== "verified") continue;
    const visible = claims.filter(shown);
    const links = visible.filter((c) => c.field.startsWith("affiliation:") && c.status !== "disputed" && facilityIds.has(c.otherRecordId ?? ""));
    const procedure = visible.find((c) => c.field === "procedure:mechanical_thrombectomy");
    const hospital = ds.hospitals.find((h) => links[0]?.otherRecordId === hospitalId(h.key));
    const state = hospital?.state ?? "DL";
    providers.push({
      kind: "neurologist",
      id: physicianId(p.key),
      name: name?.value ?? p.name,
      specialty: p.specialty,
      designation: get(claims, "designation")?.value ?? null,
      titles: visibility === "all" ? p.titles : null,
      stateCode: state,
      citySlug: STATE_CITY[state] ?? state.toLowerCase(),
      facilityIds: links.map((c) => c.otherRecordId as string),
      // Degrees are shown only once verified; the candidate titles live in `titles` + claims.
      qualifications: [],
      conditions: [],
      languages: [],
      phone: null,
      website: visibility === "all" || name?.status === "verified" ? p.profileUrl : null,
      teleconsult: null,
      geo: null,
      thrombectomyOperator: procedure && procedure.status !== "disputed" ? procedure.status : null,
      isDemo: false,
      isCandidate: visibility === "all",
      verificationStatus: toListingStatus(name?.status),
      lastVerifiedAt: lastVerified(claims),
      sourceTitle: visibility === "all" ? SOURCE_TITLE : VERIFIED_SOURCE_TITLE,
      updatedAt: ds.generatedAt,
      claims: visible.map(view),
    });
  }
  return { facilities, providers };
}

/** All pilot listings with the given decisions applied. */
export function pilotListings(decisions: ReviewDecision[], visibility: Visibility, maxAgeDays: number) {
  const facilities: Facility[] = [];
  const providers: Provider[] = [];
  for (const ds of PILOT_DATASETS) {
    const built = buildListings(ds, resolveClaims(baseClaims(ds), decisions, maxAgeDays), visibility);
    facilities.push(...built.facilities);
    providers.push(...built.providers);
  }
  return { facilities, providers };
}

/** Candidate listings with no decisions — used by tests and builds without Supabase. */
const unreviewed = pilotListings([], "all", Infinity);
export const PILOT_FACILITIES = unreviewed.facilities;
export const PILOT_PROVIDERS = unreviewed.providers;
