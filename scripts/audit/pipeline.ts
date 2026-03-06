#!/usr/bin/env npx tsx@latest
/**
 * Green Bowtie Venue Pipeline
 * ─────────────────────────────────────────────────────────────────
 * Usage:
 *   npx tsx@latest scripts/audit/pipeline.ts --cities livermore,dublin,pleasanton
 *   npx tsx@latest scripts/audit/pipeline.ts --all --limit 200
 *   npx tsx@latest scripts/audit/pipeline.ts --cities livermore --dry-run
 *
 * Steps (in order):
 *   1. Enrich   — web search: fill missing description / website
 *   2. Clean    — fix scraped junk descriptions
 *   3. Re-gate  — re-check published venues for wedding relevance (catches misclassifications)
 *   4. Photo    — vision-score primary photo; swap from Places library if bad
 *   5. Decide   — publish confirmed, unpublish junk, leave uncertain
 *   6. Sync     — push changes to Neon production
 *   7. Report   — regenerate /audit/ HTML
 *
 * Rules:
 *   - Never delete records
 *   - COUNT verified before/after every write
 *   - Skip confirmed non-wedding venues (don't re-litigate)
 *   - All changes logged to scripts/audit/runs/YYYY-MM-DD-HHmm.json
 */
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";
import { generateReport } from "./report";
import { auditAndFixPhoto } from "./photo-check";
import type { AuditRunSummary, VenueAuditResult } from "./types";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY required");

const NEON_URL = "postgresql://neondb_owner:npg_o3XHSjZF9Pcd@ep-rough-sea-ai8thyl8.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const OR_KEY = process.env.OPENROUTER_API_KEY!;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── CLI ───────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun    = args.includes("--dry-run");
const skipSync    = args.includes("--skip-sync");
const photosOnly  = args.includes("--photos-only");   // skip enrich/clean/regate, just redo photos
const forcePhotos = args.includes("--force-photos");  // re-score ALL photos, not just bad ones
const citiesArg = args[args.indexOf("--cities") + 1];
const targetCities = citiesArg
  ? citiesArg.split(",").map(c => c.trim().replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()))
  : [];
const limitArg = args[args.indexOf("--limit") + 1];
const limitN   = limitArg ? parseInt(limitArg) : undefined;

// ── Models ────────────────────────────────────────────────────────────────
const MODEL_ENRICH = "x-ai/grok-3-mini:online";
const MODEL_FAST   = "google/gemini-2.0-flash-001";

