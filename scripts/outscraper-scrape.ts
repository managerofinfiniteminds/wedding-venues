import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

type CliArgs = {
  state: string;
  stateSlug: string;
  dryRun: boolean;
  limit: number;
};

type OutscraperPlace = {
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

type OutscraperAsyncStart = {
  id: string;
  results_location: string;
  status: "Pending" | string;
};

type OutscraperPollResponse = {
  status: "Pending" | "Success" | "Failed" | string;
  data?: OutscraperPlace[][];
  error?: string;
};

const OUTSCRAPER_API_KEY = process.env.OUTSCRAPER_API_KEY;
const BASE_URL = "https://api.app.outscraper.com";
const POLL_MS = 5000;
const RATE_LIMIT_MS = 1000;
const MAX_LIMIT = 200;


const STATE_QUERIES: Record<string, string[]> = {
  "new-york": [
    "wedding venue Manhattan New York",
    "wedding venue Brooklyn New York",
    "wedding venue Queens New York",
    "wedding venue Bronx New York",
    "wedding venue Staten Island New York",
    "wedding venue Hudson Valley New York",
    "barn wedding venue Hudson Valley New York",
    "estate wedding venue Westchester New York",
    "waterfront wedding venue Long Island New York",
    "vineyard wedding venue Long Island New York",
    "wedding venue Hamptons New York",
    "wedding venue Buffalo New York",
    "wedding venue Rochester New York",
    "wedding venue Syracuse New York",
    "wedding venue Albany New York",
    "wedding venue Ithaca New York",
    "wedding venue Finger Lakes New York",
    "winery wedding venue Finger Lakes New York",
    "wedding venue Saratoga Springs New York",
    "wedding venue Catskills New York",
    "mountain wedding venue Adirondacks New York",
    "hotel wedding venue New York State",
    "banquet hall wedding New York",
    "garden wedding venue New York State",
  ],
  florida: [
    "wedding venue Miami Florida",
    "wedding venue Miami Beach Florida",
    "wedding venue Fort Lauderdale Florida",
    "wedding venue Palm Beach Florida",
    "wedding venue Boca Raton Florida",
    "wedding venue Naples Florida",
    "wedding venue Tampa Florida",
    "wedding venue St Petersburg Florida",
    "wedding venue Clearwater Florida",
    "wedding venue Orlando Florida",
    "wedding venue Winter Park Florida",
    "wedding venue Jacksonville Florida",
    "wedding venue Tallahassee Florida",
    "wedding venue Sarasota Florida",
    "wedding venue Fort Myers Florida",
    "beach wedding venue Florida Keys",
    "wedding venue Key West Florida",
    "waterfront wedding venue Florida",
    "garden wedding venue Florida",
    "resort wedding venue Florida",
    "hotel wedding venue Florida",
    "estate wedding venue Florida",
    "barn wedding venue North Florida",
    "banquet hall wedding Florida",
  ],
  texas: [
    "wedding venue Austin Texas",
    "wedding venue Dallas Texas",
    "wedding venue Fort Worth Texas",
    "wedding venue Houston Texas",
    "wedding venue San Antonio Texas",
    "wedding venue Hill Country Texas",
    "ranch wedding venue Hill Country Texas",
    "barn wedding venue Texas",
    "vineyard wedding venue Texas",
    "wedding venue Fredericksburg Texas",
    "wedding venue Waco Texas",
    "wedding venue College Station Texas",
    "wedding venue Corpus Christi Texas",
    "wedding venue Galveston Texas",
    "wedding venue El Paso Texas",
    "wedding venue Lubbock Texas",
    "wedding venue Tyler Texas",
    "wedding venue McKinney Texas",
    "wedding venue Plano Texas",
    "wedding venue Frisco Texas",
    "wedding venue Grapevine Texas",
    "industrial wedding venue Dallas Texas",
    "hotel wedding venue Houston Texas",
    "garden wedding venue Texas",
  ],
  illinois: [
    "wedding venue Chicago Illinois",
    "wedding venue West Loop Chicago",
    "wedding venue Lincoln Park Chicago",
    "wedding venue Evanston Illinois",
    "wedding venue Naperville Illinois",
    "wedding venue Oak Brook Illinois",
    "wedding venue Rockford Illinois",
    "wedding venue Peoria Illinois",
    "wedding venue Springfield Illinois",
    "wedding venue Champaign Illinois",
    "wedding venue Bloomington Illinois",
    "wedding venue Galena Illinois",
    "wedding venue Starved Rock Illinois",
    "barn wedding venue Illinois",
    "estate wedding venue Illinois",
    "garden wedding venue Illinois",
    "vineyard wedding venue Illinois",
    "hotel wedding venue Chicago",
    "loft wedding venue Chicago",
    "industrial wedding venue Chicago",
    "banquet hall wedding Illinois",
    "country club wedding Illinois",
  ],
  georgia: [
    "wedding venue Atlanta Georgia",
    "wedding venue Buckhead Atlanta",
    "wedding venue Midtown Atlanta",
    "wedding venue Alpharetta Georgia",
    "wedding venue Marietta Georgia",
    "wedding venue Roswell Georgia",
    "wedding venue Athens Georgia",
    "wedding venue Savannah Georgia",
    "wedding venue Augusta Georgia",
    "wedding venue Macon Georgia",
    "wedding venue Columbus Georgia",
    "wedding venue Blue Ridge Georgia",
    "mountain wedding venue North Georgia",
    "vineyard wedding venue North Georgia",
    "barn wedding venue Georgia",
    "estate wedding venue Georgia",
    "plantation wedding venue Georgia",
    "garden wedding venue Georgia",
    "hotel wedding venue Atlanta",
    "historic mansion wedding venue Georgia",
    "waterfront wedding venue Savannah Georgia",
    "banquet hall wedding Georgia",
  ],
  colorado: [
    "wedding venue Denver Colorado",
    "wedding venue Boulder Colorado",
    "wedding venue Colorado Springs Colorado",
    "wedding venue Fort Collins Colorado",
    "wedding venue Aspen Colorado",
    "wedding venue Vail Colorado",
    "wedding venue Breckenridge Colorado",
    "mountain wedding venue Colorado",
    "lodge wedding venue Colorado",
    "ranch wedding venue Colorado",
    "barn wedding venue Colorado",
    "wedding venue Estes Park Colorado",
    "wedding venue Beaver Creek Colorado",
    "wedding venue Telluride Colorado",
    "wedding venue Steamboat Springs Colorado",
    "wedding venue Durango Colorado",
    "garden wedding venue Denver",
    "hotel wedding venue Denver Colorado",
    "resort wedding venue Colorado",
    "wedding venue Golden Colorado",
    "wedding venue Castle Rock Colorado",
    "wedding venue Grand Junction Colorado",
  ],
  tennessee: [
    "wedding venue Nashville Tennessee",
    "wedding venue Franklin Tennessee",
    "wedding venue Memphis Tennessee",
    "wedding venue Knoxville Tennessee",
    "wedding venue Chattanooga Tennessee",
    "wedding venue Gatlinburg Tennessee",
    "wedding venue Pigeon Forge Tennessee",
    "smoky mountain wedding venue Tennessee",
    "barn wedding venue Tennessee",
    "estate wedding venue Tennessee",
    "plantation wedding venue Tennessee",
    "garden wedding venue Tennessee",
    "wedding venue Murfreesboro Tennessee",
    "wedding venue Clarksville Tennessee",
    "wedding venue Brentwood Tennessee",
    "wedding venue Johnson City Tennessee",
    "wedding venue Jackson Tennessee",
    "wedding venue Leiper's Fork Tennessee",
    "vineyard wedding venue Tennessee",
    "hotel wedding venue Nashville",
    "historic wedding venue Tennessee",
    "banquet hall wedding Tennessee",
  ],
  "north-carolina": [
    "wedding venue Charlotte North Carolina",
    "wedding venue Raleigh North Carolina",
    "wedding venue Durham North Carolina",
    "wedding venue Chapel Hill North Carolina",
    "wedding venue Asheville North Carolina",
    "mountain wedding venue Asheville North Carolina",
    "wedding venue Wilmington North Carolina",
    "beach wedding venue North Carolina",
    "wedding venue Outer Banks North Carolina",
    "wedding venue Greensboro North Carolina",
    "wedding venue Winston-Salem North Carolina",
    "wedding venue Cary North Carolina",
    "wedding venue High Point North Carolina",
    "wedding venue Boone North Carolina",
    "wedding venue Blowing Rock North Carolina",
    "wedding venue Lake Lure North Carolina",
    "vineyard wedding venue North Carolina",
    "barn wedding venue North Carolina",
    "estate wedding venue North Carolina",
    "garden wedding venue North Carolina",
    "hotel wedding venue Charlotte North Carolina",
    "historic wedding venue North Carolina",
  ],
  washington: [
    "wedding venue Seattle Washington",
    "wedding venue Bellevue Washington",
    "wedding venue Tacoma Washington",
    "wedding venue Spokane Washington",
    "wedding venue Olympia Washington",
    "wedding venue Bellingham Washington",
    "wedding venue Woodinville Washington",
    "winery wedding venue Woodinville Washington",
    "wedding venue Leavenworth Washington",
    "mountain wedding venue Washington",
    "wedding venue Snoqualmie Washington",
    "wedding venue Bainbridge Island Washington",
    "wedding venue San Juan Island Washington",
    "waterfront wedding venue Puget Sound",
    "wedding venue Whidbey Island Washington",
    "wedding venue Yakima Washington",
    "vineyard wedding venue Yakima Valley Washington",
    "barn wedding venue Washington",
    "garden wedding venue Washington",
    "hotel wedding venue Seattle Washington",
    "resort wedding venue Washington state",
    "historic wedding venue Washington state",
  ],
  arizona: [
    "wedding venue Phoenix Arizona",
    "wedding venue Scottsdale Arizona",
    "wedding venue Tempe Arizona",
    "wedding venue Mesa Arizona",
    "wedding venue Chandler Arizona",
    "wedding venue Tucson Arizona",
    "wedding venue Sedona Arizona",
    "red rock wedding venue Sedona Arizona",
    "wedding venue Flagstaff Arizona",
    "wedding venue Prescott Arizona",
    "wedding venue Paradise Valley Arizona",
    "wedding venue Gilbert Arizona",
    "wedding venue Glendale Arizona",
    "wedding venue Peoria Arizona",
    "desert wedding venue Arizona",
    "resort wedding venue Scottsdale Arizona",
    "hotel wedding venue Arizona",
    "garden wedding venue Phoenix Arizona",
    "barn wedding venue Arizona",
    "ranch wedding venue Arizona",
    "luxury wedding venue Arizona",
    "banquet hall wedding Arizona",
  ],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);

  const getValue = (key: string): string | undefined => {
    const idx = args.indexOf(key);
    if (idx === -1) return undefined;
    return args[idx + 1];
  };

  const state = getValue("--state");
  const stateSlug = getValue("--state-slug");
  const dryRun = args.includes("--dry-run");
  const limitRaw = getValue("--limit");
  const parsedLimit = limitRaw ? Number(limitRaw) : 100;
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(MAX_LIMIT, parsedLimit)) : 100;

  if (!state || !stateSlug) {
    throw new Error('Usage: npx tsx scripts/outscraper-scrape.ts --state "New York" --state-slug "new-york" [--dry-run] [--limit 100]');
  }

  return { state, stateSlug, dryRun, limit };
}

