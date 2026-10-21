import { describe, expect, it } from "vitest";
import { DEMO_FACILITIES, DEMO_PROVIDERS } from "@/lib/data/demo/records";
import { haversineKm, parseSearchParams, searchListings } from "@/lib/data/search";
import type { Listing } from "@/lib/data/types";

const all: Listing[] = [...DEMO_PROVIDERS, ...DEMO_FACILITIES];

describe("searchListings", () => {
  it("returns everything with an empty query", () => {
    expect(searchListings(all, {})).toHaveLength(all.length);
  });

  it("filters by type", () => {
    expect(searchListings(all, { type: "hospital" }).every((r) => r.listing.kind === "hospital")).toBe(true);
    expect(searchListings(all, { type: "neurologist" }).every((r) => r.listing.kind === "neurologist")).toBe(true);
  });

  it("filters by state and city", () => {
    const r = searchListings(all, { state: "MH", city: "pune" });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((x) => x.listing.stateCode === "MH" && x.listing.citySlug === "pune")).toBe(true);
  });

  it("filters by condition, language and facility type", () => {
    expect(searchListings(all, { condition: "epilepsy" }).every((r) => r.listing.conditions.includes("epilepsy"))).toBe(true);
    expect(searchListings(all, { language: "ta" }).every((r) => r.listing.languages.includes("ta"))).toBe(true);
    const rehab = searchListings(all, { facility: "rehab_centre" });
    expect(rehab.length).toBeGreaterThan(0);
    expect(rehab.every((r) => r.listing.kind === "hospital" && r.listing.type === "rehab_centre")).toBe(true);
  });

  it("filters by service; teleconsultation also matches neurologists", () => {
    const thrombo = searchListings(all, { service: "thrombolysis" });
    expect(thrombo.every((r) => r.listing.kind === "hospital" && r.listing.services.some((s) => s.code === "thrombolysis"))).toBe(true);
    const tele = searchListings(all, { service: "telemedicine" });
    expect(tele.some((r) => r.listing.kind === "neurologist")).toBe(true);
    expect(tele.some((r) => r.listing.kind === "hospital")).toBe(true);
  });

  it("matches names case-insensitively and excludes non-matches", () => {
    const r = searchListings(all, { q: "demo neurologist b" });
    expect(r).toHaveLength(1);
    expect(r[0].listing.id).toBe("demo-neurologist-2");
  });

  it("combines filters with AND", () => {
    const r = searchListings(all, { type: "hospital", state: "DL", service: "thrombectomy" });
    expect(r.map((x) => x.listing.id)).toEqual(["demo-facility-1"]);
    expect(searchListings(all, { state: "DL", condition: "dementia" })).toHaveLength(0);
  });

  it("sorts by name with numeric ordering", () => {
    const names = searchListings(all, { type: "hospital", sort: "name" }).map((r) => r.listing.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en", { numeric: true })));
  });

  it("never reports distance for unverified coordinates", () => {
    const r = searchListings(all, { near: { lat: 28.6, lng: 77.2 }, sort: "distance" });
    expect(r.every((x) => x.distanceKm === null)).toBe(true);
  });

  it("reports distance for verified coordinates", () => {
    const verified = { ...DEMO_FACILITIES[0], geo: { lat: 28.61, lng: 77.21, verified: true } };
    const [hit] = searchListings([verified], { near: { lat: 19.08, lng: 72.88 } });
    expect(hit.distanceKm).toBeGreaterThan(1100);
    expect(hit.distanceKm).toBeLessThan(1200);
  });
});

describe("haversineKm", () => {
  it("is zero for the same point", () => expect(haversineKm({ lat: 10, lng: 10 }, { lat: 10, lng: 10 })).toBe(0));
});

describe("parseSearchParams", () => {
  it("drops unknown type and sort values", () => {
    expect(parseSearchParams({ type: "x", sort: "rating" })).toMatchObject({ type: "all", sort: "relevance" });
  });
  it("treats empty strings as unset", () => {
    expect(parseSearchParams({ state: "", city: "" })).toMatchObject({ state: undefined, city: undefined });
  });
});
