import { getLiveStates } from "@/lib/states";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Venues in Every State | Green Bow Tie",
  description: "Browse thousands of wedding venues across all 50 states. Find the perfect venue for your wedding day on Green Bow Tie.",
};

// Curated scenic Unsplash images per state
const STATE_IMAGES: Record<string, string> = {
  alabama:         "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&h=400&fit=crop&auto=format",
  alaska:          "https://images.unsplash.com/photo-1531176175280-f8a6b9b0c5a3?w=600&h=400&fit=crop&auto=format",
  arizona:         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format",
  arkansas:        "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&h=400&fit=crop&auto=format",
  california:      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop&auto=format",
  colorado:        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format",
  connecticut:     "https://images.unsplash.com/photo-1505837394446-e0d17a4a5da4?w=600&h=400&fit=crop&auto=format",
  delaware:        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop&auto=format",
  florida:         "https://images.unsplash.com/photo-1440581572325-218b2bba4c6a?w=600&h=400&fit=crop&auto=format",
  georgia:         "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=400&fit=crop&auto=format",
  hawaii:          "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=600&h=400&fit=crop&auto=format",
  idaho:           "https://images.unsplash.com/photo-1476514525405-345ad388ad0c?w=600&h=400&fit=crop&auto=format",
  illinois:        "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=400&fit=crop&auto=format",
  indiana:         "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=400&fit=crop&auto=format",
  iowa:            "https://images.unsplash.com/photo-1481761289552-381112059e05?w=600&h=400&fit=crop&auto=format",
  kansas:          "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=600&h=400&fit=crop&auto=format",
  kentucky:        "https://images.unsplash.com/photo-1553531584-cffd87d6a6e9?w=600&h=400&fit=crop&auto=format",
  louisiana:       "https://images.unsplash.com/photo-1569963731010-65dac40a3594?w=600&h=400&fit=crop&auto=format",
  maine:           "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop&auto=format",
  maryland:        "https://images.unsplash.com/photo-1559333086-b0a56225a93c?w=600&h=400&fit=crop&auto=format",
  massachusetts:   "https://images.unsplash.com/photo-1501970183559-df26a5e0f37a?w=600&h=400&fit=crop&auto=format",
  michigan:        "https://images.unsplash.com/photo-1531176175280-f8a6b9b0c5a3?w=600&h=400&fit=crop&auto=format",
  minnesota:       "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&h=400&fit=crop&auto=format",
  mississippi:     "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&h=400&fit=crop&auto=format",
  missouri:        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop&auto=format",
  montana:         "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=400&fit=crop&auto=format",
  nebraska:        "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=600&h=400&fit=crop&auto=format",
  nevada:          "https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=600&h=400&fit=crop&auto=format",
  "new-hampshire": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&h=400&fit=crop&auto=format",
  "new-jersey":    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop&auto=format",
  "new-mexico":    "https://images.unsplash.com/photo-1526080652727-5b77f74eacd2?w=600&h=400&fit=crop&auto=format",
  "new-york":      "https://images.unsplash.com/photo-1534430480872-d6bcd1b0e285?w=600&h=400&fit=crop&auto=format",
  "north-carolina":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop&auto=format",
  "north-dakota":  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop&auto=format",
  ohio:            "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=400&fit=crop&auto=format",
  oklahoma:        "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=600&h=400&fit=crop&auto=format",
  oregon:          "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=400&fit=crop&auto=format",
  pennsylvania:    "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=600&h=400&fit=crop&auto=format",
  "rhode-island":  "https://images.unsplash.com/photo-1505837394446-e0d17a4a5da4?w=600&h=400&fit=crop&auto=format",
  "south-carolina":"https://images.unsplash.com/photo-1600420622778-aedb26c9cd25?w=600&h=400&fit=crop&auto=format",
  "south-dakota":  "https://images.unsplash.com/photo-1476514525405-345ad388ad0c?w=600&h=400&fit=crop&auto=format",
  tennessee:       "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=600&h=400&fit=crop&auto=format",
  texas:           "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=600&h=400&fit=crop&auto=format",
  utah:            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop&auto=format",
  vermont:         "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&h=400&fit=crop&auto=format",
  virginia:        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop&auto=format",
  washington:      "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=600&h=400&fit=crop&auto=format",
  "west-virginia": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=400&fit=crop&auto=format",
  wisconsin:       "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&h=400&fit=crop&auto=format",
  wyoming:         "https://images.unsplash.com/photo-1526080652727-5b77f74eacd2?w=600&h=400&fit=crop&auto=format",
  "puerto-rico":   "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=600&h=400&fit=crop&auto=format",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format";

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
