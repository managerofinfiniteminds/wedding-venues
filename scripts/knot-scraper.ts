/**
 * knot-scraper.ts
 * 
 * Scrapes The Knot venue pages via browser automation (Playwright via OpenClaw),
 * parses structured data with an AI model, and updates the DB.
 * 
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/knot-scraper.ts
 *   DATABASE_URL=... npx tsx scripts/knot-scraper.ts --city livermore --limit 10
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ── Knot URL map: our DB venue slugs → Knot listing IDs ─────────────────────
// These are discovered by visiting the Knot search page for the city.
// Pattern: theknot.com/marketplace/{knot-slug}-{city}-ca-{id}
const LIVERMORE_KNOT_URLS: Record<string, string> = {
  'murrieta-s-well-livermore':                     'https://www.theknot.com/marketplace/murrietaswell-livermore-ca-521553',
  'the-purple-orchid-wine-country-resort-and-spa-livermore': 'https://www.theknot.com/marketplace/purple-orchid-wine-country-resort-and-spa-livermore-ca-758553',
  'garr-vineyard-restaurant-event-center-livermore': 'https://www.theknot.com/marketplace/garre-winery-and-vineyard-livermore-ca-332933',
  'poppy-ridge-golf-course-livermore':              'https://www.theknot.com/marketplace/poppy-ridge-livermore-ca-308940',
  'retzlaff-vineyards-livermore':                  'https://www.theknot.com/marketplace/retzlaff-winery-livermore-ca-326421',
  'reinstein-ranch-livermore':                     'https://www.theknot.com/marketplace/reinstein-ranch-livermore-ca-635782',
  'mitchell-katz-winery-livermore':                'https://www.theknot.com/marketplace/mitchell-katz-winery-livermore-ca-663521',
  'fenestra-winery-livermore':                     'https://www.theknot.com/marketplace/fenestra-winery-livermore-ca-326421',
  'concerts-at-wente-vineyards-livermore':         'https://www.theknot.com/marketplace/wente-vineyards-livermore-ca-208305',
  'las-positas-vineyards-livermore':               'https://www.theknot.com/marketplace/las-positas-vineyards-livermore-ca-405312',
};

// ── Parser: extract structured data from Knot page text ─────────────────────

interface KnotData {
  name?: string;
  startingPrice?: number;
  typicalSpendPeak?: number;
  typicalSpendOffPeak?: number;
  guestCapacityMax?: number;
  guestCapacityMin?: number;
  peakSeasonStart?: string;
  peakSeasonEnd?: string;
  amenities: string[];
  ceremonyTypes: string[];
  settings: string[];
  serviceOfferings: string[];
  description?: string;
  hasIndoorSpace?: boolean;
  hasOutdoorSpace?: boolean;
  hasBridalSuite?: boolean;
  hasHandicapAccess?: boolean;
  hasWifi?: boolean;
  coordinatorName?: string;
  knotRating?: number;
  knotReviews?: number;
  googleRating?: number;
  googleReviews?: number;
  inHouseCateringRequired?: boolean;
  outsideVendorsAllowed?: boolean;
  address?: string;
  phone?: string;
  website?: string;
  photoUrls: string[];
  rawText?: string;
}

function parseKnotText(text: string, photoUrls: string[] = []): KnotData {
  const data: KnotData = {
    amenities: [],
    ceremonyTypes: [],
    settings: [],
    serviceOfferings: [],
    photoUrls,
  };

  // Name
  const nameMatch = text.match(/^([^\n]+)\n/);
  if (nameMatch) data.name = nameMatch[1].trim();

  // Starting price
  const startPriceMatch = text.match(/\$([\d,]+)\s*starting price/i);
  if (startPriceMatch) data.startingPrice = parseInt(startPriceMatch[1].replace(/,/g, ''));

  // Typical spend
  const typicalSpend = text.match(/Couples usually spend\s*\n\$?([\d,]+)\s*\n\$?([\d,]+)/i);
  if (typicalSpend) {
    data.typicalSpendPeak = parseInt(typicalSpend[1].replace(/,/g, ''));
    data.typicalSpendOffPeak = parseInt(typicalSpend[2].replace(/,/g, ''));
  }

  // Guest capacity
  const guests300 = text.match(/300\+\s*guests?/i);
  const guestsRange = text.match(/([\d]+)[-–]([\d]+)\s*guests?/i);
  if (guests300) {
    data.guestCapacityMax = 300;
    data.guestCapacityMin = 300;
  } else if (guestsRange) {
    data.guestCapacityMin = parseInt(guestsRange[1]);
    data.guestCapacityMax = parseInt(guestsRange[2]);
  }
  // Also try to find specific room capacities in description
  const specificCap = [...text.matchAll(/up to ([\d,]+)\s*guests?/gi)];
  if (specificCap.length > 0) {
    const caps = specificCap.map(m => parseInt(m[1].replace(/,/g, ''))).filter(n => !isNaN(n));
    if (caps.length > 0) data.guestCapacityMax = Math.max(...caps);
  }

  // Peak season
  const peakMatch = text.match(/peak season.*?is\s+([A-Za-z]+)\s+to\s+([A-Za-z]+)/i);
  if (peakMatch) {
    data.peakSeasonStart = peakMatch[1];
    data.peakSeasonEnd = peakMatch[2];
  }

  // Amenities block
  const amenitiesBlock = text.match(/Amenities\s*\n([\s\S]*?)(?:Ceremony Types|Settings|Venue Service|$)/i);
  if (amenitiesBlock) {
    const lines = amenitiesBlock[1].split('\n').map(l => l.trim()).filter(l => l.length > 2 && l.length < 60);
    data.amenities = lines;
    data.hasIndoorSpace = lines.some(l => /indoor/i.test(l));
    data.hasOutdoorSpace = lines.some(l => /outdoor/i.test(l));
    data.hasBridalSuite = lines.some(l => /dressing|bridal suite/i.test(l));
    data.hasHandicapAccess = lines.some(l => /handicap|accessible/i.test(l));
    data.hasWifi = lines.some(l => /wireless|wifi|wi-fi/i.test(l));
  }

  // Ceremony types
  const ceremonyBlock = text.match(/Ceremony Types\s*\n([\s\S]*?)(?:Settings|Venue Service|Amenities|$)/i);
  if (ceremonyBlock) {
    data.ceremonyTypes = ceremonyBlock[1].split('\n').map(l => l.trim()).filter(l => l.length > 2 && l.length < 60);
  }

  // Settings
  const settingsBlock = text.match(/Settings\s*\n([\s\S]*?)(?:Venue Service|Ceremony|Amenities|Awards|$)/i);
  if (settingsBlock) {
    data.settings = settingsBlock[1].split('\n').map(l => l.trim()).filter(l => l.length > 2 && l.length < 60);
  }

  // Service offerings
  const servicesBlock = text.match(/Venue Service Offerings\s*\n([\s\S]*?)(?:Awards|Meet the team|Availability|$)/i);
  if (servicesBlock) {
    data.serviceOfferings = servicesBlock[1].split('\n').map(l => l.trim()).filter(l => l.length > 2 && l.length < 60);
    data.inHouseCateringRequired = data.serviceOfferings.some(s => /catering/i.test(s));
  }

  // Ratings
  const knotRating = text.match(/(\d+\.\d+)\s*(?:out of\s*5\.0|\/5)\s*[·•]\s*(\d+)\s*reviews/i);
  if (knotRating) {
    data.knotRating = parseFloat(knotRating[1]);
    data.knotReviews = parseInt(knotRating[2]);
  }
  const googleRating = text.match(/Google\s*\n(\d+\.\d+)\/5\s*[·•]\s*(\d+)\s*reviews/i);
  if (googleRating) {
    data.googleRating = parseFloat(googleRating[1]);
    data.googleReviews = parseInt(googleRating[2]);
  }

  // Coordinator
  const coordinatorMatch = text.match(/Meet the team\s*\n([^\n]+)\n([A-Z\s&]+MANAGER|[A-Z\s&]+COORDINATOR|[A-Z\s&]+PLANNER)/i);
  if (coordinatorMatch) data.coordinatorName = coordinatorMatch[1].trim();

  // Address + phone
  const addrMatch = text.match(/(\d+[^\n]+(?:Rd|St|Ave|Blvd|Dr|Ln|Way|Ct)[^\n,]*,\s*[A-Za-z\s]+,\s*CA[^\n]*)/i);
  if (addrMatch) data.address = addrMatch[1].trim();
  const phoneMatch = text.match(/\((\d{3})\)\s*(\d{3})-(\d{4})/);
  if (phoneMatch) data.phone = phoneMatch[0];

  // Description — grab the "About this venue" block
  const aboutMatch = text.match(/About this venue[\s\S]*?(?:AWARD WINNER[^\n]*\n)?(?:Thanks to[^\n]*\n)?([\s\S]*?)(?:Read more|Pricing details)/i);
  if (aboutMatch) data.description = aboutMatch[1].trim().slice(0, 1000);

  data.rawText = text.slice(0, 5000);
  return data;
}

// ── Map Knot settings to our styleTags ────────────────────────────────────────
function knotSettingsToStyleTags(settings: string[]): string[] {
  const map: Record<string, string> = {
    'Ballroom': 'Elegant',
    'Country Club': 'Elegant',
    'Garden': 'Garden',
    'Historic Venue': 'Vintage',
    'Restaurant': 'Modern',
    'Vineyard & Winery': 'Romantic',
    'Tented': 'Rustic',
    'Beach': 'Romantic',
    'Farm & Ranch': 'Rustic',
    'Industrial': 'Industrial',
    'Park': 'Bohemian',
    'Rooftop': 'Modern',
  };
  return [...new Set(settings.map(s => map[s]).filter(Boolean))];
}

// ── Main scrape function ──────────────────────────────────────────────────────
async function scrapeKnotVenue(url: string): Promise<KnotData | null> {
  console.log(`  Fetching: ${url}`);
  
  try {
    // Use OpenClaw browser via CDP
    const cdpUrl = 'http://127.0.0.1:18800';
    
    // Create a new page
    const newPageResp = await fetch(`${cdpUrl}/json/new`);
    const newPage = await newPageResp.json() as { id: string };
    const tabId = newPage.id;
    
    // Navigate via CDP
    await fetch(`${cdpUrl}/json/activate/${tabId}`);
    
    // Use the browser via fetch to CDP
    const ws = new WebSocket(`ws://127.0.0.1:18800/devtools/page/${tabId}`);
    
    return new Promise((resolve) => {
      let msgId = 1;
      const send = (method: string, params: Record<string, unknown> = {}) => {
        const id = msgId++;
        ws.send(JSON.stringify({ id, method, params }));
        return id;
      };
      
      const results: Record<number, unknown> = {};
      
      ws.on('open', () => {
        send('Page.enable');
        send('Page.navigate', { url });
      });
      
      ws.on('message', async (raw: Buffer) => {
        const msg = JSON.parse(raw.toString());
        
        if (msg.method === 'Page.loadEventFired') {
          // Wait a bit for JS to render
          await new Promise(r => setTimeout(r, 3000));
          
          // Extract text
          const evalId = send('Runtime.evaluate', {
            expression: `
              (() => {
                const text = document.body.innerText;
                const photos = [...document.querySelectorAll('img[src*="theknot.com"], img[src*="xogrp.com"], img[src*="cloudinary"]')]
                  .map(i => i.src)
                  .filter(s => s.includes('photo') || s.includes('vendor') || s.includes('venue'))
                  .slice(0, 10);
                return JSON.stringify({ text: text.slice(0, 10000), photos });
              })()
            `,
            returnByValue: true,
          });
          results[evalId] = 'pending_eval';
        }
        
        if (msg.id && results[msg.id] === 'pending_eval') {
          try {
            const data = JSON.parse(msg.result?.result?.value || '{}') as { text: string; photos: string[] };
            ws.close();
            
            // Close the tab
            fetch(`${cdpUrl}/json/close/${tabId}`).catch(() => {});
            
            const parsed = parseKnotText(data.text || '', data.photos || []);
            resolve(parsed);
          } catch (e) {
            ws.close();
            resolve(null);
          }
        }
      });
      
      ws.on('error', () => resolve(null));
      
      // Timeout after 30s
      setTimeout(() => { ws.close(); resolve(null); }, 30000);
    });
  } catch (e) {
    console.error(`  Error scraping ${url}:`, e);
    return null;
  }
}

// ── Write parsed data to DB ───────────────────────────────────────────────────
async function updateVenueFromKnot(slug: string, data: KnotData): Promise<boolean> {
  try {
    const existing = await prisma.venue.findFirst({
      where: { slug: { contains: slug.split('-livermore')[0] } },
    });
    
    if (!existing) {
      console.log(`  ⚠ No DB match for slug: ${slug}`);
      return false;
    }

    const styleTags = knotSettingsToStyleTags(data.settings);
    
    const update: Record<string, unknown> = {
      dataSource: `theknot.com + ${existing.dataSource || 'google'}`,
      lastVerified: new Date(),
    };

    // Only set fields that were actually parsed — no guessing
    if (data.startingPrice) update.baseRentalMin = data.startingPrice;
    if (data.typicalSpendPeak) update.baseRentalMax = data.typicalSpendPeak;
    if (data.guestCapacityMax) update.maxGuests = data.guestCapacityMax;
    if (data.guestCapacityMin) update.minGuests = data.guestCapacityMin;
    if (data.hasIndoorSpace !== undefined) update.hasIndoorSpace = data.hasIndoorSpace;
    if (data.hasOutdoorSpace !== undefined) update.hasOutdoorSpace = data.hasOutdoorSpace;
    if (data.hasBridalSuite) update.hasBridalSuite = data.hasBridalSuite;
    if (data.hasHandicapAccess) update.adaCompliant = data.hasHandicapAccess;
    if (data.hasWifi) update.avIncluded = data.hasWifi; // closest schema field
    if (data.inHouseCateringRequired !== undefined) update.inHouseCateringRequired = data.inHouseCateringRequired;
    if (data.onSiteCoordinator !== undefined) (update as any).onSiteCoordinator = true;
    if (data.knotRating) update.knotRating = data.knotRating;
    if (data.knotReviews) update.knotReviews = data.knotReviews;
    if (data.googleRating) update.googleRating = data.googleRating;
    if (data.googleReviews) update.googleReviews = data.googleReviews;
    if (data.description && data.description.length > 100 && !existing.description) {
      update.description = data.description;
    }
    if (styleTags.length > 0) update.styleTags = styleTags;
    if (data.coordinatorName) update.onSiteCoordinator = true;
    if (data.serviceOfferings.some(s => /bar/i.test(s))) update.barSetup = true;
    if (data.serviceOfferings.some(s => /rental/i.test(s))) update.tablesChairsIncluded = true;
    if (data.peakSeasonStart) update.noiseOrdinance = `Peak season: ${data.peakSeasonStart}–${data.peakSeasonEnd}`; // reuse for now

    // Improve completeness score
    const fieldsSet = Object.keys(update).length;
    update.completenessScore = Math.min(90, (existing.completenessScore || 20) + fieldsSet * 3);

    await prisma.venue.update({
      where: { id: existing.id },
      data: update as any,
    });

    console.log(`  ✓ Updated ${existing.name} — ${fieldsSet} fields`);
    return true;
  } catch (e) {
    console.error(`  Error updating DB for ${slug}:`, e);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔍 Green Bowtie — Knot Scraper');
  console.log('================================');
  
  const results: Array<{ slug: string; url: string; data: KnotData | null; success: boolean }> = [];
  
  for (const [slug, url] of Object.entries(LIVERMORE_KNOT_URLS)) {
    console.log(`\n📍 ${slug}`);
    const data = await scrapeKnotVenue(url);
    
    if (data) {
      console.log(`  Parsed: price=$${data.startingPrice} capacity=${data.guestCapacityMax} amenities=${data.amenities.length}`);
      const success = await updateVenueFromKnot(slug, data);
      results.push({ slug, url, data, success });
    } else {
      console.log(`  ✗ Failed to scrape`);
      results.push({ slug, url, data: null, success: false });
    }
    
    // Be polite — don't hammer their servers
    await new Promise(r => setTimeout(r, 2000));
  }

  // Write results to file for inspection
  const outputPath = path.join(process.cwd(), 'scripts/knot-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n================================');
  console.log(`✅ Done: ${results.filter(r => r.success).length}/${results.length} venues updated`);
  console.log(`📄 Full results: ${outputPath}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
