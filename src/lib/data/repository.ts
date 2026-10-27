import { DEMO_FACILITIES, DEMO_PROVIDERS } from "./demo/records";
import { showCandidates } from "./mode";
import { PILOT_FACILITIES, PILOT_PROVIDERS } from "./pilot";
import { searchListings } from "./search";
import type { Facility, Listing, Provider, SearchQuery, SearchResult } from "./types";

/**
 * The only data entry point for pages. The MVP uses the demo implementation; a Supabase
 * implementation of this same interface replaces it once verified data exists.
 */
export interface DirectoryRepository {
  search(query: SearchQuery): Promise<SearchResult[]>;
  provider(id: string): Promise<Provider | null>;
  facility(id: string): Promise<Facility | null>;
  facilitiesByIds(ids: string[]): Promise<Facility[]>;
  providersAtFacility(id: string): Promise<Provider[]>;
  usingDemoData: boolean;
  usingCandidateData: boolean;
}

function inMemoryRepository(providers: Provider[], facilities: Facility[], flags: { demo: boolean; candidate: boolean }): DirectoryRepository {
  const listings: Listing[] = [...providers, ...facilities];
  return {
    usingDemoData: flags.demo,
    usingCandidateData: flags.candidate,
    async search(query) {
      return searchListings(listings, query);
    },
    async provider(id) {
      return providers.find((p) => p.id === id) ?? null;
    },
    async facility(id) {
      return facilities.find((f) => f.id === id) ?? null;
    },
    async facilitiesByIds(ids) {
      return facilities.filter((f) => ids.includes(f.id));
    },
    async providersAtFacility(id) {
      return providers.filter((p) => p.facilityIds.includes(id));
    },
  };
}

export const demoRepository = inMemoryRepository(DEMO_PROVIDERS, DEMO_FACILITIES, { demo: true, candidate: false });

/** Real, source-linked pilot records awaiting review. Private builds only (see ./mode). */
export const pilotRepository = inMemoryRepository(PILOT_PROVIDERS, PILOT_FACILITIES, { demo: false, candidate: true });

export const repository: DirectoryRepository = showCandidates ? pilotRepository : demoRepository;
