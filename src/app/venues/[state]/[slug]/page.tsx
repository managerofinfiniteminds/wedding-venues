
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { InquiryForm } from "@/components/InquiryForm";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getState } from "@/lib/states";
import { VenueList } from "@/components/VenueList";
import { VenueSchema } from "@/components/VenueSchema";
import { cityToSlug, PAGE_SIZE } from "@/lib/venueFilters";
import { Metadata } from "next";
import type { Venue } from "@prisma/client";

export async function generateMetadata({ params }: { params: Promise<{ state: string; slug: string }> }): Promise<Metadata> {
  const { state, slug } = await params;
  const stateConfig = getState(state);
  if (!stateConfig) return { title: "Not Found" };

  // Try venue first
  const venue = await prisma.venue.findUnique({ where: { slug } });
  if (venue) {
    return {
      title: `${venue.name} — ${venue.city}, ${stateConfig.abbr} Wedding Venue`,
      description: venue.description
        ? `${venue.description.slice(0, 150)}...`
        : `${venue.name} is a wedding venue in ${venue.city}, ${stateConfig.name}. Browse photos, pricing, and availability.`,
    };
  }

  // Try city
  const cities = await prisma.venue.groupBy({
    by: ["city"],
    where: { isPublished: true, stateSlug: state },
    _count: { city: true },
  });
  const cityMatch = cities.find((c) => cityToSlug(c.city) === slug);
  if (cityMatch) {
    return {
      title: `Wedding Venues in ${cityMatch.city}, ${stateConfig.name} | Green Bowtie`,
      description: `Browse ${cityMatch._count.city} wedding venues in ${cityMatch.city}, ${stateConfig.name}. Find the perfect venue for your wedding day on Green Bowtie.`,
    };
  }

  return { title: "Not Found" };
}

export default async function VenueOrCityPage({
  params,
}: {
  params: Promise<{ state: string; slug: string }>;
}) {
  const { state, slug } = await params;
  const stateConfig = getState(state);

  if (!stateConfig || !stateConfig.live) {
    redirect(`/venues/${state}`);
  }

  // Try venue first
  const venue = await prisma.venue.findUnique({
    where: { slug, stateSlug: state },
  });

  if (venue && venue.isPublished) {
    return <VenueDetailPage venue={venue} state={state} stateAbbr={stateConfig.abbr} stateName={stateConfig.name} />;
  }

  // Check if it's a city slug
  const cityCounts = await prisma.venue.groupBy({
    by: ["city"],
    where: { isPublished: true, stateSlug: state },
    _count: { city: true },
  });
  const cityMatch = cityCounts.find((c) => cityToSlug(c.city) === slug);

  if (cityMatch) {
    const cityName = cityMatch.city;
    const totalVenues = cityMatch._count.city;

    const venues = await prisma.venue.findMany({
      where: { isPublished: true, stateSlug: state, city: cityName },
      orderBy: [
        { isFeatured: "desc" },
        { googleRating: { sort: "desc", nulls: "last" } },
        { googleReviews: { sort: "desc", nulls: "last" } },
        { id: "asc" },
      ],
      take: PAGE_SIZE,
    });

    return (
      <CityVenuePage
        city={cityName}
        state={state}
        stateName={stateConfig.name}
        venues={venues}
        totalVenues={totalVenues}
      />
    );
  }

  notFound();
}

// ─── Venue Detail ────────────────────────────────────────────────────────────

