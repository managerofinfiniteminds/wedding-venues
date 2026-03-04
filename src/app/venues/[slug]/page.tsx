import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function VenueDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const venue = await prisma.venue.findUnique({
    where: { slug: params.slug },
  });

  if (!venue || !venue.isPublished) notFound();

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="playfair text-2xl font-bold text-pink-700">
            Venue by Vow
          </Link>
          <Link href="/venues" className="text-sm text-gray-500 hover:text-pink-600 ml-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to results
          </Link>
        </div>
      </nav>

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
          <h1 className="playfair text-4xl md:text-5xl font-bold mb-2">{venue.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-white text-pink-700 text-sm px-3 py-1 rounded-full font-medium">
              {venue.city}, {venue.state}
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
          {venue.baseRentalMin && (
            <div>
              <p className="text-gray-500">Starting From</p>
              <p className="font-semibold text-pink-700">${venue.baseRentalMin.toLocaleString()}</p>
            </div>
          )}
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
          {venue.baseRentalMin && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="playfair text-2xl font-semibold text-gray-800 mb-4">Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-gray-500 text-sm mb-1">Weekday</p>
                  <p className="text-2xl font-bold text-pink-700">${venue.baseRentalMin.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">venue rental</p>
                </div>
                <div className="border-2 border-pink-200 rounded-xl p-4 text-center bg-pink-50/30">
                  <p className="text-gray-500 text-sm mb-1">Sunday</p>
                  <p className="text-2xl font-bold text-pink-700">
                    ${Math.round(((venue.baseRentalMin ?? 0) + (venue.baseRentalMax ?? 0)) / 2).toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-xs">venue rental</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-gray-500 text-sm mb-1">Saturday Peak</p>
                  <p className="text-2xl font-bold text-pink-700">${(venue.baseRentalMax ?? 0).toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">venue rental</p>
                </div>
              </div>
              {venue.perHeadMin && (
                <p className="text-sm text-gray-600">
                  🍽️ Catering estimate: ${venue.perHeadMin}–${venue.perHeadMax}/person
                </p>
              )}
              {venue.depositPercent && (
                <p className="text-sm text-gray-600 mt-1">
                  💳 {venue.depositPercent}% deposit to hold your date
                </p>
              )}
              {venue.cancellationPolicy && (
                <p className="text-sm text-gray-600 mt-1">
                  📋 {venue.cancellationPolicy}
                </p>
              )}
            </section>
          )}

          {/* Policies */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="playfair text-2xl font-semibold text-gray-800 mb-4">Policies</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>🎤 <strong>Vendor Policy:</strong> {venue.outsideVendorsAllowed ? "Outside vendors welcome" : "Preferred vendor list required for some categories"}</p>
              {venue.inHouseCateringRequired && <p>🍽️ <strong>Catering:</strong> In-house catering required</p>}
              {venue.byobPolicy && <p>🍾 <strong>BYOB:</strong> {venue.byobPolicy}</p>}
              {venue.noiseOrdinance && <p>🔊 <strong>Noise:</strong> {venue.noiseOrdinance}</p>}
              {venue.setupHours && <p>⏱️ <strong>Setup:</strong> {venue.setupHours} hrs before · {venue.teardownHours} hrs teardown after</p>}
              {venue.leadTimeMonths && <p>📅 <strong>Booking lead time:</strong> {venue.leadTimeMonths}+ months recommended</p>}
            </div>
          </section>
        </div>

        {/* Sidebar CTA */}
        <div className="space-y-4">
          <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 sticky top-24">
            <h3 className="playfair text-xl font-semibold text-gray-800 mb-1">Check Availability</h3>
            <p className="text-gray-500 text-xs mb-4">Most couples book {venue.leadTimeMonths ?? 12}–{(venue.leadTimeMonths ?? 12) + 6} months in advance</p>
            <select className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-pink-400">
              <option>Select Month</option>
              {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => <option key={m}>{m}</option>)}
            </select>
            <select className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:border-pink-400">
              <option>Select Year</option>
              <option>2025</option>
              <option>2026</option>
              <option>2027</option>
            </select>
            <button className="w-full bg-pink-700 hover:bg-pink-800 text-white font-medium py-3 rounded-xl transition-colors">
              Check Dates
            </button>
            <div className="mt-4 pt-4 border-t border-pink-200 text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-700 mb-2">Or contact us directly</p>
              {venue.phone && <p>📞 {venue.phone}</p>}
              {venue.email && <p>✉️ {venue.email}</p>}
              {venue.website && (
                <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline block">
                  🌐 Visit website
                </a>
              )}
            </div>
          </div>

          {/* Data quality note */}
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
