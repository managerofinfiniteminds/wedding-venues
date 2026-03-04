
import { getLiveStates, getComingSoonStates } from "@/lib/states";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Wedding Venues by State | Green Bowtie",
  description: "Find wedding venues across the United States. Browse California venues now, with more states coming soon on Green Bowtie.",
};

export default async function VenuesHubPage() {
  const liveStates = getLiveStates();
  const comingSoonStates = getComingSoonStates();

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* Hero */}
      <section className="py-20 md:py-28 text-center bg-gradient-to-b from-[#f0f2ef] to-[#f8f7f5]">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="playfair text-5xl md:text-7xl font-bold text-[#3b6341]">Find Your Perfect Wedding Venue</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600">Your comprehensive guide to wedding venues across the United States.</p>
        </div>
      </section>

      {/* Live States */}
      {liveStates.length > 0 && (
        <section className="py-16">
          <div className="max-w-screen-xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl playfair font-bold text-gray-800 mb-8 text-center">Available Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {await Promise.all(liveStates.map(async (s) => {
                const venueCount = await prisma.venue.count({ where: { stateSlug: s.slug, isPublished: true } });
                return (
                  <Link key={s.slug} href={`/venues/${s.slug}`} className="block bg-white rounded-2xl border-2 border-[#3b6341] shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                     <div className="relative h-48">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center"
                            alt={`Scenery of ${s.name}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
                     </div>
                    <div className="p-6">
                      <h3 className="playfair text-2xl font-bold text-gray-800 mb-2 group-hover:text-[#3b6341] transition-colors">{s.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{s.description}</p>
                       <div className="flex justify-between items-center">
                         <p className="text-sm text-gray-500 font-medium">{venueCount.toLocaleString()} venues</p>
                         <div className="bg-[#3b6341] text-white text-sm font-semibold px-4 py-2 rounded-lg group-hover:bg-opacity-90 transition-all">
                            Explore {s.name} &rarr;
                         </div>
                       </div>
                    </div>
                  </Link>
                );
              }))}
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon States */}
      {comingSoonStates.length > 0 && (
        <section className="py-16 bg-[#f0f2ef]">
          <div className="max-w-screen-xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl playfair font-bold text-gray-800 mb-8 text-center">Coming Soon — We're Expanding</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {comingSoonStates.map((s) => (
                <div key={s.slug} className="bg-white border border-gray-200 rounded-2xl p-4 transition-opacity opacity-80 hover:opacity-100">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800">{s.name}</h4>
                        <span className="text-xs bg-gray-200 text-gray-600 font-semibold px-2 py-0.5 rounded-full">{s.abbr}</span>
                    </div>
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2 h-8">{s.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Coming Soon
                    </span>
                     <a href={`mailto:hello@greenbowtie.com?subject=Notify me when ${s.name} launches on Green Bowtie`} className="text-xs text-[#3b6341] hover:underline font-semibold">Notify Me</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



    </div>
  );
}
