#!/bin/bash
# db-backup.sh — Safe backup before any DB operation
# Usage: ./scripts/db-backup.sh [local|neon]
#
# MANDATORY: Run this before any write operation on the target DB.

set -e

export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

TARGET="${1:-neon}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/wedding-venues-backups"
mkdir -p "$BACKUP_DIR"

if [ "$TARGET" = "neon" ]; then
  if [ -z "$NEON_URL" ]; then
    echo "❌ NEON_URL not set. Export it first:"
    echo "   export NEON_URL='postgresql://neondb_owner:...@...neon.tech/neondb?sslmode=require'"
    exit 1
  fi
  BACKUP_FILE="$BACKUP_DIR/neon_backup_${TIMESTAMP}.sql"
  echo "📦 Backing up Neon (prod) → $BACKUP_FILE"
  pg_dump "$NEON_URL" -Fc -f "$BACKUP_FILE"
  ROW_COUNT=$(psql "$NEON_URL" -t -c 'SELECT COUNT(*) FROM "Venue";' | tr -d ' ')
  echo "✅ Neon backup complete — $ROW_COUNT venues"
  echo "   File: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
  echo ""
  echo "♻️  To restore:"
  echo "   pg_restore --clean --no-acl --no-owner -d \"\$NEON_URL\" $BACKUP_FILE"

elif [ "$TARGET" = "local" ]; then
  LOCAL_URL="postgresql://waynekool@localhost:5432/wedding_venues"
  BACKUP_FILE="$BACKUP_DIR/local_backup_${TIMESTAMP}.sql"
  echo "📦 Backing up local DB → $BACKUP_FILE"
  pg_dump "$LOCAL_URL" -Fc -f "$BACKUP_FILE"
  ROW_COUNT=$(psql "$LOCAL_URL" -t -c 'SELECT COUNT(*) FROM "Venue";' | tr -d ' ')
  echo "✅ Local backup complete — $ROW_COUNT venues"
  echo "   File: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

else
  echo "Usage: $0 [local|neon]"
  exit 1
fi
