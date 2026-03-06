
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import minimist from 'minimist';
import { setTimeout as sleep } from 'node:timers/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CDP_URL = 'http://127.0.0.1:18800';
const KNOT_BASE_URL = 'https://www.theknot.com/marketplace/wedding-reception-venues-';

const STATE_CODES: Record<string, string> = {
  'California': 'ca', 'Texas': 'tx', 'New York': 'ny', 'Florida': 'fl', 'North Carolina': 'nc',
  'Georgia': 'ga', 'Illinois': 'il', 'Washington': 'wa', 'Tennessee': 'tn', 'Colorado': 'co',
  'Arizona': 'az', 'Michigan': 'mi', 'Pennsylvania': 'pa', 'Missouri': 'mo', 'Virginia': 'va',
  'Ohio': 'oh', 'New Jersey': 'nj', 'Minnesota': 'mn', 'Wisconsin': 'wi', 'Maryland': 'md',
  'Indiana': 'in', 'South Carolina': 'sc', 'Louisiana': 'la', 'Alabama': 'al', 'Kentucky': 'ky',
  'Oklahoma': 'ok', 'Kansas': 'ks', 'Iowa': 'ia', 'Arkansas': 'ar', 'Utah': 'ut', 'Nevada': 'nv',
  'Oregon': 'or', 'New Mexico': 'nm', 'Idaho': 'id', 'Montana': 'mt', 'Wyoming': 'wy',
  'North Dakota': 'nd', 'South Dakota': 'sd', 'Nebraska': 'ne', 'West Virginia': 'wv',
  'Connecticut': 'ct', 'Rhode Island': 'ri', 'New Hampshire': 'nh', 'Vermont': 'vt',
  'Maine': 'me', 'Alaska': 'ak', 'Hawaii': 'hi', 'Delaware': 'de', 'Mississippi': 'ms',
  'Massachusetts': 'ma', 'DC': 'dc', 'Puerto Rico': 'pr'
};

function namesSimilar(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9s]/g, ' ').replace(/\b(the|at|by|and|&|of|in|on|winery|vineyard|vineyards|golf|club|event|center|venue|estate|resort|inn|ranch|farm)\b/g, ' ').replace(/\s+/g, ' ').trim();
  const na = norm(a), nb = norm(b);
  if (na === nb || na.includes(nb) || nb.includes(na)) return true;
  const wa = na.split(' ').filter(w => w.length > 2), wb = nb.split(' ').filter(w => w.length > 2);
  const [sh, lo] = wa.length < wb.length ? [wa, wb] : [wb, wa];
  if (!sh.length) return false;
  return sh.filter(w => lo.some(l => l.startsWith(w) || w.startsWith(l))).length / sh.length >= 0.6;
}

interface CityStats {
  city: string;
  state: string;
  cnt: number;
}

