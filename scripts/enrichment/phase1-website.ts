
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import { URL } from 'node:url';

// --- Utils ---
async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simple semaphore for concurrency control
class Semaphore {
  private permits: number;
  private queue: (() => void)[] = [];

  constructor(initialPermits: number) {
    this.permits = initialPermits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
    } else {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
  }

  release(): void {
    this.permits++;
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve?.();
    }
  }
}

function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.search = '';
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

// --- Prisma Client Setup ---
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- Configuration ---
const BATCH_SIZE = 50;
const CONCURRENT_REQUESTS = 5;
const REQUEST_TIMEOUT_MS = 8000;
const PAGE_PATHS_TO_TRY = ['/weddings/', '/events/', '/private-events/', '/'];
const PHASE1_STATE_FILE = 'phase1-state.json';
const PHASE1_PROBLEMS_FILE = 'phase1-problems.jsonl';

// --- Regex for HTML Extraction (No Cheerio/AI) ---
const REGEX = {
  META_DESCRIPTION: /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
  PARAGRAPH: /<p[^>]*>([\s\S]+?)<\/p>/i,
  CATERING: /(catering|in-house\s+catering|outside\s+caterer|preferred\s+vendor)/i,
  ALCOHOL: /(byob|outside\s+alcohol|no\s+outside\s+alcohol|bar\s+service|cash\s+bar)/i,
  CAPACITY: /(up\s+to\s+(\d+(?:,\d+)*)\s+guests?|seats?\s+(\d+(?:,\d+)*)|maximum\s+(\d+(?:,\d+)*)\s+guests?)/i,
  INSTAGRAM_OG: /<meta\s+property=["']og:see_also["']\s+content=["'](.*instagram\.com\/[^"']+)["']/i,
  INSTAGRAM_HREF: /<a[^>]*href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"']+)["']/i,
  FACEBOOK_HREF: /<a[^>]*href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"']+)["']/i,
};

function extractFromHtml(html: string): {
  description?: string;
  cateringInfo?: string;
  alcoholInfo?: string;
  maxGuests?: number;
  instagram?: string;
  facebook?: string;
} {
  const result: ReturnType<typeof extractFromHtml> = {};

  // Description
  let match = html.match(REGEX.META_DESCRIPTION);
  if (match && match[1]) {
    result.description = match[1].trim();
  } else {
    match = html.match(REGEX.PARAGRAPH);
    if (match && match[1] && match[1].length > 100) {
      result.description = match[1].replace(/<[^>]*>/g, '').trim(); // Remove HTML tags from paragraph
    }
  }

  // Catering
  match = html.match(REGEX.CATERING);
  if (match) {
    result.cateringInfo = match[1];
  }

  // Alcohol
  match = html.match(REGEX.ALCOHOL);
  if (match) {
    result.alcoholInfo = match[1];
  }

  // Capacity
  match = html.match(REGEX.CAPACITY);
  if (match) {
    const rawNumber = match[2] || match[3] || match[4];
    if (rawNumber) {
      result.maxGuests = parseInt(rawNumber.replace(/,/g, ''), 10);
    }
  }

  // Social Links
  match = html.match(REGEX.INSTAGRAM_OG);
  if (match && match[1]) {
    result.instagram = normalizeUrl(match[1]);
  }
  if (!result.instagram) {
    match = html.match(REGEX.INSTAGRAM_HREF);
    if (match && match[1]) {
      result.instagram = normalizeUrl(match[1]);
    }
  }

  match = html.match(REGEX.FACEBOOK_HREF);
  if (match && match[1]) {
    result.facebook = normalizeUrl(match[1]);
  }

  return result;
}

// --- State Management ---
interface Phase1State {
  processedIds: Set<number>;
}

async function loadState(): Promise<Phase1State> {
  try {
    const content = await fs.readFile(PHASE1_STATE_FILE, 'utf-8');
    const ids = JSON.parse(content) as number[];
    return { processedIds: new Set(ids) };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { processedIds: new Set() };
    }
    console.error(`Failed to load state file: ${error.message}`);
    return { processedIds: new Set() };
  }
}

async function saveState(state: Phase1State) {
  try {
    await fs.writeFile(PHASE1_STATE_FILE, JSON.stringify(Array.from(state.processedIds)), 'utf-8');
  } catch (error: any) {
    console.error(`Failed to save state file: ${error.message}`);
  }
}

async function logProblemVenue(problem: { id: number; name: string; city: string; state: string; website: string; error: string; ts: string }) {
  try {
    await fs.appendFile(PHASE1_PROBLEMS_FILE, JSON.stringify(problem) + '\\n', 'utf-8');
  } catch (error: any) {
    console.error(`Failed to log problem venue: ${error.message}`);
  }
}

// --- Main Processing Logic ---
async function processVenue(venue: any, semaphore: Semaphore, dryRun: boolean): Promise<boolean> {
  await semaphore.acquire();
  try {
    if (!venue.website) {
      await logProblemVenue({
        id: venue.id,
        name: venue.name,
        city: venue.city,
        state: venue.state,
        website: venue.website,
        error: 'No website URL',
        ts: new Date().toISOString(),
      });
      return false;
    }

    let htmlContent: string | null = null;
    let finalUrl: string | null = null;
    let fetchError: string | null = null;

    for (const path of PAGE_PATHS_TO_TRY) {
      const urlToFetch = `${venue.website.endsWith('/') ? venue.website.slice(0, -1) : venue.website}${path}`;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        const response = await fetch(urlToFetch, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          htmlContent = await response.text();
          finalUrl = urlToFetch;
          if (htmlContent.length > 500) break; // Found enough content to try extracting
        } else {
          fetchError = `${response.status} ${response.statusText}`;
        }
      } catch (e: any) {
        if (e.name === 'AbortError') {
          fetchError = 'Timeout';
        } else if (e.cause && e.cause.code === 'ENOTFOUND') {
          fetchError = 'DNS resolution failed';
        } else {
          fetchError = e.message;
        }
      }
    }

    if (!htmlContent) {
      await logProblemVenue({
        id: venue.id,
        name: venue.name,
        city: venue.city,
        state: venue.state,
        website: venue.website,
        error: `Failed to fetch any page or content too small: ${fetchError}`,
        ts: new Date().toISOString(),
      });
      return false;
    }

    const extracted = extractFromHtml(htmlContent);

    const updateData: any = {
      lastVerified: new Date(),
    };

    let needsUpdate = false;

    // description — if null or < 50 chars
    if (extracted.description && (venue.description === null || venue.description.length < 50)) {
      updateData.description = extracted.description;
      needsUpdate = true;
    }

    // inHouseCateringRequired, outsideVendorsAllowed (infer from cateringInfo)
    if (extracted.cateringInfo) {
      const lowerCatering = extracted.cateringInfo.toLowerCase();
      if (lowerCatering.includes('in-house catering')) {
        if (venue.inHouseCateringRequired === null) {
          updateData.inHouseCateringRequired = true;
          needsUpdate = true;
        }
        if (venue.outsideVendorsAllowed === null) {
          updateData.outsideVendorsAllowed = false;
          needsUpdate = true;
        }
      } else if (lowerCatering.includes('outside caterer') || lowerCatering.includes('preferred vendor')) {
        if (venue.outsideVendorsAllowed === null) {
          updateData.outsideVendorsAllowed = true;
          needsUpdate = true;
        }
      }
    }

    // byobPolicy (infer from alcoholInfo)
    if (extracted.alcoholInfo && venue.byobPolicy === null) {
      updateData.byobPolicy = extracted.alcoholInfo;
      needsUpdate = true;
    }

    // maxGuests — if null
    if (extracted.maxGuests && venue.maxGuests === null) {
      updateData.maxGuests = extracted.maxGuests;
      needsUpdate = true;
    }

    // instagram — if null
    if (extracted.instagram && venue.instagram === null) {
      updateData.instagram = extracted.instagram;
      needsUpdate = true;
    }

    // facebook — if null
    if (extracted.facebook && venue.facebook === null) {
      updateData.facebook = extracted.facebook;
      needsUpdate = true;
    }

    // dataSource — append "venue-website" if not already present
    if (needsUpdate) {
      const currentSources = venue.dataSource ? venue.dataSource.split(',').map((s: string) => s.trim()) : [];
      if (!currentSources.includes('venue-website')) {
        currentSources.push('venue-website');
        updateData.dataSource = currentSources.join(',');
      }
    }

    if (needsUpdate && !dryRun) {
      await prisma.venue.update({
        where: { id: venue.id },
        data: updateData,
      });
      return true;
    } else {
      // If no update, still mark as processed and set lastVerified
      if (!dryRun) {
        await prisma.venue.update({
          where: { id: venue.id },
          data: { lastVerified: new Date() },
        });
      }
      return true;
    }

  } finally {
    semaphore.release();
  }
}

