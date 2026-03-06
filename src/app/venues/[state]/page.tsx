import { NotifyForm } from "@/components/NotifyForm";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { SortSelect } from "@/components/SortSelect";
import { MobileFilters } from "@/components/MobileFilters";
import { VenueList } from "@/components/VenueList";
import { getState } from "@/lib/states";
import { PinIcon } from "@/components/Nav";
import { VENUE_TYPES, STYLES, PAGE_SIZE, toArray, buildFilterUrl, VenueSearchParams } from "@/lib/venueFilters";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
    const { state } = await params;
    const stateConfig = getState(state);
    if (!stateConfig) {
        return { title: "Wedding Venues | Green Bowtie" };
    }
    if (!stateConfig.live) {
        return {
            title: `${stateConfig.name} Wedding Venues — Coming Soon | Green Bowtie`,
        };
    }
    return {
        title: `Wedding Venues in ${stateConfig.name}`,
        description: `Browse ${stateConfig.name} wedding venues on Green Bowtie. ${stateConfig.description}`,
    };
}

export default async function StateVenuesPage({
  params: rawParams,
  searchParams,
}: {
  params: Promise<{ state: string }>;
  searchParams: Promise<VenueSearchParams>;
}) {
  const { state } = await rawParams;
  const stateConfig = getState(state);
  if (!stateConfig) {
    // Legacy URL: /venues/[slug] — treat as a CA venue slug and redirect
    redirect(`/venues/california/${state}`);
  }

  if (!stateConfig.live) {
    return <ComingSoonPage state={stateConfig} />;
  }

  const params = await searchParams;
  const q = params.q;
  const cities = toArray(params.city);
  const regions = toArray(params.region);
  const regionCities = regions.flatMap((r) => stateConfig.regions[r] ?? []);
  // Merge city search + region filter — both apply simultaneously
  const effectiveCities = [
    ...cities,
    ...regionCities.filter(c => !cities.includes(c)),
  ];
  const types = toArray(params.type);
  const styles = toArray(params.style);
  const sort = params.sort ?? 'rating';
  const page = params.page ? parseInt(params.page) : 1;

  const where: Prisma.VenueWhereInput = {
    isPublished: true,
    stateSlug: state,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(effectiveCities.length > 0 && { city: { in: effectiveCities } }),
    ...(types.length > 0 && { venueType: { in: types } }),
    ...(styles.length > 0 && { styleTags: { hasSome: styles } }),
  };

  const orderBy: Prisma.VenueOrderByWithRelationInput[] = [];
  if (sort === 'rating') orderBy.push({ googleRating: { sort: 'desc', nulls: 'last' } }, { googleReviews: { sort: 'desc', nulls: 'last' } });
  if (sort === 'price_asc') orderBy.push({ baseRentalMin: { sort: 'asc', nulls: 'last' } });
  if (sort === 'price_desc') orderBy.push({ baseRentalMin: { sort: 'desc', nulls: 'last' } });
  if (sort === 'capacity') orderBy.push({ maxGuests: { sort: 'desc', nulls: 'last' } });
  // Stable tiebreaker — prevents duplicates across pages when sort values are equal
  orderBy.push({ id: 'asc' });

  const totalVenues = await prisma.venue.count({ where });
  const grandTotal = await prisma.venue.count({ where: { isPublished: true, stateSlug: state } });
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
    where: { isPublished: true, stateSlug: state },
    orderBy: { _count: { city: "desc" } },
    take: 20,
  });
  const CITIES = cityCounts.map((c) => c.city).filter(Boolean);
  const cityCountMap = Object.fromEntries(cityCounts.map((c) => [c.city, c._count.city]));

  // Compute region counts by summing city counts across all venues
  const allCityCounts = await prisma.venue.groupBy({
    by: ["city"],
    _count: { city: true },
    where: { isPublished: true, stateSlug: state },
  });
  const allCityCountMap = Object.fromEntries(allCityCounts.map((c) => [c.city, c._count.city]));
  const regionCountMap = Object.fromEntries(
    Object.entries(stateConfig.regions).map(([region, cities]) => [
      region,
      cities.reduce((sum, city) => sum + (allCityCountMap[city] ?? 0), 0),
    ])
  );

  const typeCounts = await prisma.venue.groupBy({
    by: ['venueType'],
    _count: { venueType: true },
    where: { isPublished: true, stateSlug: state, venueType: { in: VENUE_TYPES } }
  });
  const typeCountMap = Object.fromEntries(typeCounts.map(t => [t.venueType, t._count.venueType]));

  const hasFilters = q || cities.length > 0 || regions.length > 0 || types.length > 0 || styles.length > 0;
  const totalPages = Math.ceil(totalVenues / PAGE_SIZE);
  const basePath = `/venues/${state}`;

  const sidebarContent = (
    <div>
        <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-800">Filter {stateConfig.name} Venues</h3>
            {hasFilters && <Link href={basePath} className="text-xs text-pink-600 hover:underline">Clear all</Link>}
        </div>
        <div className="space-y-4">
            <FilterSection title="Region">
                {Object.keys(stateConfig.regions).map((r) => (
                <FilterCheckbox
                    key={r}
                    label={r}
                    count={regionCountMap[r]}
                    checked={regions.includes(r)}
                    href={buildFilterUrl(basePath, params, 'region', r)}
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
                    href={buildFilterUrl(basePath, params, 'type', t)}
                />
                ))}
            </FilterSection>
        </div>
    </div>
  );

  return (
    <>
    <div className="min-h-screen bg-[#f8f7f5]">
      <MobileFilters>{sidebarContent}</MobileFilters>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <p className="text-gray-600 text-sm">
            Showing <span className="font-semibold text-gray-800">{venues.length}</span> of <span className="font-semibold text-gray-800">{totalVenues.toLocaleString()}</span> venues in {stateConfig.name}
          </p>
          <div className="flex items-center gap-3">
            {/* List / Map toggle */}
            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b6341] text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </span>

            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-gray-600 hidden sm:block">Sort:</label>
              <SortSelect current={sort} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4">
            <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">Style:</span>
            {STYLES.map(s => (
                <Link key={s} href={buildFilterUrl(basePath, params, "style", s)}
                className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                    styles.includes(s) 
                    ? "bg-pink-700 text-white border-pink-700" 
                    : "bg-white text-gray-600 border-gray-300 hover:border-pink-400"
                }`}>
                {s}
                </Link>
            ))}
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-gray-500 font-medium">Active:</span>
            {q && (() => {
              const p = new URLSearchParams();
              [...cities].forEach(c => p.append('city', c));
              [...regions].forEach(r => p.append('region', r));
              [...types].forEach(t => p.append('type', t));
              [...styles].forEach(s => p.append('style', s));
              if (sort !== 'rating') p.set('sort', sort);
              return (
                <Link href={`${basePath}?${p.toString()}`}
                  className="inline-flex items-center gap-1.5 text-xs bg-pink-50 text-pink-700 border border-pink-200 px-2.5 py-1 rounded-full hover:bg-pink-100 transition-colors">
                  🔍 "{q}" <span className="font-bold">×</span>
                </Link>
              );
            })()}
            {cities.map(c => (
              <Link key={c} href={buildFilterUrl(basePath, params, 'city', c)}
                className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors">
                📍 {c} <span className="font-bold">×</span>
              </Link>
            ))}
            {regions.map(r => (
              <Link key={r} href={buildFilterUrl(basePath, params, 'region', r)}
                className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full hover:bg-green-100 transition-colors">
                🗺️ {r} <span className="font-bold">×</span>
              </Link>
            ))}
            {types.map(t => (
              <Link key={t} href={buildFilterUrl(basePath, params, 'type', t)}
                className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full hover:bg-purple-100 transition-colors">
                🏛️ {t} <span className="font-bold">×</span>
              </Link>
            ))}
            {styles.map(s => (
              <Link key={s} href={buildFilterUrl(basePath, params, 'style', s)}
                className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full hover:bg-amber-100 transition-colors">
                ✨ {s} <span className="font-bold">×</span>
              </Link>
            ))}
            <Link href={basePath} className="text-xs text-gray-400 hover:text-pink-600 underline ml-1">Clear all</Link>
          </div>
        )}

        <div className="flex gap-8 items-start">
          <aside className="hidden lg:block w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            {sidebarContent}
          </aside>

          <main className="flex-1 min-w-0">
            {venues.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100">
                <p className="text-lg mb-2 font-semibold">No venues found</p>
                <p className="text-sm mb-4">Try adjusting your filters or clearing them to see all results.</p>
                {hasFilters && <Link href={basePath} className="text-pink-600 hover:underline text-sm font-medium">Clear all filters</Link>}
              </div>
            ) : (
                <VenueList
                    key={JSON.stringify(params)}
                    initialVenues={venues}
                    initialTotal={totalVenues}
                    searchParams={params as Record<string, string | string[]>}
                    stateSlug={state}
                />
            )}
          </main>
        </div>
      </div>
    </div>


    </>
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

function ComingSoonPage({ state }: { state: { name: string, description: string } }) {
    return (
        <div className="min-h-screen bg-[#f8f7f5] flex flex-col items-center justify-center text-center px-4">
            <div className="max-w-xl">
                <span className="inline-block bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-1 rounded-full mb-4">
                    Coming Soon
                </span>
                <h1 className="text-6xl font-bold text-gray-800 playfair mb-4">{state.name}</h1>
                <p className="text-xl text-gray-600 mb-8">{state.description}</p>
                <NotifyForm stateName={state.name} />
                <Link href="/venues/california" className="mt-12 inline-block text-gray-600 hover:text-gray-900 transition-colors">
                    &larr; Browse California Venues
                </Link>
            </div>
        </div>
    );
}

