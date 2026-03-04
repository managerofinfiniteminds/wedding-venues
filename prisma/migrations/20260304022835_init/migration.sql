-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'CA',
    "zip" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "tiktok" TEXT,
    "venueType" TEXT NOT NULL,
    "styleTags" TEXT[],
    "minGuests" INTEGER,
    "maxGuests" INTEGER,
    "seatedMax" INTEGER,
    "standingMax" INTEGER,
    "ceremonyOnly" BOOLEAN NOT NULL DEFAULT false,
    "baseRentalMin" INTEGER,
    "baseRentalMax" INTEGER,
    "priceTier" TEXT,
    "perHeadMin" INTEGER,
    "perHeadMax" INTEGER,
    "depositPercent" INTEGER,
    "peakPricing" BOOLEAN NOT NULL DEFAULT false,
    "offPeakDiscount" BOOLEAN NOT NULL DEFAULT false,
    "allInclusive" BOOLEAN NOT NULL DEFAULT false,
    "spacesDescription" TEXT,
    "hasBridalSuite" BOOLEAN NOT NULL DEFAULT false,
    "hasGroomSuite" BOOLEAN NOT NULL DEFAULT false,
    "hasOutdoorSpace" BOOLEAN NOT NULL DEFAULT false,
    "hasIndoorSpace" BOOLEAN NOT NULL DEFAULT false,
    "parkingSpots" INTEGER,
    "tablesChairsIncluded" BOOLEAN NOT NULL DEFAULT false,
    "linensIncluded" BOOLEAN NOT NULL DEFAULT false,
    "avIncluded" BOOLEAN NOT NULL DEFAULT false,
    "lightingIncluded" BOOLEAN NOT NULL DEFAULT false,
    "cateringKitchen" BOOLEAN NOT NULL DEFAULT false,
    "barSetup" BOOLEAN NOT NULL DEFAULT false,
    "onSiteCoordinator" BOOLEAN NOT NULL DEFAULT false,
    "preferredVendorList" BOOLEAN NOT NULL DEFAULT false,
    "outsideVendorsAllowed" BOOLEAN NOT NULL DEFAULT true,
    "inHouseCateringRequired" BOOLEAN NOT NULL DEFAULT false,
    "byobPolicy" TEXT,
    "setupHours" DOUBLE PRECISION,
    "teardownHours" DOUBLE PRECISION,
    "earliestStart" TEXT,
    "latestEnd" TEXT,
    "noiseOrdinance" TEXT,
    "nearbyLodging" BOOLEAN NOT NULL DEFAULT false,
    "leadTimeMonths" INTEGER,
    "cancellationPolicy" TEXT,
    "photoTags" TEXT[],
    "naturalLight" TEXT,
    "indoorOutdoorMix" TEXT,
    "adaCompliant" BOOLEAN NOT NULL DEFAULT false,
    "elevatorAccess" BOOLEAN NOT NULL DEFAULT false,
    "googleRating" DOUBLE PRECISION,
    "googleReviews" INTEGER,
    "knotRating" DOUBLE PRECISION,
    "knotReviews" INTEGER,
    "weddingwireRating" DOUBLE PRECISION,
    "weddingwireReviews" INTEGER,
    "featuredIn" TEXT[],
    "primaryPhotoUrl" TEXT,
    "photoCount" INTEGER,
    "virtualTourUrl" TEXT,
    "lastVerified" TIMESTAMP(3),
    "dataSource" TEXT,
    "completenessScore" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Venue_slug_key" ON "Venue"("slug");

-- CreateIndex
CREATE INDEX "Venue_city_idx" ON "Venue"("city");

-- CreateIndex
CREATE INDEX "Venue_venueType_idx" ON "Venue"("venueType");

-- CreateIndex
CREATE INDEX "Venue_priceTier_idx" ON "Venue"("priceTier");

-- CreateIndex
CREATE INDEX "Venue_isPublished_idx" ON "Venue"("isPublished");