function buildFallbackQueries(state: string): string[] {
  return [
    `wedding venue ${state}`,
    `barn wedding venue ${state}`,
    `estate wedding venue ${state}`,
    `garden wedding venue ${state}`,
    `hotel wedding venue ${state}`,
    `resort wedding venue ${state}`,
    `vineyard wedding venue ${state}`,
    `banquet hall wedding ${state}`,
  ];
}

function getQueries(state: string, stateSlug: string): string[] {
  return STATE_QUERIES[stateSlug] ?? buildFallbackQueries(state);
}

function estimateCost(queryCount: number): { estimatedResults: number; billableResults: number; estimatedCost: number } {
  const estimatedResults = queryCount * 50;
  const billableResults = Math.max(0, estimatedResults - 500);
  const estimatedCost = (billableResults / 1000) * 3;
  return { estimatedResults, billableResults, estimatedCost };
}

function pickFields(place: OutscraperPlace): OutscraperPlace {
  return {
    name: place.name,
    phone: place.phone,
    website: place.website,
    full_address: place.full_address,
    street: place.street,
    city: place.city,
    state: place.state,
    postal_code: place.postal_code,
    latitude: place.latitude,
    longitude: place.longitude,
    rating: place.rating,
    reviews: place.reviews,
    photo: place.photo,
    subtypes: place.subtypes,
    type: place.type,
    place_id: place.place_id,
    google_id: place.google_id,
    description: place.description,
    business_status: place.business_status,
  };
}

