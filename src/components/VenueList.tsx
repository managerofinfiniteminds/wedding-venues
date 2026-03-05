"use client";

import { useState, useCallback } from "react";
import { VenueCard } from "./VenueCard";
import type { Venue } from "@prisma/client";

interface Props {
  initialVenues: Venue[];
  initialTotal: number;
  searchParams: Record<string, string | string[]>;
  stateSlug?: string;   // required to scope Load More to the correct state
}

const PAGE_SIZE = 24;

export function VenueList({ initialVenues, initialTotal, searchParams, stateSlug }: Props) {
  const [venues, setVenues] = useState(initialVenues);
  const [total] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialVenues.length < initialTotal);

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Always include state so the API route doesn't leak cross-state data
      if (stateSlug) params.set("state", stateSlug);

      Object.entries(searchParams).forEach(([k, v]) => {
        // Pass all filter params through (city, region, type, style, sort, q)
        // region is included so the API can expand it to city lists server-side
        if (Array.isArray(v)) v.forEach((val) => params.append(k, val));
        else if (v) params.set(k, v);
      });
      params.set("offset", venues.length.toString());
      // Remove page param — we use offset-based pagination for Load More
      params.delete("page");

      const res = await fetch(`/api/venues?${params}`);
      const data = await res.json() as { venues: Venue[]; total: number; hasMore: boolean };
      setVenues((prev) => [...prev, ...data.venues]);
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  }, [venues.length, searchParams, stateSlug]);

  return (
    <>
      <div className="space-y-5">
        {venues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>

      {hasMore && (
        <div className="flex flex-col items-center gap-2 mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-pink-400 hover:text-pink-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? "Loading..." : `Load more venues`}
          </button>
          <p className="text-xs text-gray-400">
            Showing {venues.length} of {total.toLocaleString()}
          </p>
        </div>
      )}

      {!hasMore && venues.length > PAGE_SIZE && (
        <p className="text-center text-sm text-gray-400 mt-8">
          All {total.toLocaleString()} venues loaded
        </p>
      )}
    </>
  );
}
