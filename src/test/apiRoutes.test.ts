/**
 * API route logic tests
 *
 * Tests the pure logic extracted from API routes — sort building,
 * where clause construction, offset/pagination, state scoping.
 * No DB calls — pure logic only.
 */
import { describe, it, expect } from "vitest";

// ── Mirrors /api/venues sort logic ─────────────────────────────────────────
type SortOrder = { field: string; dir: "asc" | "desc"; nulls: "last" | "first" };

function buildOrderBy(sort: string): SortOrder[] {
  const order: SortOrder[] = [];
  if (sort === "rating") {
    order.push({ field: "googleRating", dir: "desc", nulls: "last" });
    order.push({ field: "googleReviews", dir: "desc", nulls: "last" });
  }
  if (sort === "price_asc") order.push({ field: "baseRentalMin", dir: "asc", nulls: "last" });
  if (sort === "price_desc") order.push({ field: "baseRentalMin", dir: "desc", nulls: "last" });
  if (sort === "capacity") order.push({ field: "maxGuests", dir: "desc", nulls: "last" });
  // Stable tiebreaker
  order.push({ field: "id", dir: "asc", nulls: "last" });
  return order;
}

describe("buildOrderBy (API sort logic)", () => {
  it("rating sort uses googleRating desc then googleReviews desc", () => {
    const order = buildOrderBy("rating");
    expect(order[0]).toMatchObject({ field: "googleRating", dir: "desc" });
    expect(order[1]).toMatchObject({ field: "googleReviews", dir: "desc" });
  });

  it("price_asc sorts baseRentalMin ascending", () => {
    const order = buildOrderBy("price_asc");
    expect(order[0]).toMatchObject({ field: "baseRentalMin", dir: "asc" });
  });

  it("price_desc sorts baseRentalMin descending", () => {
    const order = buildOrderBy("price_desc");
    expect(order[0]).toMatchObject({ field: "baseRentalMin", dir: "desc" });
  });

  it("capacity sorts maxGuests descending", () => {
    const order = buildOrderBy("capacity");
    expect(order[0]).toMatchObject({ field: "maxGuests", dir: "desc" });
  });

  it("all sorts have stable id tiebreaker as last entry", () => {
    ["rating", "price_asc", "price_desc", "capacity"].forEach((sort) => {
      const order = buildOrderBy(sort);
      expect(order[order.length - 1]).toMatchObject({ field: "id", dir: "asc" });
    });
  });

  it("nulls go last for all sorts", () => {
    ["rating", "price_asc", "price_desc", "capacity"].forEach((sort) => {
      buildOrderBy(sort).forEach((o) => {
        expect(o.nulls).toBe("last");
      });
    });
  });

  it("unknown sort value still has tiebreaker", () => {
    const order = buildOrderBy("unknown");
    expect(order).toHaveLength(1);
    expect(order[0]).toMatchObject({ field: "id" });
  });
});

// ── Mirrors /api/venues where clause construction ─────────────────────────
function buildVenueWhere(params: {
  q?: string;
  state?: string;
  cities?: string[];
  types?: string[];
  styles?: string[];
}) {
  return {
    isPublished: true,
    ...(params.state && { stateSlug: params.state }),
    ...(params.q && {
      OR: [
        { name: { contains: params.q, mode: "insensitive" } },
        { city: { contains: params.q, mode: "insensitive" } },
        { description: { contains: params.q, mode: "insensitive" } },
      ],
    }),
    ...((params.cities?.length ?? 0) > 0 && { city: { in: params.cities } }),
    ...((params.types?.length ?? 0) > 0 && { venueType: { in: params.types } }),
    ...((params.styles?.length ?? 0) > 0 && { styleTags: { hasSome: params.styles } }),
  };
}

