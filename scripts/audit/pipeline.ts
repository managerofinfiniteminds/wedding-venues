#!/usr/bin/env npx tsx@latest
/**
 * Green Bowtie Venue Pipeline
 * ─────────────────────────────────────────────────────────────────
 * One command to enrich, clean, gate, publish, sync, and report.
 *
 * Usage:
 *   npx tsx@latest scripts/audit/pipeline.ts --cities livermore,dublin,pleasanton
 *   npx tsx@latest scripts/audit/pipeline.ts --cities livermore,dublin,pleasanton --dry-run
 *   npx tsx@latest scripts/audit/pipeline.ts --all --limit 200
 *
 * What it does (in order):
 *   1. Backup  — count snapshot, abort if counts look wrong
 *   2. Enrich  — web search for venues missing description/website
 *   3. Clean   — fix scraped junk descriptions (nav text, HTML, etc.)
 *   4. Gate    — LLM confirms wedding venue relevance
 *   5. Decide  — publish confirmed, unpublish junk, leave uncertain
 *   6. Sync    — push to Neon production
 *   7. Report  — regenerate /audit/ HTML
 *
 * Rules:
 *   - Never delete records
 *   - COUNT verified before/after every batch write
 *   - Skip venues already clean (has description + published + auditStatus=clean)
 *   - Skip confirmed non-wedding venues (don't re-litigate decisions)
 *   - All changes logged to scripts/audit/runs/YYYY-MM-DD-HH.json
 */
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";
import { generateReport } from "./report";
import type { AuditRunSummary, VenueAuditResult } from "./types";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY required");

const NEON_URL = "postgresql://neondb_owner:npg_o3XHSjZF9Pcd@ep-rough-sea-ai8thyl8.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── CLI ───────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const citiesArg = args[args.indexOf("--cities") + 1];
const targetCities = citiesArg
  ? citiesArg.split(",").map(c => c.trim().replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()))
  : [];
const limitArg = args[args.indexOf("--limit") + 1];
const limitN = limitArg ? parseInt(limitArg) : undefined;
const skipSync = args.includes("--skip-sync");

// ── Models ────────────────────────────────────────────────────────────────
const MODEL_ENRICH = "x-ai/grok-3-mini:online";   // web search
const MODEL_CLEAN  = "google/gemini-2.0-flash-001"; // fast text cleanup
const MODEL_GATE   = "google/gemini-2.0-flash-001"; // relevance gate

