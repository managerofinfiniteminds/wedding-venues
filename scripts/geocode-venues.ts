import { config } from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function geocodeVenues() {
  const { rows: venues } = await pool.query(
    `SELECT id, name, street, city, state FROM "Venue" WHERE "isPublished" = true AND latitude IS NULL ORDER BY id`
  );

  console.log(`Found ${venues.length} venues to geocode. ETA ~${Math.round(venues.length * 1.1 / 60)} min.`);

  let found = 0;
  for (const [i, venue] of venues.entries()) {
    const { id, name, street, city, state } = venue;

    // Attempt 1: street address
    let q = street ? `${street}, ${city}, ${state}` : `${name}, ${city}, CA`;
    let result = await nominatim(q);

    // Attempt 2: name + city fallback
    if (!result && street) {
      await sleep(1100);
      result = await nominatim(`${name}, ${city}, CA`);
    }

    if (result) {
      await pool.query(
        `UPDATE "Venue" SET latitude = $1, longitude = $2 WHERE id = $3`,
        [parseFloat(result.lat), parseFloat(result.lon), id]
      );
      console.log(`[${i + 1}/${venues.length}] ✓ ${name} — ${result.lat}, ${result.lon}`);
      found++;
    } else {
      console.log(`[${i + 1}/${venues.length}] ✗ ${name}`);
    }

    await sleep(1100); // Nominatim rate limit: 1 req/sec
  }

  console.log(`\nDone. ${found}/${venues.length} geocoded.`);
  await pool.end();
}

async function nominatim(query: string): Promise<{ lat: string; lon: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'GreenBowtie/1.0 hello@greenbowtie.com' } });
    const data = await res.json() as any[];
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

geocodeVenues().catch((e) => { console.error(e); process.exit(1); });
