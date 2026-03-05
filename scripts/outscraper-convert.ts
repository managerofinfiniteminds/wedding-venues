import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

type OutscraperRawVenue = {
  name?: string;
  phone?: string | null;
  website?: string | null;
  full_address?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  rating?: number | string | null;
  reviews?: number | string | null;
  photo?: string | null;
  subtypes?: string | null;
  type?: string | null;
  place_id?: string | null;
  google_id?: string | null;
  description?: string | null;
  business_status?: string | null;
};

interface RawVenue {
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

const BAD_PATTERNS = [
  /raceway|racetrack|speedway|motorsport|motocross|mx park|mx track/i,
  /bowling|bowl lanes|strike|spare/i,
  /church|cathedral|chapel of christ|kingdom hall|jehovah|latter.day|assembly of god|baptist|methodist|presbyterian|evangelical|pentecostal|seventh.day|mosque|temple of|synagogue/i,
  /elementary school|middle school|high school|unified school|school district/i,
  /air force base|army base|naval|military|fort ord/i,
  /familysearch/i,
  /haunted|horror|scare|fright/i,
  /go.kart|karting|laser tag|escape room|trampoline|bounce/i,
  /cannabis|dispensary|marijuana|weed/i,
  /auto|car wash|tire|mechanic|dealership/i,
  /storage|warehouse|self.storage/i,
  /funeral|mortuary|cremation/i,
  /hospital|urgent care|medical center|clinic|pharmacy/i,
  /airport|airpark|fly.in/i,
  /covid|vaccine location/i,
  /golf simulator|simulator/i,
  /driving range/i,
  /skate|skateboard/i,
  /paintball|airsoft/i,
  /gun range|shooting range|firearms/i,
  /rv park|campground|camping|trailer park/i,
  /swap meet|flea market/i,
  /laundromat|laundry/i,
  /dollar tree|dollar general|walmart|target|costco|walgreens|cvs/i,
  /urgent care|emergency room|dialysis|rehab center/i,
  /halfway house|transitional|sober living/i,
  /dog park|animal shelter|kennel/i,
  /junkyard|salvage|auto parts/i,
  /prison|correctional|detention/i,
  /community center(?!.*event|.*wedding|.*banquet)/i,
  /recreation center(?!.*event|.*wedding)/i,
  /senior center|adult day/i,
  /food bank|soup kitchen/i,
  /post office|dmv|social security/i,
  /courthouse(?!.*garden)/i,
  /fire station|police station/i,
  /library(?!.*event)/i,
];

function parseStateSlugArg(): string {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--state-slug");
  const stateSlug = idx >= 0 ? args[idx + 1] : undefined;

  if (!stateSlug) {
    throw new Error('Usage: npx tsx scripts/outscraper-convert.ts --state-slug "new-york"');
  }

  return stateSlug;
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function shouldKeepName(name: string): boolean {
  return !BAD_PATTERNS.some((pattern) => pattern.test(name));
}

function main() {
  const stateSlug = parseStateSlugArg();
  const inPath = path.join(__dirname, `venues-${stateSlug}-raw.json`);
  const outPath = path.join(__dirname, `venues-${stateSlug}-converted.json`);

  if (!fs.existsSync(inPath)) {
    throw new Error(`Input not found: ${inPath}`);
  }

  const input = JSON.parse(fs.readFileSync(inPath, "utf8")) as OutscraperRawVenue[];

  const converted: RawVenue[] = [];
  let removed = 0;

  for (const row of input) {
    const placeId = (row.place_id ?? "").trim();
    const name = (row.name ?? "").trim();

    if (!placeId || !name) {
      removed++;
      continue;
    }

    if (!shouldKeepName(name)) {
      removed++;
      continue;
    }

    const types = (row.subtypes ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    converted.push({
      placeId,
      name,
      formattedAddress: row.full_address ?? "",
      street: row.street ?? "",
      city: row.city ?? "",
      state: row.state ?? "",
      zip: row.postal_code ?? "",
      lat: toNullableNumber(row.latitude),
      lng: toNullableNumber(row.longitude),
      phone: row.phone ?? null,
      website: row.website ?? null,
      googleRating: toNullableNumber(row.rating),
      googleReviews: toNullableNumber(row.reviews),
      photoNames: [],
      primaryPhotoUrl: row.photo ?? null,
      types,
      primaryType: row.type ?? null,
      description: row.description ?? null,
      openingHours: null,
      priceLevel: null,
      googleMapsUrl: null,
      businessStatus: row.business_status ?? null,
    });
  }

  fs.writeFileSync(outPath, JSON.stringify(converted, null, 2), "utf8");

  console.log(`Total in: ${input.length}`);
  console.log(`Kept: ${converted.length}`);
  console.log(`Removed: ${removed}`);
  console.log(`Saved: ${path.relative(process.cwd(), outPath)}`);
}

main();