function VenueDetailPage({
  venue,
  state,
  stateAbbr,
  stateName,
}: {
  venue: Venue;
  state: string;
  stateAbbr: string;
  stateName: string;
}) {
  const canonicalUrl = `https://www.greenbowtie.com/venues/${state}/${venue.slug}`;

  return (
    <div className="min-h-screen bg-stone-50">
      <VenueSchema venue={venue} stateName={stateName} url={canonicalUrl} />

      {/* Back link */}
      <div className="max-w-screen-xl mx-auto px-4 pt-4">
        <Link href={`/venues/${state}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-pink-700 transition-colors">
          ← Back to venues
        </Link>
      </div>

      {/* Hero */}
      <section
        className="relative h-72 md:h-96 bg-gray-200 flex items-end"
        style={
          venue.primaryPhotoUrl
            ? { backgroundImage: `url(${venue.primaryPhotoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : {}
        }
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="relative text-white px-6 pb-8 max-w-screen-xl mx-auto w-full">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="playfair text-4xl md:text-5xl font-bold">{venue.name}</h1>
            <FavoriteButton venueId={venue.id} venueName={venue.name} size="md" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-white text-pink-700 text-sm px-3 py-1 rounded-full font-medium">
              {venue.city}, {stateAbbr}
            </span>
            {venue.styleTags.map((tag) => (
              <span key={tag} className="bg-emerald-600/80 text-white text-sm px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
            {venue.googleRating && (
              <span className="text-yellow-300 text-sm font-medium">
                ★ {venue.googleRating} ({venue.googleReviews} reviews)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          {venue.maxGuests && (
            <div>
              <p className="text-gray-500">Capacity</p>
              <p className="font-semibold text-gray-800">{venue.minGuests ?? "?"}&ndash;{venue.maxGuests} guests</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Pricing</p>
            <p className="font-semibold text-gray-800">
              {venue.baseRentalMin
                ? `From $${venue.baseRentalMin.toLocaleString()}`
                : venue.priceTier
                  ? venue.priceTier.charAt(0).toUpperCase() + venue.priceTier.slice(1)
                  : "Contact for rates"}
            </p>
          </div>
          {venue.earliestStart && venue.latestEnd && (
            <div>
              <p className="text-gray-500">Event Hours</p>
              <p className="font-semibold text-gray-800">{venue.earliestStart} – {venue.latestEnd}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Venue Type</p>
            <p className="font-semibold text-gray-800">{venue.venueType}</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">

          {/* About */}
          {venue.description && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="playfair text-2xl font-semibold text-gray-800 mb-3">About</h2>
              <p className="text-gray-600 leading-relaxed">{venue.description}</p>
            </section>
          )}

          {/* Ratings & Directions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-stone-50 rounded-2xl border border-gray-200 p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Google Rating</p>
              {venue.googleRating ? (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="text-2xl font-bold text-gray-800">{venue.googleRating}</span>
                    <span className="text-sm text-gray-500">({venue.googleReviews?.toLocaleString()} reviews)</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} ${venue.city} wedding venue`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-pink-700 hover:underline font-medium"
                  >
                    Read Google Reviews →
                  </a>
                </>
              ) : (
                <p className="text-sm text-gray-400">No rating available yet.</p>
              )}
            </div>
            <div className="bg-stone-50 rounded-2xl border border-gray-200 p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Location</p>
              <p className="text-sm text-gray-700 mb-3 flex items-start gap-1.5">
                <span className="mt-0.5">📍</span>
                <span>{[venue.street, venue.city, venue.state, venue.zip].filter(Boolean).join(", ")}</span>
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} ${venue.street ?? ""} ${venue.city} ${venue.state}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-pink-700 hover:underline font-medium"
              >
                Get Directions →
              </a>
            </div>
          </div>

          {/* Amenities */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="playfair text-2xl font-semibold text-gray-800 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Bridal Suite", value: venue.hasBridalSuite, icon: "💄" },
                { label: "Groom Suite", value: venue.hasGroomSuite, icon: "🤵" },
                { label: "Outdoor Ceremony", value: venue.hasOutdoorSpace, icon: "🌿" },
                { label: "Indoor Reception", value: venue.hasIndoorSpace, icon: "🏛️" },
                { label: "Catering Kitchen", value: venue.cateringKitchen, icon: "🍽️" },
                { label: "Full Bar", value: venue.barSetup, icon: "🍷" },
                { label: "Tables & Chairs", value: venue.tablesChairsIncluded, icon: "🪑" },
                { label: "Linens", value: venue.linensIncluded, icon: "🎀" },
                { label: "AV Equipment", value: venue.avIncluded, icon: "🎵" },
                { label: "String Lighting", value: venue.lightingIncluded, icon: "✨" },
                { label: "On-site Coordinator", value: venue.onSiteCoordinator, icon: "👩‍💼" },
                { label: "ADA Accessible", value: venue.adaCompliant, icon: "♿" },
                { label: "Nearby Lodging", value: venue.nearbyLodging, icon: "🏨" },
              ]
                .filter((a) => a.value)
                .map((a) => (
                  <div key={a.label} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                    <span>{a.icon}</span>
                    <span>{a.label}</span>
                  </div>
                ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-[#f3f7f4] rounded-2xl border border-[#d4e4d8] p-6">
            <h2 className="playfair text-2xl font-semibold text-gray-800 mb-4">Pricing &amp; Capacity</h2>
            {(venue.baseRentalMin || venue.priceTier || venue.perHeadMin || venue.perHeadMax || venue.maxGuests) ? (
              <div className="space-y-4">
                {venue.baseRentalMin && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#3b6341]">
                      ${venue.baseRentalMin.toLocaleString()}
                    </span>
                    {venue.baseRentalMax && venue.baseRentalMax !== venue.baseRentalMin && (
                      <span className="text-xl text-[#3b6341] font-semibold">
                        &ndash; ${venue.baseRentalMax.toLocaleString()}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">starting site fee</span>
                  </div>
                )}
                {!venue.baseRentalMin && venue.priceTier && (
                  <div>
                    <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${
                      venue.priceTier === "budget" ? "bg-green-100 text-green-800" :
                      venue.priceTier === "moderate" ? "bg-blue-100 text-blue-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {venue.priceTier === "budget" ? "💰 Budget" :
                       venue.priceTier === "moderate" ? "💰💰 Moderate" :
                       "💰💰💰 Luxury"}
                    </span>
                  </div>
                )}
                {(venue.perHeadMin || venue.perHeadMax) && (
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Per person: </span>
                    {venue.perHeadMin && venue.perHeadMax && venue.perHeadMin !== venue.perHeadMax
                      ? `$${venue.perHeadMin.toLocaleString()} – $${venue.perHeadMax.toLocaleString()}`
                      : `$${(venue.perHeadMin ?? venue.perHeadMax)!.toLocaleString()}`}
                  </div>
                )}
                {venue.maxGuests && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>👥</span>
                    <span className="font-medium">
                      {venue.minGuests ? `${venue.minGuests.toLocaleString()}–` : "Up to "}
                      {venue.maxGuests.toLocaleString()} guests
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-400 pt-2 border-t border-[#d4e4d8]">
                  Pricing varies by date and season. Contact venue for exact quote.
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Pricing varies by date, guest count, and package. Contact this venue directly for a quote.</p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {(venue.phone || venue.email || venue.website) && (
            <div className="bg-stone-50 border border-gray-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Contact</p>
              <div className="space-y-2.5 text-sm text-gray-700">
                {venue.phone && (
                  <a href={`tel:${venue.phone}`} className="flex items-center gap-2 hover:text-[#3b6341] transition-colors">
                    <span>📞</span><span>{venue.phone}</span>
                  </a>
                )}
                {venue.email && (
                  <a href={`mailto:${venue.email}`} className="flex items-center gap-2 hover:text-[#3b6341] transition-colors">
                    <span>✉️</span><span>{venue.email}</span>
                  </a>
                )}
                {venue.website && (
                  <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#3b6341] hover:underline transition-colors">
                    <span>🌐</span><span>Visit website</span>
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="sticky top-24">
            <InquiryForm venueId={venue.id} venueName={venue.name} />
          </div>

          {venue.completenessScore && venue.completenessScore < 70 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
              ⚠️ Some details for this venue are still being verified. Contact them directly for the most accurate information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── City Page ────────────────────────────────────────────────────────────────

function CityVenuePage({
  city,
  state,
  stateName,
  venues,
  totalVenues,
}: {
  city: string;
  state: string;
  stateName: string;
  venues: Venue[];
  totalVenues: number;
}) {
  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="max-w-screen-xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#3b6341] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/venues" className="hover:text-[#3b6341] transition-colors">Venues</Link>
          <span>/</span>
          <Link href={`/venues/${state}`} className="hover:text-[#3b6341] transition-colors">{stateName}</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{city}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="playfair text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Wedding Venues in {city}, {stateName}
          </h1>
          <p className="text-gray-500 text-sm">
            <span className="font-semibold text-gray-700">{totalVenues.toLocaleString()}</span> wedding venue{totalVenues !== 1 ? "s" : ""} in {city}
          </p>
        </div>

        {/* Venues */}
        {venues.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100">
            <p className="text-lg font-semibold mb-2">No venues found</p>
            <Link href={`/venues/${state}`} className="text-pink-600 hover:underline text-sm">
              Browse all {stateName} venues
            </Link>
          </div>
        ) : (
          <VenueList
            initialVenues={venues}
            initialTotal={totalVenues}
            searchParams={{ city }}
            stateSlug={state}
          />
        )}

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link
            href={`/venues/${state}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#3b6341] transition-colors"
          >
            ← All {stateName} venues
          </Link>
        </div>
      </div>
    </div>
  );
}
