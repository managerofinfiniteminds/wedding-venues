"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { MapVenue } from "@/components/VenueMap";
import { USStateMap } from "@/components/USStateMap";

const VenueMap = dynamic(() => import("@/components/VenueMap").then((m) => m.VenueMap), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-stone-100 text-gray-400 text-sm">
      Loading map…
    </div>
  ),
});

interface Props {
  stateSlug?: string;
  initialVenues?: MapVenue[];
}

export function VenueMapLoader({ stateSlug: initialStateSlug, initialVenues = [] }: Props) {
  const [selectedState, setSelectedState] = useState<string | null>(initialStateSlug ?? null);

  if (selectedState) {
    return (
      <div className="flex flex-col h-full">
        {/* Back to national view */}
        <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => setSelectedState(null)}
            className="flex items-center gap-1.5 text-sm text-[#3b6341] hover:text-[#2f5035] font-medium transition-colors"
          >
            ← All States
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-600 capitalize">{selectedState.replace(/-/g, " ")}</span>
        </div>
        <div className="flex-1">
          <VenueMap initialVenues={initialVenues} stateSlug={selectedState} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f7f5]">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
        <h2 className="playfair text-2xl sm:text-3xl font-bold text-gray-800 mb-1 text-center">
          Explore by State
        </h2>
        <p className="text-gray-500 text-sm mb-6 text-center">Click any state to view venues on the map</p>
        <div className="w-full max-w-3xl">
          <USStateMap onStateSelect={setSelectedState} />
        </div>
      </div>
    </div>
  );
}
