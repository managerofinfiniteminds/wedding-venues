#!/usr/bin/env npx tsx@latest
/**
 * Sync enriched CA venue data from local CSV → Neon (prod)
 * SAFE: UPDATE only, matches on slug, never deletes rows
 */
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

const NEON_URL = "postgresql://neondb_owner:npg_o3XHSjZF9Pcd@ep-rough-sea-ai8thyl8.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const CSV_FILE = "/tmp/ca_enriched_export.csv";

const pool = new Pool({ connectionString: NEON_URL, max: 5 });

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split("\n");
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => row[h] = values[i] ?? "");
    return row;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseVal(v: string): any {
  if (v === "" || v === "\\N") return null;
  if (v === "t" || v === "true") return true;
  if (v === "f" || v === "false") return false;
  if (v === "{}") return [];
  if (v.startsWith("{") && v.endsWith("}")) {
    // postgres array like {Modern,Garden}
    return v.slice(1, -1).split(",").map(s => s.trim()).filter(Boolean);
  }
  const num = Number(v);
  if (!isNaN(num) && v !== "") return num;
  return v;
}

async function main() {
  const csv = fs.readFileSync(CSV_FILE, "utf-8");
  const rows = parseCSV(csv);
  console.log(`\n🌿 Syncing ${rows.length} enriched CA venues → Neon\n`);

  // Pre-sync count
  const before = await pool.query(`SELECT COUNT(*) FROM "Venue" WHERE "stateSlug"='california' AND "pipelineProcessedAt" IS NOT NULL`);
  console.log(`Neon before: ${before.rows[0].count} processed`);

  let updated = 0, skipped = 0, errors = 0;

  for (const row of rows) {
    try {
      const result = await pool.query(`
        UPDATE "Venue" SET
          description = $1,
          "venueType" = $2,
          "styleTags" = $3,
          "priceTier" = $4,
          "baseRentalMin" = $5,
          "baseRentalMax" = $6,
          "minGuests" = $7,
          "maxGuests" = $8,
          "seatedMax" = $9,
          "hasBridalSuite" = $10,
          "hasGroomSuite" = $11,
          "hasOutdoorSpace" = $12,
          "hasIndoorSpace" = $13,
          "onSiteCoordinator" = $14,
          "cateringKitchen" = $15,
          "barSetup" = $16,
          "tablesChairsIncluded" = $17,
          "linensIncluded" = $18,
          "avIncluded" = $19,
          "lightingIncluded" = $20,
          "adaCompliant" = $21,
          "nearbyLodging" = $22,
          "pipelineProcessedAt" = $23
        WHERE slug = $24
        RETURNING id
      `, [
        parseVal(row.description),
        parseVal(row.venueType),
        parseVal(row.styleTags),
        parseVal(row.priceTier),
        parseVal(row.baseRentalMin),
        parseVal(row.baseRentalMax),
        parseVal(row.minGuests),
        parseVal(row.maxGuests),
        parseVal(row.seatedMax),
        parseVal(row.hasBridalSuite),
        parseVal(row.hasGroomSuite),
        parseVal(row.hasOutdoorSpace),
        parseVal(row.hasIndoorSpace),
        parseVal(row.onSiteCoordinator),
        parseVal(row.cateringKitchen),
        parseVal(row.barSetup),
        parseVal(row.tablesChairsIncluded),
        parseVal(row.linensIncluded),
        parseVal(row.avIncluded),
        parseVal(row.lightingIncluded),
        parseVal(row.adaCompliant),
        parseVal(row.nearbyLodging),
        parseVal(row.pipelineProcessedAt),
        row.slug,
      ]);
      if (result.rowCount && result.rowCount > 0) updated++;
      else skipped++; // slug not found in Neon
    } catch (e: any) {
      console.error(`  ❌ ${row.slug}: ${e.message.slice(0,80)}`);
      errors++;
    }
  }

  // Post-sync count
  const after = await pool.query(`SELECT COUNT(*) FROM "Venue" WHERE "stateSlug"='california' AND "pipelineProcessedAt" IS NOT NULL`);

  console.log(`\n┌─────────────────────────────────┐`);
  console.log(`│  Sync Complete                   │`);
  console.log(`├─────────────────────────────────┤`);
  console.log(`│  Updated        ${String(updated).padEnd(16)} │`);
  console.log(`│  Slug not found ${String(skipped).padEnd(16)} │`);
  console.log(`│  Errors         ${String(errors).padEnd(16)} │`);
  console.log(`│  Neon before    ${String(before.rows[0].count).padEnd(16)} │`);
  console.log(`│  Neon after     ${String(after.rows[0].count).padEnd(16)} │`);
  console.log(`└─────────────────────────────────┘`);

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
