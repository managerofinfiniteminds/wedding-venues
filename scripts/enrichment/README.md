# Green Bowtie — Venue Enrichment Pipeline

## Sources (confirmed working via browser)

| Source | Data | Status |
|--------|------|--------|
| The Knot | Price, capacity, amenities, coordinator, ratings, peak season | ✅ Full access |
| Venue websites | Policies, catering, alcohol, BYOB, room details | ✅ Full access |
| Yelp | Ratings, reviews, category tags | ✅ Full access |
| Google Places (API) | Photos, base rating, hours, address | ✅ Already in DB |
| WeddingWire | Everything | ❌ 404s all pages |

## Pipeline Flow

1. `discover.ts` — find Knot URLs for all venues in a city
2. `scrape-knot.ts` — scrape each Knot page → structured JSON
3. `scrape-venue-site.ts` — scrape venue's own website for policies
4. `scrape-yelp.ts` — scrape Yelp for rating + review signals
5. `parse-and-merge.ts` — merge all sources, resolve conflicts
6. `upsert-db.ts` — write to DB with confidence scores

## Completeness Scoring
- 100% = all fields filled from verified sources
- 85% = price + capacity + amenities + description + coordinator
- 70% = price + capacity + description
- 50% = description + amenities only
- 30% = name + type only (skeleton)

## Running
```
DATABASE_URL=... npx tsx scripts/enrichment/run.ts --city livermore --state california
```
