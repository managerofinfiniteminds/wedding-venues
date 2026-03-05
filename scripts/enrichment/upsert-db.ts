/**
 * upsert-db.ts
 * Merges enriched data from all sources and writes to the DB.
 * Never overwrites a higher-confidence value with a lower one.
 */

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
import { settingsToStyleTags, calcCompletenessScore } from './parse-knot.js';
import type { KnotData, YelpData, VenueSiteData } from './types.js';

const prisma = new PrismaClient({ adapter } as any);

export interface UpsertResult {
  slug: string;
  name: string;
  action: 'updated' | 'skipped' | 'not_found' | 'error';
  fieldsUpdated: string[];
  completenessScore: number;
  error?: string;
}

/** Find venue in DB by name (fuzzy) or slug */
async function findVenue(name: string, city: string, stateSlug: string) {
  // Try exact name first
  const exact = await prisma.venue.findFirst({
    where: { name: { equals: name, mode: 'insensitive' }, city, stateSlug, isPublished: true },
  });
  if (exact) return exact;

  // Try fuzzy — match on first significant words
  const words = name.split(/\s+/).slice(0, 3).join(' ');
  return prisma.venue.findFirst({
    where: { name: { contains: words, mode: 'insensitive' }, city, stateSlug, isPublished: true },
  });
}

/** Write enriched data to DB */
export async function upsertVenueEnrichment(
  name: string,
  city: string,
  stateSlug: string,
  knot?: KnotData | null,
  yelp?: YelpData | null,
  site?: VenueSiteData | null,
  dryRun = false,
): Promise<UpsertResult> {
  const venue = await findVenue(name, city, stateSlug);

  if (!venue) {
    return { slug: '', name, action: 'not_found', fieldsUpdated: [], completenessScore: 0 };
  }

  const update: Record<string, unknown> = {};
  const sources: string[] = [];

  // ── From The Knot ──────────────────────────────────────────────
  if (knot) {
    sources.push('theknot.com');

    if (knot.startingPrice && !venue.baseRentalMin)
      update.baseRentalMin = knot.startingPrice;
    if (knot.typicalSpendPeak && !venue.baseRentalMax)
      update.baseRentalMax = knot.typicalSpendPeak;
    if (knot.guestCapacityMax && (!venue.maxGuests || venue.maxGuests < knot.guestCapacityMax))
      update.maxGuests = knot.guestCapacityMax;
    if (knot.guestCapacityMin && !venue.minGuests)
      update.minGuests = knot.guestCapacityMin;
    if (knot.hasIndoorSpace  !== undefined) update.hasIndoorSpace  = knot.hasIndoorSpace;
    if (knot.hasOutdoorSpace !== undefined) update.hasOutdoorSpace = knot.hasOutdoorSpace;
    if (knot.hasBridalSuite)  update.hasBridalSuite  = true;
    if (knot.hasHandicapAccess) update.adaCompliant  = true;
    if (knot.hasOnSiteAccommodations) update.nearbyLodging = true;
    if (knot.hasBar)          update.barSetup         = true;
    if (knot.hasRentals)      update.tablesChairsIncluded = true;
    if (knot.onSiteCoordinator) update.onSiteCoordinator = true;
    if (knot.hasInHouseCatering) update.inHouseCateringRequired = true;
    if (knot.knotRating)      update.knotRating  = knot.knotRating;
    if (knot.knotReviews)     update.knotReviews = knot.knotReviews;
    // Only update Google rating if it's better sourced (more reviews = more authoritative)
    if (knot.googleRatingFromKnot && knot.googleReviewsFromKnot &&
        (!venue.googleReviews || knot.googleReviewsFromKnot > venue.googleReviews)) {
      update.googleRating  = knot.googleRatingFromKnot;
      update.googleReviews = knot.googleReviewsFromKnot;
    }
    if (knot.description && (!venue.description || venue.description.length < 100))
      update.description = knot.description;
    if (knot.spacesDescription && !venue.spacesDescription)
      update.spacesDescription = knot.spacesDescription;
    if (knot.peakSeason) update.noiseOrdinance = `Peak season: ${knot.peakSeason}`;
    if (knot.peakSeason && /may|june|july|august|september|october/i.test(knot.peakSeason))
      update.peakPricing = true;

    // Style tags — merge, don't replace
    const knotTags = settingsToStyleTags(knot.settings || []);
    if (knotTags.length > 0) {
      const existing = (venue.styleTags as string[]) || [];
      update.styleTags = [...new Set([...existing, ...knotTags])];
    }
  }

  // ── From Yelp ──────────────────────────────────────────────────
  if (yelp) {
    sources.push('yelp.com');
    // We don't have a yelpRating field in schema yet — store in description notes for now
    // Future: add yelpRating, yelpReviews to schema
  }

  // ── From venue website ─────────────────────────────────────────
  if (site) {
    sources.push('venue-website');
    if (site.cateringPolicy?.toLowerCase().includes('outside') ||
        site.cateringPolicy?.toLowerCase().includes('your own')) {
      update.outsideVendorsAllowed = true;
    } else if (site.cateringPolicy?.toLowerCase().includes('in-house')) {
      update.inHouseCateringRequired = true;
    }
    if (site.alcoholPolicy?.toLowerCase().includes('no outside')) {
      update.byobPolicy = 'No outside alcohol permitted';
    } else if (site.alcoholPolicy?.toLowerCase().includes('byob')) {
      update.byobPolicy = 'BYOB permitted';
    }
    if (site.socialInstagram && !venue.instagram)
      update.instagram = `https://instagram.com/${site.socialInstagram}`;
    if (site.socialFacebook && !venue.facebook)
      update.facebook = `https://facebook.com/${site.socialFacebook}`;
    if (site.description && !venue.description)
      update.description = site.description;
  }

  // ── Metadata ───────────────────────────────────────────────────
  const newScore = knot
    ? Math.max(venue.completenessScore || 0, calcCompletenessScore(knot))
    : venue.completenessScore || 0;

  if (Object.keys(update).length === 0) {
    return { slug: venue.slug, name, action: 'skipped', fieldsUpdated: [], completenessScore: newScore };
  }

  update.dataSource    = sources.join(' + ');
  update.lastVerified  = new Date();
  update.completenessScore = newScore;

  const fieldsUpdated = Object.keys(update).filter(k => !['dataSource','lastVerified','completenessScore'].includes(k));

  if (!dryRun) {
    try {
      await prisma.venue.update({ where: { id: venue.id }, data: update as any });
    } catch (e) {
      return { slug: venue.slug, name, action: 'error', fieldsUpdated, completenessScore: newScore, error: String(e) };
    }
  }

  return { slug: venue.slug, name, action: 'updated', fieldsUpdated, completenessScore: newScore };
}

export async function disconnect() {
  await prisma.$disconnect();
}
