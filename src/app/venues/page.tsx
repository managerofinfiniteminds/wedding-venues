import { prisma } from "@/lib/prisma";
import { VenueCard } from "@/components/VenueCard";
import Link from "next/link";
import { Prisma } from "@prisma/client";

const CITIES = ["Livermore", "Pleasanton", "Dublin", "San Ramon", "Danville", "Sunol"];
const VENUE_TYPES = [
  "Vineyard & Winery",
  "Barn / Ranch",
  "Ballroom & Garden",
  "Golf Club & Terrace",
  "Country Club",
  "Boutique Estate",
  "Historic Estate",
  "Golf Club & Lawn",
  "Outdoor / Park",
  "Country Club & Garden",
];
const STYLES = ["Romantic", "Rustic", "Modern", "Garden", "Boho", "Industrial", "Vintage", "Elegant"];

interface SearchParams {
  city?: string | string[];
  type?: string | string[];
  style?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  minGuests?: string;
  maxGuests?: string;
}

function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cities = toArray(searchParams.city);
  const types = toArray(searchParams.type);
  const styles = toArray(searchParams.style);
  const minPrice = searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined;
  const minGuests = searchParams.minGuests ? parseInt(searchParams.minGuests) : undefined;
  const maxGuests = searchParams.maxGuests ? parseInt(searchParams.maxGuests) : undefined;

  const where: Prisma.VenueWhereInput = {
    isPublished: true,
    ...(cities.length > 0 && { city: { in: cities } }),
    ...(types.length > 0 && { venueType: { in: types } }),
    ...(styles.length > 0 && { styleTags: { hasSome: styles } }),
    ...(minPrice !== undefined && { baseRentalMin: { gte: minPrice } }),
    ...(maxPrice !== undefined && { baseRentalMax: { lte: maxPrice } }),
    ...(minGuests !== undefined && { minGuests: { gte: minGuests } }),
    ...(maxGuests !== undefined && { maxGuests: { lte: maxGuests } }),
  };

  const venues = await prisma.venue.findMany({
    where,
    orderBy: [{ googleRating: "desc" }, { googleReviews: "desc" }],
  });

  // Count per city for display
  const cityCounts = await prisma.venue.groupBy({
    by: ["city"],
    where: { isPublished: true },
    _count: { city: true },
  });
  const cityCountMap = Object.fromEntries(
    cityCounts.map((c) => [c.city, c._count.city])
  );

  const hasFilters = cities.length > 0 || types.length > 0 || styles.length > 0 || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="playfair text-2xl font-bold text-pink-700 whitespace-nowrap">
            Venue by Vow
          </Link>
          <form action="/venues" method="get" className="flex-1 relative max-w-xl">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              name="city"
              defaultValue={cities[0] ?? ""}
              placeholder="Search city or venue name..."
              className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-pink-400 bg-gray-50"
            />
          </form>
          <div className="ml-auto">
            <button className="bg-pink-700 hover:bg-pink-800 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-600 text-sm">
            <span className="font-semibold text-gray-800">{venues.length} venues</span>{" "}
            {cities.length > 0 ? `in ${cities.join(", ")}` : "in the Tri-Valley"}
          </p>
          {hasFilters && (
            <Link href="/venues" className="text-sm text-pink-600 hover:underline">
              Clear all filters
            </Link>
          )}
        </div>

        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-4">Filters</h3>

            {/* City */}
            <FilterSection title="City">
              {CITIES.map((c) => (
                <FilterCheckbox
                  key={c}
                  name="city"
                  value={c}
                  label={c}
                  count={cityCountMap[c]}
                  checked={cities.includes(c)}
                  currentParams={searchParams}
                />
              ))}
            </FilterSection>

            {/* Venue Type */}
            <FilterSection title="Venue Type">
              {VENUE_TYPES.map((t) => (
                <FilterCheckbox
                  key={t}
                  name="type"
                  value={t}
                  label={t}
                  checked={types.includes(t)}
                  currentParams={searchParams}
                />
              ))}
            </FilterSection>

            {/* Style */}
            <FilterSection title="Style">
              <div className="flex flex-wrap gap-1">
                {STYLES.map((s) => (
                  <StylePill
                    key={s}
                    style={s}
                    active={styles.includes(s)}
                    currentParams={searchParams}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Price */}
            <FilterSection title="Price Range">
              <form method="get" action="/venues" className="space-y-2">
                {/* carry over existing filters */}
                {cities.map((c) => <input key={c} type="hidden" name="city" value={c} />)}
                {types.map((t) => <input key={t} type="hidden" name="type" value={t} />)}
                {styles.map((s) => <input key={s} type="hidden" name="style" value={s} />)}
                <div className="flex gap-2">
                  <input type="number" name="minPrice" defaultValue={minPrice} placeholder="Min $" className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-pink-400" step="1000" />
                  <input type="number" name="maxPrice" defaultValue={maxPrice} placeholder="Max $" className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-pink-400" step="1000" />
                </div>
                <button type="submit" className="w-full bg-pink-700 text-white text-sm py-1.5 rounded-lg hover:bg-pink-800 transition-colors">
                  Apply
                </button>
              </form>
            </FilterSection>
          </aside>

          {/* Venue list */}
          <div className="flex-1 min-w-0 space-y-4">
            {venues.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg mb-2">No venues found</p>
                <Link href="/venues" className="text-pink-600 hover:underline text-sm">Clear filters</Link>
              </div>
            ) : (
              venues.map((venue) => <VenueCard key={venue.id} venue={venue} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 border-b border-gray-100 pb-5 last:border-0 last:mb-0">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
      {children}
    </div>
  );
}

function FilterCheckbox({
  name,
  value,
  label,
  count,
  checked,
  currentParams,
}: {
  name: string;
  value: string;
  label: string;
  count?: number;
  checked: boolean;
  currentParams: SearchParams;
}) {
  // Build the new URL with this filter toggled
  const params = new URLSearchParams();
  const current = toArray(currentParams[name as keyof SearchParams]);
  const others = (Object.entries(currentParams) as [string, string | string[]][])
    .filter(([k]) => k !== name);

  others.forEach(([k, v]) => {
    toArray(v).forEach((val) => params.append(k, val));
  });

  const newList = checked
    ? current.filter((v) => v !== value)
    : [...current, value];
  newList.forEach((v) => params.append(name, v));

  return (
    <Link
      href={`/venues?${params.toString()}`}
      className={`flex items-center justify-between py-1 text-sm rounded px-1 hover:bg-gray-50 transition-colors ${checked ? "text-pink-700 font-medium" : "text-gray-700"}`}
    >
      <span className="flex items-center gap-2">
        <span className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center ${checked ? "bg-pink-700 border-pink-700" : "border-gray-300"}`}>
          {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </span>
        {label}
      </span>
      {count !== undefined && <span className="text-gray-400 text-xs">{count}</span>}
    </Link>
  );
}

function StylePill({
  style,
  active,
  currentParams,
}: {
  style: string;
  active: boolean;
  currentParams: SearchParams;
}) {
  const params = new URLSearchParams();
  const currentStyles = toArray(currentParams.style);
  const newStyles = active
    ? currentStyles.filter((s) => s !== style)
    : [...currentStyles, style];

  toArray(currentParams.city).forEach((v) => params.append("city", v));
  toArray(currentParams.type).forEach((v) => params.append("type", v));
  newStyles.forEach((v) => params.append("style", v));
  if (currentParams.minPrice) params.set("minPrice", currentParams.minPrice);
  if (currentParams.maxPrice) params.set("maxPrice", currentParams.maxPrice);

  return (
    <Link
      href={`/venues?${params.toString()}`}
      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
        active
          ? "bg-pink-700 text-white border-pink-700"
          : "border-gray-300 text-gray-600 hover:border-pink-400"
      }`}
    >
      {style}
    </Link>
  );
}
