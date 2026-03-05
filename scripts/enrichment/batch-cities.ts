/**
 * batch-cities.ts
 * 
 * Run enrichment across multiple cities in sequence.
 * Prioritizes cities with the most incomplete data.
 * 
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/enrichment/batch-cities.ts
 *   DATABASE_URL=... npx tsx scripts/enrichment/batch-cities.ts --state california
 *   DATABASE_URL=... npx tsx scripts/enrichment/batch-cities.ts --dry-run
 */

import { execSync } from 'child_process';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter } as any);

// Parse args
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

const STATE_FILTER = args.state as string | undefined;
const DRY_RUN      = !!args['dry-run'];
const LIMIT_CITIES = args['limit-cities'] ? parseInt(args['limit-cities'] as string) : 20;
const VENUES_PER_CITY = args['venues-per-city'] ? parseInt(args['venues-per-city'] as string) : 30;

/** Get cities sorted by average completeness score (ascending = worst first) */
async function getCitiesToEnrich() {
  const where = STATE_FILTER ? { stateSlug: STATE_FILTER, isPublished: true } : { isPublished: true };
  
  const cities = await prisma.venue.groupBy({
    by: ['city', 'stateSlug'],
    where,
    _avg: { completenessScore: true },
    _count: { id: true },
    orderBy: [{ _avg: { completenessScore: 'asc' } }],
    take: LIMIT_CITIES,
  });

  return cities.map(c => ({
    city: c.city,
    stateSlug: c.stateSlug,
    venueCount: c._count.id,
    avgScore: Math.round(c._avg.completenessScore || 0),
  }));
}

/** Map state slug to 2-letter code */
const STATE_CODES: Record<string, string> = {
  california: 'ca', texas: 'tx', 'new-york': 'ny', florida: 'fl',
  illinois: 'il', washington: 'wa', colorado: 'co', arizona: 'az',
  georgia: 'ga', nevada: 'nv', oregon: 'or', 'north-carolina': 'nc',
  'new-jersey': 'nj', virginia: 'va', massachusetts: 'ma',
  pennsylvania: 'pa', ohio: 'oh', michigan: 'mi', minnesota: 'mn',
  missouri: 'mo', wisconsin: 'wi', maryland: 'md', indiana: 'in',
  tennessee: 'tn', 'south-carolina': 'sc', louisiana: 'la',
  alabama: 'al', kentucky: 'ky', oklahoma: 'ok', kansas: 'ks',
  iowa: 'ia', arkansas: 'ar', utah: 'ut', 'new-mexico': 'nm',
  idaho: 'id', montana: 'mt', wyoming: 'wy', 'north-dakota': 'nd',
  'south-dakota': 'sd', nebraska: 'ne', 'west-virginia': 'wv',
  connecticut: 'ct', 'rhode-island': 'ri', 'new-hampshire': 'nh',
  vermont: 'vt', maine: 'me', alaska: 'ak', hawaii: 'hi',
  delaware: 'de', mississippi: 'ms', 'district-of-columbia': 'dc',
  'puerto-rico': 'pr',
};

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   Green Bowtie — Batch City Enrichment               ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const cities = await getCitiesToEnrich();
  
  console.log(`Found ${cities.length} cities to enrich (sorted by completeness ↑):\n`);
  cities.forEach((c, i) => {
    console.log(`  ${String(i+1).padStart(2)}. ${c.city.padEnd(25)} ${c.stateSlug.padEnd(20)} venues=${c.venueCount} avgScore=${c.avgScore}%`);
  });
  console.log();

  const runLog: Array<{ city: string; state: string; result: string }> = [];
  const logPath = path.join(process.cwd(), `scripts/enrichment/batch-run-${Date.now()}.log`);

  for (const { city, stateSlug } of cities) {
    const stateCode = STATE_CODES[stateSlug] || stateSlug.slice(0, 2);
    const citySlug  = city.toLowerCase().replace(/\s+/g, '-');

    console.log(`\n─── ${city}, ${stateSlug.toUpperCase()} ──────────────────────────────`);

    try {
      const cmd = [
        `cd ${process.cwd()}`,
        `DATABASE_URL="${process.env.DATABASE_URL}"`,
        `npx tsx scripts/enrichment/run.ts`,
        `--city "${citySlug}"`,
        `--state "${stateSlug}"`,
        `--state-code "${stateCode}"`,
        `--limit ${VENUES_PER_CITY}`,
        DRY_RUN ? '--dry-run' : '',
        '--import-new', // also import venues not yet in DB
      ].filter(Boolean).join(' ');

      const output = execSync(cmd, {
        env: { ...process.env },
        timeout: 300000,
        encoding: 'utf8',
      });

      // Extract summary line
      const summary = output.match(/Updated:\s+\d+.*?Not found:\s+\d+/s)?.[0]?.replace(/\s+/g, ' ') || 'done';
      console.log(`  ✓ ${summary}`);
      runLog.push({ city, state: stateSlug, result: summary });

    } catch (e: any) {
      const err = e.message?.slice(0, 100) || String(e);
      console.error(`  ✗ Error: ${err}`);
      runLog.push({ city, state: stateSlug, result: `ERROR: ${err}` });
    }

    // Polite delay between cities
    await new Promise(r => setTimeout(r, 3000));
  }

  // Write log
  fs.writeFileSync(logPath, JSON.stringify({ cities, runLog, ts: new Date() }, null, 2));

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   BATCH COMPLETE                              ║');
  console.log(`║   Log: ${path.basename(logPath)}  ║`);
  console.log('╚══════════════════════════════════════════════╝\n');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
