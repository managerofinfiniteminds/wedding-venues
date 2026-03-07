#!/usr/bin/env npx tsx@latest
/**
 * Green Bowtie — Deep Enrichment Pipeline
 * ─────────────────────────────────────────────────────────────────
 * Extracts and writes ALL fields visible on venue detail pages:
 *
 *   Description fields:
 *   - description (4-5 sentence, humanized, source-grounded)
 *
 *   Venue classification:
 *   - venueType (refines "Event Venue" → specific type)
 *   - styleTags (aesthetic tags)
 *
 *   Capacity & pricing:
 *   - maxGuests, minGuests, seatedMax
 *   - baseRentalMin, baseRentalMax
 *   - perHeadMin, perHeadMax
 *   - priceTier (budget/moderate/luxury — inferred even without exact price)
 *
 *   Amenity booleans (all 13):
 *   - hasBridalSuite, hasGroomSuite
 *   - hasOutdoorSpace, hasIndoorSpace
 *   - onSiteCoordinator
 *   - cateringKitchen, barSetup
 *   - tablesChairsIncluded, linensIncluded
 *   - avIncluded, lightingIncluded
 *   - adaCompliant, nearbyLodging
 *
 * Data sources (all optional, graceful degradation):
 *   1. Venue website (weddings/events/pricing/packages/gallery pages)
 *   2. Yelp (review excerpts via Playwright CDP — parallel, 10s timeout)
 *   3. Google Places reviews (top 3-5 high-rating via Places API)
 *   4. Knot data already in DB (price, capacity)
 *   5. Structured DB fields (rating, type, tags, amenities, social)
 *   6. Gemini Flash synthesis → description + structured fields JSON
 *   7. Humanizer pass → strip AI writing patterns
 *
 * SAFETY:
 *   - Every original description backed up to deep-enrich-backup.jsonl BEFORE overwrite
 *   - Per-venue checkpoint in deep-enrich-state.json — crash at venue 500 = resume from 501
 *   - COUNT verified before/after run
 *   - Never modifies isPublished or auditStatus
 *
 * Usage:
 *   DATABASE_URL=... npx tsx@latest scripts/enrichment/deep-enrich.ts --cities "napa" --dry-run
 *   DATABASE_URL=... npx tsx@latest scripts/enrichment/deep-enrich.ts --cities "los angeles,san diego"
 *   DATABASE_URL=... npx tsx@latest scripts/enrichment/deep-enrich.ts --all
 *   DATABASE_URL=... npx tsx@latest scripts/enrichment/deep-enrich.ts --all --resume
 *   DATABASE_URL=... npx tsx@latest scripts/enrichment/deep-enrich.ts --all --force
 *
 * Cost: ~$0.0002/venue (2 Gemini Flash calls — synthesis + humanizer)
 * CA total: ~$0.63 for all 3,134 published venues
 */

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY required");

const OR_KEY = process.env.OPENROUTER_API_KEY!;
const GOOGLE_PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";
const MODEL = "google/gemini-2.0-flash-001";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

// ── CLI ───────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun     = args.includes("--dry-run");
const forceAll   = args.includes("--force");
const resumeMode = args.includes("--resume");
const citiesArg  = args[args.indexOf("--cities") + 1];
const targetCities = citiesArg
  ? citiesArg.split(",").map(c => c.trim().replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()))
  : [];
const limitArg = args[args.indexOf("--limit") + 1];
const limitN   = limitArg ? parseInt(limitArg) : undefined;

// ── File paths ────────────────────────────────────────────────────────────
const STATE_FILE  = path.join(__dirname, "deep-enrich-state.json");
const BACKUP_FILE = path.join(__dirname, "deep-enrich-backup.jsonl");

// ── State — crash-safe resume ─────────────────────────────────────────────
function loadState(): Set<string> {
  if (fs.existsSync(STATE_FILE)) {
    return new Set(JSON.parse(fs.readFileSync(STATE_FILE, "utf-8")));
  }
  return new Set();
}

