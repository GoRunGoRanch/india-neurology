import { DEMO_FACILITIES, DEMO_PROVIDERS } from "./demo/records";
import { directoryMode, reviewMaxAgeDays } from "./mode";
import { pilotListings } from "./pilot";
import { fetchDecisions } from "./reviews";
import { searchListings } from "./search";
import type { Facility, Listing, Provider, SearchQuery, SearchResult } from "./types";

/**
 * The only data entry point for pages. Listings come from a loader so reviewer decisions
 * (Supabase) can be applied on each request without a site rebuild.
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

type Loader = () => Promise<{ providers: Provider[]; facilities: Facility[] }>;

function loaderRepository(load: Loader, flags: { demo: boolean; candidate: boolean }): DirectoryRepository {
  return {
    usingDemoData: flags.demo,
    usingCandidateData: flags.candidate,
    async search(query) {
      const { providers, facilities } = await load();
      return searchListings([...providers, ...facilities] as Listing[], query);
    },
    async provider(id) {
      return (await load()).providers.find((p) => p.id === id) ?? null;
    },
    async facility(id) {
      return (await load()).facilities.find((f) => f.id === id) ?? null;
    },
    async facilitiesByIds(ids) {
      return (await load()).facilities.filter((f) => ids.includes(f.id));
    },
    async providersAtFacility(id) {
      return (await load()).providers.filter((p) => p.facilityIds.includes(id));
    },
  };
}

export const demoRepository = loaderRepository(async () => ({ providers: DEMO_PROVIDERS, facilities: DEMO_FACILITIES }), { demo: true, candidate: false });

/** Every real candidate with decisions applied. Private builds only (see ./mode). */
export const pilotRepository = loaderRepository(async () => pilotListings(await fetchDecisions(), "all", reviewMaxAgeDays), { demo: false, candidate: true });

/** Only reviewer-approved claims. */
export const publishedRepository = loaderRepository(async () => pilotListings(await fetchDecisions(), "verified", reviewMaxAgeDays), { demo: false, candidate: false });

export const repository: DirectoryRepository =
  directoryMode === "pilot" ? pilotRepository : directoryMode === "published" ? publishedRepository : demoRepository;