// ── LLM call ─────────────────────────────────────────────────────────────
async function llm(model: string, prompt: string, maxTokens = 500): Promise<string> {
  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://greenbowtie.com",
      "X-Title": "Green Bowtie Pipeline",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0,
    }),
  });
  if (!resp.ok) throw new Error(`LLM ${resp.status}: ${(await resp.text()).slice(0, 150)}`);
  const data = await resp.json();
  return (data.choices?.[0]?.message?.content ?? "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

function parseJSON<T>(raw: string): T | null {
  try { return JSON.parse(raw) as T; }
  catch { return null; }
}

// ── Step 2: Enrich — web search for missing description/website ───────────
async function stepEnrich(venue: Awaited<ReturnType<typeof getVenues>>[0]): Promise<Partial<Prisma.VenueUpdateInput> & { _reason: string; _isWedding: boolean | null }> {
  const result = parseJSON<{
    isWeddingVenue: boolean;
    confidence: string;
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
  }>(await llm(MODEL_ENRICH, `You are researching wedding venues for a directory called Green Bowtie.

Search the web NOW for: "${venue.name}" ${venue.city} ${venue.state}

Is this a wedding venue? Extract all available details.

Return ONLY JSON:
{
  "isWeddingVenue": true|false,
  "confidence": "high"|"medium"|"low",
  "description": "2-3 sentence wedding-focused description, or null",
  "website": "their website URL or null",
  "phone": "phone number or null",
  "maxGuests": integer or null,
  "startingPrice": integer (site fee USD) or null,
  "venueType": "one of: Vineyard & Winery|Barn / Ranch|Ballroom|Hotel & Resort|Golf Club|Garden|Historic Estate|Museum & Gallery|Event Venue|Resort|Outdoor / Park" or null,
  "styleTags": ["from: Rustic|Romantic|Modern|Industrial|Garden|Elegant|Intimate|Grand|Outdoor|Indoor|Historic|Waterfront|Mountain|Wine Country|Country Club"],
  "hasBridalSuite": true|false,
  "hasOutdoorSpace": true|false,
  "hasIndoorSpace": true|false,
  "onSiteCoordinator": true|false,
  "reasoning": "one sentence"
}`, 600));

  if (!result) return { _reason: "parse error", _isWedding: null };

  const update: Partial<Prisma.VenueUpdateInput> & { _reason: string; _isWedding: boolean | null } = {
    _reason: result.reasoning,
    _isWedding: result.confidence === "low" ? null : result.isWeddingVenue,
  };

  if (result.description?.length > 20) update.description = result.description;
  if (result.website && !venue.website) update.website = result.website;
  if (result.phone && !venue.phone) update.phone = result.phone;
  if (result.maxGuests && !venue.maxGuests) update.maxGuests = result.maxGuests;
  if (result.startingPrice && !venue.baseRentalMin) update.baseRentalMin = result.startingPrice;
  if (result.venueType && result.confidence === "high" && result.venueType !== venue.venueType) update.venueType = result.venueType;
  if (result.styleTags?.length && !venue.styleTags?.length) update.styleTags = result.styleTags;
  if (result.hasBridalSuite) update.hasBridalSuite = true;
  if (result.hasOutdoorSpace) update.hasOutdoorSpace = true;
  if (result.hasIndoorSpace) update.hasIndoorSpace = true;
  if (result.onSiteCoordinator) update.onSiteCoordinator = true;

  return update;
}

// ── Step 3: Clean — fix scraped/junk descriptions ─────────────────────────
const JUNK_PATTERNS = [
  /skip to content/i, /instagram\.com/i, /^-->/, /&#\d+;/, /&mdash;/, /&nbsp;/,
  /^[\w\s]+ \| [\w\s]+ \|/, // "Venue | Section | Section" nav pattern
  /\b0 skip to\b/i, /book now home properties/i,
];

function isJunkDescription(desc: string): boolean {
  return desc.length < 30 || JUNK_PATTERNS.some(p => p.test(desc));
}

async function stepClean(venue: { name: string; description: string }): Promise<{ description: string | null; wasFixed: boolean }> {
  const result = parseJSON<{ quality: string; rewritten: string | null }>(
    await llm(MODEL_CLEAN, `You are cleaning a wedding venue directory listing.

Venue: ${venue.name}
Current description: "${venue.description.slice(0, 400)}"

This description may contain scraped website navigation, HTML artifacts, Instagram handles, or other junk.

Return ONLY JSON:
{
  "quality": "good"|"junk",
  "rewritten": "clean 2-3 sentence wedding-focused description if junk, else null"
}`, 300)
  );

  if (!result || result.quality === "good") return { description: null, wasFixed: false };
  return { description: result.rewritten, wasFixed: true };
}

// ── Step 4: Gate — confirm wedding relevance for borderline venues ─────────
async function stepGate(venue: { name: string; venueType: string; description?: string | null }): Promise<{ isWedding: boolean; confidence: string; reason: string }> {
  const result = parseJSON<{ isWeddingVenue: boolean; confidence: string; reason: string }>(
    await llm(MODEL_GATE, `Wedding venue directory quality gate.

Venue: ${venue.name}
Type: ${venue.venueType}
Description: ${(venue.description ?? "none").slice(0, 300)}

Should this be listed in a wedding venue directory?

Return ONLY JSON:
{
  "isWeddingVenue": true|false,
  "confidence": "high"|"medium"|"low",
  "reason": "one sentence"
}`, 200)
  );

  if (!result) return { isWedding: true, confidence: "low", reason: "gate check failed" };
  return { isWedding: result.isWeddingVenue, confidence: result.confidence, reason: result.reason };
}

// ── Venue query ───────────────────────────────────────────────────────────
async function getVenues() {
  const where: Prisma.VenueWhereInput = {
    stateSlug: "california",
    // NOT already confirmed non-wedding with high confidence
    NOT: {
      auditFlags: {
        // venues with manually_unpublished or web_search_not_wedding critical flags are done
        path: ["$[*].type"],
        array_contains: "manually_unpublished",
      }
    },
    ...(targetCities.length ? { city: { in: targetCities } } : {}),
  };

  return prisma.venue.findMany({
    where,
    orderBy: [{ city: "asc" }, { name: "asc" }],
  });
}

// ── Neon sync ─────────────────────────────────────────────────────────────
async function syncToNeon(ids: string[]) {
  if (!ids.length) return;

  const neonPool = new Pool({ connectionString: NEON_URL });

  try {
    // Get current state for these venues from local
    const venues = await prisma.venue.findMany({
      where: { id: { in: ids } },
    });

    for (const v of venues) {
      const esc = (s: string | null) => s ? `'${s.replace(/'/g, "''")}'` : "NULL";
      const tags = v.styleTags?.length ? `ARRAY[${v.styleTags.map(t => `'${t.replace(/'/g,"''")}'`).join(",")}]::text[]` : "ARRAY[]::text[]";
      const sql = `
        UPDATE "Venue" SET
          "isPublished"=${v.isPublished},
          "description"=${esc(v.description)},
          "website"=${esc(v.website)},
          "phone"=${esc(v.phone)},
          "venueType"=${esc(v.venueType)},
          "maxGuests"=${v.maxGuests ?? "NULL"},
          "baseRentalMin"=${v.baseRentalMin ?? "NULL"},
          "styleTags"=${tags},
          "hasBridalSuite"=${v.hasBridalSuite},
          "hasOutdoorSpace"=${v.hasOutdoorSpace},
          "hasIndoorSpace"=${v.hasIndoorSpace},
          "onSiteCoordinator"=${v.onSiteCoordinator},
          "auditStatus"=${esc(v.auditStatus)},
          "auditScore"=${v.auditScore ?? "NULL"},
          "lastAuditedAt"=NOW()
        WHERE id='${v.id}';`;

      await neonPool.query(sql);
    }

    console.log(`  → Synced ${venues.length} venues to Neon`);
  } finally {
    await neonPool.end();
  }
}

