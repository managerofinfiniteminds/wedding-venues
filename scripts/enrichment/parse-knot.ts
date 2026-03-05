/**
 * parse-knot.ts
 * Parses raw text extracted from a Knot venue page into structured KnotData.
 * No browser dependency — pure text processing.
 */

import type { KnotData } from './types.js';

export function parseKnotPage(text: string, url: string): KnotData {
  const d: KnotData = {
    amenities: [],
    ceremonyTypes: [],
    settings: [],
    services: [],
    knotUrl: url,
  };

  // ── Basic info ────────────────────────────────────────────────────

  // Name — appears just before "Booked?" or rating line on Knot pages
  const nameMatch = text.match(/\nSee all[^\n]*\n([^\n]{3,80})\nBooked\?/i)
                 || text.match(/\nLocation\n[^\n]*\n([^\n]{3,80})\nBooked\?/i)
                 || text.match(/([^\n]{3,80})\n(?:4\.\d|5\.0)\s*out of 5 stars/i);
  if (nameMatch) d.name = nameMatch[1].trim();

  // Starting price
  const startMatch = text.match(/\$([\d,]+)\s*starting price/i);
  if (startMatch) d.startingPrice = parseInt(startMatch[1].replace(/,/g, ''));

  // Typical spend (two numbers on consecutive lines after "Couples usually spend")
  const spendMatch = text.match(/Couples usually spend\s*\n\$?([\d,]+)\s*\n\$?([\d,]+)/i);
  if (spendMatch) {
    d.typicalSpendPeak    = parseInt(spendMatch[1].replace(/,/g, ''));
    d.typicalSpendOffPeak = parseInt(spendMatch[2].replace(/,/g, ''));
  }

  // Guest capacity
  if (/300\+\s*guests?/i.test(text)) {
    d.guestCapacityMin = 300;
    // Look for higher specific numbers
    const caps = [...text.matchAll(/up to ([\d,]+)\s*guests?/gi)]
      .map(m => parseInt(m[1].replace(/,/g, '')))
      .filter(n => !isNaN(n) && n > 0);
    d.guestCapacityMax = caps.length > 0 ? Math.max(...caps) : 300;
  } else {
    const rangeMatch = text.match(/([\d]+)[-–\s]to[-–\s]([\d]+)\s*guests?/i)
                    || text.match(/([\d]+)[-–]([\d]+)\s*guests?/i);
    if (rangeMatch) {
      d.guestCapacityMin = parseInt(rangeMatch[1]);
      d.guestCapacityMax = parseInt(rangeMatch[2]);
    }
    // Still check for "up to X guests" even in non-300+ venues
    const caps = [...text.matchAll(/up to ([\d,]+)\s*guests?/gi)]
      .map(m => parseInt(m[1].replace(/,/g, '')))
      .filter(n => !isNaN(n) && n > 0);
    if (caps.length > 0) {
      d.guestCapacityMax = Math.max(d.guestCapacityMax || 0, ...caps) || undefined;
    }
    // Parse "Seating for X-Y guests" style
    const seatingMatch = text.match(/[Ss]eating for ([\d,]+)[-–]([\d,]+)\s*guests?/i);
    if (seatingMatch) {
      d.guestCapacityMin = parseInt(seatingMatch[1].replace(/,/g, ''));
      d.guestCapacityMax = parseInt(seatingMatch[2].replace(/,/g, ''));
    }
  }

  // Peak season
  const peakMatch = text.match(/[Pp]eak season.*?is\s+([A-Za-z]+)\s+to\s+([A-Za-z]+)/i);
  if (peakMatch) d.peakSeason = `${peakMatch[1]} to ${peakMatch[2]}`;

  // ── Amenities block ───────────────────────────────────────────────
  const amenBlock = text.match(/Amenities\s*\n([\s\S]*?)(?:Ceremony Types|Settings|Venue Service|$)/i);
  if (amenBlock) {
    const lines = parseLines(amenBlock[1]);
    d.amenities = lines;
    d.hasIndoorSpace       = lines.some(l => /indoor/i.test(l));
    d.hasOutdoorSpace      = lines.some(l => /outdoor/i.test(l));
    d.hasBridalSuite       = lines.some(l => /dressing\s*room|bridal\s*suite/i.test(l));
    d.hasHandicapAccess    = lines.some(l => /handicap|accessible/i.test(l));
    d.hasWifi              = lines.some(l => /wireless|wi-?fi/i.test(l));
    d.hasLiabilityInsurance= lines.some(l => /liability/i.test(l));
    d.hasOnSiteAccommodations = lines.some(l => /accommodation|lodging|on.?site/i.test(l));
  }

  // ── Ceremony types ────────────────────────────────────────────────
  const ceremBlock = text.match(/Ceremony Types\s*\n([\s\S]*?)(?:Settings|Venue Service|Amenities|$)/i);
  if (ceremBlock) d.ceremonyTypes = parseLines(ceremBlock[1]);

  // ── Settings ─────────────────────────────────────────────────────
  const settingsBlock = text.match(/Settings\s*\n([\s\S]*?)(?:Venue Service|Ceremony|Awards|$)/i);
  if (settingsBlock) d.settings = parseLines(settingsBlock[1]);

  // ── Service offerings ─────────────────────────────────────────────
  const servicesBlock = text.match(/Venue Service Offerings\s*\n([\s\S]*?)(?:Awards|Meet the team|Availability|Any questions|$)/i);
  if (servicesBlock) {
    d.services = parseLines(servicesBlock[1]);
    d.hasInHouseCatering = d.services.some(s => /catering/i.test(s));
    d.hasBar             = d.services.some(s => /bar/i.test(s));
    d.hasPlanning        = d.services.some(s => /planning/i.test(s));
    d.hasRentals         = d.services.some(s => /rental/i.test(s));
  }

  // ── Ratings ───────────────────────────────────────────────────────
  const knotRatingMatch = text.match(/(\d+\.\d+)\s*out of\s*5\.0\s*\n(\d+)\s*reviews/i);
  if (knotRatingMatch) {
    d.knotRating  = parseFloat(knotRatingMatch[1]);
    d.knotReviews = parseInt(knotRatingMatch[2]);
  }
  // Alternative format: "4.7 · 52 reviews"
  const knotAlt = text.match(/(\d+\.\d+)\s*[·•]\s*(\d+)\s*reviews/i);
  if (knotAlt && !d.knotRating) {
    d.knotRating  = parseFloat(knotAlt[1]);
    d.knotReviews = parseInt(knotAlt[2]);
  }
  const googleMatch = text.match(/Google\s*\n(\d+\.\d+)\/5\s*[·•]\s*(\d+)\s*reviews/i);
  if (googleMatch) {
    d.googleRatingFromKnot   = parseFloat(googleMatch[1]);
    d.googleReviewsFromKnot  = parseInt(googleMatch[2]);
  }

  // ── Coordinator ───────────────────────────────────────────────────
  const coordMatch = text.match(/Meet the team\s*\n([^\n]{3,60})\n([A-Z][A-Z\s&]+(?:MANAGER|COORDINATOR|PLANNER|DIRECTOR|REPRESENTATIVE|SPECIALIST))/i);
  if (coordMatch) {
    d.coordinatorName  = coordMatch[1].trim();
    d.coordinatorTitle = coordMatch[2].trim();
    d.onSiteCoordinator = true;
  }

  // ── Description ───────────────────────────────────────────────────
  // Extract the main "About this venue" body text
  const aboutMatch = text.match(
    /(?:AWARD WINNER[^\n]*\n)?(?:Thanks to[^\n]*\n)?((?:[A-Z][^\n]{50,}(?:\n|$)){1,}[\s\S]{0,800}?)(?:Read more|Pricing details|Woman-owned)/i
  );
  if (aboutMatch && aboutMatch[1].length > 100) {
    d.description = aboutMatch[1].trim().slice(0, 1200);
  }

  // ── Spaces description ────────────────────────────────────────────
  // Look for facility/capacity paragraphs
  const facilMatch = text.match(/(?:Facilities and Capacity|Spaces|Venue Spaces)\s*\n([\s\S]{50,500}?)(?:\n\n|Cuisine|$)/i);
  if (facilMatch) d.spacesDescription = facilMatch[1].trim();

  // ── Address + phone ───────────────────────────────────────────────
  const addrMatch = text.match(/(\d+\s+[^\n,]+(?:Rd|St|Ave|Blvd|Dr|Ln|Way|Ct|Road|Street|Avenue)[^\n,]*,\s*[A-Za-z\s]+,\s*CA[^\n]*)/i);
  if (addrMatch) d.address = addrMatch[1].trim();
  const phoneMatch = text.match(/\(\d{3}\)\s*\d{3}-\d{4}(?:\s+ext\.?\s*\d+)?/);
  if (phoneMatch) d.phone = phoneMatch[0];

  // ── Awards ────────────────────────────────────────────────────────
  d.isKnotAwardWinner = /AWARD WINNER/i.test(text);
  const awardCount = text.match(/AWARD WINNER \((\d+)X\)/i);
  if (awardCount) d.knotAwardCount = parseInt(awardCount[1]);

  // ── Business info ─────────────────────────────────────────────────
  d.isWomanOwned = /Woman-owned Business/i.test(text);
  const yearsMatch = text.match(/(\d+\+?\s*years?\s*in\s*business)/i);
  if (yearsMatch) d.yearsInBusiness = yearsMatch[1];
  const teamMatch = text.match(/((?:Small|Medium|Large|(?:\d+[-–+]\d+|\d+\+))\s*team[^\n]*)/i);
  if (teamMatch) d.teamSize = teamMatch[1];

  // ── Review highlights (first 3 reviews snippets) ─────────────────
  const reviewMatches = [...text.matchAll(/\d+\.\d+\n\d+\/\d+\/\d+\n([\s\S]{20,200}?)(?:Read more|$)/gi)];
  d.reviewHighlights = reviewMatches.slice(0, 3).map(m => m[1].trim());

  return d;
}

