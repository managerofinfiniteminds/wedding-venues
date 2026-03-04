"use client";

import dynamic from "next/dynamic";

const VenueMap = dynamic(() => import("@/components/VenueMap").then(m => m.VenueMap), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-stone-100 text-gray-400 text-sm">
      Loading map…
    </div>
  ),
});

export function VenueMapLoader({ venues }: { venues: any[] }) {
  return <VenueMap venues={venues} />;
}
