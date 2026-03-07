"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Venue } from "@prisma/client";
import { useFavorites } from "@/hooks/useFavorites";
import { VenueCard } from "@/components/VenueCard";

export default function FavoritesPage() {
  const { favorites, count, toggle } = useFavorites();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (favorites.length === 0) {
      setVenues([]);
      return;
    }
    setLoading(true);
    fetch(`/api/favorites?ids=${favorites.join(",")}`)
      .then((r) => r.json())
      .then((data) => setVenues(data as unknown as Venue[]))
      .catch(() => setVenues([]))
      .finally(() => setLoading(false));
  }, [favorites]);

  function clearAll() {
    [...favorites].forEach((id) => toggle(id));
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h1 className="playfair text-3xl font-bold text-gray-900">
              Your Saved Venues
            </h1>
            {count > 0 && (
              <span className="bg-pink-100 text-pink-700 text-sm font-semibold px-3 py-1 rounded-full">
                {count}
              </span>
            )}
          </div>
          {count > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-pink-700 underline underline-offset-2 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Empty state */}
        {count === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-6">💚</div>
            <h2 className="playfair text-2xl font-semibold text-gray-800 mb-3">
              No saved venues yet
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Tap the heart icon on any venue to save it here for easy
              comparison.
            </p>
            <Link
              href="/venues"
              className="inline-flex items-center gap-2 bg-[#3b6341] hover:bg-[#2f5035] text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-sm"
            >
              Browse Venues
            </Link>
          </div>
        )}

        {/* Loading */}
        {loading && count > 0 && (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <svg
              className="animate-spin w-6 h-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Loading your saved venues…
          </div>
        )}

        {/* Venue grid */}
        {!loading && venues.length > 0 && (
          <div className="space-y-4">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}

        {/* Stale IDs (saved but not found/published) */}
        {!loading && count > 0 && venues.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>Couldn&apos;t load saved venues. Try refreshing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
