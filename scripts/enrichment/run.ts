/**
 * run.ts — Green Bowtie Venue Enrichment Pipeline
 *
 * Discovers venues on The Knot, scrapes their pages, enriches venue
 * websites for policies, and writes everything to DB.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/enrichment/run.ts
 *   DATABASE_URL=... npx tsx scripts/enrichment/run.ts --city livermore --limit 20
 *   DATABASE_URL=... npx tsx scripts/enrichment/run.ts --city "san-francisco" --state california --state-code ca
 *   DATABASE_URL=... npx tsx scripts/enrichment/run.ts --dry-run
 *   DATABASE_URL=... npx tsx scripts/enrichment/run.ts --import-new    # also create new venue records
 *
 * Sources:
 *   1. The Knot  — price, capacity, amenities, coordinator, ratings, style tags
 *   2. Venue website — catering/alcohol policies, social links, BYOB rules
 *   3. Yelp — (future) ratings cross-reference
 */

import { chromium } from 'playwright';
import { parseKnotPage, calcCompletenessScore } from './parse-knot.js';
import { scrapeVenueSite } from './scrape-venue-site.js';
import { upsertVenueEnrichment, disconnect as dbDisconnect } from './upsert-db.js';
import { importNewVenue } from './import-new-venues.js';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter } as any);

// ── CLI args ────────────────────────────────────────────────────────────────
const args: Record<string, string | boolean> = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) {
    const key = a.slice(2);
    if (key.includes('=')) {
      const [k, v] = key.split('='); args[k] = v;
    } else if (argv[i+1] && !argv[i+1].startsWith('--')) {
      args[key] = argv[++i];
    } else {
      args[key] = true;
    }
  }
}

const CITY        = ((args.city as string) || 'livermore').toLowerCase().replace(/\s+/g, '-');
const STATE       = (args.state as string) || 'california';
const STATE_CODE  = (args['state-code'] as string) || 'ca';
const DRY_RUN     = !!args['dry-run'];
const IMPORT_NEW  = !!args['import-new'];
const LIMIT       = args.limit ? parseInt(args.limit as string) : 999;
const DELAY_MS    = 2200;

const CITY_DISPLAY = CITY.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── Fuzzy name matching ──────────────────────────────────────────────────────
/**
 * Check if two venue names refer to the same place.
 * Handles "Garre Winery" vs "Garré Vineyard, Restaurant, & Event Center"
 */
function namesSimilar(a: string, b: string): boolean {
  const normalize = (s: string) => s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(the|at|by|and|&|of|in|on)\b/g, ' ')
    .replace(/\b(winery|vineyard|vineyards|golf|club|event|center|venue|estate|resort|inn|ranch|farm)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;

  // Word overlap — match if 60%+ of the shorter name's words appear in the longer name
  const wordsA = na.split(' ').filter(w => w.length > 2);
  const wordsB = nb.split(' ').filter(w => w.length > 2);
  const shorter = wordsA.length < wordsB.length ? wordsA : wordsB;
  const longer  = wordsA.length < wordsB.length ? wordsB : wordsA;
  if (shorter.length === 0) return false;
  const matched = shorter.filter(w => longer.some(l => l.startsWith(w) || w.startsWith(l)));
  return matched.length / shorter.length >= 0.6;
}

// ── Knot scraping ────────────────────────────────────────────────────────────
// Reuse a single context + page across all scrapes — much faster than open/close per venue
let _sharedCtx: any = null;
let _sharedPage: any = null;

async function getSharedPage(browser: any) {
  if (!_sharedPage) {
    _sharedCtx  = await browser.newContext();
    _sharedPage = await _sharedCtx.newPage();
  }
  return _sharedPage;
}

async function getKnotData(browser: any, url: string) {
  const page = await getSharedPage(browser);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await sleep(800); // shorter delay — domcontentloaded is faster than networkidle
    const text = await page.evaluate(() => document.body.innerText);
    if (!text || text.length < 500) return null;
    return parseKnotPage(text, url);
  } catch { return null; }
  finally { await sleep(DELAY_MS); }
}