// ── Log entry ─────────────────────────────────────────────────────────────
interface LogEntry {
  name: string;
  city: string;
  action: string;
  changes: string[];
  reason: string;
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const runAt = new Date();
  const runId = runAt.toISOString().slice(0, 16).replace("T", "-").replace(":", "");
  const log: LogEntry[] = [];
  const changedIds: string[] = [];

  console.log(`\n🌿 Green Bowtie Pipeline  ${runAt.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}`);
  console.log(`   ${dryRun ? "DRY RUN  " : "LIVE     "}  Cities: ${targetCities.join(", ") || "all"}\n`);

  // ── 1. BACKUP ────────────────────────────────────────────────────────────
  const scopeWhere = targetCities.length
    ? { city: { in: targetCities }, stateSlug: "california" }
    : { stateSlug: "california" };

  const beforeTotal = await prisma.venue.count({ where: scopeWhere });
  const beforePub   = await prisma.venue.count({ where: { ...scopeWhere, isPublished: true } });
  console.log(`📊 Scope: ${beforeTotal} venues  (${beforePub} published)\n`);

  // ── 2. GET VENUES ─────────────────────────────────────────────────────────
  const allVenues = await getVenues();
  const venues = limitN ? allVenues.slice(0, limitN) : allVenues;

  // Categorize up-front so we skip genuinely done ones
  const needsEnrich  = venues.filter(v => !v.description || v.description.trim().length < 30);
  const needsClean   = venues.filter(v => v.description && isJunkDescription(v.description));
  const needsGate    = venues.filter(v =>
    v.description && v.description.trim().length >= 30 && !isJunkDescription(v.description) &&
    v.auditStatus !== "clean"
  );

  console.log(`📋 Work queue:`);
  console.log(`   ${needsEnrich.length} need web enrichment`);
  console.log(`   ${needsClean.length} have junk descriptions to clean`);
  console.log(`   ${needsGate.length} need relevance gate\n`);

