/**
 * import-new-venues.ts
 * 
 * Creates new venue records in the DB from Knot data when the venue
 * doesn't already exist. This handles the "17 not found" problem.
 * 
 * Only creates venues that pass a minimum quality bar:
 * - Have a real name (not a URL slug)
 * - Have either a price OR a capacity
 * - Are in the target city/state
 */

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { settingsToStyleTags, calcCompletenessScore } from './parse-knot.js';
import type { KnotData } from './types.js';

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter } as any);

/** Generate a URL-safe slug from venue name + city */
function makeSlug(name: string, city: string): string {
  return [name, city]
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Map venue type from Knot settings/ceremony types */
function inferVenueType(knot: KnotData): string {
  const text = [...(knot.settings || []), ...(knot.ceremonyTypes || [])].join(' ').toLowerCase();
  if (/winery|vineyard/i.test(text)) return 'Winery';
  if (/barn|farm|ranch/i.test(text)) return 'Farm & Barn';
  if (/country.?club|golf/i.test(text)) return 'Country Club';
  if (/hotel|resort/i.test(text)) return 'Hotel & Resort';
  if (/garden|outdoor/i.test(text)) return 'Garden';
  if (/historic|estate|mansion/i.test(text)) return 'Historic Estate';
  if (/ballroom|banquet/i.test(text)) return 'Ballroom';
  if (/restaurant/i.test(text)) return 'Restaurant';
  return 'Event Venue';
}

/** Infer state abbreviation from state slug */
const STATE_ABBR: Record<string, string> = {
  california: 'CA', texas: 'TX', 'new-york': 'NY', florida: 'FL',
  illinois: 'IL', washington: 'WA', colorado: 'CO', arizona: 'AZ',
  georgia: 'GA', nevada: 'NV', oregon: 'OR', 'north-carolina': 'NC',
};

export async function importNewVenue(
  name: string,
  knot: KnotData,
  city: string,
  stateSlug: string,
  stateCode: string,
  dryRun = false,
): Promise<{ action: 'created' | 'skipped' | 'error'; slug: string; reason?: string }> {
  // Quality gate
  if (!name || name.length < 4) return { action: 'skipped', slug: '', reason: 'No name' };
  if (!knot.startingPrice && !knot.guestCapacityMax) {
    return { action: 'skipped', slug: '', reason: 'No price or capacity' };
  }

  // Check if already exists
  const existing = await prisma.venue.findFirst({
    where: { name: { contains: name.split(' ').slice(0, 3).join(' '), mode: 'insensitive' } },
  });
  if (existing) return { action: 'skipped', slug: existing.slug, reason: 'Already exists' };

  const slug     = makeSlug(name, city);
  const venueType = inferVenueType(knot);
  const styleTags = settingsToStyleTags(knot.settings || []);
  const score    = calcCompletenessScore(knot);

  const cityTitle = city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (dryRun) {
    console.log(`    [DRY] Would create: ${name} (${venueType}, score=${score})`);
    return { action: 'created', slug };
  }

  try {
    await prisma.venue.create({
      data: {
        slug,
        name,
        city: cityTitle,
        stateSlug,
        state: stateCode.toUpperCase(),
        venueType,
        styleTags,
        isPublished: true,

        // Pricing
        baseRentalMin: knot.startingPrice ?? null,
        baseRentalMax: knot.typicalSpendPeak ?? null,

        // Capacity
        minGuests:  knot.guestCapacityMin ?? null,
        maxGuests:  knot.guestCapacityMax ?? null,

        // Features
        hasIndoorSpace:  knot.hasIndoorSpace  ?? false,
        hasOutdoorSpace: knot.hasOutdoorSpace ?? false,
        hasBridalSuite:  knot.hasBridalSuite  ?? false,
        adaCompliant:    knot.hasHandicapAccess ?? false,
        barSetup:        knot.hasBar ?? false,
        onSiteCoordinator: knot.onSiteCoordinator ?? false,
        inHouseCateringRequired: knot.hasInHouseCatering ?? false,

        // Content
        description: knot.description ?? '',

        // Ratings
        knotRating:  knot.knotRating  ?? null,
        knotReviews: knot.knotReviews ?? null,

        // Meta
        dataSource:       'theknot.com',
        lastVerified:     new Date(),
        completenessScore: score,
      } as any,
    });

    console.log(`    ✓ Created: ${name} (${venueType}, score=${score})`);
    return { action: 'created', slug };

  } catch (e: any) {
    // Handle duplicate slug
    if (e.code === 'P2002') {
      const altSlug = slug + '-' + Date.now().toString(36);
      await prisma.venue.create({ data: { slug: altSlug } as any });
    }
    return { action: 'error', slug, reason: String(e) };
  }
}

export async function disconnect() {
  await prisma.$disconnect();
  await pool.end();
}
