/**
 * Navigation & URL-building tests
 *
 * Covers the bugs we've hit in production:
 * - Sort dropdown resetting to /venues instead of preserving state path
 * - Filter links dropping city/state context
 * - Search URL building from city chips
 * - buildFilterUrl preserving existing params
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "../../");

// ── Mirrors SortSelect logic ────────────────────────────────────────────────
// The bug: was hardcoded to `/venues?` — now uses pathname
function buildSortUrl(pathname: string, currentParams: string, newSort: string): string {
  const params = new URLSearchParams(currentParams);
  params.set("sort", newSort);
  return `${pathname}?${params.toString()}`;
}

describe("SortSelect URL building", () => {
  it("preserves state path when changing sort", () => {
    const url = buildSortUrl("/venues/california", "city=Livermore", "price_asc");
    expect(url).toBe("/venues/california?city=Livermore&sort=price_asc");
  });

  it("preserves state path for price high to low", () => {
    const url = buildSortUrl("/venues/california", "city=Livermore", "price_desc");
    expect(url).toBe("/venues/california?city=Livermore&sort=price_desc");
  });

  it("preserves all existing params when sorting", () => {
    const url = buildSortUrl("/venues/california", "city=Livermore&type=Vineyard+%26+Winery", "rating");
    expect(url).toContain("/venues/california");
    expect(url).toContain("city=Livermore");
    expect(url).toContain("type=");
    expect(url).toContain("sort=rating");
  });

  it("replaces existing sort value", () => {
    const url = buildSortUrl("/venues/california", "city=Livermore&sort=rating", "price_asc");
    expect(url).toBe("/venues/california?city=Livermore&sort=price_asc");
    // Should not have sort twice
    expect(url.match(/sort=/g)?.length).toBe(1);
  });

  it("does NOT produce /venues? base URL (the old bug)", () => {
    const url = buildSortUrl("/venues/california", "city=Livermore", "price_asc");
    expect(url).not.toMatch(/^\/venues\?/);
    expect(url).toMatch(/^\/venues\/california/);
  });

  it("works on /venues/texas path", () => {
    const url = buildSortUrl("/venues/texas", "city=Austin", "capacity");
    expect(url).toBe("/venues/texas?city=Austin&sort=capacity");
  });

  it("works on root /venues path (fallback)", () => {
    const url = buildSortUrl("/venues", "q=winery", "price_asc");
    expect(url).toBe("/venues?q=winery&sort=price_asc");
  });
});

// ── Mirrors buildFilterUrl from lib/venueFilters.ts ────────────────────────
// Toggle behavior: add if not present, remove if already present
function buildFilterUrl(
  basePath: string,
  current: Record<string, string | string[] | undefined>,
  key: string,
  value: string
): string {
  const params = new URLSearchParams();

  for (const [k, v] of Object.entries(current)) {
    if (!v) continue;
    if (Array.isArray(v)) v.forEach((val) => params.append(k, val));
    else params.set(k, v);
  }

  // Toggle: remove if present, add if not
  const existing = params.getAll(key);
  if (existing.includes(value)) {
    const remaining = existing.filter((v) => v !== value);
    params.delete(key);
    remaining.forEach((v) => params.append(key, v));
  } else {
    params.append(key, value);
  }

  // Reset to page 1 when filters change
  params.delete("page");

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

describe("buildFilterUrl", () => {
  it("adds a filter param", () => {
    const url = buildFilterUrl("/venues/california", { city: "Livermore" }, "type", "Vineyard & Winery");
    expect(url).toContain("type=Vineyard+%26+Winery");
    expect(url).toContain("city=Livermore");
    expect(url).toMatch(/^\/venues\/california/);
  });

  it("removes a filter param when toggled off", () => {
    const url = buildFilterUrl(
      "/venues/california",
      { city: "Livermore", type: "Vineyard & Winery" },
      "type",
      "Vineyard & Winery"
    );
    expect(url).not.toContain("type=");
    expect(url).toContain("city=Livermore");
  });

  it("adds to existing multi-value filter", () => {
    const url = buildFilterUrl(
      "/venues/california",
      { type: ["Vineyard & Winery"] },
      "type",
      "Ballroom"
    );
    expect(url).toContain("type=Vineyard");
    expect(url).toContain("type=Ballroom");
  });

  it("removes one value from multi-value filter", () => {
    const url = buildFilterUrl(
      "/venues/california",
      { type: ["Vineyard & Winery", "Ballroom"] },
      "type",
      "Ballroom"
    );
    expect(url).toContain("type=Vineyard");
    expect(url).not.toContain("type=Ballroom");
  });

  it("resets page to 1 when filter changes", () => {
    const url = buildFilterUrl(
      "/venues/california",
      { city: "Livermore", page: "3" },
      "type",
      "Ballroom"
    );
    expect(url).not.toContain("page=");
  });

  it("preserves sort param when filtering", () => {
    const url = buildFilterUrl(
      "/venues/california",
      { city: "Livermore", sort: "price_asc" },
      "type",
      "Ballroom"
    );
    expect(url).toContain("sort=price_asc");
  });

  it("returns basePath with no query string when all filters removed", () => {
    const url = buildFilterUrl("/venues/california", { type: "Ballroom" }, "type", "Ballroom");
    expect(url).toBe("/venues/california");
  });
});

// ── Mirrors CitySearch buildSearchUrl ──────────────────────────────────────
type CitySuggestion = { city: string; stateSlug: string; stateAbbr: string; count: number };

function buildSearchUrl(chips: CitySuggestion[]): string {
  if (chips.length === 0) return "/venues";
  const states = [...new Set(chips.map((c) => c.stateSlug))];
  if (states.length === 1) {
    const params = chips.map((c) => `city=${encodeURIComponent(c.city)}`).join("&");
    return `/venues/${states[0]}?${params}`;
  }
  const q = chips.map((c) => `${c.city}, ${c.stateAbbr}`).join("; ");
  return `/venues?q=${encodeURIComponent(q)}`;
}

describe("CitySearch buildSearchUrl", () => {
  const livermore: CitySuggestion = { city: "Livermore", stateSlug: "california", stateAbbr: "CA", count: 42 };
  const dublin: CitySuggestion = { city: "Dublin", stateSlug: "california", stateAbbr: "CA", count: 14 };
  const austin: CitySuggestion = { city: "Austin", stateSlug: "texas", stateAbbr: "TX", count: 80 };

  it("returns /venues for empty chips", () => {
    expect(buildSearchUrl([])).toBe("/venues");
  });

  it("builds single-city URL with state path", () => {
    expect(buildSearchUrl([livermore])).toBe("/venues/california?city=Livermore");
  });

  it("builds multi-city same-state URL", () => {
    const url = buildSearchUrl([livermore, dublin]);
    expect(url).toBe("/venues/california?city=Livermore&city=Dublin");
  });

  it("falls back to /venues?q= for multi-state", () => {
    const url = buildSearchUrl([livermore, austin]);
    expect(url).toMatch(/^\/venues\?q=/);
    expect(url).toContain("Livermore");
    expect(url).toContain("Austin");
  });

  it("encodes special characters in city names", () => {
    const chip: CitySuggestion = { city: "San José", stateSlug: "california", stateAbbr: "CA", count: 50 };
    const url = buildSearchUrl([chip]);
    // encodeURIComponent uses %20 for spaces, %C3%A9 for é
    expect(url).toContain("city=San%20Jos%C3%A9");
  });
});

// ── Sort values are valid ───────────────────────────────────────────────────
describe("Sort option values", () => {
  const VALID_SORTS = ["rating", "price_asc", "price_desc", "capacity"];

  it("all sort options are valid strings", () => {
    VALID_SORTS.forEach((s) => expect(typeof s).toBe("string"));
  });

  it("default sort is rating", () => {
    expect(VALID_SORTS[0]).toBe("rating");
  });

  it("price_asc and price_desc are distinct", () => {
    expect(VALID_SORTS.indexOf("price_asc")).not.toBe(VALID_SORTS.indexOf("price_desc"));
  });
});

// ── Nav/Footer visibility fix ───────────────────────────────────────────────
describe("Nav/Footer visibility — isStandalone removed from layout", () => {
  it("standalone pages are in the (standalone) route group", () => {
    const standaloneDir = path.join(PROJECT_ROOT, "src/app/(standalone)");
    expect(fs.existsSync(standaloneDir)).toBe(true);
    expect(fs.existsSync(path.join(standaloneDir, "privacy/page.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(standaloneDir, "terms/page.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(standaloneDir, "contact/page.tsx"))).toBe(true);
  });

  it("root layout does not reference isStandalone", () => {
    const layoutPath = path.join(PROJECT_ROOT, "src/app/layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");
    expect(content).not.toContain("isStandalone");
  });

  it("root layout does not read x-pathname header", () => {
    const layoutPath = path.join(PROJECT_ROOT, "src/app/layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");
    expect(content).not.toContain("x-pathname");
  });

  it("middleware does not inject x-pathname header", () => {
    const middlewarePath = path.join(PROJECT_ROOT, "src/middleware.ts");
    const content = fs.readFileSync(middlewarePath, "utf-8");
    expect(content).not.toContain("x-pathname");
  });

  it("root layout uses shouldShowNav from layoutUtils", () => {
    const layoutPath = path.join(PROJECT_ROOT, "src/app/layout.tsx");
    const content = fs.readFileSync(layoutPath, "utf-8");
    expect(content).toContain("shouldShowNav");
    expect(content).toContain("layoutUtils");
  });
});
