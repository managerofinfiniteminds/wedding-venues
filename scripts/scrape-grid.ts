/**
 * scrape-grid.ts
 * Geographic grid scan of California using Google Places Nearby Search.
 * Covers every ~8 miles across CA to find venues the text search missed.
 * Merges with existing venues-full.json, deduplicates by placeId.
 * Output: scripts/venues-all.json
 *
 * Run: GOOGLE_PLACES_API_KEY=xxx npx tsx scripts/scrape-grid.ts
 */

import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) throw new Error("GOOGLE_PLACES_API_KEY not set");

// California bounding box
const CA_BOUNDS = {
  minLat: 32.5,  // San Diego south
  maxLat: 41.9,  // Just inside CA border (not 42.0 to avoid Oregon bleed)
  minLng: -124.4, // Pacific coast (not too far offshore)
  maxLng: -114.2, // Nevada/Arizona border
};

// Grid spacing: ~8 miles = ~0.12 degrees
const GRID_STEP = 0.12;
const SEARCH_RADIUS = 8000; // 8km radius per point

// Generate grid points covering California
function generateGrid(): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  for (let lat = CA_BOUNDS.minLat; lat <= CA_BOUNDS.maxLat; lat += GRID_STEP) {
    for (let lng = CA_BOUNDS.minLng; lng <= CA_BOUNDS.maxLng; lng += GRID_STEP) {
      points.push({
        lat: Math.round(lat * 1000) / 1000,
        lng: Math.round(lng * 1000) / 1000,
      });
    }
  }
  return points;
}

interface NearbyPlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  types?: string[];
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
  photos?: Array<{ name: string }>;
  types?: string[];
  primaryType?: string;
  editorialSummary?: { text: string };
  regularOpeningHours?: { weekdayDescriptions: string[] };
  priceLevel?: string;
  addressComponents?: Array<{ longText: string; shortText: string; types: string[] }>;
  googleMapsUri?: string;
  businessStatus?: string;
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

async function nearbySearch(lat: number, lng: number): Promise<NearbyPlace[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY!,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.types",
    },
    body: JSON.stringify({
      includedTypes: ["event_venue", "banquet_hall", "wedding_venue"],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: SEARCH_RADIUS,
        },
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 429) throw new Error("RATE_LIMIT");
    throw new Error(`Nearby search failed ${res.status}: ${err}`);
  }
  const data = await res.json() as { places?: NearbyPlace[] };
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