function saveState(done: Set<string>) {
  fs.writeFileSync(STATE_FILE, JSON.stringify([...done], null, 2));
}

// ── Backup — always before overwrite ─────────────────────────────────────
function backupVenue(v: { id: string; name: string; city: string; description: string | null }) {
  const entry = JSON.stringify({ id: v.id, name: v.name, city: v.city, description: v.description, ts: new Date().toISOString() });
  fs.appendFileSync(BACKUP_FILE, entry + "\n");
}

// ── LLM — 4 retries, 429 backoff ─────────────────────────────────────────
async function llm(prompt: string, maxTokens = 900): Promise<string> {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OR_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://greenbowtie.com",
          "X-Title": "Green Bowtie Deep Enrich",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.35,
        }),
      });
      if (resp.status === 429) {
        const wait = attempt * 20000;
        console.log(`\n   ⏳ Rate limited — waiting ${wait / 1000}s...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      if (!resp.ok) throw new Error(`LLM ${resp.status}: ${(await resp.text()).slice(0, 120)}`);
      const data = await resp.json() as { choices?: Array<{ message: { content: string } }> };
      return (data.choices?.[0]?.message?.content ?? "").trim();
    } catch (err) {
      if (attempt === 4) throw err;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  return "";
}

function parseJSON<T>(raw: string): T | null {
  try {
    // Strip markdown code fences if present
    const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(clean) as T;
  } catch { return null; }
}

// ── Website scrape — multiple pages, junk detection ───────────────────────
async function fetchWebsiteText(website: string | null): Promise<string | null> {
  if (!website) return null;
  const base = website.replace(/\/$/, "");
  const pagesToTry = [
    base + "/weddings",
    base + "/events",
    base + "/venue",
    base + "/pricing",
    base + "/packages",
    base + "/gallery",
    base,
  ];
  for (const url of pagesToTry) {
    try {
      const resp = await fetch(url, {
        signal: AbortSignal.timeout(7000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; GreenBowtieBot/1.0)" },
      });
      if (!resp.ok) continue;
      const html = await resp.text();
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (text.length < 200) continue;
      if (/enable javascript|please enable|noscript/i.test(text.slice(0, 300))) continue;
      return text.slice(0, 2000); // More context for field extraction
    } catch { continue; }
  }
  return null;
}

// ── Yelp — parallel, 10s timeout, non-blocking ───────────────────────────
async function fetchYelpReviews(name: string, city: string): Promise<string[]> {
  try {
    const { getYelpData } = await import("./scrape-yelp.js").catch(() => ({ getYelpData: null }));
    if (!getYelpData) return [];
    const result = await Promise.race([
      getYelpData(name, city, "CA"),
      new Promise<null>(r => setTimeout(() => r(null), 10000)),
    ]);
    if (!result) return [];
    return (result.reviewHighlights ?? []).slice(0, 3).map((r: string) => r.slice(0, 200));
  } catch { return []; }
}

// ── Google Places reviews ─────────────────────────────────────────────────
async function fetchGoogleReviews(name: string, city: string): Promise<string[]> {
  if (!GOOGLE_PLACES_KEY) return [];
  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name + " " + city + " CA")}&inputtype=textquery&fields=place_id&key=${GOOGLE_PLACES_KEY}`;
    const searchResp = await fetch(searchUrl, { signal: AbortSignal.timeout(6000) });
    if (!searchResp.ok) return [];
    const searchData = await searchResp.json() as { candidates?: Array<{ place_id: string }> };
    const placeId = searchData.candidates?.[0]?.place_id;
    if (!placeId) return [];

    const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${GOOGLE_PLACES_KEY}`;
    const detailResp = await fetch(detailUrl, { signal: AbortSignal.timeout(6000) });
    if (!detailResp.ok) return [];
    const detailData = await detailResp.json() as { result?: { reviews?: Array<{ text: string; rating: number }> } };
    return (detailData.result?.reviews ?? [])
      .filter(r => r.rating >= 4)
      .slice(0, 3)
      .map(r => r.text.slice(0, 200));
  } catch { return []; }
}

// ── Main synthesis prompt — description + ALL structured fields ───────────
function buildSynthesisPrompt(v: {
  name: string; city: string; venueType: string; styleTags: string[];
  googleRating: number | null; googleReviews: number | null;
  baseRentalMin: number | null; maxGuests: number | null; minGuests: number | null;
  hasBridalSuite: boolean; hasGroomSuite: boolean;
  hasOutdoorSpace: boolean; hasIndoorSpace: boolean;
  onSiteCoordinator: boolean; allInclusive: boolean;
  cateringKitchen: boolean; barSetup: boolean;
  tablesChairsIncluded: boolean; linensIncluded: boolean;
  avIncluded: boolean; lightingIncluded: boolean;
  adaCompliant: boolean; nearbyLodging: boolean;
  instagram: string | null; facebook: string | null;
  websiteText: string | null; googleReviewExcerpts: string[]; yelpReviewExcerpts: string[];
}): string {
  const allReviews = [...v.googleReviewExcerpts, ...v.yelpReviewExcerpts];
  const reviewBlock = allReviews.length
    ? `\nReal couple/guest reviews:\n${allReviews.map(r => `- "${r}"`).join("\n")}`
    : "";
  const websiteBlock = v.websiteText ? `\nFrom their website:\n${v.websiteText.slice(0, 1200)}` : "";
  const socialBlock = (v.instagram || v.facebook)
    ? `\nSocial: ${[v.instagram && "Instagram", v.facebook && "Facebook"].filter(Boolean).join(", ")}`
    : "";
  const knownData = [
    v.baseRentalMin && `Starting price: $${v.baseRentalMin.toLocaleString()}`,
    v.maxGuests && `Max guests: ${v.maxGuests}`,
    v.minGuests && `Min guests: ${v.minGuests}`,
    v.googleRating && `Google: ${v.googleRating}/5 (${v.googleReviews?.toLocaleString()} reviews)`,
  ].filter(Boolean).join(" | ");

  return `You are researching a wedding venue for a directory. Extract ALL available information and write a description.

Venue: ${v.name}
Location: ${v.city}, California
Current type: ${v.venueType}
Style tags: ${v.styleTags.join(", ") || "none"}
Known data: ${knownData || "minimal"}
${socialBlock}${websiteBlock}${reviewBlock}

Return a JSON object with ALL of these fields. Use null for anything you genuinely cannot determine.

{
  "description": "4-5 sentence wedding venue description. Rules below.",
  "venueType": "one of: Vineyard & Winery | Barn / Ranch | Ballroom | Hotel & Resort | Golf Club | Garden | Historic Estate | Museum & Gallery | Event Venue | Resort | Outdoor / Park | Restaurant | Rooftop",
  "styleTags": ["array", "of", "style", "tags"],
  "maxGuests": integer or null,
  "minGuests": integer or null,
  "seatedMax": integer or null,
  "baseRentalMin": integer or null,
  "baseRentalMax": integer or null,
  "perHeadMin": integer or null,
  "perHeadMax": integer or null,
  "priceTier": "budget | moderate | luxury | null — infer from context even without exact price",
  "hasBridalSuite": true/false,
  "hasGroomSuite": true/false,
  "hasOutdoorSpace": true/false,
  "hasIndoorSpace": true/false,
  "onSiteCoordinator": true/false,
  "cateringKitchen": true/false,
  "barSetup": true/false,
  "tablesChairsIncluded": true/false,
  "linensIncluded": true/false,
  "avIncluded": true/false,
  "lightingIncluded": true/false,
  "adaCompliant": true/false,
  "nearbyLodging": true/false
}

DESCRIPTION RULES — follow every one:
- Open with the venue's single most distinctive physical feature — not its city or location
- Use specific concrete details — if you have them from reviews/website, use them
- Hard banned: nestled, boasts, stunning, breathtaking, vibrant, testament, tapestry, perfect backdrop, ideal, seamless, picturesque, enchanting, magical, making it suitable for, making it ideal for, good choice for, whether you, conveniently located
- No em dashes (—) — use commas or periods
- No rule of three ("elegant, intimate, and memorable")
- No "not just X, it's Y" constructions
- No generic positive closer ("perfect for couples", "your dream wedding", "memories to last")
- Vary sentence length — mix short and long
- Include ONE specific detail from reviews if available
- Include price or capacity if known — real numbers matter
- Do NOT repeat the city name more than once

AMENITY RULES:
- Default to false unless you find clear evidence it exists
- "hasOutdoorSpace" = venue has outdoor ceremony or reception area
- "hasIndoorSpace" = venue has indoor reception/event space
- "nearbyLodging" = hotel or accommodation within reasonable distance
- "priceTier": budget = under $3k, moderate = $3k-$8k, luxury = over $8k site fee. Infer from venue type + rating if no price found.

Return ONLY the JSON object. No preamble, no markdown outside the JSON.`;
}

// ── Humanizer prompt ──────────────────────────────────────────────────────
function buildHumanizerPrompt(text: string, name: string): string {
  return `Edit this wedding venue description to remove AI writing patterns. Return ONLY the cleaned description text — nothing else, no quotes.

Venue: ${name}
Description: "${text}"

Fix if present:
- Banned words: nestled, boasts, stunning, breathtaking, vibrant, testament, perfect, ideal, enchanting, magical, picturesque, making it suitable for, making it ideal for, good choice for, whether you, conveniently located, serves as, stands as
- Em dashes (—) → commas or periods
- Rule-of-three lists → break them up
- Vague praise without specifics → cut it
- All same-length sentences → vary rhythm
- Generic positive endings → cut entirely
- Markdown links or raw URLs → strip
- First-person AI voice ("I", "As an AI") → remove

If already clean, return unchanged.`;
}

// ── Sanitize output text ──────────────────────────────────────────────────
function sanitize(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^(I |As an AI|As a language model)/i, "")
    .replace(/^["']|["']$/g, "") // strip surrounding quotes
    .replace(/\s+/g, " ")
    .trim();
}

// ── Price tier inference ──────────────────────────────────────────────────
// Falls back to heuristics when no exact price is available
function inferPriceTier(
  basePrice: number | null | undefined,
  googleRating: number | null | undefined,
  venueType: string | null | undefined
): "budget" | "moderate" | "luxury" | null {
  // If we have an exact price, use it
  if (basePrice) {
    if (basePrice < 3000) return "budget";
    if (basePrice < 8000) return "moderate";
    return "luxury";
  }
  // Infer from venue type
  const luxuryTypes = ["Hotel & Resort", "Historic Estate", "Resort", "Vineyard & Winery"];
  const budgetTypes = ["Outdoor / Park", "Garden", "Community"];
  if (venueType && luxuryTypes.some(t => venueType.includes(t.split(" ")[0]))) {
    return googleRating && googleRating >= 4.5 ? "luxury" : "moderate";
  }
  if (venueType && budgetTypes.some(t => venueType.includes(t.split(" ")[0]))) {
    return "budget";
  }
  // Infer from Google rating as last resort
  if (googleRating) {
    if (googleRating >= 4.7) return "luxury";
    if (googleRating >= 4.3) return "moderate";
    return "budget";
  }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const done = loadState();

  console.log(`\n🌿 Green Bowtie Deep Enrichment — Full Field Pass`);
  console.log(`   ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Dry run: ${dryRun} | Resume: ${resumeMode} | Force: ${forceAll}`);
  console.log(`   Backup: ${BACKUP_FILE}\n`);

  const where: any = {
    stateSlug: "california",
    isPublished: true,
    ...(targetCities.length ? { city: { in: targetCities } } : {}),
  };

  const allVenues = await prisma.venue.findMany({
    where,
    orderBy: [{ googleReviews: "desc" }, { city: "asc" }],
    select: {
      id: true, name: true, city: true, slug: true, website: true,
      venueType: true, styleTags: true, googleRating: true, googleReviews: true,
      baseRentalMin: true, maxGuests: true, minGuests: true, description: true,
      hasBridalSuite: true, hasGroomSuite: true,
      hasOutdoorSpace: true, hasIndoorSpace: true,
      onSiteCoordinator: true, allInclusive: true,
      cateringKitchen: true, barSetup: true,
      tablesChairsIncluded: true, linensIncluded: true,
      avIncluded: true, lightingIncluded: true,
      adaCompliant: true, nearbyLodging: true,
      instagram: true, facebook: true,
    },
  });

  const venues = allVenues.filter(v => {
    if (!forceAll && resumeMode && done.has(v.id)) return false;
    return true;
  }).slice(0, limitN);

  const beforeCount = await prisma.venue.count({ where });
  console.log(`📊 ${venues.length} to process | ${beforeCount} total published CA\n`);

  let enriched = 0, errors = 0;

  for (const v of venues) {
    process.stdout.write(`   ${v.name.slice(0, 48).padEnd(48)} `);

    try {
      // ── Gather all sources in parallel ──────────────────────────────
      const [websiteText, googleReviews, yelpReviews] = await Promise.all([
        fetchWebsiteText(v.website),
        fetchGoogleReviews(v.name, v.city),
        fetchYelpReviews(v.name, v.city),
      ]);

      const sources = [
        websiteText ? "web" : null,
        googleReviews.length ? `g:${googleReviews.length}` : null,
        yelpReviews.length ? `yelp:${yelpReviews.length}` : null,
        v.baseRentalMin ? "$$" : null,
        v.maxGuests ? "cap" : null,
      ].filter(Boolean).join("+");

      // ── Synthesis — description + all structured fields ───────────
      const rawJson = await llm(buildSynthesisPrompt({
        name: v.name, city: v.city, venueType: v.venueType,
        styleTags: v.styleTags ?? [],
        googleRating: v.googleRating, googleReviews: v.googleReviews,
        baseRentalMin: v.baseRentalMin, maxGuests: v.maxGuests, minGuests: v.minGuests,
        hasBridalSuite: v.hasBridalSuite, hasGroomSuite: v.hasGroomSuite,
        hasOutdoorSpace: v.hasOutdoorSpace, hasIndoorSpace: v.hasIndoorSpace,
        onSiteCoordinator: v.onSiteCoordinator, allInclusive: v.allInclusive,
        cateringKitchen: v.cateringKitchen, barSetup: v.barSetup,
        tablesChairsIncluded: v.tablesChairsIncluded, linensIncluded: v.linensIncluded,
        avIncluded: v.avIncluded, lightingIncluded: v.lightingIncluded,
        adaCompliant: v.adaCompliant, nearbyLodging: v.nearbyLodging,
        instagram: v.instagram, facebook: v.facebook,
        websiteText, googleReviewExcerpts: googleReviews, yelpReviewExcerpts: yelpReviews,
      }), 900);

      type SynthResult = {
        description: string;
        venueType: string | null;
        styleTags: string[] | null;
        maxGuests: number | null;
        minGuests: number | null;
        seatedMax: number | null;
        baseRentalMin: number | null;
        baseRentalMax: number | null;
        perHeadMin: number | null;
        perHeadMax: number | null;
        priceTier: string | null;
        hasBridalSuite: boolean;
        hasGroomSuite: boolean;
        hasOutdoorSpace: boolean;
        hasIndoorSpace: boolean;
        onSiteCoordinator: boolean;
        cateringKitchen: boolean;
        barSetup: boolean;
        tablesChairsIncluded: boolean;
        linensIncluded: boolean;
        avIncluded: boolean;
        lightingIncluded: boolean;
        adaCompliant: boolean;
        nearbyLodging: boolean;
      };

      const result = parseJSON<SynthResult>(rawJson);
      if (!result || !result.description) {
        console.log(`⚠️  JSON parse failed — skipping`);
        errors++;
        continue;
      }

      // ── Humanizer pass on description only ───────────────────────
      let description = sanitize(result.description);
      const humanized = sanitize(await llm(buildHumanizerPrompt(description, v.name), 400));
      if (humanized.length >= 120) description = humanized;

      // ── Validate description ──────────────────────────────────────
      if (description.length < 120) {
        console.log(`⚠️  description too short (${description.length}c) — skipping`);
        errors++;
        continue;
      }

      // ── Build update payload — only write non-null improvements ──
      const update: Record<string, unknown> = {
        description,
        pipelineProcessedAt: new Date(),
        lastAuditedAt: new Date(),
      };

      // Venue type — only upgrade from generic "Event Venue"
      if (result.venueType && result.venueType !== "Event Venue") update.venueType = result.venueType;

      // Style tags — only write if we got something meaningful
      if (result.styleTags && result.styleTags.length > 0) update.styleTags = result.styleTags;

      // Capacity — only write if bigger/better than what we have
      if (result.maxGuests && (!v.maxGuests || result.maxGuests > v.maxGuests)) update.maxGuests = result.maxGuests;
      if (result.minGuests && !v.minGuests) update.minGuests = result.minGuests;
      if (result.seatedMax) update.seatedMax = result.seatedMax;

      // Pricing — only write if we don't already have it
      if (result.baseRentalMin && !v.baseRentalMin) update.baseRentalMin = result.baseRentalMin;
      if (result.baseRentalMax) update.baseRentalMax = result.baseRentalMax;
      if (result.perHeadMin) update.perHeadMin = result.perHeadMin;
      if (result.perHeadMax) update.perHeadMax = result.perHeadMax;

      // priceTier — always write (inferred even without exact price)
      // If AI gave us one, use it. If not, infer from what we know.
      const tier = result.priceTier ?? inferPriceTier(
        result.baseRentalMin ?? v.baseRentalMin,
        v.googleRating,
        result.venueType ?? v.venueType
      );
      if (tier) update.priceTier = tier;

      // Amenities — write all (booleans; false is still useful data)
      const amenityKeys = [
        "hasBridalSuite", "hasGroomSuite", "hasOutdoorSpace", "hasIndoorSpace",
        "onSiteCoordinator", "cateringKitchen", "barSetup",
        "tablesChairsIncluded", "linensIncluded", "avIncluded",
        "lightingIncluded", "adaCompliant", "nearbyLodging"
      ] as const;
      for (const key of amenityKeys) {
        if (typeof result[key] === "boolean") update[key] = result[key];
      }

      const fieldsFilled = Object.keys(update).length - 3; // subtract desc + timestamps
      console.log(`✅ ${description.length}c [${sources || "db-only"}] +${fieldsFilled} fields`);

      // ── Write (backup first, always) ─────────────────────────────
      if (!dryRun) {
        backupVenue(v);
        await prisma.venue.update({ where: { id: v.id }, data: update });
      }

      done.add(v.id);
      if (!dryRun) saveState(done);
      enriched++;

    } catch (err) {
      console.log(`❌ ${String(err).slice(0, 70)}`);
      errors++;
    }

    // 1.3s between venues — stays under Gemini 60 RPM with 2 calls/venue
    await new Promise(r => setTimeout(r, 1300));
  }

  // ── Count verify ──────────────────────────────────────────────────────
  const afterCount = await prisma.venue.count({ where });
  if (afterCount !== beforeCount) {
    console.error(`\n🚨 COUNT MISMATCH: ${beforeCount} → ${afterCount}. Check immediately.`);
  }

  console.log(`
┌──────────────────────────────────────┐
│  Deep Enrichment Complete             │
├──────────────────────────────────────┤
│  Enriched        ${String(enriched).padStart(4)}                │
│  Errors          ${String(errors).padStart(4)}                │
│  Count check     ${beforeCount === afterCount ? "✅ ok" : "🚨 MISMATCH"}             │
└──────────────────────────────────────┘`);

  if (dryRun) console.log("\n⚠️  DRY RUN — nothing written to DB");
  console.log(`💾 Backup: ${BACKUP_FILE}`);
  console.log(`📍 State:  ${STATE_FILE}\n`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async err => {
  console.error("🚨", err);
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});
