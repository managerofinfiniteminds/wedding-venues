import { describe, it, expect } from "vitest";

// Pure function that mirrors the where clause logic in venues/page.tsx
// We test the logic in isolation
function buildWhereClause(params: {
  q?: string;
  cities?: string[];
  types?: string[];
  styles?: string[];
  minPrice?: number;
  maxPrice?: number;
  minGuests?: number;
  maxGuests?: number;
}) {
  const where: Record<string, unknown> = { isPublished: true };

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { city: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.cities?.length) where.city = { in: params.cities };
  if (params.types?.length) where.venueType = { in: params.types };
  if (params.styles?.length) where.styleTags = { hasSome: params.styles };
  if (params.minPrice !== undefined) where.baseRentalMin = { gte: params.minPrice };
  if (params.maxPrice !== undefined) where.baseRentalMax = { lte: params.maxPrice };
  if (params.minGuests !== undefined) where.maxGuests = { gte: params.minGuests };
  if (params.maxGuests !== undefined) where.minGuests = { lte: params.maxGuests };

  return where;
}

describe("buildWhereClause", () => {
  it("always includes isPublished: true", () => {
    const result = buildWhereClause({});
    expect(result.isPublished).toBe(true);
  });

  it("adds OR search when q is provided", () => {
    const result = buildWhereClause({ q: "wente" });
    expect(result.OR).toBeDefined();
    expect(Array.isArray(result.OR)).toBe(true);
    const orClauses = result.OR as Array<Record<string, unknown>>;
    expect(orClauses).toHaveLength(3);
    expect(orClauses[0]).toEqual({ name: { contains: "wente", mode: "insensitive" } });
  });

  it("does not add OR clause when q is empty", () => {
    const result = buildWhereClause({ q: "" });
    expect(result.OR).toBeUndefined();
  });

  it("filters by cities", () => {
    const result = buildWhereClause({ cities: ["Livermore", "Pleasanton"] });
    expect(result.city).toEqual({ in: ["Livermore", "Pleasanton"] });
  });

  it("does not add city filter when cities array is empty", () => {
    const result = buildWhereClause({ cities: [] });
    expect(result.city).toBeUndefined();
  });

  it("filters by venue types", () => {
    const result = buildWhereClause({ types: ["Vineyard & Winery"] });
    expect(result.venueType).toEqual({ in: ["Vineyard & Winery"] });
  });

  it("filters by style tags", () => {
    const result = buildWhereClause({ styles: ["Romantic", "Rustic"] });
    expect(result.styleTags).toEqual({ hasSome: ["Romantic", "Rustic"] });
  });

  it("filters by min price", () => {
    const result = buildWhereClause({ minPrice: 5000 });
    expect(result.baseRentalMin).toEqual({ gte: 5000 });
  });

  it("filters by max price", () => {
    const result = buildWhereClause({ maxPrice: 15000 });
    expect(result.baseRentalMax).toEqual({ lte: 15000 });
  });

  it("filters by min guests", () => {
    const result = buildWhereClause({ minGuests: 100 });
    expect(result.maxGuests).toEqual({ gte: 100 });
  });

  it("filters by max guests", () => {
    const result = buildWhereClause({ maxGuests: 200 });
    expect(result.minGuests).toEqual({ lte: 200 });
  });

  it("combines multiple filters", () => {
    const result = buildWhereClause({
      cities: ["Livermore"],
      minPrice: 5000,
      maxPrice: 20000,
      styles: ["Romantic"],
    });
    expect(result.isPublished).toBe(true);
    expect(result.city).toEqual({ in: ["Livermore"] });
    expect(result.baseRentalMin).toEqual({ gte: 5000 });
    expect(result.baseRentalMax).toEqual({ lte: 20000 });
    expect(result.styleTags).toEqual({ hasSome: ["Romantic"] });
  });
});

// ── API route stateSlug filter ─────────────────────────────────────────────
describe("API route stateSlug filter", () => {
  function buildApiWhere(state?: string, cities?: string[]) {
    return {
      isPublished: true,
      ...(state && { stateSlug: state }),
      ...((cities?.length ?? 0) > 0 && { city: { in: cities } }),
    };
  }

  it("includes stateSlug when state is provided", () => {
    const result = buildApiWhere("california", []);
    expect(result.stateSlug).toBe("california");
  });

  it("no stateSlug when state is not provided", () => {
    const result = buildApiWhere(undefined);
    expect((result as any).stateSlug).toBeUndefined();
  });

  it("scopes city filter within state context", () => {
    const result = buildApiWhere("california", ["Napa", "Sonoma"]);
    expect(result.stateSlug).toBe("california");
    expect(result.city).toEqual({ in: ["Napa", "Sonoma"] });
  });
});

// ── VenueList Load More param building ────────────────────────────────────
describe("VenueList loadMore params", () => {
  function buildLoadMoreParams(
    stateSlug: string | undefined,
    searchParams: Record<string, string | string[]>,
    offset: number
  ) {
    const params = new URLSearchParams();
    if (stateSlug) params.set("state", stateSlug);
    Object.entries(searchParams).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((val) => params.append(k, val));
      else if (v) params.set(k, v);
    });
    params.set("offset", offset.toString());
    params.delete("page");
    return params;
  }

  it("includes state param when stateSlug provided", () => {
    const p = buildLoadMoreParams("california", {}, 24);
    expect(p.get("state")).toBe("california");
  });

  it("omits state param when stateSlug is undefined", () => {
    const p = buildLoadMoreParams(undefined, {}, 24);
    expect(p.get("state")).toBeNull();
  });

  it("includes region params from searchParams", () => {
    const p = buildLoadMoreParams("california", { region: "Napa Valley" }, 24);
    expect(p.get("region")).toBe("Napa Valley");
  });

  it("includes multiple regions", () => {
    const p = buildLoadMoreParams("california", { region: ["Napa Valley", "Sonoma County"] }, 24);
    expect(p.getAll("region")).toEqual(["Napa Valley", "Sonoma County"]);
  });

  it("does not include page param", () => {
    const p = buildLoadMoreParams("california", { page: "2" }, 24);
    expect(p.get("page")).toBeNull();
  });

  it("sets correct offset", () => {
    const p = buildLoadMoreParams("california", {}, 48);
    expect(p.get("offset")).toBe("48");
  });

  it("passes through sort param", () => {
    const p = buildLoadMoreParams("california", { sort: "price_asc" }, 24);
    expect(p.get("sort")).toBe("price_asc");
  });

  it("passes through type filter", () => {
    const p = buildLoadMoreParams("california", { type: "Vineyard & Winery" }, 24);
    expect(p.get("type")).toBe("Vineyard & Winery");
  });
});