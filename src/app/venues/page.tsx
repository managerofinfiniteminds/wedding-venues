import { getLiveStates } from "@/lib/states";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Venues in Every State | Green Bow Tie",
  description: "Browse thousands of wedding venues across all 50 states. Find the perfect venue for your wedding day on Green Bow Tie.",
};



export default async function VenuesHubPage() {
  const liveStates = getLiveStates().sort((a, b) => a.name.localeCompare(b.name));

  const counts = await prisma.venue.groupBy({
    by: ["stateSlug"],
    where: { isPublished: true },
    _count: { id: true },
  });
  const countMap = new Map(counts.map((c) => [c.stateSlug, c._count.id]));
  const totalVenues = counts.reduce((sum, c) => sum + c._count.id, 0);

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* Hero */}
      <section className="py-20 md:py-28 text-center bg-gradient-to-b from-[#f0f2ef] to-[#f8f7f5]">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="playfair text-5xl md:text-7xl font-bold text-[#3b6341]">
            Find Your Perfect Wedding Venue at Green Bow Tie
          </h1>
          <div className="mt-8 flex justify-center">
            <Image src="/greenbowtie.svg" alt="Green Bowtie" width={200} height={80} className="h-48 w-auto" priority />
          </div>
          <p className="mt-6 text-lg md:text-xl text-gray-600">
            {totalVenues.toLocaleString()} venues across all 50 states — find yours today.
          </p>
        </div>
      </section>

      {/* All States Grid */}
      <section className="py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl playfair font-bold text-gray-800 mb-10 text-center">
            Browse by State
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {liveStates.map((s) => {
              const count = countMap.get(s.slug) ?? 0;
              return (
                <Link
                  key={s.slug}
                  href={`/venues/${s.slug}`}
                  className="group flex flex-col items-start justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:shadow-md hover:border-[#3b6341] transition-all duration-200"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-[#3b6341] bg-[#f0f4f0] px-2 py-0.5 rounded-full">{s.abbr}</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm leading-tight group-hover:text-[#3b6341] transition-colors">{s.name}</p>
                  <p className="text-gray-400 text-xs mt-1">{count.toLocaleString()} venues</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
