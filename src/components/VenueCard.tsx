import Link from "next/link";
import type { Venue } from "@prisma/client";

interface VenueCardProps {
  venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {
  return (
    <Link href={`/venues/${venue.slug}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-pink-100 hover:bg-pink-50/20">

        {/* Photo */}
        <div className="flex-shrink-0 w-44 h-36 overflow-hidden rounded-xl bg-gray-100">
          {venue.primaryPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={venue.primaryPhotoUrl}
              alt={venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
              <svg className="w-9 h-9 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-gray-400">No photo yet</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            {/* Name + heart */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-pink-700 transition-colors text-[15px] leading-snug">
                {venue.name}
              </h3>
            </div>

            {/* City + type */}
            <p className="text-gray-400 text-xs mb-2">
              {venue.city}, {venue.state}&nbsp;·&nbsp;{venue.venueType}
            </p>

            {/* Style tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {venue.styleTags.slice(0, 3).map((tag) => (
                <span key={tag}
                  className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs px-2 py-0.5 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            {venue.description && (
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{venue.description}</p>
            )}
          </div>

          {/* Bottom meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
            {venue.googleRating && (
              <span className="flex items-center gap-1">
                <span className="text-yellow-400 text-sm">★</span>
                <span className="font-semibold text-gray-700">{venue.googleRating}</span>
                {venue.googleReviews && <span className="text-gray-400">({venue.googleReviews})</span>}
              </span>
            )}
            {venue.googleRating && <span className="text-gray-200">|</span>}
            {venue.maxGuests && (
              <span>👥 {venue.minGuests ?? "?"}–{venue.maxGuests} guests</span>
            )}
            {venue.hasBridalSuite && (
              <span className="hidden sm:flex items-center gap-0.5">
                <span className="text-emerald-500 font-bold">✓</span> Bridal Suite
              </span>
            )}
            {venue.onSiteCoordinator && (
              <span className="hidden sm:flex items-center gap-0.5">
                <span className="text-emerald-500 font-bold">✓</span> Coordinator
              </span>
            )}
            {venue.hasOutdoorSpace && (
              <span className="hidden md:flex items-center gap-0.5">
                <span className="text-emerald-500 font-bold">✓</span> Outdoor
              </span>
            )}
          </div>
        </div>

        {/* Price — right aligned */}
        <div className="flex-shrink-0 text-right hidden sm:flex flex-col items-end justify-start pt-0.5 min-w-[80px]">
          {venue.baseRentalMin ? (
            <>
              <p className="text-xs text-gray-400 mb-0.5">From</p>
              <p className="font-bold text-pink-700 text-lg leading-none">
                ${venue.baseRentalMin.toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">venue rental</p>
            </>
          ) : (
            <p className="text-xs text-gray-400">Contact for pricing</p>
          )}
        </div>

      </div>
    </Link>
  );
}
