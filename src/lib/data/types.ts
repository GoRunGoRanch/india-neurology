// Domain types mirroring supabase/migrations/0001_init.sql (flattened for the UI).

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface Provenance {
  isDemo: boolean;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null; // ISO date
  sourceTitle: string | null;
  updatedAt: string; // ISO date
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
