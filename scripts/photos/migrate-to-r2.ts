#!/usr/bin/env npx tsx@latest
/**
 * Migrate venue photos to Cloudflare R2
 * ─────────────────────────────────────────────────────────────────
 * Downloads every venue photo and uploads to R2.
 * Replaces the primaryPhotoUrl in the DB with a stable CDN URL.
 *
 * Usage:
 *   npx tsx@latest scripts/photos/migrate-to-r2.ts
 *   npx tsx@latest scripts/photos/migrate-to-r2.ts --dry-run
 *   npx tsx@latest scripts/photos/migrate-to-r2.ts --cities livermore,dublin,pleasanton
 *   npx tsx@latest scripts/photos/migrate-to-r2.ts --force   # re-upload already-migrated photos
 *
 * Requires in .env:
 *   R2_ACCOUNT_ID=        (Cloudflare Account ID)
 *   R2_ACCESS_KEY_ID=     (R2 API token Access Key)
 *   R2_SECRET_ACCESS_KEY= (R2 API token Secret Key)
 *   R2_BUCKET=            (bucket name, e.g. "greenbowtie-photos")
 *   R2_PUBLIC_URL=        (public URL base, e.g. "https://photos.greenbowtie.com")
 *
 * Setup:
 *   1. Go to https://dash.cloudflare.com → R2
 *   2. Create bucket: greenbowtie-photos
 *   3. Settings → Public Access → Allow (or set custom domain)
 *   4. Go to Manage R2 API Tokens → Create Token (Object Read & Write)
 *   5. Copy Account ID, Access Key ID, Secret Access Key to .env
 */

import "dotenv/config";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import path from "path";

// ── Env validation ────────────────────────────────────────────────────────
const REQUIRED = ["DATABASE_URL", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"];
const missing = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`\n❌ Missing env vars: ${missing.join(", ")}`);
  console.error(`\nAdd these to your .env file:`);
  console.error(`  R2_ACCOUNT_ID=your_cloudflare_account_id`);
  console.error(`  R2_ACCESS_KEY_ID=your_r2_access_key`);
  console.error(`  R2_SECRET_ACCESS_KEY=your_r2_secret_key`);
  console.error(`  R2_BUCKET=greenbowtie-photos`);
  console.error(`  R2_PUBLIC_URL=https://photos.greenbowtie.com\n`);
  process.exit(1);
}

// ── CLI ───────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const dryRun  = args.includes("--dry-run");
const force   = args.includes("--force");  // re-upload even if already on R2
const citiesIdx = args.indexOf("--cities");
const citiesArg = citiesIdx !== -1 ? args[citiesIdx + 1] : null;
const targetCities = citiesArg
  ? citiesArg.split(",").map(c => c.trim().replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()))
  : [];

const NEON_URL = process.env.NEON_DATABASE_URL ?? "postgresql://neondb_owner:npg_o3XHSjZF9Pcd@ep-rough-sea-ai8thyl8.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const R2_PUBLIC = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
const R2_BUCKET = process.env.R2_BUCKET!;

