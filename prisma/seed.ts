import { PrismaClient } from "@prisma/client";
import { seedVenues } from "../src/lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");
  for (const venue of seedVenues) {
    await prisma.venue.upsert({
      where: { slug: venue.slug },
      update: venue,
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
  });
