import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { seedVenues } from "../src/lib/seed-data";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");
  for (const venue of seedVenues) {
    await prisma.venue.upsert({
      where: { slug: venue.slug },
      update: venue as never,
      create: venue,
    });
    console.log(`  ✓ ${venue.name}`);
  }
  console.log(`\n✅ Done — seeded ${seedVenues.length} venues`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
