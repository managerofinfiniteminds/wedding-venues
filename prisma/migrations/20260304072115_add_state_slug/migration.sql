-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "stateSlug" TEXT NOT NULL DEFAULT 'california';

-- CreateIndex
CREATE INDEX "Venue_stateSlug_idx" ON "Venue"("stateSlug");