async function startSearch(query: string, limit: number): Promise<OutscraperAsyncStart> {
  const url = new URL(`${BASE_URL}/maps/search-v3`);
  url.searchParams.set("query", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("language", "en");
  url.searchParams.set("async", "true");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-API-KEY": OUTSCRAPER_API_KEY ?? "",
    },
  });

  if (!res.ok) {
    throw new Error(`Outscraper search failed (${res.status}): ${await res.text()}`);
  }

  return (await res.json()) as OutscraperAsyncStart;
}

async function pollResults(resultsLocation: string): Promise<OutscraperPlace[]> {
  while (true) {
    const res = await fetch(resultsLocation, {
      method: "GET",
      headers: {
        "X-API-KEY": OUTSCRAPER_API_KEY ?? "",
      },
    });

    if (!res.ok) {
      throw new Error(`Outscraper poll failed (${res.status}): ${await res.text()}`);
    }

    const payload = (await res.json()) as OutscraperPollResponse;

    if (payload.status === "Pending") {
      await sleep(POLL_MS);
      continue;
    }

    if (payload.status !== "Success") {
      throw new Error(`Outscraper job failed with status ${payload.status}${payload.error ? `: ${payload.error}` : ""}`);
    }

    const flattened = (payload.data ?? []).flat();
    return flattened.map(pickFields);
  }
}

