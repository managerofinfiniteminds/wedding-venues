import { getLiveStates } from "@/lib/states";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Venues in Every State | Green Bow Tie",
  description: "Browse thousands of wedding venues across all 50 states. Find the perfect venue for your wedding day on Green Bow Tie.",
};

// Verified Wikipedia Commons landmark images — one iconic photo per state
const STATE_IMAGES: Record<string, string> = {
  alabama:         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Barrington_Hall_North.JPG/800px-Barrington_Hall_North.JPG",
  alaska:          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Wonder_Lake_and_Denali.jpg/800px-Wonder_Lake_and_Denali.jpg",
  arizona:         "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/USA_Antelope-Canyon.jpg/800px-USA_Antelope-Canyon.jpg",
  arkansas:        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Morning_on_the_Buffalo_River.jpg/800px-Morning_on_the_Buffalo_River.jpg",
  california:      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/GoldenGateBridge-001.jpg/800px-GoldenGateBridge-001.jpg",
  colorado:        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Maroon_Bells_%2811553%29a.jpg/800px-Maroon_Bells_%2811553%29a.jpg",
  connecticut:     "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/House_of_Mark_Twain.jpg/800px-House_of_Mark_Twain.jpg",
  delaware:        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/New_Castle_Court_House_Museum.jpg/800px-New_Castle_Court_House_Museum.jpg",
  florida:         "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Sunset_over_the_River_of_Grass%2C_NPSphoto%2C_G.Gardner_%289255157507%29.jpg/800px-Sunset_over_the_River_of_Grass%2C_NPSphoto%2C_G.Gardner_%289255157507%29.jpg",
  georgia:         "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Forsyth_fountain_2019.jpeg/800px-Forsyth_fountain_2019.jpeg",
  hawaii:          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Hanauma_Bay.JPG/800px-Hanauma_Bay.JPG",
  idaho:           "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/CratersDrone1.jpg/800px-CratersDrone1.jpg",
  illinois:        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Millennium_Square%2C_Chicago%2C_Illinois_%289181701264%29.jpg/800px-Millennium_Square%2C_Chicago%2C_Illinois_%289181701264%29.jpg",
  indiana:         "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Indiana_Dunes_National_Lakeshore%2C_Michigan_City%2C_Indiana%2C_Estados_Unidos%2C_2012-10-20%2C_DD_03.jpg/800px-Indiana_Dunes_National_Lakeshore%2C_Michigan_City%2C_Indiana%2C_Estados_Unidos%2C_2012-10-20%2C_DD_03.jpg",
  iowa:            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Big_bear_mound_at_Effigy_Mounds_State_Park.jpg/800px-Big_bear_mound_at_Effigy_Mounds_State_Park.jpg",
  kansas:          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flint_hills_kansas.jpg/800px-Flint_hills_kansas.jpg",
  kentucky:        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Keeneland_Race_Course.jpg/800px-Keeneland_Race_Course.jpg",
  louisiana:       "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/New_Orleans_from_the_Air_September_2019_-_Central_Business_District_Skyline_%28cropped%29.jpg/800px-New_Orleans_from_the_Air_September_2019_-_Central_Business_District_Skyline_%28cropped%29.jpg",
  maine:           "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Bass_Harbor_Lighthouse_b.jpg/800px-Bass_Harbor_Lighthouse_b.jpg",
  maryland:        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Assateague_Island_aerial_view.jpg/800px-Assateague_Island_aerial_view.jpg",
  massachusetts:   "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/View_of_Provincetown_from_Pilgrim_Monument_looking_east%2C_MA%2C_USA_-_Sept%2C_2013.jpg/800px-View_of_Provincetown_from_Pilgrim_Monument_looking_east%2C_MA%2C_USA_-_Sept%2C_2013.jpg",
  michigan:        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Pictured_Rocks_Bridalveil_Falls.jpg/800px-Pictured_Rocks_Bridalveil_Falls.jpg",
  minnesota:       "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Pose_lake_Minnesota.jpg/800px-Pose_lake_Minnesota.jpg",
  mississippi:     "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Vicksburg-illinois-memorial.jpg/800px-Vicksburg-illinois-memorial.jpg",
  missouri:        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/St_Louis_night_expblend_cropped.jpg/800px-St_Louis_night_expblend_cropped.jpg",
  montana:         "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Mountain_Goat_at_Hidden_Lake.jpg/800px-Mountain_Goat_at_Hidden_Lake.jpg",
  nebraska:        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Chimney_Rock_NE.jpg/800px-Chimney_Rock_NE.jpg",
  nevada:          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Las_Vegas_Strip.jpg/800px-Las_Vegas_Strip.jpg",
  "new-hampshire": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Sandwich_Range.jpg/800px-Sandwich_Range.jpg",
  "new-jersey":    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Cape_May_Beach_Ave_from_the_sea_3.JPG/800px-Cape_May_Beach_Ave_from_the_sea_3.JPG",
  "new-mexico":    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Taos_Pueblo_2017-05-05.jpg/800px-Taos_Pueblo_2017-05-05.jpg",
  "new-york":      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/3Falls_Niagara.jpg/800px-3Falls_Niagara.jpg",
  "north-carolina":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/View_atop_Cliff_Tops_on_Mount_LeConte%2C_GSMNP%2C_TN.jpg/800px-View_atop_Cliff_Tops_on_Mount_LeConte%2C_GSMNP%2C_TN.jpg",
  "north-dakota":  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/View_of_Theodore_Roosevelt_National_Park.jpg/800px-View_of_Theodore_Roosevelt_National_Park.jpg",
  ohio:            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Cuyahoga_Valley_National_Park_20.jpg/800px-Cuyahoga_Valley_National_Park_20.jpg",
  oklahoma:        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Tallgrass_Prairie_Preserve.jpg/800px-Tallgrass_Prairie_Preserve.jpg",
  oregon:          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Above_Crater_Lake_%28cropped%29.jpg/800px-Above_Crater_Lake_%28cropped%29.jpg",
  pennsylvania:    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Rglenn05.jpg/800px-Rglenn05.jpg",
  "rhode-island":  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Newport_Rhode_Island_Aerial_View.jpg/800px-Newport_Rhode_Island_Aerial_View.jpg",
  "south-carolina":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Middleton-place-sc1.jpg/800px-Middleton-place-sc1.jpg",
  "south-dakota":  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Mount_Rushmore_detail_view_%28100MP%29.jpg/800px-Mount_Rushmore_detail_view_%28100MP%29.jpg",
  tennessee:       "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Clifftops4-7-07.jpg/800px-Clifftops4-7-07.jpg",
  texas:           "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Canyon%2C_Rio_Grande%2C_Texas.jpeg/800px-Canyon%2C_Rio_Grande%2C_Texas.jpeg",
  utah:            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Zion_angels_landing_view.jpg/800px-Zion_angels_landing_view.jpg",
  vermont:         "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/NewEngland_Fall.jpg/800px-NewEngland_Fall.jpg",
  virginia:        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Shenandoah_River%2C_aerial.jpg/800px-Shenandoah_River%2C_aerial.jpg",
  washington:      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Mount_Rainier_from_above_Myrtle_Falls_in_August.JPG/800px-Mount_Rainier_from_above_Myrtle_Falls_in_August.JPG",
  "west-virginia": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/New_River_Gorge_Bridge.jpg/800px-New_River_Gorge_Bridge.jpg",
  wisconsin:       "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Fish_Creek%2C_Wisconsin.jpg/800px-Fish_Creek%2C_Wisconsin.jpg",
  wyoming:         "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Barns_grand_tetons.jpg/800px-Barns_grand_tetons.jpg",
  "puerto-rico":   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Castillo_San_Felipe_del_Morro_aerial%2C_May_2024_-_01.jpg/800px-Castillo_San_Felipe_del_Morro_aerial%2C_May_2024_-_01.jpg",
};

const FALLBACK_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Maroon_Bells_%2811553%29a.jpg/800px-Maroon_Bells_%2811553%29a.jpg";

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
