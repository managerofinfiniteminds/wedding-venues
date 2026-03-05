/**
 * Shared types for the venue enrichment pipeline
 */

export interface KnotData {
  name?: string;
  startingPrice?: number;
  typicalSpendPeak?: number;
  typicalSpendOffPeak?: number;
  guestCapacityMin?: number;
  guestCapacityMax?: number;
  peakSeason?: string;
  amenities: string[];
  ceremonyTypes: string[];
  settings: string[];
  services: string[];
  description?: string;
  spacesDescription?: string;
  hasIndoorSpace?: boolean;
  hasOutdoorSpace?: boolean;
  hasBridalSuite?: boolean;
  hasHandicapAccess?: boolean;
  hasWifi?: boolean;
  hasLiabilityInsurance?: boolean;
  hasOnSiteAccommodations?: boolean;
  hasInHouseCatering?: boolean;
  hasBar?: boolean;
  hasPlanning?: boolean;
  hasRentals?: boolean;
  onSiteCoordinator?: boolean;
  coordinatorName?: string;
  coordinatorTitle?: string;
  knotRating?: number;
  knotReviews?: number;
  googleRatingFromKnot?: number;
  googleReviewsFromKnot?: number;
  address?: string;
  phone?: string;
  isKnotAwardWinner?: boolean;
  knotAwardCount?: number;
  isWomanOwned?: boolean;
  yearsInBusiness?: string;
  teamSize?: string;
  knotUrl?: string;
  reviewHighlights?: string[];
}

export interface YelpData {
  name?: string;
  yelpRating?: number;
  yelpReviews?: number;
  yelpCategories?: string[];
  yelpUrl?: string;
  reviewHighlights?: string[];
  priceLevel?: string; // $, $$, $$$, $$$$
  isOpenNow?: boolean;
}

export interface VenueSiteData {
  description?: string;
  capacityNotes?: string;
  cateringPolicy?: string;
  alcoholPolicy?: string;
  outsideVendorsPolicy?: string;
  pricing?: string;
  packages?: string[];
  spaceDescriptions?: string[];
  coordinatorInfo?: string;
  faqHighlights?: string[];
  socialInstagram?: string;
  socialFacebook?: string;
}

export interface EnrichedVenue {
  slug: string;
  dbId?: string;
  name: string;
  knot?: KnotData;
  yelp?: YelpData;
  site?: VenueSiteData;
  mergedAt?: Date;
}

export interface PipelineConfig {
  city: string;
  stateSlug: string;
  dryRun?: boolean;
  limit?: number;
  forceRescrape?: boolean;
}
