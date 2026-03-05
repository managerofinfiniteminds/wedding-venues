import { getLiveStates } from "@/lib/states";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Venues in Every State | Green Bow Tie",
  description: "Browse thousands of wedding venues across all 50 states. Find the perfect venue for your wedding day on Green Bow Tie.",
};

// Local state images — downloaded to public/images/states/, never broken
const STATE_IMAGES: Record<string, string> = {
  alabama:         "/images/states/alabama.jpg",
  alaska:          "/images/states/alaska.jpg",
  arizona:         "/images/states/arizona.jpg",
  arkansas:        "/images/states/arkansas.jpg",
  california:      "/images/states/california.jpg",
  colorado:        "/images/states/colorado.jpg",
  connecticut:     "/images/states/connecticut.jpg",
  delaware:        "/images/states/delaware.jpg",
  florida:         "/images/states/florida.jpg",
  georgia:         "/images/states/georgia.jpg",
  hawaii:          "/images/states/hawaii.jpg",
  idaho:           "/images/states/idaho.jpg",
  illinois:        "/images/states/illinois.jpg",
  indiana:         "/images/states/indiana.jpg",
  iowa:            "/images/states/iowa.jpg",
  kansas:          "/images/states/kansas.jpg",
  kentucky:        "/images/states/kentucky.jpg",
  louisiana:       "/images/states/louisiana.jpg",
  maine:           "/images/states/maine.jpg",
  maryland:        "/images/states/maryland.jpg",
  massachusetts:   "/images/states/massachusetts.jpg",
  michigan:        "/images/states/michigan.jpg",
  minnesota:       "/images/states/minnesota.jpg",
  mississippi:     "/images/states/mississippi.jpg",
  missouri:        "/images/states/missouri.jpg",
  montana:         "/images/states/montana.jpg",
  nebraska:        "/images/states/nebraska.jpg",
  nevada:          "/images/states/nevada.jpg",
  "new-hampshire": "/images/states/new-hampshire.jpg",
  "new-jersey":    "/images/states/new-jersey.jpg",
  "new-mexico":    "/images/states/new-mexico.jpg",
  "new-york":      "/images/states/new-york.jpg",
  "north-carolina":"/images/states/north-carolina.jpg",
  "north-dakota":  "/images/states/north-dakota.jpg",
  ohio:            "/images/states/ohio.jpg",
  oklahoma:        "/images/states/oklahoma.jpg",
  oregon:          "/images/states/oregon.jpg",
  pennsylvania:    "/images/states/pennsylvania.jpg",
  "rhode-island":  "/images/states/rhode-island.jpg",
  "south-carolina":"/images/states/south-carolina.jpg",
  "south-dakota":  "/images/states/south-dakota.jpg",
  tennessee:       "/images/states/tennessee.jpg",
  texas:           "/images/states/texas.jpg",
  utah:            "/images/states/utah.jpg",
  vermont:         "/images/states/vermont.jpg",
  virginia:        "/images/states/virginia.jpg",
  washington:      "/images/states/washington.jpg",
  "west-virginia": "/images/states/west-virginia.jpg",
  wisconsin:       "/images/states/wisconsin.jpg",
  wyoming:         "/images/states/wyoming.jpg",
  "puerto-rico":   "/images/states/puerto-rico.jpg",
};

const FALLBACK_IMAGE = "/images/states/colorado.jpg";

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {liveStates.map((s) => {
              const count = countMap.get(s.slug) ?? 0;
              const image = STATE_IMAGES[s.slug] ?? FALLBACK_IMAGE;
              return (
                <Link
                  key={s.slug}
                  href={`/venues/${s.slug}`}
                  className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={s.name}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white font-bold text-sm leading-tight drop-shadow">{s.name}</p>
                        <p className="text-white/80 text-xs mt-0.5">{count.toLocaleString()} venues</p>
                      </div>
                      <span className="text-xs bg-white/20 text-white font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {s.abbr}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
