/**
 * rebuild-phase2-state.ts
 * 
 * Reconstructs phase2-state.json from the DB.
 * Run this if phase2-state.json is empty/missing after a crash.
 * Queries which cities already have pricing in Neon and marks them done.
 * 
 * Usage: DATABASE_URL=... npx tsx scripts/enrichment/rebuild-phase2-state.ts
 */

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter } as any);

const STATE_FILE = path.join(process.cwd(), 'scripts', 'enrichment', 'phase2-state.json');

async function main() {
  console.log('Rebuilding phase2-state.json from DB...');

  // Cities that have at least one priced venue = we scraped them
  const result = await prisma.$queryRaw<Array<{city: string; state: string; cnt: bigint}>>`
    SELECT city, state, COUNT(*) as cnt
    FROM "Venue"
    WHERE "baseRentalMin" IS NOT NULL AND "isPublished" = true
    GROUP BY city, state
    ORDER BY city
  `;

  const processed = result.map(r => `${r.city}|${r.state}`);
  
  await fs.writeFile(STATE_FILE, JSON.stringify(processed, null, 2), 'utf-8');
  
  console.log(`✅ Rebuilt state file with ${processed.length} completed cities`);
  console.log(`   Saved to: ${STATE_FILE}`);
  console.log(`\nTop 10 completed cities:`);
  processed.slice(0, 10).forEach(c => console.log(`  ${c}`));

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
