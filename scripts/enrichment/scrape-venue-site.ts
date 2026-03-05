/**
 * scrape-venue-site.ts
 * Fetches a venue's own website to extract policies, FAQs, and details
 * that The Knot doesn't have (catering rules, alcohol policy, etc.)
 */

import type { VenueSiteData } from './types.js';

const WEDDING_PAGE_SLUGS = [
  '/weddings/', '/wedding/', '/weddings-events/', '/events/weddings/',
  '/private-events/', '/events/', '/venue/', '/book/',
];

/** Try to fetch the venue's wedding/events page */
async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Strip HTML tags, collapse whitespace
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000);
  } catch {
    return null;
  }
}

/** Try multiple page paths to find wedding-relevant content */
async function findWeddingPage(baseUrl: string): Promise<{ url: string; text: string } | null> {
  // Clean base URL
  const base = baseUrl.replace(/\/$/, '');
  
  for (const slug of WEDDING_PAGE_SLUGS) {
    const url = base + slug;
    const text = await fetchPage(url);
    if (text && text.length > 300 && /wedding|event|capacity|guest|ceremony|reception/i.test(text)) {
      return { url, text };
    }
  }
  
  // Fall back to homepage
  const homepageText = await fetchPage(base + '/');
  if (homepageText) return { url: base + '/', text: homepageText };
  
  return null;
}

/** Parse the raw text for venue-specific policy and detail signals */
function parseVenueSite(text: string): VenueSiteData {
  const d: VenueSiteData = { packages: [], spaceDescriptions: [], faqHighlights: [] };

  // Catering policy
  if (/outside\s+caterer|bring.*caterer|your own.*caterer/i.test(text)) {
    const m = text.match(/.{0,100}(?:outside|your own).*caterer.{0,100}/i);
    d.cateringPolicy = m?.[0]?.trim();
  } else if (/in-house.*cater|chef.*on.?site|catering.*team/i.test(text)) {
    d.cateringPolicy = 'In-house catering provided';
  }

  // Alcohol / BYOB policy
  const alcoholMatch = text.match(/.{0,80}(?:outside.*alcohol|bring.*wine|byob|no.*outside.*alcohol|beverage.*provide).{0,80}/i);
  if (alcoholMatch) d.alcoholPolicy = alcoholMatch[0].trim();

  // Outside vendors
  const vendorMatch = text.match(/.{0,80}(?:outside.*vendor|preferred.*vendor|your own.*vendor).{0,80}/i);
  if (vendorMatch) d.outsideVendorsPolicy = vendorMatch[0].trim();

  // Capacity mentions
  const capMatches = [...text.matchAll(/up to ([\d,]+)\s*guests?/gi)];
  if (capMatches.length > 0) {
    d.capacityNotes = capMatches.map(m => m[0]).slice(0, 3).join('; ');
  }

  // Pricing mentions
  const priceMatch = text.match(/\$([\d,]+)(?:\s*[-–]\s*\$[\d,]+)?\s*(?:per|starting|site fee|package)/i);
  if (priceMatch) d.pricing = priceMatch[0].trim();

  // Description (first meaningful paragraph)
  const sentences = text.split(/\.\s+/).filter(s => s.length > 60 && s.length < 400);
  if (sentences.length > 0) d.description = sentences.slice(0, 3).join('. ').trim() + '.';

  // Coordinator/contact info
  const coordMatch = text.match(/(?:coordinator|events?\s+manager|sales?\s+director)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
  if (coordMatch) d.coordinatorInfo = coordMatch[0].trim();

  // Social media
  const igMatch = text.match(/instagram\.com\/([A-Za-z0-9_.]+)/i);
  if (igMatch) d.socialInstagram = igMatch[1];
  const fbMatch = text.match(/facebook\.com\/([A-Za-z0-9_.]+)/i);
  if (fbMatch) d.socialFacebook = fbMatch[1];

  return d;
}

/** Main entry point */
export async function scrapeVenueSite(websiteUrl: string): Promise<VenueSiteData | null> {
  if (!websiteUrl) return null;
  
  const page = await findWeddingPage(websiteUrl);
  if (!page) return null;

  return parseVenueSite(page.text);
}
