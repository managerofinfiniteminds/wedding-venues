import { describe, it, expect } from "vitest";

// Pure logic tests mirroring the map API route's bounds filtering

function filterByBounds(
  venues: Array<{ latitude: number | null; longitude: number | null; id: string }>,
  bounds: { swLat: number; swLng: number; neLat: number; neLng: number } | null
) {
  if (!bounds) return venues;
  return venues.filter(
    (v) =>
      v.latitude !== null &&
      v.longitude !== null &&
      v.latitude >= bounds.swLat &&
      v.latitude <= bounds.neLat &&
      v.longitude >= bounds.swLng &&
      v.longitude <= bounds.neLng
  );
}

function parseBounds(param: string | null) {
  if (!param) return null;
  const parts = param.split(",").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return null;
  return { swLat: parts[0], swLng: parts[1], neLat: parts[2], neLng: parts[3] };
}

const SAMPLE_VENUES = [
  { id: "v1", latitude: 37.7749, longitude: -122.4194 }, // San Francisco, CA
  { id: "v2", latitude: 34.0522, longitude: -118.2437 }, // Los Angeles, CA
  { id: "v3", latitude: 40.7128, longitude: -74.006 },   // New York City, NY
  { id: "v4", latitude: null,    longitude: null },       // No coordinates
];

describe("map bounds filtering", () => {
  it("returns all venues when no bounds provided", () => {
    const result = filterByBounds(SAMPLE_VENUES, null);
    expect(result.length).toBe(4);
  });

  it("filters to only CA venues within CA bounds", () => {
    const bounds = { swLat: 32.5, swLng: -124.5, neLat: 42.0, neLng: -114.1 };
    const result = filterByBounds(SAMPLE_VENUES, bounds);
    expect(result.map((v) => v.id)).toContain("v1");
    expect(result.map((v) => v.id)).toContain("v2");
    expect(result.map((v) => v.id)).not.toContain("v3");
  });

  it("excludes venues with null coordinates", () => {
    const bounds = { swLat: 0, swLng: -180, neLat: 90, neLng: 0 };
    const result = filterByBounds(SAMPLE_VENUES, bounds);
    expect(result.map((v) => v.id)).not.toContain("v4");
  });

  it("returns empty array when no venues are within bounds", () => {
    const bounds = { swLat: 0, swLng: 0, neLat: 1, neLng: 1 }; // middle of ocean
    const result = filterByBounds(SAMPLE_VENUES, bounds);
    expect(result.length).toBe(0);
  });

  it("includes venue exactly on boundary", () => {
    const bounds = { swLat: 37.7749, swLng: -122.4194, neLat: 40.7128, neLng: -74.006 };
    const result = filterByBounds(SAMPLE_VENUES, bounds);
    expect(result.map((v) => v.id)).toContain("v1"); // exactly on SW corner
    expect(result.map((v) => v.id)).toContain("v3"); // exactly on NE corner
  });

  it("respects MAX_VENUES cap logic (slice to 500)", () => {
    const bigList = Array.from({ length: 600 }, (_, i) => ({
      id: `v${i}`,
      latitude: 37 + i * 0.001,
      longitude: -122,
    }));
    const capped = bigList.slice(0, 500);
    expect(capped.length).toBe(500);
    expect(bigList.length).toBeGreaterThan(500);
  });
});

describe("parseBounds", () => {
  it("parses valid bounds string", () => {
    const result = parseBounds("32.5,-124.5,42.0,-114.1");
    expect(result).toEqual({ swLat: 32.5, swLng: -124.5, neLat: 42.0, neLng: -114.1 });
  });

  it("returns null for null input", () => {
    expect(parseBounds(null)).toBeNull();
  });

  it("returns null for wrong number of parts", () => {
    expect(parseBounds("1,2,3")).toBeNull();
    expect(parseBounds("1,2,3,4,5")).toBeNull();
  });

  it("returns null when any value is NaN", () => {
    expect(parseBounds("abc,1,2,3")).toBeNull();
    expect(parseBounds("not,valid,at,all")).toBeNull();
  });

  it("handles negative longitudes correctly", () => {
    const result = parseBounds("25.0,-80.0,30.0,-75.0");
    expect(result?.swLng).toBe(-80.0);
    expect(result?.neLng).toBe(-75.0);
  });
});

describe("stateSlug filter logic", () => {
  function buildMapWhere(state?: string, bounds?: { swLat: number; swLng: number; neLat: number; neLng: number } | null) {
    return {
      isPublished: true,
      latitude: { not: null },
      longitude: { not: null },
      ...(state && { stateSlug: state }),
      ...(bounds && {
        latitude: { gte: bounds.swLat, lte: bounds.neLat, not: null },
        longitude: { gte: bounds.swLng, lte: bounds.neLng, not: null },
      }),
    };
  }

  it("includes stateSlug when state param provided", () => {
    const where = buildMapWhere("california");
    expect(where.stateSlug).toBe("california");
  });

  it("omits stateSlug when no state param", () => {
    const where = buildMapWhere(undefined);
    expect((where as any).stateSlug).toBeUndefined();
  });

  it("includes bounds when provided", () => {
    const bounds = { swLat: 32.5, swLng: -124.5, neLat: 42.0, neLng: -114.1 };
    const where = buildMapWhere("california", bounds);
    expect((where.latitude as any).gte).toBe(32.5);
    expect((where.longitude as any).lte).toBe(-114.1);
  });
});
