/**
 * quality-filter.ts
 * Tier 1: Rule-based disqualification
 * Tier 2: AI classification via Gemini Flash (OpenRouter)
 *
 * Run: OPENROUTER_API_KEY=xxx npx tsx scripts/quality-filter.ts
 */

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

// ─── Tier 1: Disqualification rules ────────────────────────────────────────────

const DISQUALIFY_NAME_PATTERNS = [
  /raceway|racetrack|speedway|motorsport|motocross|mx park|mx track/i,
  /bowling|bowl lanes|strike|spare/i,
  /church|cathedral|chapel of christ|kingdom hall|jehovah|latter.day|assembly of god|baptist|methodist|presbyterian|evangelical|pentecostal|seventh.day|mosque|temple of|synagogue/i,
  /elementary school|middle school|high school|unified school|school district/i,
  /air force base|army base|naval|military|fort ord/i,
  /familysearch/i,
  /haunted|horror|scare|fright/i,
  /go.kart|karting|laser tag|escape room|trampoline|bounce/i,
  /cannabis|dispensary|marijuana|weed/i,
  /auto|car wash|tire|mechanic|dealership/i,
  /storage|warehouse|self.storage/i,
  /funeral|mortuary|cremation/i,
  /hospital|urgent care|medical center|clinic|pharmacy/i,
  /airport|airpark|fly.in/i,
  /covid|vaccine location/i,
];

const DISQUALIFY_TYPE_PATTERNS = [
  "gas_station", "grocery_store", "supermarket", "drugstore", "pharmacy",
  "car_dealer", "car_repair", "car_wash", "parking", "storage",
  "hospital", "doctor", "dentist", "veterinary_care",
  "school", "university", "library",
  "movie_theater", "amusement_park", "zoo", "aquarium",
  "airport", "bus_station", "subway_station", "train_station",
  "funeral_home", "cemetery",
];

function tier1Disqualify(name: string, phone: string | null, website: string | null, primaryPhotoUrl: string | null, googleRating: number | null, googleReviews: number | null): { keep: boolean; reason: string } {
  // Name pattern check
  for (const pattern of DISQUALIFY_NAME_PATTERNS) {
    if (pattern.test(name)) return { keep: false, reason: `name matches: ${pattern}` };
  }

  // Completely empty listings
  if (!phone && !website && !primaryPhotoUrl && (!googleReviews || googleReviews < 3)) {
    return { keep: false, reason: "no contact info, no photo, < 3 reviews" };
  }

  // Very low rated with few reviews
  if (googleRating && googleRating < 3.0 && (googleReviews ?? 0) > 10) {
    return { keep: false, reason: `low rating ${googleRating} with ${googleReviews} reviews` };
  }

  return { keep: true, reason: "" };
}

// ─── Tier 2: AI classification ─────────────────────────────────────────────────

