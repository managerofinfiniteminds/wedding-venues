/**
 * Venue slug + URL safety tests
 *
 * Slugs are used in every venue URL. A broken slug = broken SEO + broken links.
 * These tests verify slug generation rules and URL construction.
 */
import { describe, it, expect } from "vitest";

// Mirrors Prisma slug generation used when venues are seeded/scraped
function toSlug(name: string, city: string): string {
  const base = `${name} ${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")  // remove special chars
    .replace(/\s+/g, "-")           // spaces to dashes
    .replace(/-+/g, "-")            // collapse multiple dashes
    .replace(/^-|-$/g, "");         // trim leading/trailing dashes
  return base;
}

describe("Venue slug generation", () => {
  it("lowercases the slug", () => {
    expect(toSlug("Wente Vineyards", "Livermore")).toBe("wente-vineyards-livermore");
  });

  it("replaces spaces with dashes", () => {
    expect(toSlug("The Club at Ruby Hill", "Pleasanton")).toBe("the-club-at-ruby-hill-pleasanton");
  });

  it("removes special characters", () => {
    const slug = toSlug("Garré Vineyard & Event Center", "Livermore");
    // é is stripped (not transliterated) — slug starts with garr-
    expect(slug).toMatch(/^garr-vineyard/);
    expect(slug).not.toContain("&");
    expect(slug).not.toContain("é");
    expect(slug).not.toContain("à");
  });

  it("removes apostrophes", () => {
    expect(toSlug("Murrieta's Well", "Livermore")).not.toContain("'");
  });

  it("collapses multiple dashes", () => {
    const slug = toSlug("Venue  Name", "City"); // double space
    expect(slug).not.toContain("--");
  });

  it("does not start or end with a dash", () => {
    const slug = toSlug("Venue Name", "City");
    expect(slug).not.toMatch(/^-|-$/);
  });

  it("includes city in slug for uniqueness", () => {
    const slug1 = toSlug("The Clubhouse", "Livermore");
    const slug2 = toSlug("The Clubhouse", "Dublin");
    expect(slug1).not.toBe(slug2);
    expect(slug1).toContain("livermore");
    expect(slug2).toContain("dublin");
  });

  it("handles numeric characters", () => {
    expect(toSlug("K1 Speed", "Dublin")).toContain("k1");
  });

  it("handles all-numeric venue names", () => {
    const slug = toSlug("99 Bottles", "San Jose");
    expect(slug).toBeTruthy();
    expect(slug.length).toBeGreaterThan(0);
  });
});

// ── Venue URL construction ─────────────────────────────────────────────────
describe("Venue URL construction", () => {
  function venueUrl(stateSlug: string, slug: string): string {
    return `/venues/${stateSlug}/${slug}`;
  }

  it("builds correct URL structure", () => {
    expect(venueUrl("california", "wente-vineyards-livermore"))
      .toBe("/venues/california/wente-vineyards-livermore");
  });

  it("never has double slashes", () => {
    const url = venueUrl("california", "wente-vineyards-livermore");
    expect(url).not.toContain("//");
  });

  it("always starts with /venues/", () => {
    expect(venueUrl("california", "any-slug")).toMatch(/^\/venues\//);
  });

  it("state slug comes before venue slug", () => {
    const url = venueUrl("california", "some-venue-livermore");
    const parts = url.split("/");
    expect(parts[2]).toBe("california");
    expect(parts[3]).toBe("some-venue-livermore");
  });
});

// ── Photo URL safety ────────────────────────────────────────────────────────
describe("Photo URL validation", () => {
  function isValidPhotoUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  it("accepts https URLs", () => {
    expect(isValidPhotoUrl("https://example.com/photo.jpg")).toBe(true);
  });

  it("accepts http URLs", () => {
    expect(isValidPhotoUrl("http://example.com/photo.jpg")).toBe(true);
  });

  it("rejects null", () => {
    expect(isValidPhotoUrl(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidPhotoUrl(undefined)).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidPhotoUrl("")).toBe(false);
  });

  it("rejects relative paths", () => {
    expect(isValidPhotoUrl("/images/photo.jpg")).toBe(false);
  });

  it("accepts R2 CDN URLs", () => {
    expect(isValidPhotoUrl("https://pub-368e73bce8ae44c7b984173913a6fb7e.r2.dev/venues/wente-vineyards-livermore/abc123.jpg")).toBe(true);
  });

  it("accepts Google Places URLs", () => {
    expect(isValidPhotoUrl("https://places.googleapis.com/v1/places/ChIJ/photos/ATCDNf/media?maxWidthPx=800&key=AIza")).toBe(true);
  });

  it("accepts venue website URLs", () => {
    expect(isValidPhotoUrl("https://wentevineyards.com/wp-content/uploads/2022/01/photo.jpg")).toBe(true);
  });

  it("rejects data URIs", () => {
    expect(isValidPhotoUrl("data:image/jpeg;base64,/9j/4AAQ")).toBe(false);
  });
});

// ── Venue address formatting ───────────────────────────────────────────────
describe("Venue address formatting", () => {
  function formatAddress(venue: {
    street?: string | null;
    city: string;
    state: string;
    zip?: string | null;
  }): string {
    return [venue.street, venue.city, venue.state, venue.zip]
      .filter(Boolean)
      .join(", ");
  }

  it("formats full address", () => {
    expect(formatAddress({ street: "5050 Arroyo Rd", city: "Livermore", state: "CA", zip: "94550" }))
      .toBe("5050 Arroyo Rd, Livermore, CA, 94550");
  });

  it("handles missing street", () => {
    expect(formatAddress({ city: "Livermore", state: "CA" }))
      .toBe("Livermore, CA");
  });

  it("handles missing zip", () => {
    expect(formatAddress({ street: "5050 Arroyo Rd", city: "Livermore", state: "CA" }))
      .toBe("5050 Arroyo Rd, Livermore, CA");
  });

  it("handles null street and zip", () => {
    expect(formatAddress({ street: null, city: "Livermore", state: "CA", zip: null }))
      .toBe("Livermore, CA");
  });

  it("city and state are always present", () => {
    const addr = formatAddress({ city: "Livermore", state: "CA" });
    expect(addr).toContain("Livermore");
    expect(addr).toContain("CA");
  });
});

// ── Description quality check ──────────────────────────────────────────────
describe("Description quality", () => {
  const MIN_LENGTH = 150;

  function isGoodDescription(desc: string | null | undefined): boolean {
    if (!desc) return false;
    if (desc.length < MIN_LENGTH) return false;
    // Junk patterns
    if (/skip to content/i.test(desc)) return false;
    if (/instagram\.com/i.test(desc)) return false;
    if (/&#\d+;/.test(desc)) return false;
    if (/&[a-z]+;/i.test(desc)) return false;
    return true;
  }

  it("rejects null description", () => expect(isGoodDescription(null)).toBe(false));
  it("rejects undefined", () => expect(isGoodDescription(undefined)).toBe(false));
  it("rejects short description", () => expect(isGoodDescription("Nice venue.")).toBe(false));
  it("rejects description with nav text", () => {
    expect(isGoodDescription("Skip to content. Beautiful venue " + "x".repeat(200))).toBe(false);
  });
  it("rejects description with instagram handle", () => {
    expect(isGoodDescription("Follow us @instagram.com/venue " + "x".repeat(200))).toBe(false);
  });
  it("rejects HTML entities", () => {
    expect(isGoodDescription("Great venue&#8230; " + "x".repeat(200))).toBe(false);
    expect(isGoodDescription("Great &amp; beautiful " + "x".repeat(200))).toBe(false);
  });
  it("accepts a good description", () => {
    expect(isGoodDescription(
      "Wente Vineyards is California's oldest continuously operated family winery. " +
      "The Vineyard Lawn accommodates up to 600 guests for open-air ceremonies under the stars. " +
      "Full-service weddings with award-winning catering and dedicated coordination."
    )).toBe(true);
  });
});
