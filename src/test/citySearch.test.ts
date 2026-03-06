import { describe, it, expect } from "vitest";
import { buildSearchUrl, isDuplicate, CitySuggestion } from "../components/CitySearch";

const livermore: CitySuggestion = { city: "Livermore", stateSlug: "california", stateAbbr: "CA", count: 42 };
const pleasanton: CitySuggestion = { city: "Pleasanton", stateSlug: "california", stateAbbr: "CA", count: 30 };
const austin: CitySuggestion = { city: "Austin", stateSlug: "texas", stateAbbr: "TX", count: 75 };
const napa: CitySuggestion = { city: "Napa", stateSlug: "california", stateAbbr: "CA", count: 55 };

describe("buildSearchUrl", () => {
  it("returns /venues for empty chips", () => {
    expect(buildSearchUrl([])).toBe("/venues");
  });

  it("returns single-state URL for one chip", () => {
    expect(buildSearchUrl([livermore])).toBe("/venues/california?city=Livermore");
  });

  it("includes both city params for two chips same state", () => {
    const url = buildSearchUrl([livermore, pleasanton]);
    expect(url).toBe("/venues/california?city=Livermore&city=Pleasanton");
  });

  it("includes three city params for three chips same state", () => {
    const url = buildSearchUrl([livermore, pleasanton, napa]);
    expect(url).toBe("/venues/california?city=Livermore&city=Pleasanton&city=Napa");
  });

  it("uses fallback q param for chips spanning multiple states", () => {
    const url = buildSearchUrl([livermore, austin]);
    expect(url.startsWith("/venues?q=")).toBe(true);
    const decoded = decodeURIComponent(url.replace("/venues?q=", ""));
    expect(decoded).toContain("Livermore, CA");
    expect(decoded).toContain("Austin, TX");
  });

  it("URL-encodes city names with spaces", () => {
    const sanRamon: CitySuggestion = { city: "San Ramon", stateSlug: "california", stateAbbr: "CA", count: 20 };
    const url = buildSearchUrl([sanRamon]);
    expect(url).toBe("/venues/california?city=San%20Ramon");
  });
});

describe("isDuplicate", () => {
  it("returns false for empty chips", () => {
    expect(isDuplicate([], livermore)).toBe(false);
  });

  it("returns false when chip is not in list", () => {
    expect(isDuplicate([livermore], pleasanton)).toBe(false);
  });

  it("returns true when exact chip already exists", () => {
    expect(isDuplicate([livermore, pleasanton], livermore)).toBe(true);
  });

  it("returns false for same city name in different state", () => {
    const austinCA: CitySuggestion = { city: "Austin", stateSlug: "california", stateAbbr: "CA", count: 5 };
    expect(isDuplicate([austin], austinCA)).toBe(false);
  });

  it("returns true for last item in chips", () => {
    expect(isDuplicate([livermore, pleasanton, napa], napa)).toBe(true);
  });
});
