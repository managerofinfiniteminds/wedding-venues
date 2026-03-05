/**
 * scrape-yelp.ts
 * Finds Yelp listings for venues and extracts ratings + review signals.
 */

import { chromium } from 'playwright';
import type { YelpData } from './types.js';

const BROWSER_WS = 'http://127.0.0.1:18800';
const DELAY_MS   = 2000;

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function getBrowser() {
  return chromium.connectOverCDP(BROWSER_WS);
}

/** Search Yelp for a venue by name + city and return first match */
export async function findYelpVenue(venueName: string, city: string, state: string): Promise<{ url: string; name: string } | null> {
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  const query = encodeURIComponent(`${venueName} wedding venue`);
  const loc   = encodeURIComponent(`${city}, ${state}`);
  const searchUrl = `https://www.yelp.com/search?find_desc=${query}&find_loc=${loc}`;

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2000);

    const match = await page.evaluate((name) => {
      const links = [...document.querySelectorAll<HTMLAnchorElement>('a[href*="/biz/"]')];
      for (const link of links) {
        const text = link.textContent?.trim() || '';
        // Fuzzy match — check if any significant word from the venue name appears
        const words = name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const textLower = text.toLowerCase();
        if (words.some(w => textLower.includes(w))) {
          return { url: link.href, name: text };
        }
      }
      return null;
    }, venueName);

    return match;
  } catch (e) {
    console.error(`  Yelp search error for ${venueName}:`, e);
    return null;
  } finally {
    await context.close();
    await sleep(DELAY_MS);
  }
}

/** Scrape a Yelp business page for venue details */
export async function scrapeYelpVenue(url: string): Promise<YelpData | null> {
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2000);

    const data = await page.evaluate(() => {
      const text = document.body.innerText;
      const result: YelpData = { yelpUrl: window.location.href };

      // Name
      result.name = document.querySelector('h1')?.textContent?.trim();

      // Rating
      const ratingMatch = text.match(/(\d+\.\d+)\s*star rating/i) 
                       || text.match(/(\d+\.\d+)\s*\(\d+\)/);
      if (ratingMatch) result.yelpRating = parseFloat(ratingMatch[1]);

      // Review count
      const reviewMatch = text.match(/([\d,]+)\s*reviews?/i);
      if (reviewMatch) result.yelpReviews = parseInt(reviewMatch[1].replace(/,/g, ''));

      // Categories
      const categoryEls = document.querySelectorAll('[class*="category"] a, [href*="category"]');
      result.yelpCategories = [...new Set(
        [...categoryEls].map(el => el.textContent?.trim()).filter(Boolean) as string[]
      )].slice(0, 5);

      // Price level
      const priceMatch = text.match(/Price range:\s*(\$+)/i) 
                      || text.match(/(\$\$?\$?\$?)\s*·/);
      if (priceMatch) result.priceLevel = priceMatch[1];

      // Review highlights — grab first 3 review snippets
      const reviews = [...document.querySelectorAll('[class*="review"] p, [class*="comment"] p')]
        .map(el => el.textContent?.trim())
        .filter(t => t && t.length > 30 && t.length < 300) as string[];
      result.reviewHighlights = reviews.slice(0, 3);

      return result;
    });

    return data;
  } catch (e) {
    console.error(`  Yelp scrape error for ${url}:`, e);
    return null;
  } finally {
    await context.close();
    await sleep(DELAY_MS);
  }
}

/** Convenience: find + scrape Yelp in one call */
export async function getYelpData(venueName: string, city: string, state: string): Promise<YelpData | null> {
  console.log(`    [Yelp] Searching for "${venueName}"...`);
  const match = await findYelpVenue(venueName, city, state);
  if (!match) {
    console.log(`    [Yelp] Not found`);
    return null;
  }
  console.log(`    [Yelp] Found: ${match.url}`);
  return scrapeYelpVenue(match.url);
}
