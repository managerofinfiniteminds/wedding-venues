import { describe, it, expect } from "vitest";

// Test the toArray helper function
function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

describe("toArray", () => {
  it("returns empty array for undefined", () => {
    expect(toArray(undefined)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(toArray("")).toEqual([]);
  });

  it("wraps a single string in array", () => {
    expect(toArray("Livermore")).toEqual(["Livermore"]);
  });

  it("returns array as-is", () => {
    expect(toArray(["Livermore", "Pleasanton"])).toEqual(["Livermore", "Pleasanton"]);
  });
});

// Test pagination logic
function getPaginationValues(page: string | undefined, total: number, perPage: number) {
  const currentPage = Math.max(1, parseInt(page ?? "1") || 1);
  const totalPages = Math.ceil(total / perPage);
  const skip = (currentPage - 1) * perPage;
  return { currentPage, totalPages, skip, hasPrev: currentPage > 1, hasNext: currentPage < totalPages };
}

describe("getPaginationValues", () => {
  it("defaults to page 1", () => {
    const result = getPaginationValues(undefined, 47, 10);
    expect(result.currentPage).toBe(1);
    expect(result.skip).toBe(0);
  });

  it("calculates correct skip for page 2", () => {
    const result = getPaginationValues("2", 47, 10);
    expect(result.skip).toBe(10);
  });

  it("calculates total pages correctly", () => {
    const result = getPaginationValues("1", 47, 10);
    expect(result.totalPages).toBe(5);
  });

  it("handles exact division", () => {
    const result = getPaginationValues("1", 40, 10);
    expect(result.totalPages).toBe(4);
  });

  it("hasPrev is false on page 1", () => {
    expect(getPaginationValues("1", 47, 10).hasPrev).toBe(false);
  });

  it("hasPrev is true on page 2", () => {
    expect(getPaginationValues("2", 47, 10).hasPrev).toBe(true);
  });

  it("hasNext is false on last page", () => {
    expect(getPaginationValues("5", 47, 10).hasNext).toBe(false);
  });

  it("hasNext is true when not on last page", () => {
    expect(getPaginationValues("1", 47, 10).hasNext).toBe(true);
  });

  it("clamps to page 1 for invalid input", () => {
    expect(getPaginationValues("abc", 47, 10).currentPage).toBe(1);
    expect(getPaginationValues("0", 47, 10).currentPage).toBe(1);
    expect(getPaginationValues("-5", 47, 10).currentPage).toBe(1);
  });
});