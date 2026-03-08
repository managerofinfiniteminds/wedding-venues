#!/usr/bin/env npx tsx@latest
/**
 * Photo Health Check
 * ──────────────────────────────────────────────────────────────
 * Samples venue photos from Neon and checks they actually load.
 * Reports broken URLs, missing photos, and URL source breakdown.
 *
 * Usage:
 *   npx tsx@latest scripts/health/check-photos.ts           # sample 50 random
 *   npx tsx@latest scripts/health/check-photos.ts --all     # check all (slow)
 *   npx tsx@latest scripts/health/check-photos.ts --state california
 *   npx tsx@latest scripts/health/check-photos.ts --sample 200
 */

import "dotenv/config";
import { Pool } from "pg";

const NEON_URL = process.env.NEON_DATABASE_URL!;
if (!NEON_URL) { console.error("❌ NEON_DATABASE_URL not set"); process.exit(1); }

const args = process.argv.slice(2);
const checkAll = args.includes("--all");
const stateIdx = args.indexOf("--state");
const stateArg = stateIdx !== -1 ? args[stateIdx + 1] : null;
const sampleIdx = args.indexOf("--sample");
const sampleSize = sampleIdx !== -1 ? parseInt(args[sampleIdx + 1]) : 50;

const pool = new Pool({ connectionString: NEON_URL });

async function checkUrl(url: string): Promise<{ ok: boolean; status: number; ms: number }> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "GreenBowtie-HealthCheck/1.0" },
    });
    return { ok: res.ok || res.status === 302, status: res.status, ms: Date.now() - start };
  } catch {
    return { ok: false, status: 0, ms: Date.now() - start };
  }
}

async function main() {
  console.log(`\n📸 Green Bowtie — Photo Health Check`);
  console.log(`   ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}\n`);

  // ── URL source breakdown ──────────────────────────────────────────────────
  const breakdown = await pool.query<{ prefix: string; count: string }>(`
    SELECT
      CASE
        WHEN "primaryPhotoUrl" LIKE '%r2.dev%' THEN 'R2 (stable)'
        WHEN "primaryPhotoUrl" LIKE '%lh3.googleusercontent%' THEN 'Google CDN (keyless)'
        WHEN "primaryPhotoUrl" LIKE '%places.googleapis%' THEN 'Places API (needs key ⚠️)'
        WHEN "primaryPhotoUrl" LIKE '%streetview%' THEN 'Street View'
        WHEN "primaryPhotoUrl" IS NULL THEN 'No photo'
        ELSE 'Other'
      END as prefix,
      COUNT(*)::text as count
    FROM "Venue"
    WHERE "isPublished" = true
    ${stateArg ? `AND "stateSlug" = '${stateArg}'` : ""}
    GROUP BY 1
    ORDER BY count DESC
  `);

  console.log("📊 Photo URL breakdown:");
  let total = 0;
  for (const row of breakdown.rows) {
    const n = parseInt(row.count);
    total += n;
    const bar = "█".repeat(Math.round(n / total * 30));
    console.log(`   ${row.prefix.padEnd(30)} ${row.count.padStart(6)}`);
  }
  console.log();

  // ── Sample & check ────────────────────────────────────────────────────────
  const limitClause = checkAll ? "" : `LIMIT ${sampleSize}`;
  const venues = await pool.query<{ id: string; name: string; slug: string; primaryPhotoUrl: string; stateSlug: string }>(`
    SELECT id, name, slug, "primaryPhotoUrl", "stateSlug"
    FROM "Venue"
    WHERE "isPublished" = true
    AND "primaryPhotoUrl" IS NOT NULL
    ${stateArg ? `AND "stateSlug" = '${stateArg}'` : ""}
    ORDER BY RANDOM()
    ${limitClause}
  `);

  console.log(`🔍 Checking ${venues.rows.length} photos${checkAll ? " (all)" : ` (random sample of ${sampleSize})`}...\n`);

  const broken: Array<{ name: string; slug: string; state: string; url: string; status: number }> = [];
  let ok = 0;

  for (const v of venues.rows) {
    const result = await checkUrl(v.primaryPhotoUrl);
    if (result.ok) {
      ok++;
      process.stdout.write(".");
    } else {
      broken.push({ name: v.name, slug: v.slug, state: v.stateSlug, url: v.primaryPhotoUrl, status: result.status });
      process.stdout.write("✗");
    }
  }

  console.log(`\n\n✅ OK: ${ok}  ❌ Broken: ${broken.length}  (${((broken.length / venues.rows.length) * 100).toFixed(1)}% failure rate)\n`);

  if (broken.length > 0) {
    console.log("❌ Broken photos:");
    for (const b of broken) {
      console.log(`   [${b.status}] ${b.name} — greenbowtie.com/venues/${b.state}/${b.slug}`);
      console.log(`        ${b.url.slice(0, 90)}`);
    }
    console.log();
  }

  // ── Final verdict ─────────────────────────────────────────────────────────
  const placesCount = breakdown.rows.find(r => r.prefix.includes("Places API"))?.count ?? "0";
  if (parseInt(placesCount) > 0) {
    console.log(`⚠️  ${placesCount} venues still using Places API URLs (need Google key to be unrestricted)`);
    console.log(`   Run R2 migration to fix: npx tsx@latest scripts/photos/migrate-to-r2.ts\n`);
  } else {
    console.log(`✅ All photos on stable URLs (R2 or Google CDN) — no API key dependency\n`);
  }

  await pool.end();
  process.exit(broken.length > 0 ? 1 : 0); // exit 1 if broken photos found (useful for CI)
}

main().catch(async err => {
  console.error("🚨", err);
  await pool.end();
  process.exit(1);
});