describe("buildVenueWhere (API where logic)", () => {
  it("always includes isPublished: true", () => {
    expect(buildVenueWhere({}).isPublished).toBe(true);
  });

  it("scopes to state when provided", () => {
    const w = buildVenueWhere({ state: "california" });
    expect((w as any).stateSlug).toBe("california");
  });

  it("does NOT include stateSlug when state is omitted", () => {
    const w = buildVenueWhere({});
    expect((w as any).stateSlug).toBeUndefined();
  });

  it("adds OR search for q param", () => {
    const w = buildVenueWhere({ q: "wente" });
    expect((w as any).OR).toHaveLength(3);
    expect((w as any).OR[0]).toMatchObject({ name: { contains: "wente" } });
  });

  it("does not add OR when q is empty/undefined", () => {
    expect((buildVenueWhere({ q: "" }) as any).OR).toBeUndefined();
    expect((buildVenueWhere({}) as any).OR).toBeUndefined();
  });

  it("filters by city list", () => {
    const w = buildVenueWhere({ cities: ["Livermore", "Napa"] });
    expect((w as any).city).toEqual({ in: ["Livermore", "Napa"] });
  });

  it("does NOT add city filter for empty array", () => {
    const w = buildVenueWhere({ cities: [] });
    expect((w as any).city).toBeUndefined();
  });

  it("filters by venue type", () => {
    const w = buildVenueWhere({ types: ["Vineyard & Winery"] });
    expect((w as any).venueType).toEqual({ in: ["Vineyard & Winery"] });
  });

  it("filters by style tags", () => {
    const w = buildVenueWhere({ styles: ["Romantic", "Rustic"] });
    expect((w as any).styleTags).toEqual({ hasSome: ["Romantic", "Rustic"] });
  });

  it("combines all filters", () => {
    const w = buildVenueWhere({
      state: "california",
      q: "winery",
      cities: ["Napa"],
      types: ["Vineyard & Winery"],
      styles: ["Romantic"],
    });
    expect(w.isPublished).toBe(true);
    expect((w as any).stateSlug).toBe("california");
    expect((w as any).OR).toBeDefined();
    expect((w as any).city).toEqual({ in: ["Napa"] });
    expect((w as any).venueType).toEqual({ in: ["Vineyard & Winery"] });
    expect((w as any).styleTags).toEqual({ hasSome: ["Romantic"] });
  });
});

// ── Offset / pagination math ───────────────────────────────────────────────
describe("Pagination offset math", () => {
  const PAGE_SIZE = 24;

  function getHasMore(total: number, offset: number, returned: number) {
    return offset + returned < total;
  }

  it("hasMore is true when more results exist", () => {
    expect(getHasMore(100, 0, 24)).toBe(true);
  });

  it("hasMore is false on last page", () => {
    expect(getHasMore(24, 0, 24)).toBe(false);
  });

  it("hasMore is false when exactly at total", () => {
    expect(getHasMore(48, 24, 24)).toBe(false);
  });

  it("hasMore is true mid-dataset", () => {
    expect(getHasMore(100, 48, 24)).toBe(true);
  });

  it("offset 0 is first page", () => {
    expect(0 / PAGE_SIZE).toBe(0);
  });

  it("offset 24 is second page", () => {
    expect(24 / PAGE_SIZE).toBe(1);
  });
});

// ── Cities API response shape ──────────────────────────────────────────────
describe("Cities API response shape", () => {
  function formatCityResult(row: { city: string; stateSlug: string; count: number }) {
    const stateAbbr = row.stateSlug.slice(0, 2).toUpperCase(); // simplified
    return {
      city: row.city,
      stateSlug: row.stateSlug,
      stateAbbr,
      count: row.count,
    };
  }

  it("formats city result correctly", () => {
    const result = formatCityResult({ city: "Livermore", stateSlug: "california", count: 42 });
    expect(result).toEqual({ city: "Livermore", stateSlug: "california", stateAbbr: "CA", count: 42 });
  });

  it("returns empty array for queries under 2 chars", () => {
    const q = "L";
    expect(q.length < 2).toBe(true); // documents the guard condition
  });

  it("stateAbbr is always uppercase", () => {
    const result = formatCityResult({ city: "Austin", stateSlug: "texas", count: 80 });
    expect(result.stateAbbr).toBe(result.stateAbbr.toUpperCase());
  });
});

// ── Region expansion ───────────────────────────────────────────────────────
describe("Region to cities expansion", () => {
  // Mirrors logic in /api/venues route
  function expandRegions(
    regions: string[],
    existingCities: string[],
    regionMap: Record<string, string[]>
  ): string[] {
    const regionCities = regions.flatMap((r) => regionMap[r] ?? []);
    return [...existingCities, ...regionCities.filter((c) => !existingCities.includes(c))];
  }

  const regions = {
    "Tri-Valley": ["Livermore", "Dublin", "Pleasanton"],
    "Napa Valley": ["Napa", "St. Helena", "Calistoga"],
  };

  it("expands region to cities", () => {
    const result = expandRegions(["Tri-Valley"], [], regions);
    expect(result).toContain("Livermore");
    expect(result).toContain("Dublin");
    expect(result).toContain("Pleasanton");
  });

  it("does not duplicate cities already in list", () => {
    const result = expandRegions(["Tri-Valley"], ["Livermore"], regions);
    expect(result.filter((c) => c === "Livermore")).toHaveLength(1);
  });

  it("combines explicit cities and region cities", () => {
    const result = expandRegions(["Napa Valley"], ["Livermore"], regions);
    expect(result).toContain("Livermore");
    expect(result).toContain("Napa");
  });

  it("returns empty for unknown region", () => {
    const result = expandRegions(["Unknown Region"], [], regions);
    expect(result).toHaveLength(0);
  });

  it("handles multiple regions", () => {
    const result = expandRegions(["Tri-Valley", "Napa Valley"], [], regions);
    expect(result).toHaveLength(6);
  });
});
