import type { Listing, SearchQuery, SearchResult } from "./types";

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

function services(listing: Listing) {
  return listing.kind === "hospital" ? listing.services.map((s) => s.code) : [];
}

/** Pure filter + sort over any set of listings. Same semantics the SQL search will implement. */
export function searchListings(all: Listing[], query: SearchQuery): SearchResult[] {
  const q = query.q?.trim().toLowerCase();
  const results: SearchResult[] = [];

  for (const listing of all) {
    if (query.type && query.type !== "all" && listing.kind !== query.type) continue;
    if (query.state && listing.stateCode !== query.state) continue;
    if (query.city && listing.citySlug !== query.city) continue;
    if (query.condition && !listing.conditions.includes(query.condition)) continue;
    if (query.language && !listing.languages.includes(query.language)) continue;
    if (query.service) {
      // Teleconsultation applies to both kinds; other services are facility-only.
      const ok =
        query.service === "telemedicine" && listing.kind === "neurologist"
          ? listing.teleconsult === true
          : services(listing).includes(query.service);
      if (!ok) continue;
    }
    if (query.facility && (listing.kind !== "hospital" || listing.type !== query.facility)) continue;

    let score = 1;
    if (q) {
      const name = listing.name.toLowerCase();
      if (name === q) score = 3;
      else if (name.includes(q)) score = 2;
      else continue;
    }
    if (listing.verificationStatus === "verified") score += 0.5;

    // Distance only when both ends are trustworthy.
    const distanceKm =
      query.near && listing.geo?.verified ? Math.round(haversineKm(query.near, listing.geo) * 10) / 10 : null;

    results.push({ listing, score, distanceKm });
  }

  const byName = (a: SearchResult, b: SearchResult) => a.listing.name.localeCompare(b.listing.name, "en", { numeric: true });
  if (query.sort === "name") return results.sort(byName);
  if (query.sort === "distance") {
    return results.sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return byName(a, b);
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }
  return results.sort((a, b) => b.score - a.score || byName(a, b));
}

/** Parses Next.js searchParams into a SearchQuery, dropping unknown values. */
export function parseSearchParams(params: Record<string, string | string[] | undefined>): SearchQuery {
  const one = (k: string) => {
    const v = params[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s && s.length > 0 ? s : undefined;
  };
  const type = one("type");
  const sort = one("sort");
  return {
    type: type === "neurologist" || type === "hospital" ? type : "all",
    state: one("state"),
    city: one("city"),
    condition: one("condition"),
    service: one("service"),
    language: one("language"),
    facility: one("facility"),
    q: one("q"),
    sort: sort === "name" || sort === "distance" ? sort : "relevance",
  };
}