async function main() {
  const { state, stateSlug, dryRun, limit } = parseArgs();

  const queries = getQueries(state, stateSlug);
  const { estimatedResults, billableResults, estimatedCost } = estimateCost(queries.length);

  console.log(`\nState: ${state} (${stateSlug})`);
  console.log(`Queries: ${queries.length}`);
  console.log(`Per-query limit: ${limit}`);

  if (dryRun) {
    console.log("\nDry run — no API requests will be made.\n");
    queries.forEach((q, i) => console.log(`${i + 1}. ${q}`));
    console.log("\nEstimated volume/cost (assumes ~50 results/query):");
    console.log(`  Estimated results: ${estimatedResults}`);
    console.log(`  Free tier: 500`);
    console.log(`  Billable results: ${billableResults}`);
    console.log(`  Estimated cost: $${estimatedCost.toFixed(2)}\n`);
    return;
  }

  if (!OUTSCRAPER_API_KEY) {
    throw new Error("OUTSCRAPER_API_KEY is not set");
  }

  const byPlaceId = new Map<string, OutscraperPlace>();
  const anonymous: OutscraperPlace[] = [];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const start = await startSearch(query, limit);
    const rows = await pollResults(start.results_location);

    for (const row of rows) {
      const placeId = row.place_id?.trim();
      if (placeId) {
        if (!byPlaceId.has(placeId)) byPlaceId.set(placeId, row);
      } else {
        anonymous.push(row);
      }
    }

    const uniqueTotal = byPlaceId.size + anonymous.length;
    console.log(`[${i + 1}/${queries.length}] ${query}`);
    console.log(`  Results: ${rows.length} | Running unique venues: ${uniqueTotal}`);

    if (i < queries.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  const finalRows = Array.from(byPlaceId.values()).concat(anonymous);
  const outPath = path.join(__dirname, `venues-${stateSlug}-raw.json`);
  fs.writeFileSync(outPath, JSON.stringify(finalRows, null, 2), "utf8");

  console.log(`\nSaved ${finalRows.length} unique venues to ${path.relative(process.cwd(), outPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
