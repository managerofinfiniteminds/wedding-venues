/**
 * status.ts — Green Bowtie enrichment status dashboard
 * Usage: DATABASE_URL=... npx tsx scripts/enrichment/status.ts
 */

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter } as any);

const SCRIPT_DIR = path.join(process.cwd(), 'scripts', 'enrichment');

function bar(pct: number, width = 20): string {
  const filled = Math.round((pct / 100) * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function pct(n: number, total: number): string {
  if (!total) return ' 0%';
  return `${Math.round((n / total) * 100)}%`.padStart(3);
}

function readJsonSet(file: string): Set<string> {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed);
    if (parsed?.processed) return new Set(parsed.processed);
    return new Set(Object.keys(parsed));
  } catch { return new Set(); }
}

function countLines(file: string): number {
  try {
    const content = fs.readFileSync(file, 'utf8');
    return content.split('\n').filter(l => l.trim()).length;
  } catch { return 0; }
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);

  // ── DB queries ─────────────────────────────────────────────────────────────
  const [
    totalRes,
    pricingRes,
    capacityRes,
    descRes,
    phase1DoneRes,
    phase1ProbRes,
  ] = await Promise.all([
    prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Venue" WHERE "isPublished"=true`,
    prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Venue" WHERE "isPublished"=true AND "baseRentalMin" IS NOT NULL`,
    prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Venue" WHERE "isPublished"=true AND "maxGuests" IS NOT NULL`,
    prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Venue" WHERE "isPublished"=true AND description IS NOT NULL AND length(description) > 100`,
    prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Venue" WHERE "isPublished"=true AND "lastVerified" > '2000-01-02'`,
    prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Venue" WHERE "isPublished"=true AND "lastVerified" = '2000-01-01 00:00:00'`,
  ]);

  const topStates = await prisma.$queryRaw<Array<{state: string; venues: bigint; priced: bigint; capacitated: bigint}>>`
    SELECT 
      state,
      COUNT(*) as venues,
      COUNT(*) FILTER (WHERE "baseRentalMin" IS NOT NULL) as priced,
      COUNT(*) FILTER (WHERE "maxGuests" IS NOT NULL) as capacitated
    FROM "Venue"
    WHERE "isPublished"=true
    GROUP BY state
    ORDER BY venues DESC
    LIMIT 5
  `;

  const total     = Number(totalRes[0].count);
  const pricing   = Number(pricingRes[0].count);
  const capacity  = Number(capacityRes[0].count);
  const described = Number(descRes[0].count);
  const p1done    = Number(phase1DoneRes[0].count);
  const p1prob    = Number(phase1ProbRes[0].count);

  // ── Local state files ──────────────────────────────────────────────────────
  const phase1State    = readJsonSet(path.join(SCRIPT_DIR, 'phase1-state.json'));
  const phase2State    = readJsonSet(path.join(SCRIPT_DIR, 'phase2-state.json'));
  const phase1Problems = countLines(path.join(SCRIPT_DIR, 'phase1-problems.jsonl'));
  const phase2Problems = countLines(path.join(SCRIPT_DIR, 'phase2-problems.jsonl'));

  // ── Render ─────────────────────────────────────────────────────────────────
  const W = 65;
  const line = '═'.repeat(W);
  const pad  = (s: string) => `║  ${s.padEnd(W - 3)}║`;

  console.log(`\n╔${line}╗`);
  console.log(pad(`GREEN BOWTIE — Enrichment Status  [${today}]`));
  console.log(`╠${line}╣`);
  console.log(pad(`Total venues:     ${fmt(total)}`));
  console.log(pad(`Has pricing:      ${fmt(pricing).padStart(6)}  (${pct(pricing, total)})  ${bar(pricing/total*100)}`));
  console.log(pad(`Has capacity:     ${fmt(capacity).padStart(6)}  (${pct(capacity, total)})  ${bar(capacity/total*100)}`));
  console.log(pad(`Has description:  ${fmt(described).padStart(6)}  (${pct(described, total)})  ${bar(described/total*100)}`));
  console.log(`╠${line}╣`);
  console.log(pad(`Phase 1 (websites):  ${fmt(phase1State.size)} processed locally  /  ${p1done} in DB  /  ${phase1Problems} problems`));
  console.log(pad(`Phase 2 (knot):      ${fmt(phase2State.size)} cities done  /  ${phase2Problems} problems`));
  console.log(`╠${line}╣`);
  console.log(pad(`Top states by venue count:`));
  for (const s of topStates) {
    const v = Number(s.venues);
    const pr = Number(s.priced);
    const ca = Number(s.capacitated);
    console.log(pad(`  ${s.state.padEnd(20)} ${fmt(v).padStart(6)} venues  priced: ${pct(pr,v)}  cap: ${pct(ca,v)}`));
  }
  console.log(`╚${line}╝\n`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
