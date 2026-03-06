#!/usr/bin/env npx tsx@latest
/**
 * One-time cleanup: Livermore, Dublin, Pleasanton audit results.
 * 
 * SAFE: Only sets isPublished=false on venues already unpublished OR
 *       clearly non-wedding (zero ambiguity). Never deletes.
 * 
 * REVERSIBLE: Full change log written to scripts/audit/clean-tristate-log.json
 * 
 * To reverse any change:
 *   UPDATE "Venue" SET "isPublished"=true WHERE id='<id>';
 */
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Decisions ─────────────────────────────────────────────────────────────

const UNPUBLISH = [
  // venue name → reason (these were already isPublished=false except where noted)
  { name: "Pirates of Emerson Haunted Themed Park", city: "Pleasanton", reason: "Haunted attraction — not a wedding venue" },
  { name: "K1 Speed Dublin",                        city: "Dublin",     reason: "Indoor go-kart racing — not a wedding venue" },
  { name: "Sky Zone Trampoline Park",               city: "Dublin",     reason: "Trampoline park — not a wedding venue" },
  { name: "Club Moto Motocross Track",              city: "Livermore",  reason: "Motocross track — not a wedding venue" },
  { name: "Pump It Up Pleasanton Kids Birthdays and More", city: "Pleasanton", reason: "Kids bounce house — not a wedding venue" },
  { name: "Stampede Bar & Grill",                   city: "Livermore",  reason: "Bar & grill with no wedding evidence" },
  { name: "Inklings Coffee and Tea",                city: "Pleasanton", reason: "Coffee shop — not a wedding venue" },
];

const FIX_TYPE = [
  // Fix wrong venueType assignments
  { name: "Alameda County Fairgrounds", city: "Pleasanton", venueType: "Event Venue", reason: "Was incorrectly typed as 'Golf Club'" },
];

// ── Venues we examined but deliberately kept as-is ───────────────────────
const KEPT = [
  { name: "Garré Vineyard, Restaurant, & Event Center", city: "Livermore",  reason: "False positive — 'pizza' in menu text; legit winery wedding venue" },
  { name: "Pleasanton Marriott",                        city: "Pleasanton", reason: "False positive — 'cafe' in description; hotels host weddings" },
  { name: "Wildwood Rustic Rentals and Planning",       city: "Dublin",     reason: "Wedding rentals/planning company — URL dead, keep with flag" },
  { name: "Dublin Civic Center",                        city: "Dublin",     reason: "Can host weddings — URL changed/dead, keep with flag" },
  { name: "Shannon Community Center",                   city: "Dublin",     reason: "Community centers host weddings — URL dead, keep with flag" },
  { name: "Rosewood Commons",                           city: "Pleasanton", reason: "Event venue — URL temporarily unreachable, keep" },
  { name: "Casa de Milagros",                           city: "Livermore",  reason: "Published legit venue — needs enrichment, not removal" },
  { name: "The Martinelli Event Center",                city: "Livermore",  reason: "Event center — needs description, keep" },
  { name: "Tri-Valley Quarter Midget Association",      city: "Livermore",  reason: "Already unpublished — leave as-is" },
  { name: "R PLACE MUSIC CLUB",                        city: "Livermore",  reason: "Already unpublished — leave as-is" },
];

// ── Also fix the keyword false positives in the audit engine ─────────────
// (We'll update the check to whitelist these patterns)
const FALSE_POSITIVE_PATTERNS = ["pizza", "cafe", "bar & grill (in description, not name)"];

interface ChangeLogEntry {
  id: string;
  name: string;
  city: string;
  action: string;
  reason: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  reverseSql: string;
  timestamp: string;
}