async function tier2Classify(batch: Array<{ id: string; name: string; city: string; venueType: string; description: string | null; styleTags: string[] }>): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  const listText = batch.map((v, i) =>
    `${i + 1}. "${v.name}" in ${v.city} | Type: ${v.venueType} | Tags: ${v.styleTags.slice(0, 3).join(", ")}${v.description ? ` | "${v.description.slice(0, 80)}"` : ""}`
  ).join("\n");

  const prompt = `You are a wedding venue directory editor. For each venue below, decide if it's a LEGITIMATE wedding venue (a place where couples actually host wedding ceremonies or receptions).

INCLUDE: vineyards, estates, ballrooms, gardens, ranches, resorts, hotels, golf clubs, country clubs, historic mansions, event venues that host weddings, parks with wedding permits, restaurants with private event spaces.

EXCLUDE: churches/religious buildings, schools, race tracks, DMV, government offices, shopping centers, car dealers, bowling alleys, hospitals, military bases, storage facilities, cannabis shops, haunted houses, community recreation centers that don't do weddings.

For each venue, reply ONLY with the number and Y or N. Example:
1. Y
2. N
3. Y

Venues:
${listText}`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        max_tokens: 500,
      }),
    });

    if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
    const data = await res.json() as { choices: Array<{ message: { content: string } }> };
    const text = data.choices[0].message.content;

    // Parse "1. Y" or "1. N" lines
    const lines = text.split("\n").filter(l => l.trim());
    for (const line of lines) {
      const match = line.match(/^(\d+)\.\s*([YN])/i);
      if (match) {
        const idx = parseInt(match[1]) - 1;
        const isVenue = match[2].toUpperCase() === "Y";
        if (batch[idx]) results.set(batch[idx].id, isVenue);
      }
    }
  } catch (err) {
    console.error("  AI batch error:", err);
    // On error, keep all (safe default)
    batch.forEach(v => results.set(v.id, true));
  }

  return results;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!OPENROUTER_KEY) throw new Error("OPENROUTER_API_KEY not set");

  const all = await prisma.venue.findMany({
    where: { isPublished: true },
    select: { id: true, name: true, city: true, venueType: true, styleTags: true, description: true, phone: true, website: true, primaryPhotoUrl: true, googleRating: true, googleReviews: true },
  });

  console.log(`\n🔍 Starting quality filter on ${all.length} venues...\n`);

  // ── Tier 1 ──
  console.log("📋 Tier 1: Rule-based filtering...");
  const tier1Keep: typeof all = [];
  const tier1Remove: Array<{ id: string; name: string; reason: string }> = [];

  for (const v of all) {
    const { keep, reason } = tier1Disqualify(v.name, v.phone, v.website, v.primaryPhotoUrl, v.googleRating, v.googleReviews);
    if (keep) {
      tier1Keep.push(v);
    } else {
      tier1Remove.push({ id: v.id, name: v.name, reason });
    }
  }

  console.log(`  ✓ Keep: ${tier1Keep.length}`);
  console.log(`  ✗ Remove: ${tier1Remove.length}`);
  console.log(`\n  Sample removals:`);
  tier1Remove.slice(0, 15).forEach(v => console.log(`    - "${v.name}" (${v.reason})`));

  // Unpublish tier 1 failures
  if (tier1Remove.length > 0) {
    await prisma.venue.updateMany({
      where: { id: { in: tier1Remove.map(v => v.id) } },
      data: { isPublished: false },
    });
    console.log(`\n  ✓ Unpublished ${tier1Remove.length} venues (Tier 1)`);
  }

  // ── Tier 2 ──
  console.log(`\n🤖 Tier 2: AI classification on ${tier1Keep.length} venues...`);
  const BATCH_SIZE = 30;
  const tier2Remove: Array<{ id: string; name: string }> = [];
  let processed = 0;

  for (let i = 0; i < tier1Keep.length; i += BATCH_SIZE) {
    const batch = tier1Keep.slice(i, i + BATCH_SIZE);
    const results = await tier2Classify(batch);

    for (const [id, isVenue] of results) {
      if (!isVenue) {
        const v = batch.find(b => b.id === id);
        if (v) tier2Remove.push({ id, name: v.name });
      }
    }

    processed += batch.length;
    process.stdout.write(`  Progress: ${processed}/${tier1Keep.length} (${tier2Remove.length} flagged so far)\r`);

    // Small delay between batches
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n\n  ✓ Processed: ${tier1Keep.length}`);
  console.log(`  ✗ AI flagged: ${tier2Remove.length}`);
  console.log(`\n  Sample AI removals:`);
  tier2Remove.slice(0, 15).forEach(v => console.log(`    - "${v.name}"`));

  // Unpublish tier 2 failures
  if (tier2Remove.length > 0) {
    await prisma.venue.updateMany({
      where: { id: { in: tier2Remove.map(v => v.id) } },
      data: { isPublished: false },
    });
    console.log(`\n  ✓ Unpublished ${tier2Remove.length} venues (Tier 2)`);
  }

  // Final count
  const final = await prisma.venue.count({ where: { isPublished: true } });
  const removed = all.length - final;
  console.log(`\n✅ Done!`);
  console.log(`   Before: ${all.length}`);
  console.log(`   Removed: ${removed} (${tier1Remove.length} rules + ${tier2Remove.length} AI)`);
  console.log(`   After: ${final} quality venues`);

  // Estimated cost
  const batches = Math.ceil(tier1Keep.length / BATCH_SIZE);
  console.log(`\n💰 Est. AI cost: ~$${(batches * 0.001).toFixed(2)}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async e => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