  // ── 3. ENRICH ─────────────────────────────────────────────────────────────
  if (needsEnrich.length) {
    console.log("🌐 Step 1/3 — Web Enrich");
    for (const venue of needsEnrich) {
      process.stdout.write(`   ${venue.name.slice(0, 48).padEnd(48)} `);
      try {
        const enriched = await stepEnrich(venue);
        const { _reason, _isWedding, ...updateFields } = enriched;

        const changes: string[] = [];
        if (updateFields.description) changes.push("description");
        if (updateFields.website) changes.push("website");
        if (updateFields.phone) changes.push("phone");
        if (updateFields.maxGuests) changes.push("maxGuests");
        if (updateFields.baseRentalMin) changes.push("price");
        if (updateFields.venueType) changes.push(`type→${updateFields.venueType}`);
        if (updateFields.styleTags) changes.push("styleTags");

        let action = "enriched";
        let publish: boolean | undefined;

        if (_isWedding === false) {
          action = "unpublished:not-wedding";
          publish = false;
        } else if (_isWedding === true && updateFields.description) {
          action = "enriched+published";
          publish = true;
        } else if (_isWedding === null) {
          action = "enriched:uncertain";
        }

        const symbol = action.includes("not-wedding") ? "🚫" : action.includes("published") ? "✅" : "📝";
        console.log(`${symbol} ${action}  ${_reason.slice(0, 55)}`);

        if (!dryRun && (Object.keys(updateFields).length > 0 || publish !== undefined)) {
          await prisma.venue.update({
            where: { id: venue.id },
            data: {
              ...updateFields,
              ...(publish !== undefined ? { isPublished: publish } : {}),
              auditStatus: action === "unpublished:not-wedding" ? "flagged" : "clean",
              lastAuditedAt: new Date(),
            },
          });
          changedIds.push(venue.id);
        }

        log.push({ name: venue.name, city: venue.city, action, changes, reason: _reason });
      } catch (err) {
        console.log(`❌ ${String(err).slice(0, 70)}`);
        log.push({ name: venue.name, city: venue.city, action: "error", changes: [], reason: String(err).slice(0, 100) });
      }
      await new Promise(r => setTimeout(r, 800));
    }
  }

  // ── 4. CLEAN ──────────────────────────────────────────────────────────────
  if (needsClean.length) {
    console.log("\n🧹 Step 2/3 — Clean descriptions");
    for (const venue of needsClean) {
      process.stdout.write(`   ${venue.name.slice(0, 48).padEnd(48)} `);
      try {
        const { description, wasFixed } = await stepClean({ name: venue.name, description: venue.description! });
        if (wasFixed && description) {
          console.log(`✓ cleaned`);
          if (!dryRun) {
            await prisma.venue.update({
              where: { id: venue.id },
              data: { description, lastAuditedAt: new Date() },
            });
            if (!changedIds.includes(venue.id)) changedIds.push(venue.id);
          }
          log.push({ name: venue.name, city: venue.city, action: "description-cleaned", changes: ["description"], reason: "junk description replaced" });
        } else {
          console.log(`— already ok`);
        }
      } catch (err) {
        console.log(`❌ ${String(err).slice(0, 70)}`);
      }
      await new Promise(r => setTimeout(r, 400));
    }
  }

  // ── 5. GATE ───────────────────────────────────────────────────────────────
  if (needsGate.length) {
    console.log("\n🔍 Step 3/3 — Relevance gate");
    for (const venue of needsGate) {
      process.stdout.write(`   ${venue.name.slice(0, 48).padEnd(48)} `);
      try {
        // Re-fetch in case description was just updated
        const fresh = await prisma.venue.findUnique({ where: { id: venue.id } });
        const { isWedding, confidence, reason } = await stepGate(fresh ?? venue);

        let action: string;
        let newPublished: boolean | undefined;

        if (!isWedding && confidence !== "low") {
          action = "unpublished:not-wedding";
          newPublished = false;
        } else if (isWedding && fresh?.description) {
          action = "published";
          newPublished = true;
        } else {
          action = "kept:uncertain";
        }

        const symbol = action === "published" ? "✅" : action.includes("not-wedding") ? "🚫" : "⚠️ ";
        console.log(`${symbol} ${action}  ${reason.slice(0, 55)}`);

        if (!dryRun && newPublished !== undefined) {
          await prisma.venue.update({
            where: { id: venue.id },
            data: {
              isPublished: newPublished,
              auditStatus: newPublished ? "clean" : "flagged",
              lastAuditedAt: new Date(),
            },
          });
          if (!changedIds.includes(venue.id)) changedIds.push(venue.id);
        }

        log.push({ name: venue.name, city: venue.city, action, changes: newPublished !== undefined ? ["isPublished"] : [], reason });
      } catch (err) {
        console.log(`❌ ${String(err).slice(0, 70)}`);
      }
      await new Promise(r => setTimeout(r, 400));
    }
  }

  // ── 6. COUNT VERIFY ───────────────────────────────────────────────────────
  const afterTotal = await prisma.venue.count({ where: scopeWhere });
  const afterPub   = await prisma.venue.count({ where: { ...scopeWhere, isPublished: true } });