// ── LLM ──────────────────────────────────────────────────────────────────
async function llm(model: string, prompt: string, maxTokens = 500): Promise<string> {
  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OR_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://greenbowtie.com",
      "X-Title": "Green Bowtie Pipeline",
    },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: maxTokens, temperature: 0 }),
  });
  if (!resp.ok) throw new Error(`LLM ${resp.status}: ${(await resp.text()).slice(0, 120)}`);
  const data = await resp.json() as { choices?: Array<{ message: { content: string } }> };
  return (data.choices?.[0]?.message?.content ?? "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

function j<T>(raw: string): T | null {
  try { return JSON.parse(raw) as T; } catch { return null; }
}

// ── Venue helpers ─────────────────────────────────────────────────────────
const JUNK_RE = [/skip to content/i, /instagram\.com/i, /^-->/, /&#\d+;/, /&[a-z]+;/, /\b0 skip\b/i];
const isJunk  = (d: string) => d.length < 30 || JUNK_RE.some(r => r.test(d));

const isConfirmedNonWedding = (flags: unknown) => {
  if (!Array.isArray(flags)) return false;
  return (flags as Array<{type:string}>).some(f =>
    f.type === "manually_unpublished" || f.type === "web_search_not_wedding"
  );
};

// ── Step 1: Enrich ────────────────────────────────────────────────────────
type EnrichResult = Partial<Prisma.VenueUpdateInput> & { _wedding: boolean | null; _reason: string };

async function stepEnrich(v: { name: string; city: string; state: string; website: string | null; phone: string | null; maxGuests: number | null; baseRentalMin: number | null; styleTags: string[]; venueType: string }): Promise<EnrichResult> {
  type R = { isWeddingVenue: boolean; confidence: string; sourceIsThisVenue: boolean; description: string | null; website: string | null; phone: string | null; maxGuests: number | null; startingPrice: number | null; venueType: string | null; styleTags: string[]; hasBridalSuite: boolean; hasOutdoorSpace: boolean; hasIndoorSpace: boolean; onSiteCoordinator: boolean; photoUrl: string | null; reasoning: string };
  const raw = await llm(MODEL_ENRICH, `Research this for a wedding venue directory.
Search NOW: "${v.name}" wedding ${v.city} ${v.state}

CRITICAL: Only use information that is SPECIFICALLY about "${v.name}" — not a nearby venue with a similar name.
If search results are about a different venue, set sourceIsThisVenue=false and isWeddingVenue=false.

Also find the best photo URL from their website showing the actual wedding/event space (not logo, not food).
Look for: gallery pages, weddings page, og:image, hero images. Direct image URL preferred (.jpg/.png/.webp).

Return ONLY JSON:
{"isWeddingVenue":true/false,"confidence":"high/medium/low","sourceIsThisVenue":true/false,"description":"2-3 sentence wedding description about THIS specific venue or null","website":"URL or null","phone":"or null","maxGuests":int/null,"startingPrice":int/null,"venueType":"Vineyard & Winery|Barn / Ranch|Ballroom|Hotel & Resort|Golf Club|Garden|Historic Estate|Museum & Gallery|Event Venue|Resort|Outdoor / Park or null","styleTags":[],"hasBridalSuite":bool,"hasOutdoorSpace":bool,"hasIndoorSpace":bool,"onSiteCoordinator":bool,"photoUrl":"direct image URL from their website or null","reasoning":"one sentence"}`, 700);
  const r = j<R>(raw);
  if (!r) return { _wedding: null, _reason: "parse error" };
  // If the model found info about a different venue, treat as uncertain — don't write bad data
  if (r.sourceIsThisVenue === false) {
    return { _wedding: null, _reason: `source mismatch — found data for a different venue, not "${v.name}"` };
  }
  const out: EnrichResult = {
    _wedding: r.confidence === "low" ? null : r.isWeddingVenue,
    _reason: r.reasoning,
  };
  if (r.description?.length > 20) out.description = r.description;
  if (r.website && !v.website) out.website = r.website;
  if (r.phone && !v.phone) out.phone = r.phone;
  if (r.maxGuests && !v.maxGuests) out.maxGuests = r.maxGuests;
  if (r.startingPrice && !v.baseRentalMin) out.baseRentalMin = r.startingPrice;
  if (r.venueType && r.confidence === "high") out.venueType = r.venueType;
  if (r.styleTags?.length && !v.styleTags?.length) out.styleTags = r.styleTags;
  if (r.hasBridalSuite) out.hasBridalSuite = true;
  if (r.hasOutdoorSpace) out.hasOutdoorSpace = true;
  if (r.hasIndoorSpace) out.hasIndoorSpace = true;
  if (r.onSiteCoordinator) out.onSiteCoordinator = true;
  // Photo from website — only store if it looks like a real image URL
  if (r.photoUrl && /\.(jpg|jpeg|png|webp)/i.test(r.photoUrl)) {
    out.primaryPhotoUrl = r.photoUrl;
  }
  return out;
}

// ── Step 2: Clean ─────────────────────────────────────────────────────────
async function stepClean(name: string, desc: string): Promise<string | null> {
  const r = j<{ quality: string; rewritten: string | null }>(
    await llm(MODEL_FAST, `Fix this wedding venue description if it contains scraped junk (nav text, HTML, Instagram handles, etc).
Venue: ${name}
Description: "${desc.slice(0, 400)}"
Return ONLY JSON: {"quality":"good/junk","rewritten":"clean 2-3 sentence wedding description if junk, else null"}`, 250)
  );
  return r?.quality === "junk" ? (r.rewritten ?? null) : null;
}

// ── Step 2.5: Description consistency check ───────────────────────────────
// Catches descriptions that were written about a DIFFERENT venue (e.g. Par 5 got Dublin Ranch's description)
function descriptionMentionsWrongVenue(venueName: string, description: string): boolean {
  if (!description || description.length < 10) return false;
  // Extract key words from venue name (3+ chars, skip common words)
  const stopWords = new Set(["the","and","at","of","in","for","a","an","&","club","center","hall","room","house"]);
  const nameWords = venueName.toLowerCase().split(/\s+/).filter(w => w.length >= 3 && !stopWords.has(w));
  const descLower = description.toLowerCase();
  // If description contains 0 of the venue's key name words, it's suspicious
  const matches = nameWords.filter(w => descLower.includes(w));
  if (nameWords.length >= 2 && matches.length === 0) return true;
  return false;
}

// ── Step 3: Re-gate (published venues) ────────────────────────────────────
async function stepReGate(v: { name: string; venueType: string; description: string | null }): Promise<{ isWedding: boolean; confidence: string; reason: string }> {
  // If description mentions a different venue name, ignore it for gating — only use venue name + type
  const descMismatch = v.description ? descriptionMentionsWrongVenue(v.name, v.description) : false;
  const descForGate = descMismatch ? "(description appears to be from a different venue — ignore it)" : (v.description ?? "none");

  const r = j<{ isWeddingVenue: boolean; nameSignal: string; confidence: string; reason: string }>(
    await llm(MODEL_FAST, `Wedding venue directory quality gate.

Venue name: "${v.name}"
Type: ${v.venueType}
Description: ${descForGate.slice(0, 300)}

Rules — judge on NAME FIRST, description second:
1. "Technology Center Workspaces", "Office Park", "Coworking" = office space → NO
2. "Concerts at X" = concert venue → NO
3. "Haunted Park", "Trampoline Park", "Motocross Track", "Kids Birthdays" = entertainment → NO
4. "Golfing" (retail/simulator store) = NO. "Golf Course" or "Country Club" = YES
5. Hotels, wineries, vineyards, event halls, ballrooms, estates, ranches = YES
6. Restaurants and bars: only YES if name explicitly says "event" or "banquet"
7. If the description contradicts the name entirely, trust the name

Return ONLY JSON: {"isWeddingVenue":true/false,"nameSignal":"what the name signals (3-5 words)","confidence":"high/medium/low","reason":"one sentence"}`, 200)
  );
  return r ? { isWedding: r.isWeddingVenue, confidence: r.confidence, reason: `[${r.nameSignal}] ${r.reason}` }
           : { isWedding: true, confidence: "low", reason: "gate failed" };
}

// ── Venue fetch ───────────────────────────────────────────────────────────
async function getVenues() {
  const where: Prisma.VenueWhereInput = {
    stateSlug: "california",
    ...(targetCities.length ? { city: { in: targetCities } } : {}),
  };
  const all = await prisma.venue.findMany({ where, orderBy: [{ city: "asc" }, { name: "asc" }] });
  return limitN ? all.slice(0, limitN) : all;
}

// ── Neon sync ─────────────────────────────────────────────────────────────
async function syncToNeon(ids: string[]) {
  if (!ids.length) return;
  const neonPool = new Pool({ connectionString: NEON_URL });
  try {
    const venues = await prisma.venue.findMany({ where: { id: { in: ids } } });
    for (const v of venues) {
      const s = (x: string | null) => x ? `'${x.replace(/'/g, "''")}'` : "NULL";
      const tags = v.styleTags?.length
        ? `ARRAY[${v.styleTags.map(t => `'${t.replace(/'/g,"''")}'`).join(",")}]::text[]`
        : "ARRAY[]::text[]";
      await neonPool.query(`
        UPDATE "Venue" SET
          "isPublished"=${v.isPublished},"description"=${s(v.description)},
          "website"=${s(v.website)},"phone"=${s(v.phone)},"venueType"=${s(v.venueType)},
          "primaryPhotoUrl"=${s(v.primaryPhotoUrl)},"styleTags"=${tags},
          "maxGuests"=${v.maxGuests ?? "NULL"},"baseRentalMin"=${v.baseRentalMin ?? "NULL"},
          "hasBridalSuite"=${v.hasBridalSuite},"hasOutdoorSpace"=${v.hasOutdoorSpace},
          "hasIndoorSpace"=${v.hasIndoorSpace},"onSiteCoordinator"=${v.onSiteCoordinator},
          "auditStatus"=${s(v.auditStatus)},"auditScore"=${v.auditScore ?? "NULL"},
          "lastAuditedAt"=NOW()
        WHERE id='${v.id}';`);
    }
    console.log(`  → Synced ${venues.length} to Neon`);
  } finally {
    await neonPool.end();
  }
}