interface KnotVenueData {
  name: string;
  price: string | null;
  guestRange: string | null;
  url: string;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const PHASE2_STATE_FILE = path.join(__dirname, 'phase2-state.json');
const PHASE2_PROBLEMS_FILE = path.join(__dirname, 'phase2-problems.jsonl');

async function loadProcessedCities(): Promise<Set<string>> {
  if (existsSync(PHASE2_STATE_FILE)) {
    const content = await fs.readFile(PHASE2_STATE_FILE, 'utf-8');
    return new Set(JSON.parse(content));
  }
  return new Set();
}

async function saveProcessedCities(processedCities: Set<string>) {
  await fs.writeFile(PHASE2_STATE_FILE, JSON.stringify(Array.from(processedCities), null, 2), 'utf-8');
}

async function appendProblemCity(city: string, state: string, error: string) {
  const problem = { city, state, error, ts: new Date().toISOString() };
  await fs.appendFile(PHASE2_PROBLEMS_FILE, JSON.stringify(problem) + '\\n', 'utf-8');
}

async function run() {
  const argv = minimist(process.argv.slice(2));
  const targetStateCLI = argv.state ? argv.state.toLowerCase() : null;
  const resume = argv.resume;
  const dryRun = argv['dry-run'];
  const limitCities = argv.limit ? parseInt(argv.limit, 10) : 0;

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let processedCities = await loadProcessedCities();
  let currentProcessedBatch = new Set<string>(); // Keep track of cities processed in this run for potential resume

  const gracefulExit = async () => {
    console.log('\\n[phase2] Caught SIGINT. Saving state and closing browser...');
    await saveProcessedCities(processedCities); // Save all accumulated processed cities
    if (browser) await browser.close();
    if (prisma) await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', gracefulExit);
  process.on('SIGTERM', gracefulExit);

  try {
    console.log('[phase2] Connecting to Playwright CDP at %s', CDP_URL);
    browser = await chromium.connectOverCDP(CDP_URL);
    context = await browser.newContext(); // Single shared context
    page = await context.newPage(); // Single shared page

    const citiesInDb: CityStats[] = await prisma.$queryRaw<CityStats[]>`
      SELECT city, state, COUNT(*) as cnt FROM "Venue" WHERE "isPublished"=true GROUP BY city, state ORDER BY cnt DESC;
    `;

    console.log(`[phase2] Found ${citiesInDb.length} distinct cities in DB.`);

    let cityCount = 0;
    for (const cityStat of citiesInDb) {
      if (limitCities > 0 && cityCount >= limitCities) {
        console.log(`[phase2] Reached city limit of ${limitCities}. Exiting.`);
        break;
      }

      const cityStateKey = `${cityStat.city}|${cityStat.state}`;
      const stateCode = STATE_CODES[cityStat.state];

      if (!stateCode) {
        console.warn(`[phase2] Skipping city ${cityStat.city}, ${cityStat.state}: Unknown state code.`);
        await appendProblemCity(cityStat.city, cityStat.state, 'Unknown state code');
        processedCities.add(cityStateKey);
        currentProcessedBatch.add(cityStateKey);
        continue;
      }

      if (processedCities.has(cityStateKey) && resume) {
        console.log(`[phase2] Skipping city ${cityStat.city}, ${cityStat.state} (already processed and --resume active).`);
        continue;
      } else if (processedCities.has(cityStateKey) && !resume) {
        console.log(`[phase2] Skipping city ${cityStat.city}, ${cityStat.state} (already processed). Use --resume to re-process.`);
        continue;
      }


      cityCount++;
      const citySlug = cityStat.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-/,'').replace(/-\s*$/,'');
      const knotUrl = `${KNOT_BASE_URL}${citySlug}-${stateCode}`;

      console.log(`[phase2] Processing city ${cityCount}/${citiesInDb.length} | ${cityStat.city}, ${cityStat.state} (${cityStateKey}) | URL: ${knotUrl}`);

      let knotVenues: KnotVenueData[] = [];
      try {
        if (!page) throw new Error("Playwright page not initialized.");
        await page.goto(knotUrl, { waitUntil: 'domcontentloaded' });
        await sleep(1200);

        // Extract unique venue URLs from page
        const venueUrls: string[] = await page.evaluate(() => {
          const seen = new Set<string>();
          const results: string[] = [];
          document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(a => {
            if (/\/marketplace\/[\w-]+-[a-z]{2}-\d+$/.test(a.href) && !seen.has(a.href)) {
              seen.add(a.href);
              results.push(a.href);
            }
          });
          return results;
        });

        // Parse all pricing/name/guest data from innerText (The Knot renders all visible text)
        const pageText: string = await page.evaluate(() => document.body.innerText);

        // Pattern: "VenueName\nStarting at $X,XXX\nXX-XX Guests•Type"
        const cardPattern = /^(.+?)\nStarting at \$([\d,]+)\n([\d,+\-\u2013 ]+Guests?)/gm;
        const nameToPrice = new Map<string, {price: number; guests: string}>();
        let m: RegExpExecArray | null;
        while ((m = cardPattern.exec(pageText)) !== null) {
          const name = m[1].trim();
          const price = parseInt(m[2].replace(/,/g, ''));
          const guests = m[3].trim();
          if (name && price) nameToPrice.set(name.toLowerCase(), { price, guests });
        }

        // Build venue list from URLs, enrich with pricing from text
        knotVenues = venueUrls.map(url => {
          // Derive name from slug: "firehouse-chicago-chicago-il-609137" → "Firehouse Chicago"
          const slug = url.split('/').pop() || '';
          const nameParts = slug.replace(/-[a-z]{2}-\d+$/, '').replace(/-/g, ' ');
          const nameFromSlug = nameParts.replace(/\b\w/g, c => c.toUpperCase());
          // Try to find exact match in parsed text
          const matched = [...nameToPrice.entries()].find(([k]) => 
            k.includes(nameParts.slice(0, 8)) || nameParts.includes(k.slice(0, 8))
          );
          return {
            name: nameFromSlug,
            price: matched ? `$${matched[1].price.toLocaleString()}` : null,
            guestRange: matched ? matched[1].guests : null,
            url,
          };
        }).filter(v => v.name.length > 2);
        console.log(`[phase2] Found ${knotVenues.length} potential venues on Knot page.`);

      } catch (e: any) {
        console.error(`[phase2] Error navigating or scraping ${knotUrl}: ${e.message}`);
        await appendProblemCity(cityStat.city, cityStat.state, e.message);
        processedCities.add(cityStateKey);
        currentProcessedBatch.add(cityStateKey);
        await saveProcessedCities(processedCities);
        await sleep(5000);
        continue;
      }

      if (knotVenues.length === 0) {
        console.log(`[phase2] No venues found on Knot page for ${cityStat.city}, ${cityStat.state}.`);
        await appendProblemCity(cityStat.city, cityStat.state, 'No venues found on page');
        processedCities.add(cityStateKey);
        currentProcessedBatch.add(cityStateKey);
        await saveProcessedCities(processedCities);
        await sleep(5000);
        continue;
      }

      const dbVenues = await prisma.venue.findMany({
        where: { city: cityStat.city, state: cityStat.state, isPublished: true },
        select: { id: true, name: true, baseRentalMin: true, completenessScore: true }
      });

      let matchedCount = 0;
      let updatedCount = 0;

      for (const knotVenue of knotVenues) {
        for (const dbVenue of dbVenues) {
          if (namesSimilar(knotVenue.name, dbVenue.name)) {
            matchedCount++;
            let needsUpdate = false;
            const updateData: any = {};

            if (knotVenue.price && dbVenue.baseRentalMin === null) {
              const priceValue = parseInt(knotVenue.price.replace(/[^0-9]/g, ''), 10);
              if (!isNaN(priceValue)) {
                updateData.baseRentalMin = priceValue;
                needsUpdate = true;
              }
            }

            // Always update completenessScore to the maximum
            const newCompletenessScore = Math.max(dbVenue.completenessScore || 0, 10); // Example: give 10 points for finding on Knot
            if (newCompletenessScore > (dbVenue.completenessScore || 0)) {
              updateData.completenessScore = newCompletenessScore;
              needsUpdate = true;
            }

            if (needsUpdate && !dryRun) {
              await prisma.venue.update({
                where: { id: dbVenue.id },
                data: updateData
              });
              updatedCount++;
            }
            break;
          }
        }
      }
      console.log(`[phase2] city ${cityCount}/${citiesInDb.length} | ${cityStat.city}, ${cityStat.state} | found: ${knotVenues.length} knot | matched: ${matchedCount} | updated: ${updatedCount}`);

      processedCities.add(cityStateKey);
      currentProcessedBatch.add(cityStateKey);
      await saveProcessedCities(processedCities); // Save state after each city
      await sleep(5000); // Polite delay — 5s to avoid Cloudflare rate limiting
    }
  } catch (error: any) {
    console.error('[phase2] Fatal error:', error);
  } finally {
    console.log('[phase2] Enrichment complete or interrupted. Closing browser and DB connection.');
    await saveProcessedCities(processedCities); // Final save
    if (browser) {
      await browser.close();
      console.log('[phase2] Browser closed.');
    }
    if (prisma) {
      await prisma.$disconnect();
      console.log('[phase2] Prisma client disconnected.');
    }
    process.exit(0);
  }
}

run();
