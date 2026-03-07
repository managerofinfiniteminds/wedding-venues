import { getLiveStates } from "@/lib/states";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";
import { USStateMapHomepage } from "@/components/USStateMapClient";

export const metadata: Metadata = {
  title: "Wedding Venues in Every State | Green Bow Tie",
  description: "Browse thousands of wedding venues across all 50 states. Find the perfect venue for your wedding day on Green Bow Tie.",
};

// Curated featured states — most popular for weddings
const FEATURED_STATES = [
  { slug: "california",  label: "California",  image: "/state-california.jpg" },
  { slug: "new-york",    label: "New York",    image: "/state-new-york.jpg" },
  { slug: "texas",       label: "Texas",       image: "/state-texas.jpg" },
  { slug: "florida",     label: "Florida",     image: "/state-florida.jpg" },
  { slug: "tennessee",   label: "Tennessee",   image: "/state-tennessee.jpg" },
  { slug: "colorado",    label: "Colorado",    image: "/state-colorado.jpg" },
];

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

      {/* ── HERO ── */}
      <section className="flex items-center justify-center py-16 bg-[#f8f7f5]">
        <div className="text-center px-4 max-w-3xl mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/greenbowtie-logo.svg"
            alt="Green Bowtie"
            className="h-[22.5rem] sm:h-[31.5rem] md:h-[40.5rem] w-auto mx-auto mb-8"
          />
          <h1 className="playfair text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
            Find Your Perfect<br className="hidden sm:block" /> Wedding Venue
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-500">
            {totalVenues.toLocaleString()} venues across all 50 states
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#browse"
              className="inline-flex items-center justify-center gap-2 bg-[#3b6341] text-white font-semibold px-7 py-3.5 rounded-full text-sm shadow-lg hover:bg-[#2e4f33] transition-all"
            >
              Browse by State
            </a>
          </div>
        </div>
      </section>

      {/* ── FEATURED STATES ── */}
      <section className="py-14 bg-white">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="playfair text-3xl font-bold text-gray-800 text-center mb-2">
            Popular Wedding Destinations
          </h2>
          <p className="text-gray-500 text-center text-sm mb-8">Start with the most sought-after states</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURED_STATES.map(({ slug, label, image }) => {
              const count = countMap.get(slug) ?? 0;
              return (
                <Link
                  key={slug}
                  href={`/venues/${slug}`}
                  className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 aspect-[3/4]"
                >
                  {/* Background image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="font-semibold text-sm leading-tight">{label}</p>
                    <p className="text-white/70 text-xs mt-0.5">{count.toLocaleString()} venues</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE US MAP ── */}
      <section id="browse" className="py-16 bg-[#f8f7f5]">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="playfair text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">
            Browse All 50 States
          </h2>
          <p className="text-gray-500 text-center text-sm mb-8">Click any state to browse venues</p>
          <div className="max-w-4xl mx-auto">
            <USStateMapHomepage />
          </div>
        </div>
      </section>

      {/* ── STATE GRID (fallback / mobile) ── */}
      <section className="pb-16 bg-[#f8f7f5]">
        <div className="max-w-screen-xl mx-auto px-4">
          <p className="text-gray-500 text-center text-sm mb-6">Or pick a state directly</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {liveStates.map((s) => {
              const count = countMap.get(s.slug) ?? 0;
              return (
                <Link
                  key={s.slug}
                  href={`/venues/${s.slug}`}
                  className="group flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:shadow-md hover:border-[#3b6341] transition-all duration-200"
                >
                  <span className="text-xs font-bold text-[#3b6341] bg-[#f0f4f0] px-2 py-1 rounded-full flex-shrink-0 w-10 text-center">{s.abbr}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm leading-tight group-hover:text-[#3b6341] transition-colors truncate">{s.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{count.toLocaleString()} venues</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="py-16 bg-[#3b6341] text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="playfair text-3xl font-bold mb-3">Your perfect day starts here.</h2>
          <p className="text-white/80 text-sm">Filter by style, browse by state, and find the one that feels like you.</p>
        </div>
      </section>
    </div>
  );
}