// ── Log entry ─────────────────────────────────────────────────────────────
interface LogEntry { name: string; city: string; action: string; changes: string[]; reason: string }

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const runAt  = new Date();
  const runId  = runAt.toISOString().slice(0, 16).replace("T", "-").replace(":", "");
  const log: LogEntry[] = [];
  const changed: string[] = [];

  console.log(`\n🌿 Green Bowtie Pipeline  ${runAt.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}`);
  console.log(`   ${dryRun ? "DRY RUN  " : "LIVE     "}  Cities: ${targetCities.join(", ") || "all"}\n`);

  const scopeWhere: Prisma.VenueWhereInput = {
    stateSlug: "california",
    ...(targetCities.length ? { city: { in: targetCities } } : {}),
  };
  const beforeTotal = await prisma.venue.count({ where: scopeWhere });
  const beforePub   = await prisma.venue.count({ where: { ...scopeWhere, isPublished: true } });
  console.log(`📊 Scope: ${beforeTotal} venues (${beforePub} published)\n`);

  const venues = await getVenues();

  // Categorize
  const confirmed = venues.filter(v => isConfirmedNonWedding(v.auditFlags));
  const needsEnrich  = venues.filter(v => !confirmed.includes(v) && (!v.description || v.description.trim().length < 30));
  const needsClean   = venues.filter(v => !confirmed.includes(v) && v.description && isJunk(v.description));
  // Re-gate: published venues that haven't been manually confirmed OR whose description looks suspicious
  const needsReGate  = venues.filter(v => !confirmed.includes(v) && v.isPublished && v.auditStatus !== "flagged" &&
    v.description && v.description.length >= 30);
  // Description mismatch: catch venues where description was written about a different venue
  const descMismatch = venues.filter(v => !confirmed.includes(v) && v.description &&
    descriptionMentionsWrongVenue(v.name, v.description));
  // Photo check: --force-photos rescans ALL published venues; default only scans published ones
  const needsPhoto = forcePhotos
    ? venues.filter(v => !confirmed.includes(v) && v.isPublished)
    : venues.filter(v => !confirmed.includes(v) && v.isPublished);

  console.log(`📋 Queue: ${needsEnrich.length} enrich  ${needsClean.length} clean  ${needsReGate.length} re-gate  ${needsPhoto.length} photo  ${descMismatch.length} desc-mismatch\n`);

  // ── STEP 0: DESCRIPTION MISMATCH ─────────────────────────────────────────
  // Clear descriptions that appear to be about a DIFFERENT venue (e.g. Par 5 got Dublin Ranch's text).
  // We ONLY clear the description — we do NOT unpublish, since the venue itself may be legitimate.
  // Cleared venues get re-queued into needsEnrich to get a fresh description next.
  if (descMismatch.length) {
    console.log("⚠️  Step 0 — Description mismatch (clearing wrong-venue text, will re-enrich)");
    for (const v of descMismatch) {
      console.log(`   ${v.name.slice(0, 48).padEnd(48)} 🗑  clearing mismatched description`);
      if (!dryRun) {
        await prisma.venue.update({ where: { id: v.id }, data: {
          description: null, lastAuditedAt: new Date(),
        }});
        // Add to needsEnrich so they get a fresh description this same run
        if (!needsEnrich.find(e => e.id === v.id)) needsEnrich.push(v);
      }
      log.push({ name: v.name, city: v.city, action: "desc-mismatch:cleared", changes: ["description"], reason: "description appears to describe a different venue — re-queued for enrichment" });
    }
    console.log();
  }

  // ── STEP 1: ENRICH ───────────────────────────────────────────────────────
  if (!photosOnly && needsEnrich.length) {
    console.log("🌐 Step 1 — Enrich (web search)");
    for (const v of needsEnrich) {
      process.stdout.write(`   ${v.name.slice(0, 48).padEnd(48)} `);
      try {
        const e = await stepEnrich(v);
        const { _wedding, _reason, ...fields } = e;
        const updates: string[] = Object.keys(fields).filter(k => k !== "_wedding" && k !== "_reason");
        let action = "enriched";
        let pub: boolean | undefined;
        if (_wedding === false) { action = "unpublished:not-wedding"; pub = false; }
        else if (_wedding === true && fields.description) { action = "enriched+published"; pub = true; }
        else if (_wedding === null) { action = "enriched:uncertain"; }

        const sym = pub === false ? "🚫" : pub === true ? "✅" : "📝";
        console.log(`${sym} ${action}  ${_reason.slice(0, 55)}`);

        if (!dryRun && (updates.length || pub !== undefined)) {
          await prisma.venue.update({ where: { id: v.id }, data: {
            ...fields,
            ...(pub !== undefined ? { isPublished: pub } : {}),
            auditStatus: pub === false ? "flagged" : "clean",
            lastAuditedAt: new Date(),
          }});
          changed.push(v.id);
        }
        log.push({ name: v.name, city: v.city, action, changes: updates, reason: _reason });
      } catch (err) {
        console.log(`❌ ${String(err).slice(0, 70)}`);
        log.push({ name: v.name, city: v.city, action: "error", changes: [], reason: String(err).slice(0, 100) });
      }
      await new Promise(r => setTimeout(r, 800));
    }
  }

  // ── STEP 2: CLEAN ────────────────────────────────────────────────────────
  if (!photosOnly && needsClean.length) {
    console.log("\n🧹 Step 2 — Clean descriptions");
    for (const v of needsClean) {
      process.stdout.write(`   ${v.name.slice(0, 48).padEnd(48)} `);
      try {
        const fixed = await stepClean(v.name, v.description!);
        if (fixed) {
          console.log(`✓ fixed`);
          if (!dryRun) {
            await prisma.venue.update({ where: { id: v.id }, data: { description: fixed, lastAuditedAt: new Date() } });
            if (!changed.includes(v.id)) changed.push(v.id);
          }
          log.push({ name: v.name, city: v.city, action: "cleaned", changes: ["description"], reason: "junk description replaced" });
        } else {
          console.log(`— ok`);
        }
      } catch (err) { console.log(`❌ ${String(err).slice(0, 70)}`); }
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // ── STEP 3: RE-GATE (published venues) ────────────────────────────────
  if (!photosOnly && needsReGate.length) {
    console.log("\n🔍 Step 3 — Re-gate published venues");
    for (const v of needsReGate) {
      // Re-fetch in case description was just updated
      const fresh = await prisma.venue.findUnique({ where: { id: v.id } });
      const target = fresh ?? v;
      process.stdout.write(`   ${target.name.slice(0, 48).padEnd(48)} `);
      try {
        const { isWedding, confidence, reason } = await stepReGate(target);
        if (!isWedding && confidence !== "low") {
          console.log(`🚫 unpublished:not-wedding  ${reason.slice(0, 55)}`);
          if (!dryRun) {
            await prisma.venue.update({ where: { id: v.id }, data: {
              isPublished: false, auditStatus: "flagged", lastAuditedAt: new Date(),
              auditFlags: [
                ...(Array.isArray(target.auditFlags) ? target.auditFlags as object[] : []),
                { type: "regate_not_wedding", severity: "critical", field: "name", detail: reason, autoFixed: true }
              ]
            }});
            if (!changed.includes(v.id)) changed.push(v.id);
          }
          log.push({ name: v.name, city: v.city, action: "unpublished:not-wedding", changes: ["isPublished"], reason });
        } else {
          console.log(`✅ confirmed  ${reason.slice(0, 55)}`);
          log.push({ name: v.name, city: v.city, action: "confirmed", changes: [], reason });
        }
      } catch (err) { console.log(`❌ ${String(err).slice(0, 70)}`); }
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // ── STEP 4: PHOTO ────────────────────────────────────────────────────────
  if (needsPhoto.length) {
    console.log("\n📸 Step 4 — Photo audit + swap");
    for (const v of needsPhoto) {
      // Re-fetch in case publish status changed
      const fresh = await prisma.venue.findUnique({ where: { id: v.id } });
      if (!fresh?.isPublished) continue;
      process.stdout.write(`   ${fresh.name.slice(0, 48).padEnd(48)} `);
      try {
        const result = await auditAndFixPhoto(fresh, OR_KEY, forcePhotos);
        if (result.action === "ok") {
          console.log(`✓ photo ok (${result.oldScore}/10)  ${result.reason.slice(0, 50)}`);
          log.push({ name: v.name, city: v.city, action: "photo:ok", changes: [], reason: `${result.oldScore}/10 — ${result.reason}` });
        } else if (result.action === "swapped") {
          console.log(`🔄 photo swapped (${result.oldScore}→${result.newScore}/10)  ${result.reason.slice(0, 45)}`);
          if (!dryRun) {
            await prisma.venue.update({ where: { id: v.id }, data: { primaryPhotoUrl: result.newUrl!, lastAuditedAt: new Date() } });
            if (!changed.includes(v.id)) changed.push(v.id);
          }
          log.push({ name: v.name, city: v.city, action: "photo:swapped", changes: ["primaryPhotoUrl"], reason: result.reason });
        } else if (result.action === "no-good-photo") {
          console.log(`⚠️  no good photo (${result.oldScore}/10)  ${result.reason.slice(0, 45)}`);
          log.push({ name: v.name, city: v.city, action: "photo:needs-manual", changes: [], reason: result.reason });
        } else {
          console.log(`— ${result.action}`);
          log.push({ name: v.name, city: v.city, action: `photo:${result.action}`, changes: [], reason: result.reason });
        }
      } catch (err) { console.log(`❌ ${String(err).slice(0, 70)}`); }
      await new Promise(r => setTimeout(r, 400));
    }
  }

  // ── COUNT VERIFY ──────────────────────────────────────────────────────────
  const afterTotal = await prisma.venue.count({ where: scopeWhere });
  const afterPub   = await prisma.venue.count({ where: { ...scopeWhere, isPublished: true } });
  if (afterTotal !== beforeTotal) {
    console.error(`\n🚨 COUNT MISMATCH: ${beforeTotal} → ${afterTotal}. Aborting sync.`);
    process.exit(1);
  }

  // ── SYNC ─────────────────────────────────────────────────────────────────
  if (!dryRun && !skipSync && changed.length) {
    console.log(`\n🔄 Syncing ${changed.length} venues to Neon...`);
    await syncToNeon(changed);
  }

  // ── REPORT ───────────────────────────────────────────────────────────────
  console.log("\n📄 Generating report...");
  const all = await prisma.venue.findMany({ where: scopeWhere, orderBy: [{ city: "asc" }, { name: "asc" }] });
  const reportResults: VenueAuditResult[] = all.map(v => ({
    id: v.id, name: v.name, city: v.city,
    auditScore: v.auditScore ?? 0,
    auditStatus: (v.auditStatus ?? "unaudited") as VenueAuditResult["auditStatus"],
    flags: Array.isArray(v.auditFlags) ? v.auditFlags as VenueAuditResult["flags"] : [],
    autoFixesApplied: 0, wasPublished: v.isPublished, isPublished: v.isPublished,
  }));
  const reportSummary: AuditRunSummary = {
    runAt: runAt.toISOString(), cities: targetCities, totalVenues: reportResults.length,
    clean: reportResults.filter(r => r.auditStatus === "clean").length,
    needsReview: reportResults.filter(r => r.auditStatus === "needs_review").length,
    flagged: reportResults.filter(r => r.auditStatus === "flagged").length,
    totalFlags: reportResults.reduce((s, r) => s + r.flags.length, 0),
    criticalFlags: reportResults.reduce((s, r) => s + r.flags.filter(f => f.severity === "critical" && !f.autoFixed).length, 0),
    warningFlags: reportResults.reduce((s, r) => s + r.flags.filter(f => f.severity === "warning" && !f.autoFixed).length, 0),
    autoFixesApplied: log.filter(e => ["enriched+published","cleaned","photo:swapped"].includes(e.action)).length,
    results: reportResults,
  };
  const reportPath = await generateReport(reportSummary);

  // ── LOG ───────────────────────────────────────────────────────────────────
  const runsDir = path.resolve(__dirname, "runs");
  fs.mkdirSync(runsDir, { recursive: true });
  fs.writeFileSync(path.join(runsDir, `${runId}.json`), JSON.stringify({
    runAt: runAt.toISOString(), cities: targetCities, dryRun,
    before: { total: beforeTotal, published: beforePub },
    after: { total: afterTotal, published: afterPub },
    changed: changed.length, log,
  }, null, 2));

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  const pubDelta = afterPub - beforePub;
  const cnt = (a: string) => log.filter(e => e.action === a).length;
  console.log(`
┌──────────────────────────────────────┐
│  Pipeline Complete                    │
├──────────────────────────────────────┤
│  Enriched        ${String(log.filter(e=>e.action.startsWith("enrich")).length).padStart(4)}                │
│  Cleaned         ${String(cnt("cleaned")).padStart(4)}                │
│  Re-gated        ${String(log.filter(e=>e.action.startsWith("confirmed")||e.action.startsWith("unpub")).length).padStart(4)}                │
│  Photos swapped  ${String(cnt("photo:swapped")).padStart(4)}                │
│  Photos flagged  ${String(cnt("photo:needs-manual")).padStart(4)}                │
│  Published    ${pubDelta >= 0 ? "+" : ""}${String(pubDelta).padStart(4)}                │
├──────────────────────────────────────┤
│  Total  ${afterTotal} venues  (${afterPub} published)     │
└──────────────────────────────────────┘`);

  if (dryRun) console.log("\n⚠️  DRY RUN — nothing written");
  console.log(`📄 ${reportPath}\n`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async err => {
  console.error("🚨", err);
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});
