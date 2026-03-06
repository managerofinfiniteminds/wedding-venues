#!/usr/bin/env npx tsx
import "dotenv/config";
/**
 * Green Bowtie Venue Audit Engine
 *
 * Usage:
 *   npx tsx scripts/audit/run.ts --cities livermore,dublin,pleasanton
 *   npx tsx scripts/audit/run.ts --cities livermore,dublin,pleasanton --dry-run
 *   npx tsx scripts/audit/run.ts --stale --days 30
 *   npx tsx scripts/audit/run.ts --all --limit 200
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  checkWeddingRelevance, checkTextQuality, checkUrl,
  checkCompleteness, checkTypeCoherence,
  calculateAuditScore, statusFromScore,
} from "./checks";
import { llmWeddingRelevanceCheck, llmDescriptionQualityCheck } from "./llm-checks";
import { generateReport } from "./report";
import type { VenueAuditResult, AuditRunSummary, AuditFlag } from "./types";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── CLI args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const allVenues = args.includes("--all");
const staleMode = args.includes("--stale");
const staleDays = parseInt(args[args.indexOf("--days") + 1] ?? "30");
const limitArg = args[args.indexOf("--limit") + 1];
const limit = limitArg ? parseInt(limitArg) : undefined;

const citiesArg = args[args.indexOf("--cities") + 1];
const targetCities = citiesArg
  ? citiesArg.split(",").map((c) => c.trim().replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()))
  : [];

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔍 Green Bowtie Venue Audit`);
  console.log(`   Mode: ${dryRun ? "DRY RUN (no DB writes)" : "LIVE"}`);
  if (targetCities.length) console.log(`   Cities: ${targetCities.join(", ")}`);
  if (staleMode) console.log(`   Stale mode: venues not audited in ${staleDays}+ days`);
  console.log("");

  const where: Prisma.VenueWhereInput = {};
  if (targetCities.length) {
    where.city = { in: targetCities };
    where.stateSlug = "california";
  }
  if (staleMode) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - staleDays);
    where.OR = [{ lastAuditedAt: null }, { lastAuditedAt: { lt: cutoff } }];
  }

  const venues = await prisma.venue.findMany({
    where,
    orderBy: [{ city: "asc" }, { name: "asc" }],
  });

  console.log(`📋 Found ${venues.length} venues to audit\n`);

  const results: VenueAuditResult[] = [];
  let processed = 0;

  for (const venue of venues) {
    processed++;
    process.stdout.write(`  [${processed}/${venues.length}] ${venue.name.slice(0, 52).padEnd(52)} `);

    const allFlags: AuditFlag[] = [];
    const textFixes: Record<string, string> = {};

    // 1. Wedding relevance (keyword-based)
    allFlags.push(...checkWeddingRelevance(venue));

    // 2. Text quality (auto-fix encoding/HTML entities)
    const { flags: textFlags, fixes } = checkTextQuality(venue);
    allFlags.push(...textFlags);
    Object.assign(textFixes, fixes);

    // 3. URL validation
    const urlFlags = await checkUrl(venue.website);
    allFlags.push(...urlFlags);

    // 4. Completeness
    allFlags.push(...checkCompleteness({ ...venue, primaryPhotoUrl: venue.primaryPhotoUrl ?? null }));

    // 5. Type coherence
    allFlags.push(...checkTypeCoherence(venue));

    // 6. LLM wedding relevance
    const llmRelevanceFlags = await llmWeddingRelevanceCheck(venue);
    allFlags.push(...llmRelevanceFlags);

    // 7. LLM description quality
    const { flags: llmDescFlags, improvedDescription } = await llmDescriptionQualityCheck(venue);
    allFlags.push(...llmDescFlags);

    const score = calculateAuditScore(allFlags);
    const status = statusFromScore(score, allFlags);
    const autoFixesApplied = allFlags.filter((f) => f.autoFixed).length;

    const emoji = status === "clean" ? "✅" : status === "needs_review" ? "⚠️ " : "🚨";
    const critical = allFlags.filter((f) => f.severity === "critical" && !f.autoFixed).length;
    console.log(`${emoji} score=${score} flags=${allFlags.length}${critical ? ` crit=${critical}` : ""}`);

    if (!dryRun) {
      const updateData: Record<string, unknown> = {
        lastAuditedAt: new Date(),
        auditScore: score,
        auditStatus: status,
        auditFlags: allFlags as object[],
      };
      if (textFixes.description) updateData.description = textFixes.description;
      if (textFixes.name) updateData.name = textFixes.name;
      if (improvedDescription) updateData.description = improvedDescription;

      await prisma.venue.update({ where: { id: venue.id }, data: updateData });
    }

    results.push({
      id: venue.id,
      name: venue.name,
      city: venue.city,
      auditScore: score,
      auditStatus: status,
      flags: allFlags,
      autoFixesApplied,
      wasPublished: venue.isPublished,
      isPublished: venue.isPublished,
    });
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const summary: AuditRunSummary = {
    runAt: new Date().toISOString(),
    cities: targetCities,
    totalVenues: results.length,
    clean: results.filter((r) => r.auditStatus === "clean").length,
    needsReview: results.filter((r) => r.auditStatus === "needs_review").length,
    flagged: results.filter((r) => r.auditStatus === "flagged").length,
    totalFlags: results.reduce((s, r) => s + r.flags.length, 0),
    criticalFlags: results.reduce((s, r) => s + r.flags.filter((f) => f.severity === "critical" && !f.autoFixed).length, 0),
    warningFlags: results.reduce((s, r) => s + r.flags.filter((f) => f.severity === "warning" && !f.autoFixed).length, 0),
    autoFixesApplied: results.reduce((s, r) => s + r.autoFixesApplied, 0),
    results,
  };

  console.log(`\n${"─".repeat(60)}`);
  console.log(`✅ Clean:        ${summary.clean}`);
  console.log(`⚠️  Needs review: ${summary.needsReview}`);
  console.log(`🚨 Flagged:      ${summary.flagged}`);
  console.log(`🔧 Auto-fixes:   ${summary.autoFixesApplied}`);
  console.log(`   Critical flags: ${summary.criticalFlags}`);
  console.log(`${"─".repeat(60)}\n`);

  const reportPath = await generateReport(summary);
  console.log(`📄 Report: ${reportPath}`);
  if (dryRun) console.log("\n⚠️  DRY RUN — no changes written to DB");

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});