async function discoverKnotUrls(browser: any): Promise<Array<{name: string; url: string}>> {
  const stateCode = STATE_CODE.toLowerCase();
  const searchUrl = `https://www.theknot.com/marketplace/wedding-reception-venues-${CITY}-${stateCode}`;
  const ctx  = await browser.newContext();
  const page = await ctx.newPage();

  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(2000);

    // Also handle pagination — click "View more" if present
    try {
      const moreBtn = page.locator('button:has-text("View more"), a:has-text("View more")').first();
      if (await moreBtn.isVisible({ timeout: 2000 })) {
        await moreBtn.click();
        await sleep(2000);
      }
    } catch { /* no "View more" — that's fine */ }

    return await page.evaluate((sc: string) => {
      const seen  = new Set<string>();
      const items: Array<{name: string; url: string}> = [];
      const re    = new RegExp(`/marketplace/[\\w-]+-${sc}-\\d+$`);

      document.querySelectorAll<HTMLAnchorElement>('a[href*="/marketplace/"]').forEach(a => {
        const href = a.href;
        if (!re.test(href) || seen.has(href)) return;
        seen.add(href);
        const card = a.closest('li, article, [class*="card"], [class*="Card"]');
        const nameEl = card?.querySelector('h3,h2,h1,[class*="name"],[class*="Name"]') || a;
        items.push({ url: href, name: nameEl.textContent?.trim().slice(0, 100) || href });
      });

      return items;
    }, stateCode);
  } finally {
    await ctx.close();
  }
}

