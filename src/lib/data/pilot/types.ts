// Shape of a pilot research dataset (src/lib/data/pilot/*.json). Mirrors the India Stroke Hub
// brief: hospitals, physicians, affiliations, hospital services and physician procedures are
// separate records, and every claim carries its own evidence and review status.

/** "unknown" is never a status — a missing claim means unknown, not unavailable. */
export type ClaimStatus = "draft" | "pending_review" | "verified" | "disputed" | "stale";

export interface Evidence {
  field?: string;
  url: string;
  excerpt: string;
  kind: "verbatim" | "summary";
  sourceType: "official" | "government" | "news";
  sourceDate: string | null;
  checkedAt: string; // ISO date the source was read
}

export interface Review {
  status: ClaimStatus;
  reviewer: string | null;
  reviewedAt: string | null;
}

export interface PilotHospital {
  key: string;
  name: string;
  chain: string | null;
  campus: string | null;
  address: string | null;
  city: string;
  state: string;
  pincode: string | null;
  officialWebsite: string | null;
  officialPhone: string | null;
  ownership: "government" | "private" | "trust" | null;
  evidence: Evidence[];
  services: (Review & { code: string; value: "available"; evidence: Evidence[] })[];
  notes: string | null;
  review: Review;
}

export interface PilotPhysician {
  key: string;
  name: string;
  titles: string | null;
  designation: string | null;
  specialty: string;
  subspecialty: string | null;
  profileUrl: string | null;
  evidence: Evidence[];
  flags: string[];
  review: Review;
}

export interface PilotAffiliation extends Review {
  physicianKey: string;
  hospitalKey: string;
  role: string | null;
  evidence: Evidence[];
  flags: string[];
}

/** Kept apart from hospital services: a hospital offering thrombectomy proves nothing about a doctor. */
export interface PilotProcedure extends Review {
  physicianKey: string;
  procedure: "mechanical_thrombectomy";
  value: "explicit_claim";
  evidence: Evidence[];
}

export interface PilotDataset {
  pilot: string;
  generatedAt: string;
  hospitals: PilotHospital[];
  physicians: PilotPhysician[];
  affiliations: PilotAffiliation[];
  procedures: PilotProcedure[];
  sourceFailures: { url: string; reason: string }[];
}
