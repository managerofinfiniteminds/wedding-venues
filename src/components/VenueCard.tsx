import Link from "next/link";
import type { Venue } from "@prisma/client";

export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link href={`/venues/${venue.slug}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5 transition-all duration-200 hover:shadow-md hover:border-pink-100 hover:bg-pink-50/20">
        
        {/* Photo — 208x160 */}
        <div className="flex-shrink-0 w-52 h-40 overflow-hidden rounded-xl bg-gray-100">
          {venue.primaryPhotoUrl ? (
            <img src={venue.primaryPhotoUrl} alt={venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
              <svg className="w-9 h-9 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span className="text-xs text-gray-400">No photo yet</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{venue.city}, {venue.state} · {venue.venueType}</p>
            <h3 className="font-semibold text-gray-900 group-hover:text-pink-700 transition-colors text-base leading-snug mb-2">{venue.name}</h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {venue.styleTags.slice(0,3).map(tag => (
                <span key={tag} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs px-2 py-0.5 rounded-full font-medium">{tag}</span>
              ))}
            </div>
            {venue.description && (
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{venue.description}</p>
            )}
          </div>
          
          {/* Bottom meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-gray-500">
            {venue.googleRating && (
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="font-semibold text-gray-700">{venue.googleRating}</span>
                <span className="text-gray-400">({venue.googleReviews})</span>
              </span>
            )}
            {venue.maxGuests && (
              <span className="flex items-center gap-1">
                <span>👥</span>
                <span>{venue.minGuests ?? "?"}–{venue.maxGuests} guests</span>
              </span>
            )}
            {venue.hasBridalSuite && <span className="hidden sm:flex items-center gap-0.5"><span className="text-emerald-500 font-bold">✓</span> Bridal Suite</span>}
            {venue.onSiteCoordinator && <span className="hidden sm:flex items-center gap-0.5"><span className="text-emerald-500 font-bold">✓</span> On-site Coordinator</span>}
            {venue.barSetup && <span className="hidden md:flex items-center gap-0.5"><span className="text-emerald-500 font-bold">✓</span> Full Bar</span>}
            {venue.hasOutdoorSpace && <span className="hidden md:flex items-center gap-0.5"><span className="text-emerald-500 font-bold">✓</span> Outdoor Ceremony</span>}
          </div>
        </div>

        {/* Price */}
        <div className="flex-shrink-0 text-right hidden sm:flex flex-col items-end justify-start gap-0.5 min-w-[90px]">
          {venue.baseRentalMin ? (
            <>
              <p className="text-xs text-gray-400">From</p>
              <p className="font-bold text-pink-700 text-xl leading-tight">${venue.baseRentalMin.toLocaleString()}</p>
              <p className="text-xs text-gray-400">venue rental</p>
            </>
          ) : (
            <p className="text-xs text-gray-400 mt-1">Contact for pricing</p>
          )}
        </div>
      </div>
    </Link>
  );
}