function parseAddress(components?: PlaceDetails["addressComponents"]): { street: string; city: string; state: string; zip: string } {
  if (!components) return { street: "", city: "", state: "CA", zip: "" };
  const get = (type: string) => components.find((c) => c.types.includes(type))?.longText ?? "";
  return {
    street: [get("street_number"), get("route")].filter(Boolean).join(" "),
    city: get("locality") || get("sublocality") || get("administrative_area_level_2"),
    state: get("administrative_area_level_1"),
    zip: get("postal_code"),
  };
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const outPath = path.join(__dirname, "venues-all.json");
  const existingPath = path.join(__dirname, "venues-full.json");

  // Load existing venues
  let allVenues: VenueRecord[] = [];
  const seenIds = new Set<string>();

  if (fs.existsSync(existingPath)) {
    allVenues = JSON.parse(fs.readFileSync(existingPath, "utf8"));
    allVenues.forEach((v) => seenIds.add(v.placeId));
    console.log(`▶ Loaded ${allVenues.length} existing venues from venues-full.json`);
  }

  // Resume grid progress if interrupted
  let startIndex = 0;
  const progressPath = path.join(__dirname, ".grid-progress.json");
  const newCandidateIds: string[] = [];

  if (fs.existsSync(progressPath)) {
    const progress = JSON.parse(fs.readFileSync(progressPath, "utf8"));
    startIndex = progress.gridIndex ?? 0;
    const savedCandidates: string[] = progress.candidates ?? [];
    savedCandidates.forEach((id) => { if (!seenIds.has(id)) newCandidateIds.push(id); });
    console.log(`▶ Resuming grid from index ${startIndex}, ${newCandidateIds.length} candidates queued`);
  }

  const grid = generateGrid();
  console.log(`\n📍 Grid: ${grid.length} points covering California`);
  console.log(`   Searching from index ${startIndex}...\n`);

  // ── Phase 1: Nearby Search across grid ──
  const candidateIds = new Set<string>([...seenIds, ...newCandidateIds]);

  for (let i = startIndex; i < grid.length; i++) {
    const { lat, lng } = grid[i];
    try {
      const places = await nearbySearch(lat, lng);
      let newCount = 0;
      for (const p of places) {
        if (!p.formattedAddress?.includes(", CA ")) continue;
        if (!candidateIds.has(p.id)) {
          candidateIds.add(p.id);
          if (!seenIds.has(p.id)) {
            newCandidateIds.push(p.id);
            newCount++;
          }
        }
      }

      if (i % 100 === 0) {
        process.stdout.write(`  Grid [${i}/${grid.length}] lat=${lat} lng=${lng} → +${newCount} | ${newCandidateIds.length} new candidates total\n`);
        // Save progress
        fs.writeFileSync(progressPath, JSON.stringify({ gridIndex: i, candidates: newCandidateIds }));
      }

      await sleep(120);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "RATE_LIMIT") {
        console.log("\n  ⚠ Rate limited — waiting 5s...");
        await sleep(5000);
        i--; // retry
      } else {
        // Skip bad point
      }
    }
  }

  console.log(`\n✓ Phase 1 done. ${newCandidateIds.length} new venue IDs to enrich.\n`);

  // ── Phase 2: Get Details ──
  console.log(`🔬 Phase 2: Fetching details for ${newCandidateIds.length} venues...`);
  let enriched = 0;
  let skipped = 0;

  for (let i = 0; i < newCandidateIds.length; i++) {
    const placeId = newCandidateIds[i];
    try {
      const details = await getPlaceDetails(placeId);

      const stateComp = details.addressComponents?.find((c) => c.types.includes("administrative_area_level_1"));
      if (stateComp?.shortText !== "CA") { skipped++; continue; }
      if (details.businessStatus === "CLOSED_PERMANENTLY") { skipped++; continue; }

      const { street, city, state, zip } = parseAddress(details.addressComponents);
      const photoNames = (details.photos ?? []).slice(0, 5).map((p) => p.name);
      const primaryPhotoUrl = photoNames.length > 0 ? getPhotoUrl(photoNames[0]) : null;

      allVenues.push({
        placeId: details.id,
        name: details.displayName?.text ?? "",
        formattedAddress: details.formattedAddress ?? "",
        street, city, state, zip,
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
      });

      seenIds.add(placeId);
      enriched++;

      if (enriched % 100 === 0) {
        fs.writeFileSync(outPath, JSON.stringify(allVenues, null, 2));
        process.stdout.write(`\n  💾 Checkpoint: ${allVenues.length} total venues\n`);
      }

      process.stdout.write(`  [${i + 1}/${newCandidateIds.length}] ✓ ${details.displayName?.text}, ${city} (${allVenues.length} total)\r`);
      await sleep(120);
    } catch {
      await sleep(1000);
    }
  }

  // Final save
  fs.writeFileSync(outPath, JSON.stringify(allVenues, null, 2));

  // Clean up progress file
  if (fs.existsSync(progressPath)) fs.unlinkSync(progressPath);

  console.log(`\n\n✅ Complete!`);
  console.log(`   Total venues: ${allVenues.length}`);
  console.log(`   New from grid: ${enriched}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Output: ${outPath}`);

  const gridCost = (grid.length - startIndex) * 0.032;
  const detailsCost = newCandidateIds.length * 0.017;
  console.log(`\n💰 Estimated additional cost: $${(gridCost + detailsCost).toFixed(2)}`);
}

main().catch(console.error);
