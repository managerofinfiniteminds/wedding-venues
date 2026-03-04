import Link from "next/link";
import type { Venue } from "@prisma/client";

interface VenueCardProps {
  venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {
  return (
    <Link href={`/venues/${venue.slug}`}>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-pink-50/30 group">
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
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-xs">No photo yet</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-pink-700 transition-colors text-base leading-tight">
              {venue.name}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              {venue.city}, {venue.state} · {venue.venueType}
            </p>

            {/* Style tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {venue.styleTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            {venue.description && (
              <p className="text-gray-500 text-sm mt-2 line-clamp-2">{venue.description}</p>
            )}
          </div>

          {/* Bottom row */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {venue.googleRating && (
              <>
                <span className="text-yellow-400 text-sm">★</span>
                <span className="text-sm font-medium text-gray-800">{venue.googleRating}</span>
                {venue.googleReviews && (
                  <span className="text-gray-400 text-xs">({venue.googleReviews} reviews)</span>
                )}
                <span className="text-gray-300">·</span>
              </>
            )}
            {venue.maxGuests && (
              <span className="text-xs text-gray-500">
                👥 {venue.minGuests ?? "?"}&ndash;{venue.maxGuests} guests
              </span>
            )}
            <div className="hidden sm:flex flex-wrap gap-2">
              {venue.hasBridalSuite && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="text-green-500">✓</span> Bridal Suite
                </span>
              )}
              {venue.onSiteCoordinator && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="text-green-500">✓</span> Coordinator
                </span>
              )}
              {venue.hasOutdoorSpace && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="text-green-500">✓</span> Outdoor Ceremony
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex-shrink-0 text-right hidden sm:flex flex-col items-end justify-start gap-1">
          {venue.baseRentalMin && (
            <>
              <p className="font-bold text-pink-700 text-lg">
                ${venue.baseRentalMin.toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs">venue rental</p>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
