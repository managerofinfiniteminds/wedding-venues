#!/usr/bin/env npx tsx@latest
/**
 * Green Bowtie — Deep Enrichment Pipeline
 * ─────────────────────────────────────────────────────────────────
 * Upgrades ALL venue descriptions by synthesizing from multiple sources:
 *   1. Venue website (weddings/events/pricing/packages/gallery pages)
 *   2. Yelp (review excerpts via existing Playwright scraper — parallel, non-blocking)
 *   3. Google Places reviews (top 3–5 high-rating via Places API)
 *   4. Knot data already in DB (price, capacity)
 *   5. Structured DB fields (rating, type, tags, amenities, social)
 *   6. Gemini Flash synthesis — 4–5 sentence wedding description
 *   7. Humanizer pass — strips AI writing patterns per humanizer skill
 *
 * SAFETY: Every original description is backed up to deep-enrich-backup.jsonl
 *         before being overwritten. Fully recoverable at any time.
 *         Per-venue checkpoint in deep-enrich-state.json — crash-safe resume.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx@latest scripts/enrichment/deep-enrich.ts --cities "napa" --dry-run
 *   DATABASE_URL=... npx tsx@latest scripts/enrichment/deep-enrich.ts --cities "los angeles,san diego"
 *   DATABASE_URL=... npx tsx@latest scripts/enrichment/deep-enrich.ts --all
 *   DATABASE_URL=... npx tsx@latest scripts/enrichment/deep-enrich.ts --all --resume
 *   DATABASE_URL=... npx tsx@latest scripts/enrichment/deep-enrich.ts --all --force
 *
 * Cost: ~$0.0002/venue (2 Gemini Flash calls — synthesis + humanizer, no web search)
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

// ── Backup — append original description before any overwrite ─────────────
function backupDescription(id: string, name: string, city: string, original: string | null) {
  const entry = JSON.stringify({ id, name, city, original, ts: new Date().toISOString() });
  fs.appendFileSync(BACKUP_FILE, entry + "\n");
}

// ── LLM — 3 retries, 429 backoff ─────────────────────────────────────────
async function llm(prompt: string, maxTokens = 600): Promise<string> {
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
          temperature: 0.4,
        }),
      });
      if (resp.status === 429) {
        const wait = attempt * 20000; // 20s, 40s, 60s
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
      // Discard JS-only pages or near-empty results
      if (text.length < 200) continue;
      if (/enable javascript|please enable|noscript/i.test(text.slice(0, 300))) continue;
      // Got useful content — return first 1500 chars
      return text.slice(0, 1500);
    } catch { continue; }
  }
  return null;
}

// ── Yelp — parallel, 10s total timeout, non-blocking ─────────────────────
async function fetchYelpReviews(name: string, city: string): Promise<string[]> {
  try {
    // Yelp scraper uses Playwright CDP — wrap in a timeout race
    const { getYelpData } = await import("./scrape-yelp.js").catch(() => ({ getYelpData: null }));
    if (!getYelpData) return [];

    const result = await Promise.race([
      getYelpData(name, city, "CA"),
      new Promise<null>(r => setTimeout(() => r(null), 10000)),
    ]);
    if (!result) return [];
    return (result.reviewHighlights ?? []).slice(0, 3).map((r: string) => r.slice(0, 200));
  } catch {
    return [];
  }
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
  } catch {
    return [];
  }
}

// ── Description sanitizer ─────────────────────────────────────────────────
function sanitize(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")  // strip markdown links → keep text
    .replace(/https?:\/\/\S+/g, "")           // strip raw URLs
    .replace(/^(I |As an AI|As a language model)/i, "") // strip AI voice leakage
    .replace(/\s+/g, " ")
    .trim();
}

// ── Synthesis prompt ──────────────────────────────────────────────────────
function buildPrompt(v: {
  name: string; city: string; venueType: string; styleTags: string[];
  googleRating: number | null; googleReviews: number | null;
  baseRentalMin: number | null; maxGuests: number | null;
  hasBridalSuite: boolean; hasOutdoorSpace: boolean; hasIndoorSpace: boolean;
  onSiteCoordinator: boolean; allInclusive: boolean; cateringKitchen: boolean;
  instagram: string | null; facebook: string | null;
  websiteText: string | null; googleReviewExcerpts: string[]; yelpReviewExcerpts: string[];
}): string {
  const amenities = [
    v.hasBridalSuite && "bridal suite",
    v.hasOutdoorSpace && "outdoor space",
    v.hasIndoorSpace && "indoor space",
    v.onSiteCoordinator && "on-site coordinator",
    v.allInclusive && "all-inclusive packages",
    v.cateringKitchen && "catering kitchen",
  ].filter(Boolean).join(", ");

  const allReviews = [...v.googleReviewExcerpts, ...v.yelpReviewExcerpts];
  const reviewBlock = allReviews.length
    ? `\nReal couple/guest reviews:\n${allReviews.map(r => `- "${r}"`).join("\n")}`
    : "";

  const websiteBlock = v.websiteText
    ? `\nFrom their website:\n${v.websiteText.slice(0, 900)}`
    : "";

  const socialBlock = (v.instagram || v.facebook)
    ? `\nActive social media: ${[v.instagram && "Instagram", v.facebook && "Facebook"].filter(Boolean).join(", ")}`
    : "";

  return `Write a wedding venue description for a directory listing. 4–5 sentences. Present tense.

Venue: ${v.name}
Location: ${v.city}, California
Type: ${v.venueType}
Style: ${v.styleTags.join(", ") || "not specified"}
Google rating: ${v.googleRating ? `${v.googleRating}/5 (${v.googleReviews?.toLocaleString()} reviews)` : "not available"}
Starting price: ${v.baseRentalMin ? `$${v.baseRentalMin.toLocaleString()}` : "not listed"}
Max guests: ${v.maxGuests ?? "not listed"}
Amenities: ${amenities || "not specified"}
${socialBlock}${websiteBlock}${reviewBlock}

WRITING RULES — follow every one:
- Write like a knowledgeable local, not a brochure or press release
- Use specific concrete details — if you have them, use them; if not, describe the type and vibe
- Open with the venue's single most distinctive feature — not its location or city name
- Hard banned words/phrases: nestled, boasts, stunning, breathtaking, vibrant, testament, tapestry, perfect backdrop, ideal, seamless, picturesque, enchanting, magical, making it suitable for, making it ideal for, good choice for, perfect for couples, whether you, a good option
- No em dashes (—) — use commas or periods instead
- No rule of three ("elegant, intimate, and memorable")
- No "not just X, it's Y" constructions
- No generic positive closer ("a perfect choice", "your dream wedding", "memories to last", "a truly special")
- Vary sentence length — mix short and long naturally
- If review quotes exist, reference ONE specific detail couples actually mentioned
- Include price or capacity if known — real numbers build trust
- Don't repeat the city name more than once
- No markdown, no URLs, no bullet points — plain prose only
- Write the description text only. No intro, no preamble.`;
}

// ── Humanizer prompt ──────────────────────────────────────────────────────
function buildHumanizerPrompt(text: string, name: string): string {
  return `Edit this wedding venue description to remove any remaining AI writing patterns.

Venue: ${name}
Description:
"${text}"

Check for and fix:
- Any banned words/phrases still present: nestled, boasts, stunning, breathtaking, vibrant, testament, perfect, ideal, enchanting, magical, picturesque, making it suitable for, making it ideal for, good choice for, whether you, a good option, conveniently located
- Em dashes (—) — replace with commas or periods
- Rule-of-three lists — break them up
- Vague praise without specifics — cut it, don't replace
- All sentences the same length — vary rhythm
- "serves as" / "stands as" — replace with "is"
- Generic positive endings — cut entirely
- Any markdown links or raw URLs — strip them
- Any first-person AI voice ("I", "As an AI") — remove

If the description is already clean, return it unchanged.
Return ONLY the final description. Nothing else. No quotes around it.`;
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const done = loadState();

  console.log(`\n🌿 Green Bowtie Deep Enrichment`);
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
      baseRentalMin: true, maxGuests: true, description: true,
      hasBridalSuite: true, hasOutdoorSpace: true, hasIndoorSpace: true,
      onSiteCoordinator: true, allInclusive: true, cateringKitchen: true,
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

      // ── Synthesis ────────────────────────────────────────────────────
      const prompt = buildPrompt({
        name: v.name, city: v.city, venueType: v.venueType,
        styleTags: v.styleTags ?? [],
        googleRating: v.googleRating, googleReviews: v.googleReviews,
        baseRentalMin: v.baseRentalMin, maxGuests: v.maxGuests,
        hasBridalSuite: v.hasBridalSuite, hasOutdoorSpace: v.hasOutdoorSpace,
        hasIndoorSpace: v.hasIndoorSpace, onSiteCoordinator: v.onSiteCoordinator,
        allInclusive: v.allInclusive, cateringKitchen: v.cateringKitchen,
        instagram: v.instagram, facebook: v.facebook,
        websiteText, googleReviewExcerpts: googleReviews, yelpReviewExcerpts: yelpReviews,
      });

      let description = sanitize(await llm(prompt, 500));

      // ── Humanizer pass ───────────────────────────────────────────────
      const humanized = sanitize(await llm(buildHumanizerPrompt(description, v.name), 400));
      if (humanized.length >= 120) description = humanized;

      // ── Validate ─────────────────────────────────────────────────────
      if (description.length < 120) {
        console.log(`⚠️  too short (${description.length}c) — skipping`);
        errors++;
        continue;
      }

      console.log(`✅ ${description.length}c [${sources || "db-only"}]`);

      // ── Write (backup first, always) ─────────────────────────────────
      if (!dryRun) {
        backupDescription(v.id, v.name, v.city, v.description);
        await prisma.venue.update({
          where: { id: v.id },
          data: {
            description,
            pipelineProcessedAt: new Date(),
            lastAuditedAt: new Date(),
          },
        });
      }

      done.add(v.id);
      if (!dryRun) saveState(done);
      enriched++;

    } catch (err) {
      console.log(`❌ ${String(err).slice(0, 70)}`);
      errors++;
    }

    // 1.2s between venues — stays comfortably under Gemini 60 RPM
    await new Promise(r => setTimeout(r, 1200));
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
