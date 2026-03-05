/**
 * scrape-knot.ts
 * 
 * Discovers Knot listings for a city and scrapes each venue page.
 * Uses the OpenClaw browser (already running on port 18800).
 * 
 * Usage: import and call from run.ts
 */

import { chromium } from 'playwright';
import { parseKnotPage, settingsToStyleTags, calcCompletenessScore } from './parse-knot.js';
import type { KnotData } from './types.js';

const BROWSER_WS = 'ws://127.0.0.1:18800';
const KNOT_BASE  = 'https://www.theknot.com/marketplace';
const DELAY_MS   = 2500; // polite delay between pages

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

/** Connect to the already-running OpenClaw browser via CDP */
async function getBrowser() {
  return chromium.connectOverCDP(`http://127.0.0.1:18800`);
}

/** Discover all venue Knot URLs from the city search page */
export async function discoverKnotVenues(city: string, stateCode: string): Promise<Array<{name: string; url: string; startingPrice?: number; guestRange?: string}>> {
  const searchUrl = `${KNOT_BASE}/wedding-reception-venues-${city.toLowerCase().replace(/\s+/g,'-')}-${stateCode.toLowerCase()}`;
  
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await sleep(2000);

    const venues = await page.evaluate(() => {
      const results: Array<{name: string; url: string; startingPrice?: number; guestRange?: string}> = [];
      const seen = new Set<string>();
      
      document.querySelectorAll<HTMLAnchorElement>('a[href*="/marketplace/"]').forEach(a => {
        const href = a.href;
        if (!href.match(/\/marketplace\/[\w-]+-ca-\d+$/) || seen.has(href)) return;
        seen.add(href);
        
        // Walk up to find the card
        const card = a.closest('li, article, [class*="card"]');
        const text  = card?.textContent || '';
        const priceMatch = text.match(/Starting at \$([\d,]+)/);
        const guestMatch = text.match(/([\d,+]+(?:\s*-\s*[\d,+]+)?)\s*[Gg]uests?/);
        
        results.push({
          url:  href,
          name: (card?.querySelector('h3, h2') || a).textContent?.trim().slice(0, 80) || href,
          startingPrice: priceMatch ? parseInt(priceMatch[1].replace(/,/g,'')) : undefined,
          guestRange: guestMatch?.[1],
        });
      });
      
      return results;
    });

    console.log(`  Found ${venues.length} venues on Knot for ${city}, ${stateCode}`);
    return venues;

  } finally {
    await context.close();
  }
}

/** Scrape a single Knot venue page and return parsed data */
export async function scrapeKnotVenue(url: string): Promise<KnotData | null> {
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(1500);

    const text = await page.evaluate(() => document.body.innerText);
    if (!text || text.length < 500) {
      console.log(`    ⚠ Page too short (${text?.length} chars) — venue may not be on Knot`);
      return null;
    }

    return parseKnotPage(text, url);

  } catch (e) {
    console.error(`    ✗ Error scraping ${url}:`, e);
    return null;
  } finally {
    await context.close();
    await sleep(DELAY_MS);
  }
}

/** Scrape all venues for a city from Knot */
export async function scrapeKnotCity(city: string, stateCode: string): Promise<Map<string, KnotData>> {
  console.log(`\n🔍 Scraping Knot for ${city}, ${stateCode}...`);
  
  const venues = await discoverKnotVenues(city, stateCode);
  const results = new Map<string, KnotData>();

  for (const venue of venues) {
    console.log(`  → ${venue.name}`);
    const data = await scrapeKnotVenue(venue.url);
    if (data) {
      const score = calcCompletenessScore(data);
      console.log(`    ✓ price=$${data.startingPrice ?? '?'} cap=${data.guestCapacityMax ?? '?'} score=${score}`);
      results.set(venue.url, data);
    }
  }

  return results;
}

export { settingsToStyleTags, calcCompletenessScore };
