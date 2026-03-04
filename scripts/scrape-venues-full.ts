/**
 * scrape-venues-full.ts
 * Maxed-out Google Places scraper for California wedding venues.
 * Phase 1: Text Search across many queries/cities → collect Place IDs
 * Phase 2: Place Details for each unique venue → full metadata
 * Output: scripts/venues-full.json
 *
 * Run: GOOGLE_PLACES_API_KEY=xxx npx tsx scripts/scrape-venues-full.ts
 */

import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) throw new Error("GOOGLE_PLACES_API_KEY not set");

// ─── Search Queries ────────────────────────────────────────────────────────────
// Broad + specific queries across all major CA wedding markets
const SEARCH_QUERIES: string[] = [
  // Tri-Valley
  "wedding venue Livermore California",
  "wedding venue Pleasanton California",
  "wedding venue Dublin California",
  "wedding venue San Ramon California",
  "wedding venue Danville California",
  "vineyard wedding Livermore California",
  "event venue Tri-Valley California",

  // Bay Area - SF
  "wedding venue San Francisco California",
  "wedding venue San Francisco waterfront",
  "wedding venue Presidio San Francisco",
  "wedding venue Golden Gate Park San Francisco",
  "wedding venue Nob Hill San Francisco",
  "wedding venue SoMa San Francisco",
  "wedding venue Marin County California",
  "wedding venue Sausalito California",
  "wedding venue Mill Valley California",
  "wedding venue Tiburon California",

  // Bay Area - East Bay
  "wedding venue Oakland California",
  "wedding venue Berkeley California",
  "wedding venue Walnut Creek California",
  "wedding venue Lafayette California",
  "wedding venue Orinda California",
  "wedding venue Alamo California",
  "wedding venue Fremont California",
  "wedding venue Hayward California",

  // Bay Area - Peninsula
  "wedding venue Palo Alto California",
  "wedding venue Menlo Park California",
  "wedding venue Woodside California",
  "wedding venue Portola Valley California",
  "wedding venue San Mateo California",
  "wedding venue Burlingame California",
  "wedding venue Hillsborough California",
  "wedding venue Half Moon Bay California",
  "wedding venue Pacifica California",

  // Bay Area - South Bay
  "wedding venue San Jose California",
  "wedding venue Santa Clara California",
  "wedding venue Sunnyvale California",
  "wedding venue Saratoga California",
  "wedding venue Los Gatos California",
  "wedding venue Campbell California",
  "wedding venue Morgan Hill California",
  "wedding venue Gilroy California",

  // Wine Country - Napa
  "wedding venue Napa California",
  "vineyard wedding venue Napa Valley",
  "wedding venue St Helena California",
  "wedding venue Calistoga California",
  "wedding venue Yountville California",
  "wedding venue Rutherford California",
  "winery wedding venue Napa California",

  // Wine Country - Sonoma
  "wedding venue Sonoma California",
  "wedding venue Healdsburg California",
  "wedding venue Santa Rosa California",
  "wedding venue Petaluma California",
  "wedding venue Sebastopol California",
  "wedding venue Windsor California",
  "vineyard wedding Sonoma County California",
  "wedding venue Cloverdale California",

  // Central Coast
  "wedding venue Santa Barbara California",
  "wedding venue Montecito California",
  "wedding venue Solvang California",
  "wedding venue Santa Ynez California",
  "wedding venue San Luis Obispo California",
  "wedding venue Paso Robles California",
  "wedding venue Pismo Beach California",
  "wedding venue Cambria California",
  "wedding venue Carmel California",
  "wedding venue Monterey California",
  "wedding venue Pacific Grove California",
  "wedding venue Big Sur California",
  "wedding venue Santa Cruz California",
  "wedding venue Aptos California",
  "wedding venue Capitola California",

  // Los Angeles
  "wedding venue Los Angeles California",
  "wedding venue Beverly Hills California",
  "wedding venue Bel Air Los Angeles",
  "wedding venue Hollywood California",
  "wedding venue West Hollywood California",
  "wedding venue Culver City California",
  "wedding venue Brentwood Los Angeles",
  "wedding venue Pacific Palisades California",
  "wedding venue Malibu California",
  "wedding venue Santa Monica California",
  "wedding venue Venice Beach California",
  "wedding venue Manhattan Beach California",
  "wedding venue Palos Verdes California",
  "wedding venue Pasadena California",
  "wedding venue San Marino California",
  "wedding venue Arcadia California",
  "wedding venue Monrovia California",
  "wedding venue Glendora California",
  "wedding venue Pomona California",
  "wedding venue Rancho Cucamonga California",
  "wedding venue Long Beach California",
  "wedding venue San Pedro California",
  "barn wedding venue Los Angeles",
  "rooftop wedding venue Los Angeles",
  "garden wedding venue Los Angeles",

  // Orange County
  "wedding venue Orange County California",
  "wedding venue Anaheim California",
  "wedding venue Irvine California",
  "wedding venue Newport Beach California",
  "wedding venue Laguna Beach California",
  "wedding venue Dana Point California",
  "wedding venue San Clemente California",
  "wedding venue Huntington Beach California",
  "wedding venue Fullerton California",

  // San Diego
  "wedding venue San Diego California",
  "wedding venue La Jolla California",
  "wedding venue Del Mar California",
  "wedding venue Rancho Santa Fe California",
  "wedding venue Coronado California",
  "wedding venue Chula Vista California",
  "wedding venue Temecula California",
  "winery wedding venue Temecula California",
  "wedding venue Escondido California",
  "wedding venue Fallbrook California",
  "wedding venue Oceanside California",
  "wedding venue Encinitas California",
  "wedding venue Solana Beach California",
  "wedding venue Carlsbad California",

  // Desert / Inland Empire
  "wedding venue Palm Springs California",
  "wedding venue Palm Desert California",
  "wedding venue Rancho Mirage California",
  "wedding venue La Quinta California",
  "wedding venue Joshua Tree California",
  "wedding venue Yucca Valley California",
  "wedding venue Riverside California",

  // Sacramento / Central Valley
  "wedding venue Sacramento California",
  "wedding venue Folsom California",
  "wedding venue El Dorado Hills California",
  "wedding venue Granite Bay California",
  "wedding venue Roseville California",
  "wedding venue Auburn California",
  "wedding venue Davis California",
  "wedding venue Woodland California",
  "wedding venue Stockton California",
  "wedding venue Modesto California",
  "wedding venue Fresno California",
  "wedding venue Visalia California",

  // Gold Country / Foothills
  "wedding venue Placerville California",
  "wedding venue Jackson California",
  "wedding venue Nevada City California",
  "wedding venue Grass Valley California",
  "vineyard wedding Gold Country California",

  // North Bay / Mendocino
  "wedding venue Ukiah California",
  "wedding venue Boonville California",
  "wedding venue Mendocino California",
  "wedding venue Fort Bragg California",

  // Type-specific statewide
  "vineyard wedding venue California",
  "barn wedding venue Northern California",
  "barn wedding venue Southern California",
  "beach wedding venue California",
  "historic estate wedding venue California",
  "outdoor wedding venue California mountains",
  "hotel wedding venue California coast",
  "museum wedding venue California",
  "rooftop wedding venue California",
  "ranch wedding venue California",
  "resort wedding venue California",
];

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PlaceSearchResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
}