async function main() {
  let state = await loadState();
  let updatedCount = 0;
  let problemCount = 0;
  let processedThisRun = 0;

  // Argument parsing
  const args = process.argv.slice(2);
  const findArg = (name: string) => {
    const index = args.indexOf(name);
    return index !== -1 ? args[index + 1] : undefined;
  };

  const stateFilter = findArg('--state');
  const limitArg = findArg('--limit');
  const resume = args.includes('--resume');
  const dryRun = args.includes('--dry-run');

  if (dryRun) {
    console.log('--- DRY RUN MODE --- No database writes will be performed.');
  }

  // Create or clear problems file
  if (!resume && fsSync.existsSync(PHASE1_PROBLEMS_FILE)) {
    await fs.unlink(PHASE1_PROBLEMS_FILE);
  }

  let offset = 0;
  let hasMore = true;
  let totalVenues = 0;

  // First, get total count
  totalVenues = await prisma.venue.count({
    where: {
      lastVerified: resume ? { not: new Date('2000-01-01') } : null,
      ...(stateFilter ? { state: stateFilter } : {}),
    },
  });

  if (resume) {
    // Re-count total for resume to reflect unprocessed ones
    totalVenues = await prisma.venue.count({
      where: {
        lastVerified: { equals: null }, // Only null and not the sentinel value
        ...(stateFilter ? { state: stateFilter } : {}),
      },
    });
  }

  console.log(`[phase1] Starting enrichment. Total venues to process: ${totalVenues}`);

  const startTime = Date.now();
  const semaphore = new Semaphore(CONCURRENT_REQUESTS);

  async function fetchAndProcessBatch() {
    while (hasMore) {
      const venues = await prisma.venue.findMany({
        where: {
          lastVerified: resume ? { equals: null } : null, // Only fetch where lastVerified is actually null for resume
          ...(stateFilter ? { state: stateFilter } : {}),
        },
        orderBy: { id: 'asc' },
        take: BATCH_SIZE,
        skip: offset, // Pagination
      });

      if (venues.length === 0) {
        hasMore = false;
        break;
      }

      const tasks = venues.map(async (venue: any) => {
        if (resume && state.processedIds.has(venue.id)) {
          return Promise.resolve(false); // Skip already processed in resume mode
        }
        try {
          const success = await processVenue(venue, semaphore, dryRun);
          if (success) {
            updatedCount++;
            state.processedIds.add(venue.id);
          } else {
            problemCount++;
            // If processing failed, set lastVerified to sentinel only if not dry run
            if (!dryRun) {
              await prisma.venue.update({
                where: { id: venue.id },
                data: { lastVerified: new Date('2000-01-01') },
              });
            }
          }
        } catch (error) {
          console.error(`Error processing venue ${venue.id}:`, error);
          problemCount++;
          // Always log to problems file, even if we caught a generic error
          await logProblemVenue({
            id: venue.id,
            name: venue.name,
            city: venue.city,
            state: venue.state,
            website: venue.website,
            error: (error as Error).message || 'Unknown error',
            ts: new Date().toISOString(),
          });
          // Set lastVerified to sentinel if not dry run
          if (!dryRun) {
            await prisma.venue.update({
              where: { id: venue.id },
              data: { lastVerified: new Date('2000-01-01') },
            });
          }
        }
        processedThisRun++;

        if (processedThisRun % 100 === 0) {
          const elapsed = (Date.now() - startTime) / 1000; // seconds
          const venuesPerSecond = processedThisRun / elapsed;
          const remainingVenues = totalVenues - processedThisRun;
          const etaMinutes = remainingVenues > 0 ? (remainingVenues / venuesPerSecond / 60).toFixed(1) : '0';
          console.log(
            `[phase1] ${processedThisRun}/${totalVenues} (${((processedThisRun / totalVenues) * 100 || 0).toFixed(
              1,
            )}%) | updated: ${updatedCount} | problems: ${problemCount} | eta: ${etaMinutes}min`,
          );
        }
      });

      await Promise.all(tasks);
      await saveState(state); // Save state after each batch

      offset += venues.length;
      if (limitArg && processedThisRun >= parseInt(limitArg, 10)) {
        hasMore = false;
      }

      if (totalVenues > 0 && processedThisRun >= totalVenues) {
        hasMore = false;
      }
    }
  }

  // Handle SIGINT/SIGTERM for graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\\n[phase1] SIGINT received. Flushing current batch and saving state...');
    // No need to flush current batch explicitly as saveState is done after each Promise.all(tasks)
    await saveState(state);
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    console.log('\\n[phase1] SIGTERM received. Flushing current batch and saving state...');
    await saveState(state);
    process.exit(0);
  });

  await fetchAndProcessBatch();


  console.log(`[phase1] Enrichment complete. Total processed: ${processedThisRun}, Updated: ${updatedCount}, Problems: ${problemCount}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
