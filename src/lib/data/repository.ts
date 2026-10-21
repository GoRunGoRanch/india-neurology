import { DEMO_FACILITIES, DEMO_PROVIDERS } from "./demo/records";
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
}

const demoListings: Listing[] = [...DEMO_PROVIDERS, ...DEMO_FACILITIES];

export const demoRepository: DirectoryRepository = {
  usingDemoData: true,
  async search(query) {
    return searchListings(demoListings, query);
  },
  async provider(id) {
    return DEMO_PROVIDERS.find((p) => p.id === id) ?? null;
  },
  async facility(id) {
    return DEMO_FACILITIES.find((f) => f.id === id) ?? null;
  },
  async facilitiesByIds(ids) {
    return DEMO_FACILITIES.filter((f) => ids.includes(f.id));
  },
  async providersAtFacility(id) {
    return DEMO_PROVIDERS.filter((p) => p.facilityIds.includes(id));
  },
};

export const repository: DirectoryRepository = demoRepository;
