
import { prisma } from "@/lib/prisma";
import { VenueCard } from "@/components/VenueCard";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { SortSelect } from "@/components/SortSelect";
import { MobileFilters } from "@/components/MobileFilters";
import { Nav } from "@/components/Nav";

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
const PAGE_SIZE = 10;

export interface SearchParams {
  q?: string;
  city?: string | string[];
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
    ...(cities.length > 0 && { city: { in: cities } }),
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
  const venues = await prisma.venue.findMany({
    where,
    orderBy,
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });

  const cityCounts = await prisma.venue.groupBy({
    by: ["city"],
    _count: { city: true },
    where: { isPublished: true, city: { in: CITIES } }
  });
  const cityCountMap = Object.fromEntries(cityCounts.map((c) => [c.city, c._count.city]));

  const typeCounts = await prisma.venue.groupBy({
    by: ['venueType'],
    _count: { venueType: true },
    where: { isPublished: true, venueType: { in: VENUE_TYPES } }
  });
  const typeCountMap = Object.fromEntries(typeCounts.map(t => [t.venueType, t._count.venueType]));

  const hasFilters = q || cities.length > 0 || types.length > 0 || styles.length > 0 || minPrice || maxPrice || minGuests || maxGuests;
  const totalPages = Math.ceil(totalVenues / PAGE_SIZE);

  const sidebarContent = (
    <div>
        <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-800">Filters</h3>
            {hasFilters && <Link href="/venues" className="text-xs text-pink-600 hover:underline">Clear all</Link>}
        </div>
        <div className="space-y-4">
            <FilterSection title="City">
                {CITIES.map((c) => (
                <FilterCheckbox
                    key={c}
                    label={c}
                    count={cityCountMap[c]}
                    checked={cities.includes(c)}
                    href={buildFilterUrl(params, 'city', c)}
                />
                ))}
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
            Showing <span className="font-semibold text-gray-800">{venues.length}</span> of <span className="font-semibold text-gray-800">{totalVenues}</span> venues
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

          <main className="flex-1 min-w-0 space-y-5">
            {venues.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100">
                <p className="text-lg mb-2 font-semibold">No venues found</p>
                <p className="text-sm mb-4">Try adjusting your filters or clearing them to see all results.</p>
                {hasFilters && <Link href="/venues" className="text-pink-600 hover:underline text-sm font-medium">Clear all filters</Link>}
              </div>
            ) : (
                <>
                    {venues.map((venue) => <VenueCard key={venue.id} venue={venue} />)}
                    {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} currentParams={params} />}
                </>
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

function Pagination({ currentPage, totalPages, currentParams }: { currentPage: number; totalPages: number; currentParams: SearchParams; }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([key, value]) => {
      if (key !== 'page') {
        toArray(value).forEach(v => params.append(key, v));
      }
    });
    if (page > 1) {
        params.set('page', page.toString());
    } else {
        params.delete('page');
    }
    return `/venues?${params.toString()}`
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link href={createPageUrl(currentPage - 1)} className="px-4 py-2 text-sm border bg-white rounded-lg hover:bg-gray-50 transition-colors">Previous</Link>
      )}
      {/* Simplified pagination display logic */}
      {pages.map(p => (
        <Link 
          key={p} 
          href={createPageUrl(p)} 
          className={`px-4 py-2 text-sm border rounded-lg transition-colors ${p === currentPage ? 'bg-pink-700 border-pink-700 text-white' : 'bg-white hover:bg-gray-50'}`}>
            {p}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link href={createPageUrl(currentPage + 1)} className="px-4 py-2 text-sm border bg-white rounded-lg hover:bg-gray-50 transition-colors">Next</Link>
      )}
    </div>
  )
}

