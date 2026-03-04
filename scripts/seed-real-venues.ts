/**
 * seed-real-venues.ts
 * Clears existing venue data and seeds from venues-all.json (or venues-full.json as fallback).
 * Maps Google Places data to our Prisma schema.
 *
 * Run: DATABASE_URL="..." npx tsx scripts/seed-real-venues.ts
 */

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

function inferStyleTags(raw: RawVenue): string[] {
  const tags: string[] = [];
  const name = raw.name.toLowerCase();
  const desc = (raw.description ?? "").toLowerCase();
  const combined = name + " " + desc;

  if (/vineyard|winery|wine|rustic elegant|estate/.test(combined)) tags.push("Romantic");
  if (/rustic|barn|ranch|farm|country/.test(combined)) tags.push("Rustic");
  if (/modern|contemporary|urban|loft|rooftop|sleek/.test(combined)) tags.push("Modern");
  if (/garden|botanical|outdoor|nature|floral/.test(combined)) tags.push("Garden");
  if (/elegant|luxury|grand|sophisticated|upscale/.test(combined)) tags.push("Elegant");
  if (/boho|bohemian|eclectic|whimsical/.test(combined)) tags.push("Boho");
  if (/vintage|historic|victorian|classic|antique/.test(combined)) tags.push("Vintage");
  if (/beach|ocean|coastal|waterfront|marina|bay/.test(combined)) tags.push("Beachside");
  if (/mountain|hillside|view|scenic|vineyard/.test(combined)) tags.push("Scenic Views");

  // Ensure at least one tag
  if (tags.length === 0) tags.push("Elegant");
  return [...new Set(tags)].slice(0, 4);
}

function slugify(name: string, city: string): string {
  return (name + "-" + city)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function inferCompleteness(raw: RawVenue): number {
  let score = 30; // base
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
  // Find the best available data file
  const allPath = path.join(__dirname, "venues-all.json");
  const fullPath = path.join(__dirname, "venues-full.json");
  const dataPath = fs.existsSync(allPath) ? allPath : fullPath;

  if (!fs.existsSync(dataPath)) {
    throw new Error("No venue data file found. Run scrape-venues-full.ts first.");
  }

  const raw: RawVenue[] = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  console.log(`📂 Loaded ${raw.length} venues from ${path.basename(dataPath)}`);

  // Filter: only CA, skip permanently closed, skip no name
  const filtered = raw.filter((v) =>
    (v.state === "CA" || v.state === "California") &&
    v.name &&
    v.city &&
    v.businessStatus !== "CLOSED_PERMANENTLY"
  );
  console.log(`✓ ${filtered.length} venues after filtering`);

  // Deduplicate by placeId
  const seen = new Set<string>();
  const unique = filtered.filter((v) => {
    if (seen.has(v.placeId)) return false;
    seen.add(v.placeId);
    return true;
  });
  console.log(`✓ ${unique.length} unique venues`);

  // Clear existing data
  console.log("\n🗑  Clearing existing venues...");
  await prisma.venue.deleteMany();

  // Seed in batches of 100
  console.log(`\n🌱 Seeding ${unique.length} venues...`);
  const BATCH = 100;
  let inserted = 0;
  let errors = 0;

  // Track slugs to avoid duplicates
  const usedSlugs = new Map<string, number>();

  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);

    for (const v of batch) {
      let baseSlug = slugify(v.name, v.city);
      const count = usedSlugs.get(baseSlug) ?? 0;
      const slug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;
      usedSlugs.set(baseSlug, count + 1);

      try {
        await prisma.venue.create({
          data: {
            slug,
            name: v.name,
            street: v.street || null,
            city: v.city,
            state: "CA",
            zip: v.zip || null,
            phone: v.phone,
            website: v.website,
            venueType: inferVenueType(v),
            styleTags: inferStyleTags(v),
            googleRating: v.googleRating,
            googleReviews: v.googleReviews,
            primaryPhotoUrl: v.primaryPhotoUrl,
            photoCount: v.photoNames?.length ?? 0,
            description: v.description,
            isPublished: true,
            completenessScore: inferCompleteness(v),
            dataSource: "google_places",
          },
        });
        inserted++;
      } catch (err: unknown) {
        errors++;
        if (errors <= 5) console.error(`  ✗ Failed: ${v.name} — ${err instanceof Error ? err.message : err}`);
      }
    }

    process.stdout.write(`  Progress: ${Math.min(i + BATCH, unique.length)}/${unique.length}\r`);
  }

  console.log(`\n\n✅ Done!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Errors: ${errors}`);

  const total = await prisma.venue.count();
  console.log(`   Total in DB: ${total}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
