"use client";

import Link from "next/link";
import type { Venue } from "@prisma/client";

function stripDomain(url: string) {
  return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
}

export function VenueCard({ venue }: { venue: Venue }) {
  const googleDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.name} ${venue.street ?? ""} ${venue.city} ${venue.state}`
  )}`;

  const addressLine = [venue.street, venue.city, venue.state, venue.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/venues/${venue.stateSlug}/${venue.slug}`}
      className="block bg-white rounded-2xl border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-pink-100 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
        {/* Photo */}
        <div className="flex-shrink-0 w-full h-48 sm:w-52 sm:h-40 overflow-hidden rounded-xl bg-gray-100">
          {venue.primaryPhotoUrl ? (
            <img
              src={venue.primaryPhotoUrl}
              alt={venue.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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

        {/* Body */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{venue.venueType}</p>
            <h3 className="font-semibold text-gray-900 group-hover:text-pink-700 transition-colors text-base leading-snug mb-1">
              {venue.name}
            </h3>

            {/* Location — plain text inside card link, no nested <a> */}
            {addressLine && (
              <p className="inline-flex items-center gap-1 text-xs text-emerald-700 mb-2">
                <span>📍</span>
                <span>{addressLine}</span>
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-2">
              {venue.styleTags.slice(0, 3).map((tag) => (
                <span key={tag} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs px-2 py-0.5 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {venue.description && (
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{venue.description}</p>
            )}
          </div>

          {/* Meta row + button */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              {venue.googleRating && (
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="font-semibold text-gray-700">{venue.googleRating}</span>
                  <span className="text-gray-400">({venue.googleReviews?.toLocaleString()})</span>
                </span>
              )}
              {venue.baseRentalMin ? (
                <span className="flex items-center gap-1">
                  <span>💵</span>
                  <span>From ${venue.baseRentalMin.toLocaleString()}</span>
                </span>
              ) : venue.priceTier === "budget" ? (
                <span className="flex items-center gap-1"><span>💰</span><span>Budget</span></span>
              ) : venue.priceTier === "moderate" ? (
                <span className="flex items-center gap-1"><span>💰💰</span><span>Moderate</span></span>
              ) : venue.priceTier === "luxury" ? (
                <span className="flex items-center gap-1"><span>💰💰💰</span><span>Luxury</span></span>
              ) : null}
              {venue.maxGuests && (
                <span className="flex items-center gap-1">
                  <span>👥</span>
                  <span>{venue.minGuests ?? "?"}–{venue.maxGuests} guests</span>
                </span>
              )}
              {venue.phone && (
                <span className="flex items-center gap-1 text-gray-500">
                  <span>📞</span>
                  <span className="hidden md:inline">{venue.phone}</span>
                  <span className="md:hidden">Call</span>
                </span>
              )}
              {venue.website && (
                <span className="flex items-center gap-1 text-pink-700">
                  <span>🌐</span>
                  <span className="hidden md:inline">{stripDomain(venue.website)}</span>
                  <span className="md:hidden">Website</span>
                </span>
              )}
            </div>

            {/* View details button — right aligned, compact */}
            <span className="flex-shrink-0 text-xs font-semibold text-white bg-[#3b6341] hover:bg-[#2f5035] px-4 py-2 rounded-full transition-colors shadow-sm whitespace-nowrap">
              View details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
