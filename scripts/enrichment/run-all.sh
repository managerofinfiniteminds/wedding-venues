#!/bin/bash
# run-all.sh — Master enrichment pipeline with auto-backup and safety checks
# Usage: NEON_URL="postgresql://..." ./scripts/enrichment/run-all.sh [options]
# Options: --dry-run, --state <name>, --phase1-only, --phase2-only, --resume, --status-only

set -e

# 1. Parse args
DRY_RUN=false
STATE_FILTER=
PHASE1_ONLY=false
PHASE2_ONLY=false
RESUME=false
STATUS_ONLY=false

for i in \"$@\"
do
case $i in
    --dry-run)
    DRY_RUN=true
    shift
    ;;
    --state=*)
    STATE_FILTER=\"${i#*=}\"
    shift
    ;;
    --phase1-only)
    PHASE1_ONLY=true
    shift
    ;;
    --phase2-only)
    PHASE2_ONLY=true
    shift
    ;;
    --resume)
    RESUME=true
    shift
    ;;
    --status-only)
    STATUS_ONLY=true
    shift
    ;;
    -*|--*)
    echo \"Unknown option $i\"
    exit 1
    ;;
    *)
    ;;
esac
done

# 2. Resolve DB URL (NEON_URL takes precedence over DATABASE_URL)
DB_URL=\"${NEON_URL:-$DATABASE_URL}\"
if [ -z \"$DB_URL\" ]; then
  echo \"Error: Neither NEON_URL nor DATABASE_URL environment variables are set.\"
  exit 1
fi
export DATABASE_URL=\"$DB_URL\"

# Determine mode string for header
MODE=\"FULL RUN\"
if [ \"$PHASE1_ONLY\" = true ]; then MODE=\"PHASE 1 ONLY\"; fi
if [ \"$PHASE2_ONLY\" = true ]; then MODE=\"PHASE 2 ONLY\"; fi
if [ \"$STATUS_ONLY\" = true ]; then MODE=\"STATUS ONLY\"; fi
if [ \"$DRY_RUN\" = true ]; then MODE=\"$MODE (DRY RUN)\"; fi
if [ \"$RESUME\" = true ]; then MODE=\"$MODE (RESUME)\"; fi

# 3. If not --status-only: call scripts/db-backup.sh neon for auto-backup
if [ \"$STATUS_ONLY\" = false ]; then
  echo \"$(date +\"[%Y-%m-%d %H:%M:%S]\") Running DB backup...\"
  # Assuming scripts/db-backup.sh exists relative to this script's parent directory
  BACKUP_SCRIPT=\"$(dirname \"$0\")/../db-backup.sh\"
  if [ ! -f \"$BACKUP_SCRIPT\" ]; then
    echo \"Error: db-backup.sh not found at $BACKUP_SCRIPT\"
    exit 1
  fi
  \"$BACKUP_SCRIPT\" neon || { echo \"DB backup failed, exiting.\"; exit 1; }
  echo \"DB backup successful.\"
fi

# 4. Print header with timestamp, DB target, mode
echo \"\n╔═══════════════════════════════════════════════════════════════╗\"
echo \"║ GREEN BOWTIE — ENRICHMENT PIPELINE           [$(date +\"%Y-%m-%d %H:%M:%S\")] ║\"
echo \"╠═══════════════════════════════════════════════════════════════╣\"
echo \"║ Target DB: $(echo \"$DB_URL\" | sed -r 's/^(.*:)\/\/.+@([^/:]+)(:.*)?\/([^?]+).*$/\\1\/\\/\\2\/\\4/')               ║\"
echo \"║ Mode: $MODE$(printf \'%*s\' $((54 - ${#MODE})) )║\"
echo \"╚═══════════════════════════════════════════════════════════════╝\"\n
# Store initial venue count
if [ \"$STATUS_ONLY\" = false ]; then
  echo \"$(date +\"[%Y-%m-%d %H:%M:%S]\") Getting initial venue count...\"
  INITIAL_VENUE_COUNT=$(psql \"$DB_URL\" -t -c \"SELECT COUNT(*) FROM \\\"Venue\\\" WHERE \\\"isPublished\\\"=true;\" | xargs)
  echo \"Initial venue count: $INITIAL_VENUE_COUNT\"
fi

# 5. Unless --phase2-only: run npx tsx scripts/enrichment/phase1-website.ts
if [ \"$PHASE2_ONLY\" = false ] && [ \"$STATUS_ONLY\" = false ]; then
  echo \"\n$(date +\"[%Y-%m-%d %H:%M:%S]\") Running Phase 1 (website scraping)...\"
  PHASE1_ARGS=
  if [ \"$DRY_RUN\" = true ]; then PHASE1_ARGS=\"$PHASE1_ARGS --dry-run\"; fi
  if [ \"$RESUME\" = true ]; then PHASE1_ARGS=\"$PHASE1_ARGS --resume\"; fi
  if [ -n \"$STATE_FILTER\" ]; then PHASE1_ARGS=\"$PHASE1_ARGS --state \"$STATE_FILTER\"\"; fi
  # Placeholder for actual phase1 script command - assuming it exists for now
  echo \"npx tsx \"$(dirname \"$0\")/phase1-website.ts\" \$PHASE1_ARGS\"
  # npx tsx \"$(dirname \"$0\")/phase1-website.ts\" \$PHASE1_ARGS # Uncomment when phase1-website.ts is ready
  echo \"Phase 1 (website scraping) skipped in this task as phase1-website.ts is not provided.\"
fi

# 6. Unless --phase1-only: run npx tsx scripts/enrichment/phase2-knot-cities.ts
if [ \"$PHASE1_ONLY\" = false ] && [ \"$STATUS_ONLY\" = false ]; then
  echo \"\n$(date +\"[%Y-%m-%d %H:%M:%S]\") Running Phase 2 (Knot cities enrichment)...\"
  PHASE2_ARGS=
  if [ \"$DRY_RUN\" = true ]; then PHASE2_ARGS=\"$PHASE2_ARGS --dry-run\"; fi
  if [ \"$RESUME\" = true ]; then PHASE2_ARGS=\"$PHASE2_ARGS --resume\"; fi
  if [ -n \"$STATE_FILTER\" ]; then PHASE2_ARGS=\"$PHASE2_ARGS --state \"$STATE_FILTER\"\"; fi
  npx tsx \"$(dirname \"$0\")/phase2-knot-cities.ts\" \$PHASE2_ARGS
fi

# 7. Record count before and after (using psql), alert if count dropped
if [ \"$STATUS_ONLY\" = false ]; then
  echo \"\n$(date +\"[%Y-%m-%d %H:%M:%S]\") Getting final venue count...\"
  FINAL_VENUE_COUNT=$(psql \"$DB_URL\" -t -c \"SELECT COUNT(*) FROM \\\"Venue\\\" WHERE \\\"isPublished\\\"=true;\" | xargs)
  echo \"Final venue count: $FINAL_VENUE_COUNT\"

  if [ \"$FINAL_VENUE_COUNT\" -lt \"$INITIAL_VENUE_COUNT\" ]; then
    echo \"\\n\\e[31mWARNING: Venue count dropped from $INITIAL_VENUE_COUNT to $FINAL_VENUE_COUNT!\\e[0m\"
    echo \"Please investigate immediately.\"
  elif [ \"$FINAL_VENUE_COUNT\" -gt \"$INITIAL_VENUE_COUNT\" ]; then
    echo \"\\nVenue count increased from $INITIAL_VENUE_COUNT to $FINAL_VENUE_COUNT. Good.\"
  else
    echo \"\\nVenue count remained stable at $INITIAL_VENUE_COUNT.\"
  fi
fi

# 8. Run npx tsx scripts/enrichment/status.ts at the end
echo \"\n$(date +\"[%Y-%m-%d %H:%M:%S]\") Running final status report...\"
npx tsx \"$(dirname \"$0\")/status.ts\"

# 9. Print restore command
if [ \"$STATUS_ONLY\" = false ]; then
  RESTORE_CMD=\"psql -d \"$DB_URL\" -f $(date +\"%Y%m%d\")-db-backup.sql\"
  echo \"\nTo restore from the latest backup (if needed):\"
  echo \"$RESTORE_CMD\"
fi

# Make it executable
chmod +x \"$(dirname \"$0\")/run-all.sh\"
