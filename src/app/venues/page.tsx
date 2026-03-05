import { getLiveStates } from "@/lib/states";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Venues in Every State | Green Bow Tie",
  description: "Browse thousands of wedding venues across all 50 states. Find the perfect venue for your wedding day on Green Bow Tie.",
};

// Verified Unsplash image IDs — all confirmed 200 OK, CDN-friendly, no hotlink issues
// Gaps filled with picsum.photos (seeded = consistent per state, always loads)
const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&h=400&fit=crop&auto=format`;
const P = (seed: string) => `https://picsum.photos/seed/${seed}/600/400`;

const STATE_IMAGES: Record<string, string> = {
  alabama:         U("1564349683136-77e08dba1ef7"),  // antebellum estate
  alaska:          U("1531366936337-7c912a4589a7"),  // aurora borealis
  arizona:         U("1518623489648-a173ef7824f3"),  // Antelope Canyon
  arkansas:        U("1504701954957-2010ec3bcec1"),  // Ozark river
  california:      U("1501594907352-04cda38ebc29"),  // Golden Gate Bridge
  colorado:        U("1506905925346-21bda4d32df4"),  // Rocky Mountains
  connecticut:     U("1508739773434-c26b3d09e071"),  // New England fall foliage
  delaware:        U("1507525428034-b723cf961d3e"),  // coastal beach
  florida:         U("1532375810709-75b1da00537c"),  // palm-lined beach
  georgia:         U("1568702846914-96b305d2aaeb"),  // Savannah
  hawaii:          U("1542259009477-d625272157b7"),  // tropical coast
  idaho:           P("idaho-sawtooth"),               // Sawtooth Mountains
  illinois:        U("1477959858617-67f85cf4f1df"),  // Chicago skyline
  indiana:         U("1500382017468-9049fed747ef"),  // rolling fields sunset
  iowa:            U("1481761289552-381112059e05"),  // farmland
  kansas:          U("1570913149827-d2ac84ab3f9a"),  // prairie
  kentucky:        U("1504384308090-c894fdcc538d"),  // horse farm
  louisiana:       P("louisiana-bayou"),              // bayou/New Orleans
  maine:           U("1558494949-ef010cbdcc31"),     // lighthouse coast
  maryland:        U("1559333086-b0a56225a93c"),     // Chesapeake Bay
  massachusetts:   P("massachusetts-cape-cod"),       // Cape Cod
  michigan:        P("michigan-great-lakes"),         // Great Lakes shoreline
  minnesota:       P("minnesota-boundary-waters"),    // boundary waters
  mississippi:     P("mississippi-antebellum"),       // plantation estate
  missouri:        U("1449824913935-59a10b8d2000"),  // Gateway Arch / St. Louis
  montana:         U("1500534314209-a25ddb2bd429"),  // Big Sky / mountains
  nebraska:        U("1489824904134-891ab64532f1"),  // prairie landscape
  nevada:          U("1581351721010-8cf859cb14a4"),  // Las Vegas Strip
  "new-hampshire": U("1508739773434-c26b3d09e071"),  // White Mountains fall
  "new-jersey":    P("new-jersey-shore"),             // Jersey Shore
  "new-mexico":    U("1526080652727-5b77f74eacd2"),  // adobe / desert
  "new-york":      U("1541899481282-d53bffe3c35d"),  // Manhattan skyline
  "north-carolina":U("1464822759023-fed622ff2c3b"),  // Blue Ridge Mountains
  "north-dakota":  U("1570077188670-e3a8d69ac5ff"),  // Badlands
  ohio:            P("ohio-hocking-hills"),            // Hocking Hills
  oklahoma:        P("oklahoma-tallgrass"),            // tallgrass prairie
  oregon:          P("oregon-crater-lake"),            // Crater Lake
  pennsylvania:    P("pennsylvania-countryside"),      // Amish countryside
  "rhode-island":  P("rhode-island-newport"),          // Newport mansions
  "south-carolina":P("south-carolina-charleston"),     // Charleston plantation
  "south-dakota":  P("south-dakota-rushmore"),         // Mount Rushmore
  tennessee:       U("1514924013411-cbf25faa35bb"),  // Smoky Mountains
  texas:           U("1531218150217-54595bc2b934"),  // Texas Hill Country
  utah:            U("1469854523086-cc02fe5d8800"),  // Zion / red rocks
  vermont:         U("1508739773434-c26b3d09e071"),  // fall foliage
  virginia:        U("1464822759023-fed622ff2c3b"),  // Blue Ridge / Shenandoah
  washington:      U("1502175353174-a7a70e73b362"),  // Mount Rainier / Seattle
  "west-virginia": P("west-virginia-gorge"),           // New River Gorge
  wisconsin:       P("wisconsin-door-county"),          // Door County
  wyoming:         U("1516912481808-3406841bd33c"),  // Grand Tetons
  "puerto-rico":   P("puerto-rico-old-san-juan"),     // Old San Juan
};

const FALLBACK_IMAGE = U("1506905925346-21bda4d32df4");

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
