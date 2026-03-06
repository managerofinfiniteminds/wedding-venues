#!/usr/bin/env npx tsx@latest
/**
 * Web Enrich — for venues missing description/website, search Google,
 * pull real data, update DB, and publish if confirmed wedding venue.
 *
 * Uses Grok :online via OpenRouter for live web search + extraction.
 * Writes a full change log for reversibility.
 *
 * Usage:
 *   npx tsx@latest scripts/audit/web-enrich.ts --cities livermore,dublin,pleasanton
 *   npx tsx@latest scripts/audit/web-enrich.ts --cities livermore,dublin,pleasanton --dry-run
 */
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY required");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const citiesArg = args[args.indexOf("--cities") + 1];
const targetCities = citiesArg
  ? citiesArg.split(",").map((c) => c.trim().replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()))
  : [];

// ── LLM web search + extract ──────────────────────────────────────────────
async function searchAndExtract(venue: {
  name: string;
  city: string;
  state: string;
  venueType: string;
  website?: string | null;
}): Promise<{
  isWeddingVenue: boolean;
  confidence: "high" | "medium" | "low";
  description: string | null;
  website: string | null;
  phone: string | null;
  maxGuests: number | null;
  startingPrice: number | null;
  venueType: string | null;
  styleTags: string[];
  hasBridalSuite: boolean;
  hasOutdoorSpace: boolean;
  hasIndoorSpace: boolean;
  onSiteCoordinator: boolean;
  reasoning: string;
} | null> {
  const prompt = `You are a research assistant for Green Bowtie, a wedding venue directory.

Search the web RIGHT NOW for: "${venue.name}" wedding venue ${venue.city} ${venue.state}

I need you to:
1. Find their actual website
2. Determine if they host WEDDINGS (not just events)
3. Extract all available details

Return ONLY this JSON (no markdown, no explanation):
{
  "isWeddingVenue": true|false,
  "confidence": "high"|"medium"|"low",
  "description": "2-3 sentence wedding-focused description of the venue, or null if not a wedding venue",
  "website": "their actual website URL, or null",
  "phone": "phone number or null",
  "maxGuests": integer or null,
  "startingPrice": integer (site fee USD) or null,
  "venueType": "most accurate type from: Vineyard & Winery, Barn / Ranch, Ballroom, Hotel & Resort, Golf Club, Garden, Historic Estate, Museum & Gallery, Event Venue, Resort, Outdoor / Park" or null,
  "styleTags": ["array of applicable: Rustic, Romantic, Modern, Industrial, Garden, Elegant, Intimate, Grand, Outdoor, Indoor, Historic, Waterfront, Mountain, Wine Country, Country Club"],
  "hasBridalSuite": true|false,
  "hasOutdoorSpace": true|false,
  "hasIndoorSpace": true|false,
  "onSiteCoordinator": true|false,
  "reasoning": "one sentence on why this is or isn't a wedding venue"
}`;

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://greenbowtie.com",
      "X-Title": "Green Bowtie Web Enrich",
    },
    body: JSON.stringify({
      model: "x-ai/grok-3-mini:online",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenRouter ${resp.status}: ${err.slice(0, 200)}`);
  }

  const data = await resp.json();
  const raw = data.choices?.[0]?.message?.content ?? "";

  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error(`  ⚠️  JSON parse failed for ${venue.name}:`, cleaned.slice(0, 100));
    return null;
  }
}

// ── Venues to skip (confirmed non-wedding, already handled) ───────────────
const SKIP_NAMES = new Set([
  "Pirates of Emerson Haunted Themed Park",
  "K1 Speed Dublin",
  "Sky Zone Trampoline Park",
  "Club Moto Motocross Track",
  "Pump It Up Pleasanton Kids Birthdays and More",
  "Stampede Bar & Grill",
  "Inklings Coffee and Tea",
  "Tri-Valley Quarter Midget Association", // racing association
  "Dublin Technology Center Workspaces",    // coworking
]);

interface EnrichLogEntry {
  id: string;
  name: string;
  city: string;
  action: "enriched_and_published" | "enriched_kept_unpublished" | "confirmed_not_wedding" | "skipped_already_good" | "error";
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  reverseSql: string;
  reasoning: string;
  timestamp: string;
}

async function main() {
  const ts = new Date().toISOString();
  const log: EnrichLogEntry[] = [];

  console.log(`\n🌐 Green Bowtie — Web Enrich`);
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  if (targetCities.length) console.log(`   Cities: ${targetCities.join(", ")}`);
  console.log("");

  const where: Prisma.VenueWhereInput = {
    stateSlug: "california",
    ...(targetCities.length ? { city: { in: targetCities } } : {}),
    OR: [
      { description: null },
      { description: "" },
      { description: { lt: "a" } }, // empty string variants
    ],
  };

  const venues = await prisma.venue.findMany({
    where,
    orderBy: [{ city: "asc" }, { name: "asc" }],
  });

  const toProcess = venues.filter(v => !SKIP_NAMES.has(v.name));
  console.log(`📋 ${toProcess.length} venues need enrichment (${venues.length - toProcess.length} skipped)\n`);

  // COUNT before
  const beforeCount = await prisma.venue.count({
    where: targetCities.length ? { city: { in: targetCities }, stateSlug: "california" } : {}
  });
  const beforePublished = await prisma.venue.count({
    where: {
      ...(targetCities.length ? { city: { in: targetCities }, stateSlug: "california" } : {}),
      isPublished: true,
    }
  });
  console.log(`📊 BEFORE: ${beforeCount} total, ${beforePublished} published\n`);

  let enriched = 0, published = 0, notWedding = 0, errors = 0;

  for (const venue of toProcess) {
    process.stdout.write(`  [${toProcess.indexOf(venue) + 1}/${toProcess.length}] ${venue.name.slice(0, 50).padEnd(50)} `);

    try {
      const result = await searchAndExtract({
        name: venue.name,
        city: venue.city,
        state: venue.state,
        venueType: venue.venueType,
        website: venue.website,
      });

      if (!result) {
        console.log(`⚠️  parse error`);
        errors++;
        log.push({ id: venue.id, name: venue.name, city: venue.city, action: "error", before: {}, after: {}, reverseSql: "", reasoning: "JSON parse failed", timestamp: ts });
        continue;
      }

      const before = {
        isPublished: venue.isPublished,
        description: venue.description,
        website: venue.website,
        venueType: venue.venueType,
        phone: venue.phone,
        maxGuests: venue.maxGuests,
        baseRentalMin: venue.baseRentalMin,
        styleTags: venue.styleTags,
        hasBridalSuite: venue.hasBridalSuite,
        hasOutdoorSpace: venue.hasOutdoorSpace,
        hasIndoorSpace: venue.hasIndoorSpace,
        onSiteCoordinator: venue.onSiteCoordinator,
      };

      if (!result.isWeddingVenue && result.confidence !== "low") {
        console.log(`🚫 not wedding (${result.confidence}) — ${result.reasoning.slice(0, 60)}`);
        notWedding++;

        if (!dryRun) {
          await prisma.venue.update({
            where: { id: venue.id },
            data: {
              isPublished: false,
              auditStatus: "flagged",
              lastAuditedAt: new Date(),
              auditFlags: [
                ...(Array.isArray(venue.auditFlags) ? venue.auditFlags as object[] : []),
                { type: "web_search_not_wedding", severity: "critical", field: "name", detail: result.reasoning, autoFixed: true, fixDetail: `Web search confirmed not a wedding venue (${result.confidence} confidence)` }
              ],
            }
          });
        }

        log.push({
          id: venue.id, name: venue.name, city: venue.city,
          action: "confirmed_not_wedding",
          before: { isPublished: venue.isPublished },
          after: { isPublished: false },
          reverseSql: `UPDATE "Venue" SET "isPublished"=${venue.isPublished} WHERE id='${venue.id}'; -- ${venue.name}`,
          reasoning: result.reasoning,
          timestamp: ts,
        });
        continue;
      }

      // Build update payload — only set fields we actually got data for
      const updateData: Prisma.VenueUpdateInput = {
        lastAuditedAt: new Date(),
        auditStatus: "clean",
      };

      if (result.description && result.description.length > 20) {
        updateData.description = result.description;
      }
      if (result.website && !venue.website) {
        updateData.website = result.website;
      }
      if (result.phone && !venue.phone) {
        updateData.phone = result.phone;
      }
      if (result.maxGuests && !venue.maxGuests) {
        updateData.maxGuests = result.maxGuests;
      }
      if (result.startingPrice && !venue.baseRentalMin) {
        updateData.baseRentalMin = result.startingPrice;
      }
      if (result.venueType && result.venueType !== venue.venueType && result.confidence === "high") {
        updateData.venueType = result.venueType;
      }
      if (result.styleTags?.length > 0 && venue.styleTags.length === 0) {
        updateData.styleTags = result.styleTags;
      }
      if (result.hasBridalSuite) updateData.hasBridalSuite = true;
      if (result.hasOutdoorSpace) updateData.hasOutdoorSpace = true;
      if (result.hasIndoorSpace) updateData.hasIndoorSpace = true;
      if (result.onSiteCoordinator) updateData.onSiteCoordinator = true;

      // Publish if: confirmed wedding venue + high/medium confidence + has description
      const shouldPublish = result.isWeddingVenue && result.confidence !== "low" && result.description;
      if (shouldPublish) {
        updateData.isPublished = true;
      }

      console.log(`${shouldPublish ? "✅ enriched+published" : "📝 enriched"} (${result.confidence}) — ${result.reasoning.slice(0, 55)}`);

      if (!dryRun) {
        await prisma.venue.update({ where: { id: venue.id }, data: updateData });
      }

      enriched++;
      if (shouldPublish) published++;

      log.push({
        id: venue.id, name: venue.name, city: venue.city,
        action: shouldPublish ? "enriched_and_published" : "enriched_kept_unpublished",
        before,
        after: { ...updateData, isPublished: shouldPublish },
        reverseSql: [
          `UPDATE "Venue" SET "isPublished"=${before.isPublished}, "description"=${before.description ? `'${String(before.description).replace(/'/g, "''")}'` : "NULL"}, "website"=${before.website ? `'${before.website}'` : "NULL"} WHERE id='${venue.id}'; -- ${venue.name}`,
        ].join("\n"),
        reasoning: result.reasoning,
        timestamp: ts,
      });

    } catch (err) {
      console.log(`❌ error: ${String(err).slice(0, 60)}`);
      errors++;
      log.push({ id: venue.id, name: venue.name, city: venue.city, action: "error", before: {}, after: {}, reverseSql: "", reasoning: String(err).slice(0, 100), timestamp: ts });
    }

    // Small delay to be kind to the API
    await new Promise(r => setTimeout(r, 1000));
  }

  // COUNT after
  const afterCount = await prisma.venue.count({
    where: targetCities.length ? { city: { in: targetCities }, stateSlug: "california" } : {}
  });
  const afterPublished = await prisma.venue.count({
    where: {
      ...(targetCities.length ? { city: { in: targetCities }, stateSlug: "california" } : {}),
      isPublished: true,
    }
  });

  console.log(`\n${"─".repeat(60)}`);
  console.log(`📊 AFTER:  ${afterCount} total, ${afterPublished} published`);
  if (afterCount !== beforeCount) {
    console.error(`🚨 SAFETY ALERT: Count changed ${beforeCount} → ${afterCount}!`);
    process.exit(1);
  }
  console.log(`✅ Count verified: ${beforeCount} → ${afterCount} (no records deleted)`);
  console.log(`\n📝 Enriched:  ${enriched} venues`);
  console.log(`🟢 Published: ${published} newly published`);
  console.log(`🚫 Not wedding: ${notWedding} confirmed non-wedding`);
  console.log(`❌ Errors:    ${errors}`);
  console.log(`${"─".repeat(60)}\n`);

  // Write log
  const logPath = path.resolve(__dirname, "web-enrich-log.json");
  fs.writeFileSync(logPath, JSON.stringify({ runAt: ts, summary: { beforeCount, beforePublished, afterCount, afterPublished, enriched, published, notWedding, errors }, log }, null, 2));
  console.log(`📋 Log: ${logPath}`);

  if (dryRun) console.log("\n⚠️  DRY RUN — no DB changes written");

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error("🚨", err);
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});
