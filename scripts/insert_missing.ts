#!/usr/bin/env npx tsx@latest
/**
 * Insert 39 new CA venues into Neon (venues that exist locally but not in Neon)
 * Generates fresh cuid-style IDs to avoid conflicts
 */
import { Pool } from "pg";
// Simple ID generator (timestamp + random)
function createId(): string {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

const LOCAL_URL = "postgresql://waynekool@localhost:5432/wedding_venues";
const NEON_URL = "postgresql://neondb_owner:npg_o3XHSjZF9Pcd@ep-rough-sea-ai8thyl8.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const MISSING_SLUGS = [
  "annenberg-community-beach-house-santa-monica","black-oak-mountain-vineyards-cool",
  "bridgeport-ranch-barns-terrace-bridgeport","cayucos-creek-barn-cayucos",
  "cielo-estate-winery-shingle-springs","crystal-hermitage-gardens-nevada-city",
  "david-girard-vineyards-placerville","fairview-crystal-springs-ceremony-site-burlingame",
  "farallon-event-center-lynwood","filoli-historic-house-world-class-garden-woodside",
  "gold-hill-gardens-newcastle","greystone-mansion-gardens-the-doheny-estate-beverly-hills",
  "harmony-ridge-lodge-nevada-city","hastings-house-garden-weddings-half-moon-bay",
  "la-celebrations-banquet-halls-los-angeles","miners-foundry-cultural-center-nevada-city",
  "monserate-winery-fallbrook","monte-verde-inn-foresthill","nevada-city-winery-nevada-city",
  "newcastle-wedding-gardens-newcastle","oceano-hotel-spa-half-moon-bay-harbor-half-moon-bay",
  "river-garden-weddings-events-vista","rough-ready-vineyards-rough-and-ready",
  "sacred-oak-vineyard-cherry-valley","saureel-vineyards-placerville",
  "schrammsberg-estate-nevada-city","secret-garden-at-rancho-santa-fe-rancho-santa-fe",
  "smith-farm-weddings-events-susanville","the-barn-at-harrow-cellars-sonoma",
  "the-barn-at-unity-ranch-valley-springs","the-barn-event-center-by-amador-cellars-plymouth",
  "the-garden-weddings-events-escondido","the-hacienda-santa-ana","the-roth-estate-nevada-city",
  "the-vineyards-simi-valley","trentadue-winery-geyserville","twenty-mile-house-graeagle",
  "waterfall-lodge-and-retreat-ben-lomond","wente-vineyards-livermore"
];

const local = new Pool({ connectionString: LOCAL_URL });
const neon = new Pool({ connectionString: NEON_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  // Fetch local venues
  const placeholders = MISSING_SLUGS.map((_, i) => `$${i+1}`).join(",");
  const { rows: venues } = await local.query(
    `SELECT * FROM "Venue" WHERE slug IN (${placeholders})`,
    MISSING_SLUGS
  );

  console.log(`\n🌿 Inserting ${venues.length} new venues into Neon\n`);

  // Get column names from local
  const { rows: cols } = await local.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name='Venue' ORDER BY ordinal_position`
  );
  const columns = cols.map((c: any) => c.column_name);

  let inserted = 0, errors = 0;

  for (const venue of venues) {
    // Generate a fresh ID to avoid conflicts
    venue.id = createId();

    const colList = columns.map((c: string) => `"${c}"`).join(", ");
    const valPlaceholders = columns.map((_: string, i: number) => `$${i+1}`).join(", ");
    const values = columns.map((c: string) => venue[c] ?? null);

    try {
      await neon.query(
        `INSERT INTO "Venue" (${colList}) VALUES (${valPlaceholders})`,
        values
      );
      inserted++;
      console.log(`  ✅ ${venue.name} (${venue.city})`);
    } catch (e: any) {
      console.error(`  ❌ ${venue.name}: ${e.message.slice(0,80)}`);
      errors++;
    }
  }

  const after = await neon.query(`SELECT COUNT(*) FROM "Venue" WHERE "stateSlug"='california'`);
  console.log(`\n┌─────────────────────────────────┐`);
  console.log(`│  Insert Complete                  │`);
  console.log(`├─────────────────────────────────┤`);
  console.log(`│  Inserted  ${String(inserted).padEnd(22)} │`);
  console.log(`│  Errors    ${String(errors).padEnd(22)} │`);
  console.log(`│  CA total  ${String(after.rows[0].count).padEnd(22)} │`);
  console.log(`└─────────────────────────────────┘`);

  await local.end();
  await neon.end();
}

main().catch(e => { console.error(e); process.exit(1); });
