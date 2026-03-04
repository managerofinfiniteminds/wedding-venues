"use client";

import { useState } from "react";
import type { Venue } from "@prisma/client";

function stripDomain(url: string) {
  return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
}

export function VenueCard({ venue }: { venue: Venue }) {
  const [expanded, setExpanded] = useState(false);

  const googleReviewsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.name} ${venue.city} CA wedding venue`
  )}`;
  const googleDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.name} ${venue.street ?? ""} ${venue.city} ${venue.state}`
  )}`;

  const addressLine = [venue.street, venue.city, venue.state, venue.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-pink-100 overflow-hidden"
      onClick={() => setExpanded((e) => !e)}
    >
      {/* ── Collapsed row ── */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5 cursor-pointer">
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
            <p className="text-xs text-gray-400 mb-0.5">
              {venue.venueType}
            </p>
            <h3 className="font-semibold text-gray-900 hover:text-pink-700 transition-colors text-base leading-snug mb-1">
              {venue.name}
            </h3>

            {/* Location — always visible */}
            {addressLine && (
              <a
                href={googleDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-pink-700 transition-colors mb-2"
                onClick={(e) => e.stopPropagation()}
              >
                <span>📍</span>
                <span>{addressLine}</span>
              </a>
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

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-gray-500">
            {venue.googleRating && (
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="font-semibold text-gray-700">{venue.googleRating}</span>
                <span className="text-gray-400">({venue.googleReviews?.toLocaleString()})</span>
              </span>
            )}
            {venue.maxGuests && (
              <span className="flex items-center gap-1">
                <span>👥</span>
                <span>{venue.minGuests ?? "?"}–{venue.maxGuests} guests</span>
              </span>
            )}
            {venue.phone && (
              <a
                href={`tel:${venue.phone}`}
                className="flex items-center gap-1 text-gray-500 hover:text-pink-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span>📞</span>
                <span className="hidden md:inline">{venue.phone}</span>
                <span className="md:hidden">Call</span>
              </a>
            )}
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-pink-700 hover:text-pink-800 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span>🌐</span>
                <span className="hidden md:inline">{stripDomain(venue.website)}</span>
                <span className="md:hidden">Website</span>
              </a>
            )}
          </div>
        </div>

        {/* Expand caret */}
        <div className="flex-shrink-0 hidden sm:flex flex-col items-end justify-start min-w-[60px]">
          <span className="text-xs text-gray-400 mt-1">{expanded ? "▲ less" : "▼ more"}</span>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div
          className="border-t border-gray-100 px-4 sm:px-5 pb-5 pt-4 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Reviews + Directions side by side */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Google Rating */}
            <div className="bg-stone-50 rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Google Rating</p>
              {venue.googleRating ? (
                <>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="text-2xl font-bold text-gray-800">{venue.googleRating}</span>
                    <span className="text-sm text-gray-500">({venue.googleReviews?.toLocaleString()} reviews)</span>
                  </div>
                  <a
                    href={googleReviewsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-pink-700 hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Read Google Reviews →
                  </a>
                </>
              ) : (
                <p className="text-sm text-gray-400">No rating available yet.</p>
              )}
            </div>

            {/* Directions */}
            <div className="bg-stone-50 rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</p>
              <p className="text-sm text-gray-700 mb-2 flex items-start gap-1.5">
                <span className="mt-0.5">📍</span>
                <span>{addressLine || `${venue.city}, ${venue.state}`}</span>
              </p>
              <a
                href={googleDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-pink-700 hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Get Directions on Google Maps →
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl border-l-4 p-4" style={{ borderLeftColor: "#3b6341" }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {venue.phone && (
                <a href={`tel:${venue.phone}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-pink-700 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <span>📞</span><span>{venue.phone}</span>
                </a>
              )}
              {venue.email && (
                <a href={`mailto:${venue.email}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-pink-700 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <span>✉️</span><span className="truncate">{venue.email}</span>
                </a>
              )}
              {venue.website && (
                <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-pink-700 hover:text-pink-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <span>🌐</span><span>{stripDomain(venue.website)}</span>
                </a>
              )}
              {venue.instagram && (
                <a href={`https://instagram.com/${venue.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-pink-700 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <span>📷</span><span>@{venue.instagram}</span>
                </a>
              )}
              {!venue.phone && !venue.email && !venue.website && (
                <p className="text-gray-400 italic col-span-2">Search online for contact details.</p>
              )}
            </div>
          </div>

          {/* Description — only if we have it */}
          {venue.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">About</p>
              <p className="text-sm text-gray-700 leading-relaxed">{venue.description}</p>
            </div>
          )}

          {/* Close */}
          <button
            className="w-full text-center text-sm text-gray-400 hover:text-pink-700 transition-colors pt-1"
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
          >
            Show less ▲
          </button>
        </div>
      )}
    </div>
  );
}