// ── DB lookup ────────────────────────────────────────────────────────────────
async function getDBVenues() {
  return prisma.venue.findMany({
    where: {
      city:       { equals: CITY_DISPLAY, mode: 'insensitive' },
      stateSlug:  STATE,
      isPublished: true,
    },
    select: { id: true, name: true, slug: true, website: true, completenessScore: true },
    orderBy: [{ completenessScore: 'asc' }, { googleReviews: 'desc' }],
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function getVenueCount(): Promise<number> {
  const result = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Venue"`;
  return Number(result[0].count);
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   Green Bowtie — Venue Enrichment Pipeline           ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n  City:        ${CITY_DISPLAY}, ${STATE.toUpperCase()}`);
  console.log(`  Mode:        ${DRY_RUN ? '🔍 DRY RUN (no DB writes)' : '✍️  LIVE'}`);
  console.log(`  Import new:  ${IMPORT_NEW ? 'YES — will create new venue records' : 'NO'}`);
  console.log(`  Limit:       ${LIMIT} Knot venues\n`);

  // ── Safety: record count before any writes
  const countBefore = await getVenueCount();
  console.log(`  🛡️  Venue count before: ${countBefore}\n`);

  // ── Connect browser
  console.log('Connecting to browser...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  console.log('✓ Browser connected\n');

  // ── Step 1: Discover Knot URLs
  console.log('Step 1: Discovering venues on The Knot...');
  const knotUrls = await discoverKnotUrls(browser);
  console.log(`  Found ${knotUrls.length} venues on The Knot\n`);

  // ── Step 2: Load DB venues
  console.log('Step 2: Loading DB venues...');
  const dbVenues = await getDBVenues();
  console.log(`  Found ${dbVenues.length} venues in DB for ${CITY_DISPLAY}\n`);

  // ── Step 3: Scrape all Knot pages
  console.log('Step 3: Scraping The Knot venue pages...\n');
  const scraped: Array<{ name: string; url: string; knot: any; site: any; dbMatch: any }> = [];

  for (const knotVenue of knotUrls.slice(0, LIMIT)) {
    process.stdout.write(`  [Knot] Scraping...`);
    const knot = await getKnotData(browser, knotVenue.url);
    if (!knot) { console.log(` ✗ ${knotVenue.url.split('/').pop()}`); continue; }

    const name     = knot.name || knotVenue.name || knotVenue.url.split('/').pop() || '?';
    const score    = calcCompletenessScore(knot);
    const dbMatch  = dbVenues.find(v => namesSimilar(v.name, name));

    console.log(
      ` ✓ "${name.slice(0, 40)}"` +
      ` price=$${knot.startingPrice ?? '?'}` +
      ` cap=${knot.guestCapacityMax ?? '?'}` +
      ` score=${score}` +
      (dbMatch ? ` → matched "${dbMatch.name.slice(0,25)}"` : ' → NEW')
    );

    scraped.push({ name, url: knotVenue.url, knot, site: null, dbMatch: dbMatch ?? null });
  }

  // ── Step 4: Scrape venue websites for policies
  console.log('\nStep 4: Scraping venue websites for policies...\n');

  // Collect all websites to scrape: from DB matches + unmatched DB venues
  const websiteTargets = new Map<string, { name: string; website: string; scrapedItem: any }>();

  for (const item of scraped) {
    if (item.dbMatch?.website) {
      websiteTargets.set(item.dbMatch.slug, { name: item.name, website: item.dbMatch.website, scrapedItem: item });
    }
  }
  // Also scrape DB venues that weren't in our Knot scrape
  for (const dbVenue of dbVenues) {
    if (dbVenue.website && !websiteTargets.has(dbVenue.slug)) {
      websiteTargets.set(dbVenue.slug, { name: dbVenue.name, website: dbVenue.website, scrapedItem: null });
    }
  }

  for (const [, target] of websiteTargets) {
    process.stdout.write(`  [Site] ${target.name.slice(0, 45).padEnd(45)}`);
    const site = await scrapeVenueSite(target.website);
    const hasPolicies = !!(site?.cateringPolicy || site?.alcoholPolicy || site?.outsideVendorsPolicy);
    const hasDesc     = !!(site?.description && site.description.length > 50);
    console.log(` ${hasPolicies || hasDesc ? '✓' : '→'} catering=${!!site?.cateringPolicy} alcohol=${!!site?.alcoholPolicy} desc=${hasDesc}`);

    if (site && (hasPolicies || hasDesc)) {
      if (target.scrapedItem) {
        target.scrapedItem.site = site;
      } else {
        // DB-only venue — push with no Knot data
        scraped.push({ name: target.name, url: '', knot: null, site, dbMatch: dbVenues.find(v => v.name === target.name) });
      }
    }
    await sleep(400);
  }

  // ── Step 5: Write to DB
  console.log('\nStep 5: Writing to DB...\n');

  const results: any[] = [];
  let createdCount = 0;

  for (const item of scraped) {
    const cityTitle = CITY_DISPLAY;

    if (item.dbMatch || !IMPORT_NEW) {
      // Update existing
      const result = await upsertVenueEnrichment(
        item.dbMatch?.name || item.name,
        cityTitle,
        STATE,
        item.knot,
        null,
        item.site,
        DRY_RUN,
      );
      results.push(result);
      const icon = result.action === 'updated' ? '✓' : result.action === 'not_found' ? '∅' : '~';
      console.log(
        `  ${icon} ${result.name.slice(0, 42).padEnd(42)}` +
        ` [${result.action}] score=${result.completenessScore}` +
        (result.fieldsUpdated.length > 0 ? ` +${result.fieldsUpdated.length} fields: ${result.fieldsUpdated.slice(0,4).join(', ')}` : '')
      );
    } else if (IMPORT_NEW && item.knot) {
      // Create new record
      const res = await importNewVenue(item.name, item.knot, CITY, STATE, STATE_CODE, DRY_RUN);
      results.push({ ...res, name: item.name });
      if (res.action === 'created') createdCount++;
      const icon = res.action === 'created' ? '🆕' : res.action === 'skipped' ? '~' : '✗';
      console.log(`  ${icon} ${item.name.slice(0, 42).padEnd(42)} [${res.action}] ${res.reason ?? ''}`);
    }
    if (results[results.length - 1]?.error) {
      console.log(`      ERROR: ${results[results.length - 1].error}`);
    }
  }

  // ── Save results
  const outPath = path.join(process.cwd(), `scripts/enrichment/results-${CITY}-${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ city: CITY, state: STATE, results }, null, 2));

  // ── Summary
  const updated   = results.filter(r => r.action === 'updated').length;
  const skipped   = results.filter(r => r.action === 'skipped').length;
  const notFound  = results.filter(r => r.action === 'not_found').length;
  const errors    = results.filter(r => r.action === 'error').length;

  console.log('\n╔══════════════════════════════════════╗');
  console.log(`║  [${CITY_DISPLAY.slice(0,20).padEnd(20)}] SUMMARY   ║`);
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  Updated:   ${String(updated).padEnd(5)} venues           ║`);
  if (createdCount > 0)
    console.log(`║  Created:   ${String(createdCount).padEnd(5)} new venues       ║`);
  console.log(`║  Skipped:   ${String(skipped).padEnd(5)} (already full)   ║`);
  console.log(`║  Not found: ${String(notFound).padEnd(5)} (not in DB)      ║`);
  if (errors > 0)
    console.log(`║  Errors:    ${String(errors).padEnd(5)}                  ║`);
  console.log('╠══════════════════════════════════════╣');
  console.log(`║  score=90+: ${String(results.filter(r => r.completenessScore >= 90).length).padEnd(5)} venues           ║`);
  console.log(`║  score=70+: ${String(results.filter(r => r.completenessScore >= 70).length).padEnd(5)} venues           ║`);
  console.log('╚══════════════════════════════════════╝\n');

  // ── Safety: verify count didn't drop
  if (!DRY_RUN) {
    const countAfter = await getVenueCount();
    const delta = countAfter - countBefore;
    if (countAfter < countBefore) {
      console.error(`\n🚨 SAFETY ALERT: Venue count DROPPED from ${countBefore} → ${countAfter}!`);
      console.error(`   This should never happen during enrichment. Investigate immediately.`);
      process.exit(1);
    } else {
      console.log(`\n  🛡️  Venue count after: ${countAfter} (${delta >= 0 ? '+' : ''}${delta} new)`);
    }
  }

  // Close shared page/context if it was opened
  if (_sharedPage) { try { await _sharedCtx.close(); } catch {} }
  await browser.close();
  await dbDisconnect();
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
