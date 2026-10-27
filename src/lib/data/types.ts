// Domain types mirroring supabase/migrations/0001_init.sql (flattened for the UI).

import type { ClaimStatus, Evidence } from "./pilot/types";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface Provenance {
  isDemo: boolean;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null; // ISO date
  sourceTitle: string | null;
  updatedAt: string; // ISO date
  /** Real, source-linked research record that no reviewer has approved yet. */
  isCandidate?: boolean;
  /** Each individual claim with its own evidence (pilot records only). */
  claims?: ClaimView[];
}

/** One claim as shown on a profile: what is asserted, its review state, and where it came from. */
export interface ClaimView {
  /** "name" | "address" | "phone" | "website" | "designation" | "service:<code>" | "affiliation:<facilityId>" | "procedure:mechanical_thrombectomy" */
  field: string;
  value: string;
  status: ClaimStatus;
  reviewedAt: string | null;
  evidence: Evidence[];
  flags?: string[];
  reviewer?: string | null;
  /** What the research said, when a reviewer corrected the value. */
  originalValue?: string | null;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  /** Distance sort and "km away" are shown only when true. */
  verified: boolean;
}

export interface Facility extends Provenance {
  kind: "hospital";
  id: string; // canonical_id
  name: string;
  type: string; // FACILITY_TYPES code
  stateCode: string;
  citySlug: string;
  address: string | null;
  geo: GeoPoint | null;
  phone: string | null;
  website: string | null;
  services: { code: string; available24x7: boolean | null; verified: boolean }[];
  chain?: string | null;
  conditions: string[]; // condition slugs the facility treats
  languages: string[];
  accessibility: { wheelchair?: boolean; lift?: boolean; accessibleToilet?: boolean };
}

export interface Qualification {
  degree: string;
  institution: string | null;
  year: number | null;
  registrationCouncil: string | null;
  registrationNumber: string | null;
  verified: boolean;
}

export interface Provider extends Provenance {
  kind: "neurologist";
  id: string;
  name: string;
  specialty: string;
  stateCode: string;
  citySlug: string;
  facilityIds: string[];
  qualifications: Qualification[];
  conditions: string[];
  languages: string[];
  phone: string | null;
  website: string | null;
  teleconsult: boolean | null;
  geo: GeoPoint | null;
  designation?: string | null;
  titles?: string | null;
  /** Only set from explicit evidence about this individual; never inferred from the hospital. */
  thrombectomyOperator?: ClaimStatus | null;
}

export type Listing = Provider | Facility;

export interface SearchQuery {
  type?: "neurologist" | "hospital" | "all";
  state?: string;
  city?: string;
  condition?: string;
  service?: string;
  language?: string;
  facility?: string; // facility type code
  q?: string;
  sort?: "relevance" | "name" | "distance";
  near?: { lat: number; lng: number };
}

export interface SearchResult {
  listing: Listing;
  score: number;
  distanceKm: number | null;
}