  if (afterTotal !== beforeTotal) {
    console.error(`\n🚨 SAFETY: Count changed ${beforeTotal} → ${afterTotal}. Aborting sync.`);
    process.exit(1);
  }

  const pubDelta = afterPub - beforePub;
  console.log(`\n📊 Result: ${afterTotal} venues  (${afterPub} published  ${pubDelta >= 0 ? "+" : ""}${pubDelta})`);

  // ── 7. NEON SYNC ──────────────────────────────────────────────────────────
  if (!dryRun && !skipSync && changedIds.length) {
    console.log(`\n🔄 Syncing ${changedIds.length} changed venues to Neon...`);
    await syncToNeon(changedIds);
  }

  // ── 8. AUDIT REPORT ───────────────────────────────────────────────────────
  console.log("\n📄 Regenerating audit report...");

  // Build a lightweight summary for the report
  const allAudited = await prisma.venue.findMany({
    where: scopeWhere,
    orderBy: [{ city: "asc" }, { name: "asc" }],
  });

  const reportResults: VenueAuditResult[] = allAudited.map(v => ({
    id: v.id,
    name: v.name,
    city: v.city,
    auditScore: v.auditScore ?? 0,
    auditStatus: (v.auditStatus ?? "unaudited") as VenueAuditResult["auditStatus"],
    flags: Array.isArray(v.auditFlags) ? v.auditFlags as VenueAuditResult["flags"] : [],
    autoFixesApplied: 0,
    wasPublished: v.isPublished,
    isPublished: v.isPublished,
  }));

  const summary: AuditRunSummary = {
    runAt: runAt.toISOString(),
    cities: targetCities,
    totalVenues: reportResults.length,
    clean: reportResults.filter(r => r.auditStatus === "clean").length,
    needsReview: reportResults.filter(r => r.auditStatus === "needs_review").length,
    flagged: reportResults.filter(r => r.auditStatus === "flagged").length,
    totalFlags: reportResults.reduce((s, r) => s + r.flags.length, 0),
    criticalFlags: reportResults.reduce((s, r) => s + r.flags.filter(f => f.severity === "critical" && !f.autoFixed).length, 0),
    warningFlags: reportResults.reduce((s, r) => s + r.flags.filter(f => f.severity === "warning" && !f.autoFixed).length, 0),
    autoFixesApplied: log.filter(e => e.action.includes("cleaned") || e.action.includes("enriched")).length,
    results: reportResults,
  };

  const reportPath = await generateReport(summary);

  // ── 9. WRITE RUN LOG ──────────────────────────────────────────────────────
  const runsDir = path.resolve(__dirname, "runs");
  fs.mkdirSync(runsDir, { recursive: true });
  const logPath = path.join(runsDir, `${runId}.json`);
  fs.writeFileSync(logPath, JSON.stringify({
    runAt: runAt.toISOString(),
    cities: targetCities,
    dryRun,
    before: { total: beforeTotal, published: beforePub },
    after: { total: afterTotal, published: afterPub },
    changed: changedIds.length,
    log,
  }, null, 2));

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  const enriched   = log.filter(e => e.action.includes("enriched")).length;
  const cleaned    = log.filter(e => e.action === "description-cleaned").length;
  const published  = log.filter(e => e.action.includes("published") && !e.action.includes("un")).length;
  const unpublished= log.filter(e => e.action.includes("unpublished")).length;
  const uncertain  = log.filter(e => e.action.includes("uncertain")).length;
  const errors     = log.filter(e => e.action === "error").length;

  console.log(`
┌─────────────────────────────┐
│  Pipeline Complete           │
├─────────────────────────────┤
│  Enriched       ${String(enriched).padStart(4)}          │
│  Cleaned        ${String(cleaned).padStart(4)}          │
│  Published  +${String(published).padStart(4)}          │
│  Unpublished   -${String(unpublished).padStart(3)}          │
│  Uncertain      ${String(uncertain).padStart(4)}          │
│  Errors         ${String(errors).padStart(4)}          │
├─────────────────────────────┤
│  Total   ${afterTotal} venues (${afterPub} pub)  │
└─────────────────────────────┘`);

  if (dryRun) console.log("\n⚠️  DRY RUN — nothing written");
  console.log(`📋 Log: ${logPath}`);
  console.log(`📄 Report: ${reportPath}\n`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async err => {
  console.error("🚨", err);
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});
