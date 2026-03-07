#!/usr/bin/env npx tsx@latest
/**
 * Green Bowtie — Deep Enrichment Pipeline
 * ─────────────────────────────────────────────────────────────────
 * Upgrades venue descriptions by synthesizing data from multiple sources:
 *   1. Venue website (scrape their weddings/events page)
 *   2. Google Places reviews (top 3–5 via Places API)
 *   3. Knot data already in DB (price, capacity)
 *   4. Structured DB fields (rating, type, tags, amenities)
 *   5. Gemini Flash synthesis — writes a 4–5 sentence wedding description
 *   6. Humanizer pass — removes AI writing patterns (per humanizer skill)
 *
 * Usage:
 *   npx tsx@latest scripts/enrichment/deep-enrich.ts --cities "los angeles,san diego"
 *   npx tsx@latest scripts/enrichment/deep-enrich.ts --all --limit 100
 *   npx tsx@latest scripts/enrichment/deep-enrich.ts --cities "napa" --dry-run
 *   npx tsx@latest scripts/enrichment/deep-enrich.ts --all --resume   # skip already deep-enriched
 *   npx tsx@latest scripts/enrichment/deep-enrich.ts --force          # redo everything
 *
 * Every source is optional — the script degrades gracefully.
 * Per-venue checkpoint: crash at venue 500 = resume from 501.
 * Cost: ~$0.0001/venue (Gemini Flash, no web search)
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
const MODEL = "google/gemini-2.0-flash-001"; // Synthesis + humanizer — no web search needed

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

// ── CLI ───────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun    = args.includes("--dry-run");
const forceAll  = args.includes("--force");
const resumeMode = args.includes("--resume");
const allMode   = args.includes("--all");
const citiesArg = args[args.indexOf("--cities") + 1];
const targetCities = citiesArg
  ? citiesArg.split(",").map(c => c.trim().replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()))
  : [];
const limitArg  = args[args.indexOf("--limit") + 1];
const limitN    = limitArg ? parseInt(limitArg) : undefined;

// ── State file for resume support ─────────────────────────────────────────
const STATE_FILE = path.join(__dirname, "deep-enrich-state.json");

function loadState(): Set<string> {
  if (fs.existsSync(STATE_FILE)) {
    return new Set(JSON.parse(fs.readFileSync(STATE_FILE, "utf-8")));
  }
  return new Set();
}

function saveState(done: Set<string>) {
  fs.writeFileSync(STATE_FILE, JSON.stringify([...done], null, 2));
}

// ── LLM call ─────────────────────────────────────────────────────────────
async function llm(prompt: string, maxTokens = 600): Promise<string> {
  for (let attempt = 1; attempt <= 3; attempt++) {
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
          temperature: 0.4, // Slight creativity for natural writing
        }),
      });
      if (!resp.ok) throw new Error(`LLM ${resp.status}: ${(await resp.text()).slice(0, 120)}`);
      const data = await resp.json() as { choices?: Array<{ message: { content: string } }> };
      return (data.choices?.[0]?.message?.content ?? "").trim();
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
  return "";
}

// ── Fetch venue website text ──────────────────────────────────────────────
async function fetchWebsiteText(website: string | null): Promise<string | null> {
  if (!website) return null;
  try {
    // Try weddings/events subpage first, then homepage
    const urls = [
      website.replace(/\/$/, "") + "/weddings",
      website.replace(/\/$/, "") + "/events",
      website.replace(/\/$/, "") + "/venue",
      website,
    ];
    for (const url of urls) {
      try {
        const resp = await fetch(url, {
          signal: AbortSignal.timeout(8000),
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; GreenBowtieBot/1.0)",
          },
        });
        if (!resp.ok) continue;
        const html = await resp.text();
        // Strip tags, collapse whitespace, grab first 1500 chars
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .slice(0, 1500)
          .trim();
        if (text.length > 100) return text;
      } catch { continue; }
    }
  } catch { /* ignore */ }
  return null;
}

