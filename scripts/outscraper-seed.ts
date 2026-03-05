import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface RawVenue {
  placeId: string;
  name: string;
  formattedAddress: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  googleRating: number | null;
  googleReviews: number | null;
  photoNames: string[];
  primaryPhotoUrl: string | null;
  types: string[];
  primaryType: string | null;
  description: string | null;
  openingHours: string[] | null;
  priceLevel: string | null;
  googleMapsUrl: string | null;
  businessStatus: string | null;
}

function parseStateSlugArg(): string {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--state-slug");
  const stateSlug = idx >= 0 ? args[idx + 1] : undefined;

  if (!stateSlug) {
    throw new Error('Usage: npx tsx scripts/outscraper-seed.ts --state-slug "new-york"');
  }

  return stateSlug;
}

function inferVenueType(raw: RawVenue): string {
  const types = raw.types ?? [];
  const name = raw.name.toLowerCase();

  if (types.includes("winery") || /winery|vineyard|vino|cellar/.test(name)) return "Vineyard & Winery";
  if (/barn|ranch|farm|rustic/.test(name)) return "Barn / Ranch";
  if (types.includes("golf_course") || /golf|links/.test(name)) return "Golf Club";
  if (types.includes("country_club") || /country club/.test(name)) return "Country Club";
  if (/ballroom|banquet|hall/.test(name)) return "Ballroom";
  if (/garden|botanical|arboretum/.test(name)) return "Garden";
  if (/estate|manor|mansion|chateau|villa|hacienda/.test(name)) return "Historic Estate";
  if (types.includes("resort") || /resort|spa/.test(name)) return "Resort";
  if (types.includes("hotel") || /hotel|inn|lodge/.test(name)) return "Hotel & Resort";
  if (/park|preserve|nature|outdoor/.test(name)) return "Outdoor / Park";
  if (/rooftop|loft|penthouse/.test(name)) return "Urban / Rooftop";
  if (/museum|gallery|art/.test(name)) return "Museum & Gallery";
  if (/restaurant|bistro|cafe/.test(name)) return "Restaurant";
  if (types.includes("event_venue") || types.includes("banquet_hall")) return "Event Venue";
  return "Venue";
}

function inferStyle(raw: RawVenue): string[] {
  const tags: string[] = [];
  const name = raw.name.toLowerCase();
  const desc = (raw.description ?? "").toLowerCase();
  const combined = name + " " + desc;

  if (/vineyard|winery|wine|rustic elegant|estate/.test(combined)) tags.push("Romantic");
  if (/rustic|barn|ranch|farm|country/.test(combined)) tags.push("Rustic");
  if (/modern|contemporary|urban|loft|rooftop|sleek/.test(combined)) tags.push("Modern");
  if (/garden|botanical|outdoor|nature|floral/.test(combined)) tags.push("Garden");
  if (/elegant|luxury|grand|sophisticated|upscale/.test(combined)) tags.push("Elegant");
  if (/boho|bohemian|eclectic|whimsical/.test(combined)) tags.push("Bohemian");
  if (/vintage|historic|victorian|classic|antique/.test(combined)) tags.push("Vintage");
  if (/beach|ocean|coastal|waterfront|marina|bay/.test(combined)) tags.push("Beachside");
  if (/mountain|hillside|view|scenic|vineyard/.test(combined)) tags.push("Scenic Views");

  if (tags.length === 0) tags.push("Elegant");
  return Array.from(new Set(tags)).slice(0, 4);
}

function slugify(name: string, city: string): string {
  return (name + "-" + city)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function inferCompleteness(raw: RawVenue): number {
  let score = 30;
  if (raw.phone) score += 15;
  if (raw.website) score += 15;
  if (raw.googleRating) score += 10;
  if (raw.description) score += 10;
  if (raw.primaryPhotoUrl) score += 10;
  if (raw.city) score += 5;
  if (raw.street) score += 5;
  return Math.min(score, 100);
}

async function main() {
  const stateSlug = parseStateSlugArg();
  const dataPath = path.join(__dirname, `venues-${stateSlug}-converted.json`);

  if (!fs.existsSync(dataPath)) {
    throw new Error(`Converted file not found: ${dataPath}`);
  }

  const rows = JSON.parse(fs.readFileSync(dataPath, "utf8")) as RawVenue[];

  let upserted = 0;
  let skipped = 0;
  let errors = 0;

  const usedSlugs = new Map<string, number>();

  for (const v of rows) {
    if (!v.placeId || !v.name || !v.city) {
      skipped++;
      continue;
    }

    const baseSlug = slugify(v.name, v.city);
    const count = usedSlugs.get(baseSlug) ?? 0;
    const slug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;
    usedSlugs.set(baseSlug, count + 1);

    try {
      await (prisma as any).venue.upsert({
        where: { slug },
        update: {
          name: v.name,
          slug,
          street: v.street || null,
          city: v.city,
          state: v.state || null,
          stateSlug,
          zip: v.zip || null,
          latitude: v.lat,
          longitude: v.lng,
          phone: v.phone,
          website: v.website,
          venueType: inferVenueType(v),
          styleTags: inferStyle(v),
          googleRating: v.googleRating,
          googleReviews: v.googleReviews ? Math.trunc(v.googleReviews) : null,
          primaryPhotoUrl: v.primaryPhotoUrl,
          photoCount: v.photoNames?.length ?? 0,
          description: v.description,
          isPublished: true,
          completenessScore: inferCompleteness(v),
          dataSource: "outscraper",
        },
        create: {
          name: v.name,
          slug,
          street: v.street || null,
          city: v.city,
          state: v.state || null,
          stateSlug,
          zip: v.zip || null,
          latitude: v.lat,
          longitude: v.lng,
          phone: v.phone,
          website: v.website,
          venueType: inferVenueType(v),
          styleTags: inferStyle(v),
          googleRating: v.googleRating,
          googleReviews: v.googleReviews ? Math.trunc(v.googleReviews) : null,
          primaryPhotoUrl: v.primaryPhotoUrl,
          photoCount: v.photoNames?.length ?? 0,
          description: v.description,
          isPublished: true,
          completenessScore: inferCompleteness(v),
          dataSource: "outscraper",
        },
      });

      upserted++;
    } catch (err: unknown) {
      errors++;
      if (errors <= 10) {
        console.error(`✗ ${v.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  console.log(`Upserted: ${upserted}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