function parseLines(block: string): string[] {
  return block
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2 && l.length < 80 && !/^\d+$/.test(l));
}

/** Map Knot settings tags → our styleTags vocabulary */
export function settingsToStyleTags(settings: string[]): string[] {
  const MAP: Record<string, string> = {
    'Ballroom':       'Elegant',
    'Country Club':   'Elegant',
    'Garden':         'Garden',
    'Historic Venue': 'Vintage',
    'Restaurant':     'Modern',
    'Vineyard & Winery': 'Romantic',
    'Tented':         'Rustic',
    'Beach':          'Romantic',
    'Farm & Ranch':   'Rustic',
    'Barn':           'Rustic',
    'Industrial':     'Industrial',
    'Park':           'Bohemian',
    'Rooftop':        'Modern',
    'Hotel':          'Elegant',
    'Backyard':       'Bohemian',
    'Trees':          'Rustic',
  };
  return [...new Set(settings.map(s => MAP[s]).filter(Boolean))];
}

/** Calculate completeness score for a venue based on filled fields */
export function calcCompletenessScore(data: KnotData): number {
  let score = 20; // base for being on Knot at all
  if (data.startingPrice) score += 15;
  if (data.typicalSpendPeak) score += 5;
  if (data.guestCapacityMax) score += 15;
  if (data.description && data.description.length > 100) score += 10;
  if (data.spacesDescription) score += 5;
  if (data.amenities.length > 0) score += 5;
  if (data.services.length > 0) score += 5;
  if (data.knotRating) score += 5;
  if (data.coordinatorName) score += 5;
  if (data.peakSeason) score += 3;
  if (data.address) score += 2;
  return Math.min(90, score); // cap at 90 — 100 requires phone verification
}
