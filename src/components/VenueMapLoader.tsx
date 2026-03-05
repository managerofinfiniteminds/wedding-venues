"use client";

import dynamic from "next/dynamic";
import type { MapVenue } from "@/components/VenueMap";

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

export function VenueMapLoader({ stateSlug, initialVenues = [] }: Props) {
  return <VenueMap initialVenues={initialVenues} stateSlug={stateSlug} />;
}
