#!/bin/bash
# db-safe-run.sh — Safe wrapper for any enrichment run against a database.
#
# ALWAYS:
#   1. Takes a backup of the target DB before running
#   2. Records row count before
#   3. Runs the command
#   4. Verifies row count after (alerts if count drops)
#
# Usage:
#   NEON_URL="postgresql://..." ./scripts/db-safe-run.sh npx tsx scripts/enrichment/run.ts --city livermore
#   ./scripts/db-safe-run.sh npx tsx scripts/enrichment/batch-cities.ts --state california

set -e

export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

# ── Resolve DB URL ──────────────────────────────────────────────────────────
# Priority: NEON_URL env var > DATABASE_URL env var > .env file
if [ -n "$NEON_URL" ]; then
  DB_URL="$NEON_URL"
  DB_LABEL="neon (prod)"
elif [ -n "$DATABASE_URL" ]; then
  DB_URL="$DATABASE_URL"
  if echo "$DB_URL" | grep -q "neon.tech"; then
    DB_LABEL="neon (prod)"
  else
    DB_LABEL="local"
  fi
else
  echo "❌ No DB URL found. Set NEON_URL or DATABASE_URL."
  exit 1
fi

# ── Backup ──────────────────────────────────────────────────────────────────
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/wedding-venues-backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.dump"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   DB SAFE RUN                                        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  DB:      $DB_LABEL"
echo "  Backup:  $BACKUP_FILE"
echo "  Command: $@"
echo ""

echo "📦 [1/4] Taking backup..."
if pg_dump "$DB_URL" -Fc -f "$BACKUP_FILE" 2>&1; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "  ✓ Backup complete ($BACKUP_SIZE)"
else
  echo "  ❌ Backup FAILED — aborting. Not safe to proceed."
  exit 1
fi

echo ""
echo "📊 [2/4] Recording row count before..."
COUNT_BEFORE=$(psql "$DB_URL" -t -c 'SELECT COUNT(*) FROM "Venue";' 2>/dev/null | tr -d ' \n')
echo "  ✓ Venues before: $COUNT_BEFORE"

echo ""
echo "🚀 [3/4] Running command..."
echo "─────────────────────────────────────────────────────────"
export DATABASE_URL="$DB_URL"
if "$@"; then
  RUN_EXIT=0
else
  RUN_EXIT=$?
  echo ""
  echo "  ⚠️  Command exited with code $RUN_EXIT"
fi
echo "─────────────────────────────────────────────────────────"

echo ""
echo "📊 [4/4] Verifying row count after..."
COUNT_AFTER=$(psql "$DB_URL" -t -c 'SELECT COUNT(*) FROM "Venue";' 2>/dev/null | tr -d ' \n')
echo "  Venues before: $COUNT_BEFORE"
echo "  Venues after:  $COUNT_AFTER"

if [ "$COUNT_AFTER" -lt "$COUNT_BEFORE" ]; then
  echo ""
  echo "  🚨 ROW COUNT DROPPED! $COUNT_BEFORE → $COUNT_AFTER"
  echo "  🚨 DATA MAY HAVE BEEN DELETED!"
  echo ""
  echo "  Restore with:"
  echo "    pg_restore --clean --no-acl --no-owner -d \"$DB_URL\" $BACKUP_FILE"
  echo ""
  exit 1
elif [ "$COUNT_AFTER" -gt "$COUNT_BEFORE" ]; then
  ADDED=$((COUNT_AFTER - COUNT_BEFORE))
  echo "  ✓ $ADDED new venues added (total: $COUNT_AFTER)"
else
  echo "  ✓ Count unchanged — enrichment only (no new/deleted rows)"
fi

echo ""
echo "♻️  Restore command (if ever needed):"
echo "   pg_restore --clean --no-acl --no-owner -d \"\$NEON_URL\" $BACKUP_FILE"
echo ""

if [ "$RUN_EXIT" -ne 0 ]; then
  exit $RUN_EXIT
fi
