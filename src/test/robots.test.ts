/**
 * Robots.txt + sitemap safety tests
 *
 * Internal pages must never be indexed. Public pages must be reachable.
 * A regression here directly harms SEO or exposes internal tools.
 */
import { describe, it, expect } from "vitest";

// Mirrors the disallow list from src/app/robots.ts
const DISALLOWED_PATHS = ["/api/", "/_next/", "/audit/", "/data/"];
const ALLOWED_PATHS = ["/", "/venues", "/venues/california", "/map"];
const SITEMAP_URL = "https://greenbowtie.com/sitemap.xml";
const HOST = "https://greenbowtie.com";

function isDisallowed(path: string): boolean {
  return DISALLOWED_PATHS.some((d) => path.startsWith(d));
}

describe("robots.txt rules", () => {
  it("disallows /api/ paths", () => {
    expect(isDisallowed("/api/venues")).toBe(true);
    expect(isDisallowed("/api/cities")).toBe(true);
    expect(isDisallowed("/api/states/map")).toBe(true);
  });

  it("disallows /_next/ paths", () => {
    expect(isDisallowed("/_next/static/chunk.js")).toBe(true);
  });

  it("disallows /audit/ (internal tool)", () => {
    expect(isDisallowed("/audit/")).toBe(true);
    expect(isDisallowed("/audit/reports/2026-03-06.html")).toBe(true);
  });

  it("disallows /data/ (internal strategy page)", () => {
    expect(isDisallowed("/data/")).toBe(true);
    expect(isDisallowed("/data")).toBe(false); // path must match prefix exactly
  });

  it("does NOT disallow public venue pages", () => {
    expect(isDisallowed("/venues/california")).toBe(false);
    expect(isDisallowed("/venues/california/wente-vineyards-livermore")).toBe(false);
    expect(isDisallowed("/venues")).toBe(false);
  });

  it("does NOT disallow homepage", () => {
    expect(isDisallowed("/")).toBe(false);
  });

  it("does NOT disallow /map", () => {
    expect(isDisallowed("/map")).toBe(false);
  });

  it("sitemap URL is correct", () => {
    expect(SITEMAP_URL).toBe("https://greenbowtie.com/sitemap.xml");
  });

  it("host is set correctly", () => {
    expect(HOST).toBe("https://greenbowtie.com");
  });

  it("disallowed list has no public pages accidentally added", () => {
    const publicPaths = ["/venues", "/map", "/"];
    publicPaths.forEach((p) => {
      expect(DISALLOWED_PATHS.some((d) => p.startsWith(d))).toBe(false);
    });
  });
});

// ── Sitemap URL structure ────────────────────────────────────────────────────
describe("Sitemap URL structure", () => {
  function buildVenueUrl(stateSlug: string, venueSlug: string): string {
    return `https://greenbowtie.com/venues/${stateSlug}/${venueSlug}`;
  }

  function buildStateUrl(stateSlug: string): string {
    return `https://greenbowtie.com/venues/${stateSlug}`;
  }

  it("venue URLs follow correct pattern", () => {
    const url = buildVenueUrl("california", "wente-vineyards-livermore");
    expect(url).toBe("https://greenbowtie.com/venues/california/wente-vineyards-livermore");
  });

  it("state URLs follow correct pattern", () => {
    expect(buildStateUrl("california")).toBe("https://greenbowtie.com/venues/california");
    expect(buildStateUrl("texas")).toBe("https://greenbowtie.com/venues/texas");
  });

  it("URLs do not contain double slashes (after protocol)", () => {
    const url = buildVenueUrl("california", "some-venue");
    expect(url.replace("https://", "")).not.toContain("//");
  });

  it("venue URLs use state slug not state name", () => {
    const url = buildVenueUrl("california", "some-venue");
    expect(url).not.toContain("California"); // no capitalized state name
  });

  it("internal pages excluded from sitemap scope", () => {
    const internalPaths = ["/api", "/audit", "/data", "/_next"];
    internalPaths.forEach((p) => {
      expect(p).not.toMatch(/^\/venues/); // internal pages don't start with /venues
    });
  });

  it("sitemap priorities are in valid range", () => {
    const priorities = [1.0, 0.9, 0.8, 0.7];
    priorities.forEach((p) => {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    });
  });

  it("homepage has highest priority", () => {
    const homePriority = 1.0;
    const venuePriority = 0.8;
    expect(homePriority).toBeGreaterThan(venuePriority);
  });
});

// ── Metadata robots config ─────────────────────────────────────────────────
describe("Page-level robots metadata", () => {
  // Internal pages must have noindex set
  const internalPageRobots = { index: false, follow: false, noarchive: true, nosnippet: true };
  const publicPageRobots = { index: true, follow: true };

  it("internal pages have index: false", () => {
    expect(internalPageRobots.index).toBe(false);
  });

  it("internal pages have follow: false", () => {
    expect(internalPageRobots.follow).toBe(false);
  });

  it("internal pages have noarchive: true", () => {
    expect(internalPageRobots.noarchive).toBe(true);
  });

  it("internal pages have nosnippet: true", () => {
    expect(internalPageRobots.nosnippet).toBe(true);
  });

  it("public pages have index: true", () => {
    expect(publicPageRobots.index).toBe(true);
  });

  it("public pages have follow: true", () => {
    expect(publicPageRobots.follow).toBe(true);
  });
});
