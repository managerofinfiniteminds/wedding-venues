
import { prisma } from "@/lib/prisma";
import { VenueCard } from "@/components/VenueCard";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { SortSelect } from "@/components/SortSelect";
import { MobileFilters } from "@/components/MobileFilters";
import { FilterCheckbox } from "@/components/FilterCheckbox";
import { StylePill } from "@/components/StylePill";
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

  return `/venues?${params.toString()}`;
}

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = params.q;
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
    ...(types.length > 0 && { venueType: { in: types } }),
    ...(styles.length > 0 && { styleTags: { hasSome: styles } }),
    ...(minPrice !== undefined && { baseRentalMin: { gte: minPrice } }),
    ...(maxPrice !== undefined && { baseRentalMax: { lte: maxPrice } }),
    ...(minGuests !== undefined && { maxGuests: { gte: minGuests } }),
    ...(maxGuests !== undefined && { minGuests: { lte: maxGuests } }),
  };

  const orderBy: Prisma.VenueOrderByWithRelationInput[] = [];
  if (sort === 'rating') orderBy.push({ googleRating: 'desc' }, { googleReviews: 'desc' });
  if (sort === 'price_asc') orderBy.push({ baseRentalMin: 'asc' });
  if (sort === 'price_desc') orderBy.push({ baseRentalMin: 'desc' });
  if (sort === 'capacity') orderBy.push({ maxGuests: 'desc' });

  const totalVenues = await prisma.venue.count({ where });
  const venues = await prisma.venue.findMany({
    where,
    orderBy,
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });

  const cityCounts = await prisma.venue.groupBy({
    by: ["city"],
    where: { isPublished: true },
    _count: { city: true },
  });
  const cityCountMap = Object.fromEntries(
    cityCounts.map((c) => [c.city, c._count.city])
  );

  const hasFilters = q || types.length > 0 || styles.length > 0 || minPrice || maxPrice || minGuests || maxGuests;
  const totalPages = Math.ceil(totalVenues / PAGE_SIZE);

  const sidebarContent = (
    <div className="space-y-5">
      <FilterSection title="City">
        {CITIES.map((c) => (
          <FilterCheckbox
            key={c}
            name="city"
            value={c}
            label={c}
            count={cityCountMap[c]}
            checked={toArray(params.q).includes(c)} // Simplified check
            currentParams={params}
          />
        ))}
      </FilterSection>

      <FilterSection title="Venue Type">
        {VENUE_TYPES.map((t) => (
          <FilterCheckbox
            key={t}
            name="type"
            value={t}
            label={t}
            checked={types.includes(t)}
            currentParams={params}
          />
        ))}
      </FilterSection>

      <FilterSection title="Style">
        <div className="flex flex-wrap gap-1">
          {STYLES.map((s) => (
            <StylePill
              key={s}
              style={s}
              active={styles.includes(s)}
              currentParams={params}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Guest Capacity">
        <form method="get" action="/venues" className="space-y-2">
          {Object.entries(params).map(([key, value]) =>
            toArray(value).map(v => <input key={`${key}-${v}`} type="hidden" name={key} value={v} />)
          )}
          <div className="flex gap-2">
            <input type="number" name="minGuests" defaultValue={minGuests} placeholder="Min" className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-pink-400" step="10" />
            <input type="number" name="maxGuests" defaultValue={maxGuests} placeholder="Max" className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-pink-400" step="10" />
          </div>
          <button type="submit" className="w-full bg-pink-700 text-white text-sm py-1.5 rounded-lg hover:bg-pink-800 transition-colors">
            Apply
          </button>
        </form>
      </FilterSection>

      <FilterSection title="Price Range">
        <form method="get" action="/venues" className="space-y-2">
           {Object.entries(params).map(([key, value]) =>
            toArray(value).map(v => <input key={`${key}-${v}`} type="hidden" name={key} value={v} />)
          )}
          <div className="flex gap-2">
            <input type="number" name="minPrice" defaultValue={minPrice} placeholder="Min $" className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-pink-400" step="1000" />
            <input type="number" name="maxPrice" defaultValue={maxPrice} placeholder="Max $" className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-pink-400" step="1000" />
          </div>
          <button type="submit" className="w-full bg-pink-700 text-white text-sm py-1.5 rounded-lg hover:bg-pink-800 transition-colors">
            Apply
          </button>
        </form>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <Nav q={q} />
      <MobileFilters>{sidebarContent}</MobileFilters>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-600 text-sm">
            Showing <span className="font-semibold text-gray-800">{Math.min(PAGE_SIZE, venues.length)}</span> of <span className="font-semibold text-gray-800">{totalVenues}</span> venues
          </p>
          <div className="flex items-center gap-4">
             {hasFilters && (
                <Link href="/venues" className="text-sm text-pink-600 hover:underline">
                  Clear all filters
                </Link>
              )}
              <SortSelect current={sort} />
           </div>
        </div>

        <div className="flex gap-6 items-start">
          <aside className="hidden lg:block w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-4">Filters</h3>
            {sidebarContent}
          </aside>

          <div className="flex-1 min-w-0 space-y-4">
            {venues.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg mb-2">No venues found</p>
                <Link href="/venues" className="text-pink-600 hover:underline text-sm">
                  Clear filters
                </Link>
              </div>
            ) : (
              venues.map((venue) => <VenueCard key={venue.id} venue={venue} />)
            )}
            {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} currentParams={params} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
      {children}
    </div>
  );
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
    params.set('page', page.toString());
    return `/venues?${params.toString()}`
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link href={createPageUrl(currentPage - 1)} className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100">Previous</Link>
      )}
      {pages.map(p => (
        <Link 
          key={p} 
          href={createPageUrl(p)} 
          className={`px-3 py-1 text-sm border rounded-lg ${p === currentPage ? 'bg-pink-700 text-white' : 'hover:bg-gray-100'}`}>
            {p}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link href={createPageUrl(currentPage + 1)} className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100">Next</Link>
      )}
    </div>
  )
}