// ── Fetch Google Places reviews ───────────────────────────────────────────
async function fetchGoogleReviews(name: string, city: string): Promise<string[]> {
  if (!GOOGLE_PLACES_KEY) return [];
  try {
    // Find place ID
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name + " " + city + " CA")}&inputtype=textquery&fields=place_id&key=${GOOGLE_PLACES_KEY}`;
    const searchResp = await fetch(searchUrl, { signal: AbortSignal.timeout(6000) });
    if (!searchResp.ok) return [];
    const searchData = await searchResp.json() as { candidates?: Array<{ place_id: string }> };
    const placeId = searchData.candidates?.[0]?.place_id;
    if (!placeId) return [];

    // Fetch reviews
    const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${GOOGLE_PLACES_KEY}`;
    const detailResp = await fetch(detailUrl, { signal: AbortSignal.timeout(6000) });
    if (!detailResp.ok) return [];
    const detailData = await detailResp.json() as { result?: { reviews?: Array<{ text: string; rating: number }> } };
    const reviews = detailData.result?.reviews ?? [];

    // Return top 3 high-rating reviews, trimmed
    return reviews
      .filter(r => r.rating >= 4)
      .slice(0, 3)
      .map(r => r.text.slice(0, 200));
  } catch {
    return [];
  }
}

// ── Build synthesis prompt ────────────────────────────────────────────────
function buildPrompt(v: {
  name: string;
  city: string;
  venueType: string;
  styleTags: string[];
  googleRating: number | null;
  googleReviews: number | null;
  baseRentalMin: number | null;
  maxGuests: number | null;
  hasBridalSuite: boolean;
  hasOutdoorSpace: boolean;
  hasIndoorSpace: boolean;
  onSiteCoordinator: boolean;
  allInclusive: boolean;
  cateringKitchen: boolean;
  websiteText: string | null;
  reviewExcerpts: string[];
}): string {
  const amenities = [
    v.hasBridalSuite && "bridal suite",
    v.hasOutdoorSpace && "outdoor space",
    v.hasIndoorSpace && "indoor space",
    v.onSiteCoordinator && "on-site coordinator",
    v.allInclusive && "all-inclusive packages",
    v.cateringKitchen && "catering kitchen",
  ].filter(Boolean).join(", ");

  const reviewBlock = v.reviewExcerpts.length
    ? `\nReal couple reviews:\n${v.reviewExcerpts.map(r => `- "${r}"`).join("\n")}`
    : "";

  const websiteBlock = v.websiteText
    ? `\nFrom their website:\n${v.websiteText.slice(0, 800)}`
    : "";

  return `Write a wedding venue description for a directory listing. 4–5 sentences. Present tense.

Venue: ${v.name}
Location: ${v.city}, California
Type: ${v.venueType}
Style tags: ${v.styleTags.join(", ") || "not specified"}
Google rating: ${v.googleRating ? `${v.googleRating}/5 (${v.googleReviews?.toLocaleString()} reviews)` : "not available"}
Starting price: ${v.baseRentalMin ? `$${v.baseRentalMin.toLocaleString()}` : "not listed"}
Max guests: ${v.maxGuests ?? "not listed"}
Amenities: ${amenities || "not specified"}
${websiteBlock}
${reviewBlock}

WRITING RULES — follow every one:
- Write like a knowledgeable local, not a brochure
- Use specific concrete details over vague praise
- No "nestled", "boasts", "stunning", "breathtaking", "vibrant", "testament", "tapestry", "perfect backdrop"
- No em dashes (—). Use commas or periods instead
- No rule of three ("elegant, intimate, and memorable")
- No "not just X, it's Y" constructions
- Vary sentence length — mix short and long
- If you have review quotes, incorporate a specific detail couples mentioned
- Include price or capacity if known — couples want real numbers
- End on something specific and memorable about this venue, not a generic closer
- Write the description only. No intro, no preamble, no meta-commentary.`;
}

