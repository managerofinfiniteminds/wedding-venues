
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { SortSelect } from "@/components/SortSelect";
import { MobileFilters } from "@/components/MobileFilters";
import { Nav } from "@/components/Nav";
import { VenueList } from "@/components/VenueList";

// California regions → cities mapping (by wedding destination identity)
const REGIONS: Record<string, string[]> = {
  "San Francisco": ["San Francisco", "Sausalito", "Tiburon", "Mill Valley", "San Rafael", "Novato", "Marin", "Muir Beach", "Stinson Beach", "Stinson Beach", "Muir Beach", "Mill Valley", "Sausalito", "Tiburon", "Belvedere", "Corte Madera", "Larkspur", "Kentfield", "Ross", "San Anselmo", "Fairfax", "San Geronimo", "Woodacre", "Forest Knolls", "Lagunitas"],
  "East Bay": ["Oakland", "Berkeley", "Walnut Creek", "Concord", "Pleasanton", "Livermore", "Dublin", "San Ramon", "Danville", "Alamo", "Lafayette", "Orinda", "Fremont", "Hayward", "Newark", "Union City", "Alameda", "Emeryville", "Albany", "El Cerrito", "Richmond", "Pinole", "Hercules", "Martinez", "Brentwood", "Antioch", "Pittsburg", "Oakley", "Benicia"],
  "Peninsula & South Bay": ["San Mateo", "Burlingame", "Hillsborough", "Redwood City", "Menlo Park", "Palo Alto", "Los Altos", "Mountain View", "Sunnyvale", "Santa Clara", "San Jose", "Saratoga", "Los Gatos", "Campbell", "Morgan Hill", "Gilroy", "Half Moon Bay", "Pacifica", "Woodside", "Portola Valley", "Atherton", "Foster City", "Belmont", "San Carlos", "Millbrae", "San Bruno", "South San Francisco", "Daly City", "Milpitas"],
  "Napa Valley": ["Napa", "Yountville", "Oakville", "Rutherford", "St Helena", "Calistoga", "American Canyon", "Pope Valley", "Angwin", "Vallejo", "St. Helena", "Vacaville", "Fairfield", "Angwin", "Pope Valley", "Deer Park", "Rutherford", "Oakville", "Yountville", "American Canyon", "Napa"],
  "Sonoma County": ["Sonoma", "Santa Rosa", "Healdsburg", "Petaluma", "Sebastopol", "Windsor", "Geyserville", "Cloverdale", "Glen Ellen", "Kenwood", "Guerneville", "Forestville", "Graton", "Occidental", "Rohnert Park", "Cotati", "Boyes Hot Springs", "Sonoma", "El Verano", "Fetters Hot Springs", "Boyes Hot Springs", "Agua Caliente", "Kenwood", "Glen Ellen", "Eldridge", "Vineburg", "Schellville", "Petaluma", "Two Rock", "Valley Ford", "Bodega Bay", "Bodega", "Tomales", "Novato", "Santa Rosa", "Healdsburg", "Geyserville", "Cloverdale"],
  "Santa Cruz": ["Santa Cruz", "Aptos", "Capitola", "Scotts Valley", "Soquel", "Felton", "Boulder Creek", "Ben Lomond", "Watsonville", "Corralitos", "La Selva Beach"],
  "Monterey & Carmel": ["Monterey", "Carmel", "Pacific Grove", "Pebble Beach", "Big Sur", "Carmel Valley", "Seaside", "Marina", "Salinas", "Castroville", "Moss Landing", "Half Moon Bay", "Hollister", "King City", "Carmel-by-the-Sea"],
  "Santa Barbara": ["Santa Barbara", "Montecito", "Goleta", "Carpinteria", "Summerland", "Hope Ranch", "Santa Ynez", "Solvang", "Buellton", "Los Olivos", "Ballard", "Lompoc", "Santa Maria", "Ojai", "Ventura", "Oxnard", "Camarillo", "Moorpark", "Thousand Oaks", "Santa Paula", "Somis"],
  "San Luis Obispo": ["San Luis Obispo", "Paso Robles", "Pismo Beach", "Arroyo Grande", "Grover Beach", "Morro Bay", "Cambria", "Templeton", "Atascadero", "Nipomo", "Santa Margarita", "San Miguel", "Paso Robles"],
  "Los Angeles": ["Los Angeles", "Beverly Hills", "West Hollywood", "Santa Monica", "Malibu", "Culver City", "Brentwood", "Pacific Palisades", "Bel Air", "Hollywood", "Silver Lake", "Echo Park", "Downtown Los Angeles", "Arts District", "Pasadena", "Arcadia", "Monrovia", "Burbank", "Glendale", "Studio City", "Sherman Oaks", "Encino", "Tarzana", "Woodland Hills", "Calabasas", "Agoura Hills", "Long Beach", "San Pedro", "Torrance", "Redondo Beach", "Hermosa Beach", "Manhattan Beach", "El Segundo", "Hawthorne", "Inglewood", "Gardena", "Carson", "Lakewood", "Whittier", "Santa Clarita", "Valencia", "Simi Valley", "Chatsworth", "Northridge", "Granada Hills", "Van Nuys", "Altadena", "La Canada Flintridge", "Los Angeles County", "Agua Dulce", "Westlake Village", "Marina del Rey", "Avalon", "Rancho Palos Verdes"],
  "Orange County": ["Anaheim", "Irvine", "Fullerton", "Santa Ana", "Orange", "Huntington Beach", "Newport Beach", "Laguna Beach", "Dana Point", "San Clemente", "Laguna Niguel", "Mission Viejo", "Lake Forest", "Aliso Viejo", "Rancho Santa Margarita", "Coto de Caza", "San Juan Capistrano", "Costa Mesa", "Tustin", "Garden Grove", "Brea", "Placentia", "Yorba Linda", "Seal Beach", "Los Alamitos", "Cypress", "La Palma"],
  "Inland Empire": ["Riverside", "San Bernardino", "Rancho Cucamonga", "Ontario", "Fontana", "Rialto", "Colton", "Redlands", "Loma Linda", "Yucaipa", "Beaumont", "Banning", "Hemet", "San Jacinto", "Perris", "Moreno Valley", "Murrieta", "Temecula", "Wildomar", "Lake Elsinore", "Canyon Lake", "Menifee", "Chino", "Chino Hills", "Corona", "Norco", "Pomona", "Claremont", "La Verne", "San Dimas", "Glendora", "Upland", "Montclair", "Apple Valley", "Victorville", "Hesperia", "Palmdale", "Lancaster", "Lake Arrowhead", "Big Bear Lake", "Idyllwild-Pine Cove", "Oak Glen"],
  "San Diego": ["San Diego", "La Jolla", "Del Mar", "Coronado", "Chula Vista", "Escondido", "Carlsbad", "Encinitas", "Solana Beach", "Oceanside", "Temecula", "Fallbrook", "Rancho Santa Fe", "El Cajon", "Santee", "La Mesa", "Poway", "San Marcos", "Vista", "Bonsall", "Valley Center", "Ramona", "Alpine", "Lakeside", "National City", "Imperial Beach", "Jamul", "Julian"],
  "Palm Springs & Desert": ["Palm Springs", "Palm Desert", "Rancho Mirage", "La Quinta", "Cathedral City", "Desert Hot Springs", "Indian Wells", "Indio", "Coachella", "Thermal", "Joshua Tree", "Yucca Valley", "Twentynine Palms", "Borrego Springs"],
  "Sacramento": ["Sacramento", "Folsom", "El Dorado Hills", "Roseville", "Granite Bay", "Davis", "Woodland", "Elk Grove", "Rancho Cordova", "Citrus Heights", "Rocklin", "Lincoln", "Loomis", "Orangevale", "Fair Oaks", "Galt", "West Sacramento", "Winters", "Dixon"],
  "Gold Country": ["Auburn", "Grass Valley", "Nevada City", "Placerville", "El Dorado Hills", "Cameron Park", "Shingle Springs", "Georgetown", "Coloma", "Lotus", "Garden Valley", "Sonora", "Jamestown", "Angels Camp", "Jackson", "Sutter Creek", "Amador City", "Ione", "Plymouth", "Camino", "Murphys", "Groveland", "Somerset"],
  "Lake Tahoe": ["South Lake Tahoe", "Tahoe City", "Truckee", "Olympic Valley", "Kings Beach", "Carnelian Bay", "Homewood", "Meeks Bay", "Incline Village", "Stateline"],
  "Central Valley": ["Fresno", "Bakersfield", "Stockton", "Modesto", "Visalia", "Madera", "Porterville", "Tulare", "Hanford", "Lodi", "Turlock", "Merced", "Tracy", "Manteca", "Tehachapi", "Delano", "Sanger", "Los Banos", "Clovis", "Oakdale", "Kingsburg", "Exeter", "Oakhurst", "Dinuba", "Reedley", "Taft"],
  "Shasta & Northern CA": ["Redding", "Chico", "Red Bluff", "Oroville", "Yuba City", "Marysville", "Anderson", "Corning", "Colusa", "Willows", "Orland", "Mount Shasta", "Cottonwood", "Susanville", "McCloud", "Crescent City", "Tehama", "Weed", "Yreka", "Fort Jones", "Etna", "Happy Camp", "Orleans", "Willow Creek", "Hoopa", "Weaverville", "Lewiston", "Douglas City", "Hayfork", "Hyampom", "Ruth", "Mad River", "Bridgeville", "Fortuna", "Loleta", "Scotia", "Rio Dell", "Eureka", "Arcata", "McKinleyville", "Trinidad", "Orick", "Klamath", "Hiouchi", "Gasquet", "Fort Dick", "Smith River"],
  "Mendocino Coast": ["Mendocino", "Fort Bragg", "Elk", "Albion", "Little River", "Philo", "Boonville", "Gualala", "Point Arena", "Anchor Bay", "Hopland", "Ukiah", "Willits", "Ferndale", "Garberville", "Shelter Cove", "Whitethorn", "Piercy", "Leggett", "Laytonville", "Covelo", "Dos Rios", "Longvale", "Branscomb", "Westport", "Rockport", "Elk", "Albion", "Little River", "Mendocino", "Caspar", "Fort Bragg", "Cleone", "MacKerricher", "Inglenook", "Cuffeys Cove", "Anchor Bay", "Gualala", "Point Arena", "Manchester", "Boonville", "Philo", "Navarro", "Comptche", "Redwood Valley", "Potter Valley", "Hopland", "Talmage", "Ukiah", "Calpella", "Willits", "Glen Blair", "Marshall", "Inverness", "Point Reyes Station", "Olema", "Bolinas", "Samuel", "Nicasio"],
  "Lake County & North Bay": ["Lakeport", "Clearlake", "Kelseyville", "Middletown", "Cobb", "Upper Lake", "Nice", "Lucerne", "Eureka", "Arcata", "Fortuna", "Cobb", "Middletown", "Hidden Valley Lake", "Lower Lake", "Clearlake Oaks", "Nice", "Lakeport", "Upper Lake", "Lucerne", "Kelseyville", "Finley", "Clearlake", "Clearlake Highlands", "Spring Valley"],
};

