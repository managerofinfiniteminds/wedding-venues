import { Client } from "pg";

const LOCAL_URL = "postgresql://waynekool@localhost:5432/wedding_venues";
const NEON_URL = "postgresql://neondb_owner:npg_o3XHSjZF9Pcd@ep-rough-sea-ai8thyl8.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const local = new Client({ connectionString: LOCAL_URL });
  const neon = new Client({ connectionString: NEON_URL });

  await local.connect();
  await neon.connect();

  console.log("=== Pre-sync Neon count ===");
  const pre = await neon.query('SELECT COUNT(*) as total FROM "Venue"');
  console.log(`Neon total: ${pre.rows[0].total}`);

  console.log("\n=== Fetching enriched Livermore venues from local ===");
  const { rows } = await local.query(`
    SELECT
      slug,
      "baseRentalMin", "baseRentalMax",
      "maxGuests", "minGuests",
      "onSiteCoordinator", "hasBridalSuite", "nearbyLodging",
      "inHouseCateringRequired", "byobPolicy",
      description,
      "styleTags",
      "completenessScore",
      "dataSource",
      "isPublished"
    FROM "Venue"
    WHERE city = 'Livermore'
    AND (
      "baseRentalMin" IS NOT NULL
      OR description IS NOT NULL
      OR "isPublished" = false
    )
    ORDER BY slug
  `);

  console.log(`Found ${rows.length} enriched Livermore venues to sync`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const row of rows) {
    // Check if venue exists in Neon
    const check = await neon.query('SELECT id FROM "Venue" WHERE slug = $1', [row.slug]);
    if (check.rows.length === 0) {
      console.log(`  SKIP (not in Neon): ${row.slug}`);
      notFound++;
      continue;
    }

    // Build update — only set fields that have real values
    const sets: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    const maybeNum = (val: number | null, col: string) => {
      if (val !== null && val !== undefined) {
        sets.push(`"${col}" = $${i++}`);
        params.push(val);
      }
    };

    const maybeBool = (val: boolean | null, col: string, onlyIfTrue = false) => {
      if (val !== null && val !== undefined) {
        if (onlyIfTrue && val === false) return; // don't overwrite true with false
        sets.push(`"${col}" = $${i++}`);
        params.push(val);
      }
    };

    const maybeStr = (val: string | null, col: string) => {
      if (val !== null && val !== undefined && val !== "") {
        sets.push(`"${col}" = $${i++}`);
        params.push(val);
      }
    };

    maybeNum(row.baseRentalMin, "baseRentalMin");
    maybeNum(row.baseRentalMax, "baseRentalMax");
    maybeNum(row.maxGuests, "maxGuests");
    maybeNum(row.minGuests, "minGuests");
    maybeBool(row.onSiteCoordinator, "onSiteCoordinator", true);
    maybeBool(row.hasBridalSuite, "hasBridalSuite", true);
    maybeBool(row.nearbyLodging, "nearbyLodging", true);
    maybeBool(row.inHouseCateringRequired, "inHouseCateringRequired", true);
    maybeStr(row.byobPolicy, "byobPolicy");
    maybeStr(row.description, "description");
    maybeNum(row.completenessScore, "completenessScore");
    maybeStr(row.dataSource, "dataSource");

    // styleTags — array
    if (row.styleTags && row.styleTags.length > 0) {
      sets.push(`"styleTags" = $${i++}`);
      params.push(row.styleTags);
    }

    // isPublished — always sync this (important for McGrail etc.)
    sets.push(`"isPublished" = $${i++}`);
    params.push(row.isPublished);

    if (sets.length === 0) {
      skipped++;
      continue;
    }

    params.push(row.slug);
    const sql = `UPDATE "Venue" SET ${sets.join(", ")} WHERE slug = $${i}`;

    await neon.query(sql, params);
    console.log(`  UPDATED: ${row.slug} (${sets.length} fields)`);
    updated++;
  }

  console.log(`\n=== Sync complete ===`);
  console.log(`Updated: ${updated} | Skipped: ${skipped} | Not in Neon: ${notFound}`);

  console.log("\n=== Post-sync Neon count ===");
  const post = await neon.query('SELECT COUNT(*) as total FROM "Venue"');
  console.log(`Neon total: ${post.rows[0].total} (should be ${pre.rows[0].total})`);

  console.log("\n=== Spot check: Wente in Neon ===");
  const wente = await neon.query(
    'SELECT name, "baseRentalMin", "baseRentalMax", "maxGuests", "isPublished" FROM "Venue" WHERE slug = $1',
    ["wente-vineyards-livermore"]
  );
  console.log(wente.rows[0] ?? "NOT FOUND");

  console.log("\n=== Spot check: McGrail (should be isPublished=false) ===");
  const mcgrail = await neon.query(
    'SELECT name, "isPublished" FROM "Venue" WHERE slug = $1',
    ["mcgrail-vineyards-and-winery-livermore"]
  );
  console.log(mcgrail.rows[0] ?? "NOT FOUND");

  await local.end();
  await neon.end();
}

main().catch(e => { console.error(e); process.exit(1); });