interface PlaceDetails {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  photos?: Array<{ name: string; widthPx: number; heightPx: number }>;
  types?: string[];
  primaryType?: string;
  editorialSummary?: { text: string };
  regularOpeningHours?: { weekdayDescriptions: string[] };
  priceLevel?: string;
  addressComponents?: Array<{ longText: string; shortText: string; types: string[] }>;
  googleMapsUri?: string;
  businessStatus?: string;
  instagram?: string;
}

interface VenueRecord {
  placeId: string;
  name: string;
  formattedAddress: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  googleRating: number | null;
  googleReviews: number | null;
  photoNames: string[];
  primaryPhotoUrl: string | null;
  types: string[];
  primaryType: string | null;
  description: string | null;
  openingHours: string[] | null;
  priceLevel: string | null;
  googleMapsUrl: string | null;
  businessStatus: string | null;
}

// ─── API Helpers ───────────────────────────────────────────────────────────────
async function textSearch(query: string): Promise<PlaceSearchResult[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY!,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 20,
      languageCode: "en",
      locationBias: {
        rectangle: {
          low: { latitude: 32.5, longitude: -124.5 },
          high: { latitude: 42.0, longitude: -114.1 },
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Text search failed ${res.status}: ${await res.text()}`);
  const data = await res.json() as { places?: PlaceSearchResult[] };
  return data.places ?? [];
}

async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const fields = [
    "id", "displayName", "formattedAddress", "location",
    "rating", "userRatingCount", "websiteUri", "nationalPhoneNumber",
    "photos", "types", "primaryType", "editorialSummary",
    "regularOpeningHours", "priceLevel", "addressComponents",
    "googleMapsUri", "businessStatus",
  ].join(",");

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": API_KEY!,
      "X-Goog-FieldMask": fields,
    },
  });
  if (!res.ok) throw new Error(`Details failed ${res.status}: ${await res.text()}`);
  return await res.json() as PlaceDetails;
}

function getPhotoUrl(photoName: string, maxWidth = 800): string {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parseAddress(components: PlaceDetails["addressComponents"]): { street: string; city: string; state: string; zip: string } {
  if (!components) return { street: "", city: "", state: "CA", zip: "" };
  const get = (type: string) => components.find((c) => c.types.includes(type))?.longText ?? "";
  const streetNum = get("street_number");
  const route = get("route");
  return {
    street: [streetNum, route].filter(Boolean).join(" "),
    city: get("locality") || get("sublocality") || get("administrative_area_level_2"),
    state: get("administrative_area_level_1"),
    zip: get("postal_code"),
  };
}

function isWeddingRelevant(place: PlaceSearchResult | PlaceDetails): boolean {
  const name = (place as PlaceDetails).displayName?.text ?? "";
  const types = (place as PlaceDetails).types ?? [];
  const venueTypes = ["event_venue", "banquet_hall", "wedding_venue", "resort", "hotel",
    "winery", "park", "garden", "country_club", "golf_course", "restaurant",
    "tourist_attraction", "lodging", "spa"];
  const namePattern = /venue|estate|winery|vineyard|barn|ranch|manor|hall|garden|resort|inn|club|mansion|lodge|retreat|chateau|villa|hacienda|rancho|casa/i;
  return types.some((t) => venueTypes.includes(t)) || namePattern.test(name);
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const outPath = path.join(__dirname, "venues-full.json");
  
  // Resume from existing if interrupted
  let existingVenues: VenueRecord[] = [];
  const seenIds = new Set<string>();
  if (fs.existsSync(outPath)) {
    existingVenues = JSON.parse(fs.readFileSync(outPath, "utf8"));
    existingVenues.forEach((v) => seenIds.add(v.placeId));
    console.log(`▶ Resuming: ${existingVenues.length} venues already collected`);
  }

  // ── Phase 1: Collect Place IDs ──
  console.log(`\n📍 Phase 1: Text Search (${SEARCH_QUERIES.length} queries)...`);
  const candidateIds = new Set<string>(seenIds);
  const newCandidates: string[] = [];

  for (let i = 0; i < SEARCH_QUERIES.length; i++) {
    const query = SEARCH_QUERIES[i];
    try {
      const places = await textSearch(query);
      let newCount = 0;
      for (const p of places) {
        if (!p.formattedAddress?.includes(", CA ") && !p.formattedAddress?.includes(", California")) continue;
        if (!candidateIds.has(p.id)) {
          candidateIds.add(p.id);
          if (!seenIds.has(p.id)) {
            newCandidates.push(p.id);
            newCount++;
          }
        }
      }
      process.stdout.write(`  [${i + 1}/${SEARCH_QUERIES.length}] "${query.slice(0, 50)}" → +${newCount} new (${newCandidates.length} total new)\r`);
      await sleep(150); // ~6 req/sec, well under 10/sec limit
    } catch (err) {
      console.error(`\n  ✗ Error: ${query}:`, err);
      await sleep(1000);
    }
  }

  console.log(`\n\n✓ Phase 1 done. ${newCandidates.length} new venue IDs to enrich.`);

  // ── Phase 2: Get Details ──
  console.log(`\n🔬 Phase 2: Fetching details for ${newCandidates.length} venues...`);
  const allVenues: VenueRecord[] = [...existingVenues];
  let enriched = 0;
  let skipped = 0;

  for (let i = 0; i < newCandidates.length; i++) {
    const placeId = newCandidates[i];
    try {
      const details = await getPlaceDetails(placeId);

      // Skip if not CA
      const stateComp = details.addressComponents?.find((c) => c.types.includes("administrative_area_level_1"));
      if (stateComp && stateComp.shortText !== "CA") { skipped++; continue; }

      // Skip if not wedding-relevant
      if (!isWeddingRelevant(details)) { skipped++; continue; }

      // Skip permanently closed
      if (details.businessStatus === "CLOSED_PERMANENTLY") { skipped++; continue; }

      const { street, city, state, zip } = parseAddress(details.addressComponents);
      const photoNames = (details.photos ?? []).slice(0, 5).map((p) => p.name);
      const primaryPhotoUrl = photoNames.length > 0 ? getPhotoUrl(photoNames[0]) : null;

      const venue: VenueRecord = {
        placeId: details.id,
        name: details.displayName?.text ?? "",
        formattedAddress: details.formattedAddress ?? "",
        street,
        city,
        state,
        zip,
        lat: details.location?.latitude ?? null,
        lng: details.location?.longitude ?? null,
        phone: details.nationalPhoneNumber ?? null,
        website: details.websiteUri ?? null,
        googleRating: details.rating ?? null,
        googleReviews: details.userRatingCount ?? null,
        photoNames,
        primaryPhotoUrl,
        types: details.types ?? [],
        primaryType: details.primaryType ?? null,
        description: details.editorialSummary?.text ?? null,
        openingHours: details.regularOpeningHours?.weekdayDescriptions ?? null,
        priceLevel: details.priceLevel ?? null,
        googleMapsUrl: details.googleMapsUri ?? null,
        businessStatus: details.businessStatus ?? null,
      };

      allVenues.push(venue);
      enriched++;

      // Save every 50 venues in case of interruption
      if (enriched % 50 === 0) {
        fs.writeFileSync(outPath, JSON.stringify(allVenues, null, 2));
        process.stdout.write(`\n  💾 Saved checkpoint: ${allVenues.length} venues total\n`);
      }

      process.stdout.write(`  [${i + 1}/${newCandidates.length}] ✓ ${venue.name}, ${venue.city} (${allVenues.length} total)\r`);
      await sleep(150);
    } catch (err) {
      console.error(`\n  ✗ Failed ${placeId}:`, err);
      await sleep(1000);
    }
  }

  // Final save
  fs.writeFileSync(outPath, JSON.stringify(allVenues, null, 2));
  console.log(`\n\n✅ Done!`);
  console.log(`   Total venues: ${allVenues.length}`);
  console.log(`   Enriched this run: ${enriched}`);
  console.log(`   Skipped (not CA/not relevant): ${skipped}`);
  console.log(`   Output: ${outPath}`);

  // Cost estimate
  const searchCost = SEARCH_QUERIES.length * 0.032;
  const detailsCost = newCandidates.length * 0.017;
  console.log(`\n💰 Estimated cost: $${(searchCost + detailsCost).toFixed(2)}`);
  console.log(`   Text searches: ${SEARCH_QUERIES.length} × $0.032 = $${searchCost.toFixed(2)}`);
  console.log(`   Place details: ${newCandidates.length} × $0.017 = $${detailsCost.toFixed(2)}`);
}

main().catch(console.error);
