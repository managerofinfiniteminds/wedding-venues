import type { Venue } from "@prisma/client";

interface VenueSchemaProps {
  venue: Venue;
  stateName: string;
  url: string;
}

/**
 * Schema.org JSON-LD for venue detail pages.
 * Outputs EventVenue (for Google's wedding-specific rich results)
 * nested inside a LocalBusiness with full address, rating, and pricing.
 */
export function VenueSchema({ venue, stateName, url }: VenueSchemaProps) {
  const address = {
    "@type": "PostalAddress",
    ...(venue.street && { streetAddress: venue.street }),
    addressLocality: venue.city,
    addressRegion: venue.state,
    ...(venue.zip && { postalCode: venue.zip }),
    addressCountry: "US",
  };

  const geo =
    venue.latitude && venue.longitude
      ? {
          "@type": "GeoCoordinates",
          latitude: venue.latitude,
          longitude: venue.longitude,
        }
      : undefined;

  const aggregateRating =
    venue.googleRating && venue.googleReviews && venue.googleReviews > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: venue.googleRating,
          reviewCount: venue.googleReviews,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined;

  // Build priceRange string for LocalBusiness
  let priceRange: string | undefined;
  if (venue.baseRentalMin) {
    priceRange = venue.baseRentalMax && venue.baseRentalMax !== venue.baseRentalMin
      ? `$${venue.baseRentalMin.toLocaleString()} – $${venue.baseRentalMax.toLocaleString()}`
      : `From $${venue.baseRentalMin.toLocaleString()}`;
  } else if (venue.priceTier === "budget") {
    priceRange = "$";
  } else if (venue.priceTier === "moderate") {
    priceRange = "$$";
  } else if (venue.priceTier === "luxury") {
    priceRange = "$$$";
  }

  const amenities: string[] = [];
  if (venue.hasBridalSuite) amenities.push("Bridal Suite");
  if (venue.hasGroomSuite) amenities.push("Groom's Suite");
  if (venue.hasOutdoorSpace) amenities.push("Outdoor Ceremony Space");
  if (venue.hasIndoorSpace) amenities.push("Indoor Reception Space");
  if (venue.cateringKitchen) amenities.push("Catering Kitchen");
  if (venue.barSetup) amenities.push("Full Bar");
  if (venue.tablesChairsIncluded) amenities.push("Tables & Chairs Included");
  if (venue.linensIncluded) amenities.push("Linens Included");
  if (venue.avIncluded) amenities.push("AV Equipment");
  if (venue.lightingIncluded) amenities.push("String Lighting");
  if (venue.onSiteCoordinator) amenities.push("On-site Coordinator");
  if (venue.adaCompliant) amenities.push("ADA Accessible");
  if (venue.nearbyLodging) amenities.push("Nearby Lodging");

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EventVenue"],
    name: venue.name,
    url,
    description: venue.description
      ? venue.description.slice(0, 300)
      : `${venue.name} is a wedding venue in ${venue.city}, ${stateName}.`,
    address,
    ...(geo && { geo }),
    ...(aggregateRating && { aggregateRating }),
    ...(priceRange && { priceRange }),
    ...(venue.phone && { telephone: venue.phone }),
    ...(venue.email && { email: venue.email }),
    ...(venue.website && { sameAs: venue.website }),
    ...(venue.primaryPhotoUrl && {
      image: venue.primaryPhotoUrl,
    }),
    ...(venue.maxGuests && {
      maximumAttendeeCapacity: venue.maxGuests,
    }),
    ...(amenities.length > 0 && { amenityFeature: amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })) }),
    ...(venue.styleTags.length > 0 && { keywords: venue.styleTags.join(", ") }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
