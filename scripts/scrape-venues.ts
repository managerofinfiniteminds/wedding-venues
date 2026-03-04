/**
 * scrape-venues.ts
 * Uses Google Places API (New) to find wedding venues across California.
 * Outputs: scripts/venues-raw.json
 *
 * Run: npx tsx scripts/scrape-venues.ts
 */

import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) throw new Error("GOOGLE_PLACES_API_KEY not set");

// California regions to search — each will run multiple queries
const SEARCH_AREAS = [
  // Tri-Valley (our home turf)
  { label: "Livermore CA", query: "wedding venue Livermore California" },
  { label: "Pleasanton CA", query: "wedding venue Pleasanton California" },
  { label: "Dublin CA", query: "wedding venue Dublin California" },
  { label: "San Ramon CA", query: "wedding venue San Ramon California" },
  { label: "Danville CA", query: "wedding venue Danville California" },
  // Bay Area
  { label: "San Francisco CA", query: "wedding venue San Francisco California" },
  { label: "San Jose CA", query: "wedding venue San Jose California" },
  { label: "Oakland CA", query: "wedding venue Oakland California" },
  { label: "Napa CA", query: "wedding venue Napa California" },
  { label: "Sonoma CA", query: "wedding venue Sonoma California" },
  { label: "Santa Cruz CA", query: "wedding venue Santa Cruz California" },
  { label: "Half Moon Bay CA", query: "wedding venue Half Moon Bay California" },
  // Wine Country
  { label: "Healdsburg CA", query: "wedding venue Healdsburg California" },
  { label: "St Helena CA", query: "wedding venue St Helena Napa Valley California" },
  // Los Angeles
  { label: "Los Angeles CA", query: "wedding venue Los Angeles California" },
  { label: "Malibu CA", query: "wedding venue Malibu California" },
  { label: "Pasadena CA", query: "wedding venue Pasadena California" },
  { label: "Santa Monica CA", query: "wedding venue Santa Monica California" },
  // San Diego
  { label: "San Diego CA", query: "wedding venue San Diego California" },
  { label: "La Jolla CA", query: "wedding venue La Jolla California" },
  // Central Coast
  { label: "Santa Barbara CA", query: "wedding venue Santa Barbara California" },
  { label: "San Luis Obispo CA", query: "wedding venue San Luis Obispo California" },
  // Desert
  { label: "Palm Springs CA", query: "wedding venue Palm Springs California" },
  // Sacramento
  { label: "Sacramento CA", query: "wedding venue Sacramento California" },
  { label: "Folsom CA", query: "wedding venue Folsom California" },
];

interface PlaceResult {
  id: string;
  name: string;
  formattedAddress: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  photos?: Array<{ name: string }>;
  types?: string[];
  editorialSummary?: { text: string };
  regularOpeningHours?: { weekdayDescriptions: string[] };
  priceLevel?: string;
}

interface ScrapedVenue {
  placeId: string;
  name: string;
  formattedAddress: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  website: string | null;
  googleRating: number | null;
  googleReviews: number | null;
  photoReference: string | null;
  types: string[];
  description: string | null;
  searchArea: string;
}

function parseCity(address: string): { city: string; state: string; zip: string } {
  // "123 Main St, Livermore, CA 94550, USA"
  const parts = address.split(",").map((s) => s.trim());
  const city = parts[1] ?? "";
  const stateZip = parts[2] ?? "";
  const [state, zip] = stateZip.trim().split(" ");
  return { city, state: state ?? "CA", zip: zip ?? "" };
}

async function searchPlaces(query: string, pageToken?: string): Promise<{ places: PlaceResult[]; nextPageToken?: string }> {
  const url = "https://places.googleapis.com/v1/places:searchText";
  const body: Record<string, unknown> = {
    textQuery: query,
    locationBias: {
      rectangle: {
        low: { latitude: 32.5, longitude: -124.5 },
        high: { latitude: 42.0, longitude: -114.1 },
      },
    },
    maxResultCount: 20,
    languageCode: "en",
  };
  if (pageToken) body.pageToken = pageToken;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY!,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.photos,places.types,places.editorialSummary,nextPageToken",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Places API error ${res.status}: ${err}`);
  }

  const data = await res.json() as { places?: PlaceResult[]; nextPageToken?: string };
  return { places: data.places ?? [], nextPageToken: data.nextPageToken };
}

function isWeddingVenue(place: PlaceResult): boolean {
  const venueTypes = ["event_venue", "banquet_hall", "wedding_venue", "resort", "hotel", "winery", "park", "garden"];
  const hasVenueType = place.types?.some((t) => venueTypes.includes(t)) ?? false;
  const nameHints = /venue|estate|winery|vineyard|barn|ranch|manor|hall|gardens?|resort|inn|club|mansion/i;
  const hasNameHint = nameHints.test(place.name ?? "");
  return hasVenueType || hasNameHint;
}

async function main() {
  const allVenues: ScrapedVenue[] = [];
  const seenIds = new Set<string>();

  for (const area of SEARCH_AREAS) {
    console.log(`\n🔍 Searching: ${area.label}...`);
    try {
      const { places } = await searchPlaces(area.query);
      let added = 0;

      for (const place of places) {
        if (seenIds.has(place.id)) continue;
        if (!isWeddingVenue(place)) continue;

        seenIds.add(place.id);
        const { city, state, zip } = parseCity(place.formattedAddress ?? "");

        // Only keep California
        if (state !== "CA") continue;

        const venue: ScrapedVenue = {
          placeId: place.id,
          name: place.name ?? (place as unknown as { displayName?: { text?: string } }).displayName?.text ?? "",
          formattedAddress: place.formattedAddress ?? "",
          city,
          state,
          zip,
          phone: place.nationalPhoneNumber ?? null,
          website: place.websiteUri ?? null,
          googleRating: place.rating ?? null,
          googleReviews: place.userRatingCount ?? null,
          photoReference: place.photos?.[0]?.name ?? null,
          types: place.types ?? [],
          description: place.editorialSummary?.text ?? null,
          searchArea: area.label,
        };

        allVenues.push(venue);
        added++;
      }

      console.log(`  ✓ Added ${added} new venues (${allVenues.length} total)`);

      // Rate limit — 10 req/sec allowed, be conservative
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`  ✗ Error for ${area.label}:`, err);
    }
  }

  const outPath = path.join(__dirname, "venues-raw.json");
  fs.writeFileSync(outPath, JSON.stringify(allVenues, null, 2));
  console.log(`\n✅ Done! ${allVenues.length} venues written to ${outPath}`);
}

main().catch(console.error);
