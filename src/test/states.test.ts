import { describe, it, expect } from "vitest";
import { STATES, getState, getLiveStates, getComingSoonStates, getStateCities, getStateRegions } from "@/lib/states";

describe("STATES config", () => {
  it("has all 50 US states plus Puerto Rico", () => {
    expect(Object.keys(STATES).length).toBe(51);
  });

  it("california is the only live state", () => {
    const live = getLiveStates();
    expect(live.length).toBe(1);
    expect(live[0].slug).toBe("california");
  });

  it("california has regions defined", () => {
    expect(Object.keys(STATES.california.regions).length).toBeGreaterThan(15);
  });

  it("all 50 non-California entries are coming soon", () => {
    const soon = getComingSoonStates();
    expect(soon.length).toBe(50);
    expect(soon.every((s) => !s.live)).toBe(true);
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

  it("getStateCities returns empty array for coming-soon states", () => {
    expect(getStateCities("texas")).toEqual([]);
    expect(getStateCities("new-york")).toEqual([]);
    expect(getStateCities("florida")).toEqual([]);
  });

  it("getStateRegions returns region names for california", () => {
    const regions = getStateRegions("california");
    expect(regions).toContain("Napa Valley");
    expect(regions).toContain("Los Angeles");
    expect(regions).toContain("San Diego");
  });

  it("getStateRegions returns empty array for coming-soon states", () => {
    expect(getStateRegions("texas")).toEqual([]);
  });

  it("coming-soon states have empty regions", () => {
    getComingSoonStates().forEach((s) => {
      expect(Object.keys(s.regions).length, `${s.slug} should have empty regions`).toBe(0);
    });
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
