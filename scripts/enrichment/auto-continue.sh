#!/bin/bash
# auto-continue.sh — Waits for phase1 to finish, then auto-launches phase2.
# Runs as background watcher. Logs to /tmp/enrichment-auto.log
#
# Usage: NEON_URL="..." nohup ./scripts/enrichment/auto-continue.sh &

set -e
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

DB_URL="${NEON_URL:-$DATABASE_URL}"
LOG="/tmp/enrichment-auto.log"
PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }

log "auto-continue.sh started. Watching for phase1 completion..."

# Wait for phase1 process to finish
while pgrep -f "phase1-website" > /dev/null 2>&1; do
  sleep 30
done

log "Phase1 finished. Waiting 10s then starting phase2..."
sleep 10

# Final phase1 stats
DONE=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM \"Venue\" WHERE \"lastVerified\" > '2000-01-02';" 2>/dev/null | tr -d ' \n')
PROBLEMS=$(wc -l < "$PROJECT_DIR/phase1-problems.jsonl" 2>/dev/null || echo 0)
log "Phase1 result: $DONE venues updated, $PROBLEMS problems"

# Run status snapshot
log "Status snapshot:"
DATABASE_URL="$DB_URL" npx tsx "$PROJECT_DIR/scripts/enrichment/status.ts" 2>&1 | tee -a "$LOG"

# Launch phase2 (Knot city pricing) — needs browser running
log "Starting phase2 (Knot city pricing)..."
cd "$PROJECT_DIR"
DATABASE_URL="$DB_URL" npx tsx scripts/enrichment/phase2-knot-cities.ts --resume 2>&1 | tee -a "$LOG"

log "Phase2 complete. Final status:"
DATABASE_URL="$DB_URL" npx tsx scripts/enrichment/status.ts 2>&1 | tee -a "$LOG"
log "All enrichment phases complete."