// ── Humanizer pass ────────────────────────────────────────────────────────
async function humanize(text: string, venueName: string): Promise<string> {
  const prompt = `You are editing a wedding venue description to remove AI writing patterns.

Venue: ${venueName}
Original description:
"${text}"

Fix any of these issues if present:
- Remove "nestled", "boasts", "stunning", "breathtaking", "vibrant", "testament", "perfect", "ideal"  
- Replace em dashes (—) with commas or periods
- Break up any rule-of-three lists
- Replace vague claims with specific details (if no specific detail available, cut the vague claim)
- Vary sentence length if all sentences are similar length
- Use "is/has/offers" instead of "serves as/stands as/boasts"
- Remove any generic positive closer ("a perfect choice for...", "your dream wedding awaits")

If the description is already clean and natural, return it unchanged.
Return ONLY the final description text. Nothing else.`;

  const result = await llm(prompt, 400);
  // Sanity check — if humanizer returns something very short or broken, use original
  if (result.length < 100 || result.length > text.length * 2) return text;
  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const done = loadState();

  console.log(`\n🌿 Green Bowtie Deep Enrichment  ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}`);
  console.log(`   Model: ${MODEL} | Dry run: ${dryRun} | Resume: ${resumeMode} | Force: ${forceAll}\n`);

  // Fetch venues
  const where: any = {
    stateSlug: "california",
    isPublished: true,
    ...(targetCities.length ? { city: { in: targetCities } } : {}),
  };

  const allVenues = await prisma.venue.findMany({
    where,
    orderBy: [{ googleReviews: "desc" }, { city: "asc" }], // Most-reviewed first = highest quality data
    select: {
      id: true, name: true, city: true, slug: true, website: true,
      venueType: true, styleTags: true, googleRating: true, googleReviews: true,
      baseRentalMin: true, maxGuests: true, description: true,
      hasBridalSuite: true, hasOutdoorSpace: true, hasIndoorSpace: true,
      onSiteCoordinator: true, allInclusive: true, cateringKitchen: true,
      pipelineProcessedAt: true,
    },
  });

  // Filter: skip already deep-enriched in resume mode, or skip if no data to work with
  const venues = allVenues.filter(v => {
    if (!forceAll && resumeMode && done.has(v.id)) return false;
    return true;
  }).slice(0, limitN);

  console.log(`📋 ${venues.length} venues to process (${allVenues.length} total published CA)\n`);

  let enriched = 0, skipped = 0, errors = 0;

  for (const v of venues) {
    process.stdout.write(`   ${v.name.slice(0, 50).padEnd(50)} `);

    try {
      // ── Gather data from all sources (all optional) ──────────────────
      const [websiteText, reviewExcerpts] = await Promise.allSettled([
        fetchWebsiteText(v.website),
        fetchGoogleReviews(v.name, v.city),
      ]).then(results => [
        results[0].status === "fulfilled" ? results[0].value : null,
        results[1].status === "fulfilled" ? results[1].value : [],
      ]);

      // ── Build and run synthesis prompt ──────────────────────────────
      const prompt = buildPrompt({
        name: v.name,
        city: v.city,
        venueType: v.venueType,
        styleTags: v.styleTags ?? [],
        googleRating: v.googleRating,
        googleReviews: v.googleReviews,
        baseRentalMin: v.baseRentalMin,
        maxGuests: v.maxGuests,
        hasBridalSuite: v.hasBridalSuite,
        hasOutdoorSpace: v.hasOutdoorSpace,
        hasIndoorSpace: v.hasIndoorSpace,
        onSiteCoordinator: v.onSiteCoordinator,
        allInclusive: v.allInclusive,
        cateringKitchen: v.cateringKitchen,
        websiteText: websiteText as string | null,
        reviewExcerpts: reviewExcerpts as string[],
      });

      let description = await llm(prompt, 500);

      // ── Humanizer pass ───────────────────────────────────────────────
      description = await humanize(description, v.name);

      // ── Validate ─────────────────────────────────────────────────────
      if (description.length < 120) {
        console.log(`⚠️  too short (${description.length} chars) — skipping`);
        skipped++;
        continue;
      }

      const sources = [
        websiteText ? "website" : null,
        (reviewExcerpts as string[]).length ? "reviews" : null,
        v.baseRentalMin ? "knot-price" : null,
      ].filter(Boolean).join("+");

      console.log(`✅ ${description.length}c [${sources || "db-only"}]`);

      // ── Write to DB ──────────────────────────────────────────────────
      if (!dryRun) {
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
      console.log(`❌ ${String(err).slice(0, 60)}`);
      errors++;
    }

    // Polite delay — Gemini Flash rate limits at ~60 RPM
    await new Promise(r => setTimeout(r, 1100));
  }

  console.log(`
┌──────────────────────────────────────┐
│  Deep Enrichment Complete             │
├──────────────────────────────────────┤
│  Enriched        ${String(enriched).padStart(4)}                │
│  Skipped         ${String(skipped).padStart(4)}                │
│  Errors          ${String(errors).padStart(4)}                │
└──────────────────────────────────────┘`);

  if (dryRun) console.log("\n⚠️  DRY RUN — nothing written");
  console.log();

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async err => {
  console.error("🚨", err);
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});