// ── R2 client (S3-compatible) ─────────────────────────────────────────────
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// ── DB ────────────────────────────────────────────────────────────────────
// Always use Neon (production) for photo migration
const pool    = new Pool({ connectionString: NEON_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

// ── Helpers ───────────────────────────────────────────────────────────────

// Generate a stable, readable R2 key from venue slug + a hash of the source URL
function r2Key(venueSlug: string, sourceUrl: string, mimeType: string): string {
  const ext  = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
  const hash = crypto.createHash("md5").update(sourceUrl).digest("hex").slice(0, 8);
  return `venues/${venueSlug}/${hash}.${ext}`;
}

// Check if already uploaded to R2
async function existsInR2(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// Download a photo and upload to R2, return the stable public URL
async function mirrorToR2(sourceUrl: string, venueSlug: string): Promise<{
  r2Url: string;
  key: string;
  bytes: number;
  alreadyExisted: boolean;
}> {
  const resp = await fetch(sourceUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GreenBowtie/1.0)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!resp.ok) throw new Error(`Download failed: ${resp.status} ${sourceUrl.slice(0, 80)}`);

  const contentType = resp.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) throw new Error(`Not an image: ${contentType}`);

  const key = r2Key(venueSlug, sourceUrl, contentType);

  // Skip if already uploaded (unless --force)
  if (!force && await existsInR2(key)) {
    return { r2Url: `${R2_PUBLIC}/${key}`, key, bytes: 0, alreadyExisted: true };
  }

  const buf = Buffer.from(await resp.arrayBuffer());

  await r2.send(new PutObjectCommand({
    Bucket:      R2_BUCKET,
    Key:         key,
    Body:        buf,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable", // 1 year cache
    Metadata: {
      "source-url": sourceUrl.slice(0, 512),
      "venue-slug": venueSlug,
    },
  }));

  return { r2Url: `${R2_PUBLIC}/${key}`, key, bytes: buf.length, alreadyExisted: false };
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n📸 R2 Photo Migration  ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}`);
  console.log(`   Bucket: ${R2_BUCKET}  Public: ${R2_PUBLIC}`);
  console.log(`   ${dryRun ? "DRY RUN — no changes" : "LIVE"}  ${force ? " --force (re-upload all)" : ""}\n`);

  const stateIdx = args.indexOf("--state");
  const stateArg = stateIdx !== -1 ? args[stateIdx + 1] : null;

  // Use raw SQL for reliable filtering — Prisma's NOT startsWith is unreliable
  const conditions: string[] = [
    `"isPublished" = true`,
    `"primaryPhotoUrl" IS NOT NULL`,
  ];
  if (!force) conditions.push(`"primaryPhotoUrl" NOT LIKE '${R2_PUBLIC}%'`);
  if (stateArg) conditions.push(`"stateSlug" = '${stateArg}'`);
  if (targetCities.length) {
    const cityList = targetCities.map(c => `'${c.replace(/'/g, "''")}'`).join(",");
    conditions.push(`"city" IN (${cityList})`);
  }

  const sql = `SELECT id, name, slug, "primaryPhotoUrl", city FROM "Venue" WHERE ${conditions.join(" AND ")} ORDER BY city, name`;
  const totalCheck = await prisma.$queryRawUnsafe<[{count: bigint}]>(`SELECT COUNT(*) FROM "Venue" WHERE "isPublished"=true`);
  console.log(`   DB total published venues: ${totalCheck[0].count}`);
  console.log(`   Full SQL: ${sql}\n`);

  const rawVenues = await prisma.$queryRawUnsafe<Array<{
    id: string; name: string; slug: string; primaryPhotoUrl: string; city: string;
  }>>(sql);
  const venues = rawVenues;

  console.log(`Found ${venues.length} venues to migrate\n`);
  if (!venues.length) {
    console.log("Nothing to do — all photos already on R2. Use --force to re-upload.\n");
    await cleanup(); return;
  }

  let migrated = 0, skipped = 0, failed = 0, totalBytes = 0;
  const failures: string[] = [];
  const neonUpdates: Array<{ id: string; url: string }> = [];

  for (const v of venues) {
    process.stdout.write(`   ${v.name.slice(0, 48).padEnd(48)} `);
    try {
      if (dryRun) {
        console.log(`— dry run (${v.primaryPhotoUrl!.slice(0, 50)}...)`);
        skipped++;
        continue;
      }

      const result = await mirrorToR2(v.primaryPhotoUrl!, v.slug);

      if (result.alreadyExisted) {
        console.log(`⏭  already in R2`);
        // Still update DB in case it's pointing to old URL
        await prisma.venue.update({ where: { id: v.id }, data: { primaryPhotoUrl: result.r2Url } });
        neonUpdates.push({ id: v.id, url: result.r2Url });
        skipped++;
      } else {
        const kb = (result.bytes / 1024).toFixed(0);
        console.log(`✅ ${kb}kb → ${result.key}`);
        await prisma.venue.update({ where: { id: v.id }, data: { primaryPhotoUrl: result.r2Url } });
        neonUpdates.push({ id: v.id, url: result.r2Url });
        totalBytes += result.bytes;
        migrated++;
      }
    } catch (err) {
      console.log(`❌ ${String(err).slice(0, 70)}`);
      failures.push(`${v.name}: ${String(err).slice(0, 100)}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 300)); // rate limit
  }

  // ── Sync to Neon ─────────────────────────────────────────────────────────
  if (!dryRun && neonUpdates.length) {
    console.log(`\n🔄 Syncing ${neonUpdates.length} URLs to Neon...`);
    const neonPool = new Pool({ connectionString: NEON_URL });
    try {
      for (const { id, url } of neonUpdates) {
        await neonPool.query(
          `UPDATE "Venue" SET "primaryPhotoUrl"=$1, "lastAuditedAt"=NOW() WHERE id=$2`,
          [url, id]
        );
      }
      console.log("  → Done");
    } finally {
      await neonPool.end();
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`
┌──────────────────────────────────────┐
│  Migration Complete                   │
├──────────────────────────────────────┤
│  Uploaded   ${String(migrated).padStart(4)} photos               │
│  Skipped    ${String(skipped).padStart(4)} (already on R2)      │
│  Failed     ${String(failed).padStart(4)}                       │
│  Data       ${((totalBytes / 1024 / 1024)).toFixed(1).padStart(4)} MB                    │
└──────────────────────────────────────┘`);

  if (failures.length) {
    console.log("\n⚠️  Failures:");
    failures.forEach(f => console.log(`   ${f}`));
  }

  if (dryRun) console.log("\n⚠️  DRY RUN — nothing written\n");
  else console.log(`\n✅ All photos now at stable R2 URLs: ${R2_PUBLIC}/venues/...\n`);

  await cleanup();
}

async function cleanup() {
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
}

main().catch(async err => {
  console.error("🚨", err);
  await cleanup();
  process.exit(1);
});