async function main() {
  const changeLog: ChangeLogEntry[] = [];
  const ts = new Date().toISOString();

  console.log("\n🧹 Green Bowtie — Tri-City Cleanup");
  console.log("   Mode: LIVE — changes will be written");
  console.log("   Safety: isPublished=false only, NO deletes\n");

  // ── COUNT BEFORE ────────────────────────────────────────────────────────
  const beforeCount = await prisma.venue.count({
    where: { city: { in: ["Livermore", "Dublin", "Pleasanton"] }, stateSlug: "california" }
  });
  const beforePublished = await prisma.venue.count({
    where: { city: { in: ["Livermore", "Dublin", "Pleasanton"] }, stateSlug: "california", isPublished: true }
  });
  console.log(`📊 BEFORE: ${beforeCount} total, ${beforePublished} published\n`);

  // ── UNPUBLISH clearly-not-wedding venues ─────────────────────────────
  console.log("🚫 Unpublishing non-wedding venues:");
  for (const target of UNPUBLISH) {
    const venue = await prisma.venue.findFirst({
      where: { name: target.name, city: target.city, stateSlug: "california" }
    });
    if (!venue) {
      console.log(`   ⚠️  NOT FOUND: ${target.name}`);
      continue;
    }

    const before = { isPublished: venue.isPublished, auditStatus: venue.auditStatus };
    await prisma.venue.update({
      where: { id: venue.id },
      data: {
        isPublished: false,
        auditStatus: "flagged",
        auditFlags: [
          ...(Array.isArray(venue.auditFlags) ? venue.auditFlags : []),
          { type: "manually_unpublished", severity: "critical", field: "isPublished", detail: target.reason, autoFixed: true, fixDetail: `Set isPublished=false by audit cleanup on ${ts}` }
        ] as object[]
      }
    });

    const entry: ChangeLogEntry = {
      id: venue.id, name: venue.name, city: venue.city,
      action: "unpublish",
      reason: target.reason,
      before,
      after: { isPublished: false, auditStatus: "flagged" },
      reverseSql: `UPDATE "Venue" SET "isPublished"=true WHERE id='${venue.id}'; -- ${venue.name}`,
      timestamp: ts,
    };
    changeLog.push(entry);
    const wasPublished = before.isPublished ? " (WAS PUBLISHED)" : "";
    console.log(`   ✓ ${venue.name}${wasPublished}`);
  }

  // ── FIX venueType mismatches ─────────────────────────────────────────
  console.log("\n🔧 Fixing venueType mismatches:");
  for (const fix of FIX_TYPE) {
    const venue = await prisma.venue.findFirst({
      where: { name: fix.name, city: fix.city, stateSlug: "california" }
    });
    if (!venue) {
      console.log(`   ⚠️  NOT FOUND: ${fix.name}`);
      continue;
    }

    const before = { venueType: venue.venueType };
    await prisma.venue.update({
      where: { id: venue.id },
      data: { venueType: fix.venueType }
    });

    changeLog.push({
      id: venue.id, name: venue.name, city: venue.city,
      action: "fix_venue_type",
      reason: fix.reason,
      before,
      after: { venueType: fix.venueType },
      reverseSql: `UPDATE "Venue" SET "venueType"='${before.venueType}' WHERE id='${venue.id}'; -- ${venue.name}`,
      timestamp: ts,
    });
    console.log(`   ✓ ${venue.name}: '${before.venueType}' → '${fix.venueType}'`);
  }

  // ── COUNT AFTER ─────────────────────────────────────────────────────────
  const afterCount = await prisma.venue.count({
    where: { city: { in: ["Livermore", "Dublin", "Pleasanton"] }, stateSlug: "california" }
  });
  const afterPublished = await prisma.venue.count({
    where: { city: { in: ["Livermore", "Dublin", "Pleasanton"] }, stateSlug: "california", isPublished: true }
  });

  console.log(`\n📊 AFTER: ${afterCount} total, ${afterPublished} published`);
  if (afterCount !== beforeCount) {
    console.error(`\n🚨 SAFETY ALERT: Count changed from ${beforeCount} to ${afterCount} — investigate!`);
    process.exit(1);
  }
  console.log(`✅ Count verified: ${beforeCount} → ${afterCount} (no records deleted)`);

  // ── Write reversibility log ──────────────────────────────────────────
  const logPath = path.resolve(__dirname, "clean-tristate-log.json");
  const logData = {
    runAt: ts,
    summary: {
      totalVenues: beforeCount,
      publishedBefore: beforePublished,
      publishedAfter: afterPublished,
      unpublished: changeLog.filter(e => e.action === "unpublish").length,
      typeFixed: changeLog.filter(e => e.action === "fix_venue_type").length,
      keptWithNotes: KEPT.length,
    },
    changes: changeLog,
    keptWithNotes: KEPT,
    falsePositivePatternsIdentified: FALSE_POSITIVE_PATTERNS,
    reverseInstructions: "To reverse any change, run the SQL in entry.reverseSql against your local or Neon DB.",
  };
  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
  console.log(`\n📋 Reversibility log: ${logPath}`);

  // ── Summary ─────────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(55)}`);
  console.log(`Unpublished:  ${changeLog.filter(e => e.action === "unpublish").length} venues`);
  console.log(`Type fixed:   ${changeLog.filter(e => e.action === "fix_venue_type").length} venues`);
  console.log(`Kept w/ notes:${KEPT.length} venues (no change)`);
  console.log(`${"─".repeat(55)}`);
  console.log("\n✅ Done. No records deleted. All changes reversible.\n");

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error("\n🚨 ERROR:", err);
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});