const VENUE_TYPES = [
  "Vineyard & Winery",
  "Barn / Ranch",
  "Ballroom",
  "Golf Club",
  "Country Club",
  "Historic Estate",
  "Resort",
  "Hotel & Resort",
  "Garden",
  "Outdoor / Park",
  "Urban / Rooftop",
  "Museum & Gallery",
  "Restaurant",
  "Event Venue",
];
const STYLES = ["Romantic", "Rustic", "Modern", "Garden", "Bohemian", "Industrial", "Vintage", "Elegant"];
const PAGE_SIZE = 24;

export interface SearchParams {
  q?: string;
  city?: string | string[];
  region?: string | string[];
  type?: string | string[];
  style?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  minGuests?: string;
  maxGuests?: string;
  sort?: string;
  page?: string;
}

export function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

export function buildFilterUrl(
  currentParams: SearchParams,
  toggleKey: string,
  toggleValue: string
): string {
  const params = new URLSearchParams();
  Object.entries(currentParams).forEach(([k, v]) => {
    if (k === toggleKey) return;
    toArray(v as string | string[]).forEach(val => params.append(k, val));
  });

  const current = toArray(currentParams[toggleKey as keyof SearchParams]);
  const isActive = current.includes(toggleValue);
  const newList = isActive ? current.filter(v => v !== toggleValue) : [...current, toggleValue];
  newList.forEach(v => params.append(toggleKey, v));

  // Reset page on filter change
  params.delete('page');

  return `/venues?${params.toString()}`;
}

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = params.q;
  const cities = toArray(params.city);
  const regions = toArray(params.region);
  // Expand regions into city lists
  const allRegionCities = Object.values(REGIONS).flat();
  const regionCities = regions.includes("Other")
    ? [] // handled separately below
    : regions.flatMap((r) => REGIONS[r] ?? []);
  const effectiveCities = cities.length > 0 ? cities : regionCities;
  const types = toArray(params.type);
  const styles = toArray(params.style);
  const minPrice = params.minPrice ? parseInt(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : undefined;
  const minGuests = params.minGuests ? parseInt(params.minGuests) : undefined;
  const maxGuests = params.maxGuests ? parseInt(params.maxGuests) : undefined;
  const sort = params.sort ?? 'rating';
  const page = params.page ? parseInt(params.page) : 1;

  const where: Prisma.VenueWhereInput = {
    isPublished: true,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(regions.includes("Other")
      ? { city: { notIn: allRegionCities } }
      : effectiveCities.length > 0
      ? { city: { in: effectiveCities } }
      : {}),
    ...(types.length > 0 && { venueType: { in: types } }),
    ...(styles.length > 0 && { styleTags: { hasSome: styles } }),
    ...(minPrice !== undefined && { baseRentalMin: { gte: minPrice } }),
    ...(maxPrice !== undefined && { baseRentalMax: { lte: maxPrice } }),
    ...(minGuests !== undefined && { maxGuests: { gte: minGuests } }),
    ...(maxGuests !== undefined && { minGuests: { lte: maxGuests } }),
  };

  const orderBy: Prisma.VenueOrderByWithRelationInput[] = [];
  if (sort === 'rating') orderBy.push({ googleRating: { sort: 'desc', nulls: 'last' } }, { googleReviews: { sort: 'desc', nulls: 'last' } });
  if (sort === 'price_asc') orderBy.push({ baseRentalMin: { sort: 'asc', nulls: 'last' } });
  if (sort === 'price_desc') orderBy.push({ baseRentalMin: { sort: 'desc', nulls: 'last' } });
  if (sort === 'capacity') orderBy.push({ maxGuests: { sort: 'desc', nulls: 'last' } });

  const totalVenues = await prisma.venue.count({ where });
  const grandTotal = await prisma.venue.count({ where: { isPublished: true } });
  const venues = await prisma.venue.findMany({
    where,
    orderBy,
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });

  // Get top 20 cities by venue count dynamically
  const cityCounts = await prisma.venue.groupBy({
    by: ["city"],
    _count: { city: true },
    where: { isPublished: true },
    orderBy: { _count: { city: "desc" } },
    take: 20,
  });
  const CITIES = cityCounts.map((c) => c.city).filter(Boolean);
  const cityCountMap = Object.fromEntries(cityCounts.map((c) => [c.city, c._count.city]));

  // Compute region counts by summing city counts across all venues
  const allCityCounts = await prisma.venue.groupBy({
    by: ["city"],
    _count: { city: true },
    where: { isPublished: true },
  });
  const allCityCountMap = Object.fromEntries(allCityCounts.map((c) => [c.city, c._count.city]));
  const regionCountMap = Object.fromEntries(
    Object.entries(REGIONS).map(([region, cities]) => [
      region,
      cities.reduce((sum, city) => sum + (allCityCountMap[city] ?? 0), 0),
    ])
  );
  const allKnownCities = Object.values(REGIONS).flat();
  const otherCount = Object.entries(allCityCountMap)
    .filter(([city]) => !allKnownCities.includes(city))
    .reduce((sum, [, count]) => sum + count, 0);

  const typeCounts = await prisma.venue.groupBy({
    by: ['venueType'],
    _count: { venueType: true },
    where: { isPublished: true, venueType: { in: VENUE_TYPES } }
  });
  const typeCountMap = Object.fromEntries(typeCounts.map(t => [t.venueType, t._count.venueType]));

  const hasFilters = q || cities.length > 0 || regions.length > 0 || types.length > 0 || styles.length > 0 || minPrice || maxPrice || minGuests || maxGuests;
  const totalPages = Math.ceil(totalVenues / PAGE_SIZE);

  const sidebarContent = (
    <div>
        <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-800">Filters</h3>
            {hasFilters && <Link href="/venues" className="text-xs text-pink-600 hover:underline">Clear all</Link>}
        </div>
        <div className="space-y-4">
            <FilterSection title="Region">
                {Object.keys(REGIONS).map((r) => (
                <FilterCheckbox
                    key={r}
                    label={r}
                    count={regionCountMap[r]}
                    checked={regions.includes(r)}
                    href={buildFilterUrl(params, 'region', r)}
                />
                ))}
                <FilterCheckbox
                    label="Other"
                    count={otherCount}
                    checked={regions.includes("Other")}
                    href={buildFilterUrl(params, 'region', 'Other')}
                />
            </FilterSection>

            <FilterSection title="Venue Type">
                {VENUE_TYPES.map((t) => (
                <FilterCheckbox
                    key={t}
                    label={t}
                    count={typeCountMap[t] || 0}
                    checked={types.includes(t)}
                    href={buildFilterUrl(params, 'type', t)}
                />
                ))}
            </FilterSection>

            {/* Price & Guest Forms can remain the same, just wrapped in FilterSection */}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <Nav q={q} />
      {/* MobileFilters can be adapted or simplified if needed */}
      <MobileFilters>{sidebarContent}</MobileFilters>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 text-sm">
            Showing <span className="font-semibold text-gray-800">{venues.length}</span> of <span className="font-semibold text-gray-800">{totalVenues.toLocaleString()}</span> venues
            {hasFilters && <span className="text-gray-400"> · {grandTotal.toLocaleString()} total in CA</span>}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-gray-600">Sort by:</label>
                <SortSelect current={sort} />
            </div>
           </div>
        </div>
        
        {/* Style pills - horizontal scroll above list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4">
            <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">Style:</span>
            {STYLES.map(s => (
                <Link key={s} href={buildFilterUrl(params, "style", s)}
                className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                    styles.includes(s) 
                    ? "bg-pink-700 text-white border-pink-700" 
                    : "bg-white text-gray-600 border-gray-300 hover:border-pink-400"
                }`}>
                {s}
                </Link>
            ))}
        </div>

        <div className="flex gap-8 items-start">
          <aside className="hidden lg:block w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            {sidebarContent}
          </aside>

          <main className="flex-1 min-w-0">
            {venues.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100">
                <p className="text-lg mb-2 font-semibold">No venues found</p>
                <p className="text-sm mb-4">Try adjusting your filters or clearing them to see all results.</p>
                {hasFilters && <Link href="/venues" className="text-pink-600 hover:underline text-sm font-medium">Clear all filters</Link>}
              </div>
            ) : (
              <VenueList
                initialVenues={venues}
                initialTotal={totalVenues}
                searchParams={params as Record<string, string | string[]>}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-800 mb-2 list-none marker:content-[''] hover:text-pink-700">
        <span>{title}</span>
        <svg className="w-4 h-4 text-gray-400 transition-transform details-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </summary>
      <div className="space-y-1 pt-2">
        {children}
      </div>
    </details>
  );
}

function FilterCheckbox({ label, count, checked, href }: { label: string; count?: number; checked: boolean; href: string; }) {
    return (
        <Link href={href} className="flex items-center justify-between py-1 px-1 rounded hover:bg-pink-50 text-sm text-gray-700 transition-colors group">
            <span className="flex items-center gap-2.5">
                <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                checked ? "bg-pink-600 border-pink-600" : "border-gray-300 group-hover:border-pink-400"
                }`}>
                {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                </span>
                <span className={checked ? "text-gray-800 font-medium" : ""}>{label}</span>
            </span>
            {count !== undefined && <span className="text-gray-400 text-xs px-1.5 py-0.5 bg-gray-100 rounded-full">{count}</span>}
        </Link>
    )
}



