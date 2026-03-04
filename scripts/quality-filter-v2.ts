/**
 * quality-filter-v2.ts
 * Stricter second pass. Targets venues that passed v1 but are clearly garbage.
 * Uses a more aggressive prompt focused on wedding intent.
 */

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

// Additional name-based rules we missed in v1
const ADDITIONAL_BAD_PATTERNS = [
  /golf simulator|simulator/i,
  /driving range/i,
  /skate|skateboard/i,
  /paintball|airsoft/i,
  /gun range|shooting range|firearms/i,
  /rv park|campground|camping|trailer park/i,
  /swap meet|flea market/i,
  /laundromat|laundry/i,
  /dollar tree|dollar general|walmart|target|costco|walgreens|cvs/i,
  /urgent care|emergency room|dialysis|rehab center/i,
  /halfway house|transitional|sober living/i,
  /dog park|animal shelter|kennel/i,
  /junkyard|salvage|auto parts/i,
  /prison|correctional|detention/i,
  /community center(?!.*event|.*wedding|.*banquet)/i,
  /recreation center(?!.*event|.*wedding)/i,
  /senior center|adult day/i,
  /food bank|soup kitchen/i,
  /post office|dmv|social security/i,
  /courthouse(?!.*garden)/i,
  /fire station|police station/i,
  /library(?!.*event)/i,
];

async function tier2StrictClassify(batch: Array<{ id: string; name: string; city: string; venueType: string; description: string | null }>): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  const listText = batch.map((v, i) =>
    `${i + 1}. "${v.name}" — ${v.city}${v.description ? ` ("${v.description.slice(0, 60)}")` : ""}`
  ).join("\n");

  const prompt = `You are a strict wedding venue directory editor. Your job is to REJECT anything that is not a real, dedicated wedding and event venue.

KEEP only:
- Vineyards, wineries, estates, ranches, barns specifically set up for weddings
- Hotels and resorts with dedicated wedding/banquet facilities
- Golf clubs and country clubs with event spaces (NOT driving ranges or simulators)
- Historic mansions, gardens, parks with wedding permits
- Dedicated event centers and banquet halls
- Restaurants with private dining rooms marketed for weddings
- Beaches, outdoor spaces specifically used for weddings

REJECT clearly:
- Golf simulators, driving ranges
- Community centers, recreation centers, senior centers
- Sports venues, stadiums, arenas
- Government buildings (DMV, courts, post office)
- Shopping centers, retail stores
- Medical facilities
- Schools, universities (unless historic venue)
- Religious buildings (churches, temples)
- Industrial facilities
- Campgrounds, RV parks
- Anything that is clearly NOT a wedding destination

Be STRICT. If you're not sure it's a wedding venue, reject it. We want quality over quantity.

For each venue, reply ONLY with number and Y (keep) or N (reject):
1. Y
2. N

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
        max_tokens: 600,
      }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    const data = await res.json() as { choices: Array<{ message: { content: string } }> };
    const text = data.choices[0].message.content;

    const lines = text.split("\n").filter(l => l.trim());
    for (const line of lines) {
      const match = line.match(/^(\d+)\.\s*([YN])/i);
      if (match) {
        const idx = parseInt(match[1]) - 1;
        const keep = match[2].toUpperCase() === "Y";
        if (batch[idx]) results.set(batch[idx].id, keep);
      }
    }
  } catch (err) {
    console.error("  Batch error:", err);
    batch.forEach(v => results.set(v.id, true)); // safe default: keep
  }

  return results;
}

async function main() {
  if (!OPENROUTER_KEY) throw new Error("OPENROUTER_API_KEY not set");

  const all = await prisma.venue.findMany({
    where: { isPublished: true },
    select: { id: true, name: true, city: true, venueType: true, description: true },
    orderBy: { name: "asc" },
  });

  console.log(`\n🔍 Starting strict quality pass on ${all.length} venues...\n`);

  // Rule-based pre-filter (additional patterns)
  const ruleRemove: Array<{ id: string; name: string }> = [];
  const remaining: typeof all = [];

  for (const v of all) {
    let bad = false;
    for (const pattern of ADDITIONAL_BAD_PATTERNS) {
      if (pattern.test(v.name)) { bad = true; break; }
    }
    if (bad) ruleRemove.push({ id: v.id, name: v.name });
    else remaining.push(v);
  }

  console.log(`📋 Additional rules: removing ${ruleRemove.length}`);
  ruleRemove.slice(0, 20).forEach(v => console.log(`    - "${v.name}"`));

  if (ruleRemove.length > 0) {
    await prisma.venue.updateMany({
      where: { id: { in: ruleRemove.map(v => v.id) } },
      data: { isPublished: false },
    });
  }

  // Strict AI pass
  console.log(`\n🤖 Strict AI pass on ${remaining.length} venues...`);
  const BATCH_SIZE = 25;
  const aiRemove: Array<{ id: string; name: string }> = [];
  let processed = 0;

  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = remaining.slice(i, i + BATCH_SIZE);
    const results = await tier2StrictClassify(batch);

    for (const [id, keep] of results) {
      if (!keep) {
        const v = batch.find(b => b.id === id);
        if (v) aiRemove.push({ id, name: v.name });
      }
    }

    processed += batch.length;
    process.stdout.write(`  ${processed}/${remaining.length} (${aiRemove.length} flagged)\r`);
    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\n\n  AI flagged: ${aiRemove.length}`);
  console.log(`\n  Sample removals:`);
  aiRemove.slice(0, 25).forEach(v => console.log(`    - "${v.name}"`));

  if (aiRemove.length > 0) {
    await prisma.venue.updateMany({
      where: { id: { in: aiRemove.map(v => v.id) } },
      data: { isPublished: false },
    });
  }

  const final = await prisma.venue.count({ where: { isPublished: true } });
  console.log(`\n✅ Done!`);
  console.log(`   Before: ${all.length}`);
  console.log(`   Rule removals: ${ruleRemove.length}`);
  console.log(`   AI removals: ${aiRemove.length}`);
  console.log(`   After: ${final} venues`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async e => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
