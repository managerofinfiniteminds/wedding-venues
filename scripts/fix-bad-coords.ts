/**
 * fix-bad-coords.ts
 * 
 * Sanity-checks geocoded CA venues. Any venue with coordinates outside
 * California's bounding box gets its lat/lng nulled out so it doesn't
 * appear as a phantom pin on the map.
 * 
 * California bounds:
 *   Latitude:  32.5 (south) to 42.0 (north)
 *   Longitude: -124.5 (west) to -114.1 (east)
 * 
 * Run after geocode-venues.ts completes:
 *   DATABASE_URL="..." npx tsx scripts/fix-bad-coords.ts
 */

import { config } from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CA_BOUNDS = {
  latMin: 32.5,
  latMax: 42.0,
  lngMin: -124.5,
  lngMax: -114.1,
};

async function fixBadCoords() {
  // Find venues with coordinates outside CA bounds
  const { rows: bad } = await pool.query(`
    SELECT id, name, city, latitude, longitude
    FROM "Venue"
    WHERE "isPublished" = true
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND (
        latitude  < $1 OR latitude  > $2 OR
        longitude < $3 OR longitude > $4
      )
    ORDER BY name
  `, [CA_BOUNDS.latMin, CA_BOUNDS.latMax, CA_BOUNDS.lngMin, CA_BOUNDS.lngMax]);

  if (bad.length === 0) {
    console.log("✅ All geocoded venues are within California bounds. Nothing to fix.");
    await pool.end();
    return;
  }

  console.log(`⚠️  Found ${bad.length} venues with bad coordinates:\n`);
  bad.forEach((v) => {
    console.log(`  ✗ ${v.name} (${v.city}) — lat: ${v.latitude}, lng: ${v.longitude}`);
  });

  // Null out bad coordinates
  const ids = bad.map((v) => v.id);
  await pool.query(
    `UPDATE "Venue" SET latitude = NULL, longitude = NULL WHERE id = ANY($1)`,
    [ids]
  );

  console.log(`\n✅ Nulled out ${bad.length} venues with out-of-bounds coordinates.`);
  console.log(`   Re-run geocode-venues.ts to attempt better matches, or fix manually.`);

  await pool.end();
}

fixBadCoords().catch((e) => { console.error(e); process.exit(1); });
