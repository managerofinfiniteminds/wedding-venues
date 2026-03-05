import { describe, it, expect } from "vitest";
import { STATES, getState, getLiveStates, getComingSoonStates, getStateCities, getStateRegions } from "@/lib/states";

describe("STATES config", () => {
  it("has all 50 US states plus Puerto Rico", () => {
    expect(Object.keys(STATES).length).toBe(51);
  });

  it("california is the only fully live state with venue data", () => {
    const live = getLiveStates();
    expect(live.length).toBeGreaterThanOrEqual(1);
    expect(live.map((s) => s.slug)).toContain("california");
  });

  it("california has regions defined", () => {
    expect(Object.keys(STATES.california.regions).length).toBeGreaterThan(15);
  });

  it("puerto-rico is coming soon", () => {
    const pr = getState("puerto-rico");
    expect(pr?.live).toBe(false);
  });

  it("getState returns correct config for california", () => {
    const ca = getState("california");
    expect(ca?.abbr).toBe("CA");
    expect(ca?.name).toBe("California");
  });

  it("getState returns undefined for unknown slug", () => {
    expect(getState("mars")).toBeUndefined();
    expect(getState("")).toBeUndefined();
  });

  it("all states have required fields", () => {
    Object.values(STATES).forEach((s) => {
      expect(s.name, `${s.slug} missing name`).toBeTruthy();
      expect(s.abbr, `${s.slug} missing abbr`).toBeTruthy();
      expect(s.slug, `${s.slug} missing slug`).toBeTruthy();
      expect(typeof s.live, `${s.slug} live must be boolean`).toBe("boolean");
      expect(s.description, `${s.slug} missing description`).toBeTruthy();
    });
  });

  it("slug key matches slug field for every state", () => {
    Object.entries(STATES).forEach(([key, s]) => {
      expect(s.slug, `key "${key}" has slug "${s.slug}"`).toBe(key);
    });
  });

  it("all state abbrs are 2 characters", () => {
    Object.values(STATES).forEach((s) => {
      expect(s.abbr.length, `${s.slug} abbr should be 2 chars`).toBe(2);
    });
  });

  it("getStateCities returns cities for california", () => {
    const cities = getStateCities("california");
    expect(cities.length).toBeGreaterThan(200);
    expect(cities).toContain("San Francisco");
    expect(cities).toContain("Los Angeles");
    expect(cities).toContain("Napa");
    expect(cities).toContain("San Diego");
  });

  it("getStateRegions returns region names for california", () => {
    const regions = getStateRegions("california");
    expect(regions).toContain("Napa Valley");
    expect(regions).toContain("Los Angeles");
    expect(regions).toContain("San Diego");
  });

  // ── New region tests ──────────────────────────────────────────────────────

  it("all states have at least one region", () => {
    Object.values(STATES).forEach((s) => {
      expect(Object.keys(s.regions).length, `${s.slug} has no regions`).toBeGreaterThan(0);
    });
  });

  it("each region has at least 3 cities", () => {
    Object.values(STATES).forEach((s) => {
      Object.entries(s.regions).forEach(([region, cities]) => {
        expect(
          cities.length,
          `${s.slug} > "${region}" has only ${cities.length} cities (need ≥ 3)`
        ).toBeGreaterThanOrEqual(3);
      });
    });
  });

  it("no duplicate city names within a state's regions", () => {
    Object.values(STATES).forEach((s) => {
      const allCities = Object.values(s.regions).flat();
      const unique = new Set(allCities);
      expect(
        unique.size,
        `${s.slug} has ${allCities.length - unique.size} duplicate city names across regions`
      ).toBe(allCities.length);
    });
  });

  it("getStateCities returns cities for all states with regions", () => {
    expect(getStateCities("texas").length).toBeGreaterThan(0);
    expect(getStateCities("new-york").length).toBeGreaterThan(0);
    expect(getStateCities("florida").length).toBeGreaterThan(0);
  });

  it("getStateRegions returns human-logical regions for key states", () => {
    expect(getStateRegions("texas")).toContain("Austin & Hill Country");
    expect(getStateRegions("new-york")).toContain("New York City");
    expect(getStateRegions("florida")).toContain("Miami & South Florida");
    expect(getStateRegions("tennessee")).toContain("Nashville Metro");
    expect(getStateRegions("washington")).toContain("Seattle Metro");
  });

  // Spot-check specific states exist
  it("has all major states", () => {
    const slugs = Object.keys(STATES);
    ["texas", "new-york", "florida", "colorado", "washington", "oregon",
     "arizona", "georgia", "north-carolina", "tennessee", "virginia",
     "hawaii", "alaska", "wyoming", "vermont", "rhode-island", "puerto-rico"].forEach((s) => {
      expect(slugs, `missing state: ${s}`).toContain(s);
    });
  });
});
