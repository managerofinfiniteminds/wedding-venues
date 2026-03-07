import { NotifyForm } from "@/components/NotifyForm";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { SortSelect } from "@/components/SortSelect";
import { MobileFilters } from "@/components/MobileFilters";
import { FilterPanel } from "@/components/FilterPanel";
import { VenueList } from "@/components/VenueList";
import { getState } from "@/lib/states";
import { PinIcon } from "@/components/Nav";
import {
  AMENITIES,
  PRICE_TIERS,
  STYLES,
  PAGE_SIZE,
  toArray,
  buildFilterUrl,
  buildCustomUrl,
  formatBudgetLabel,
  formatGuestLabel,
  VenueSearchParams,
} from "@/lib/venueFilters";
import { redirect } from "next/navigation";
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
  const effectiveCities = [...cities, ...regionCities.filter((c) => !cities.includes(c))];
  const types = toArray(params.type);
  const styles = toArray(params.style);
  const amenities = toArray(params.amenities);
  const priceTier = params.priceTier;
  const sort = params.sort ?? "rating";
  const page = params.page ? parseInt(params.page) : 1;

  const budgetMin = params.budgetMin ? parseInt(params.budgetMin) : undefined;
  const budgetMax = params.budgetMax ? parseInt(params.budgetMax) : undefined;
  const guestMin = params.guestMin ? parseInt(params.guestMin) : undefined;
  const guestMax = params.guestMax ? parseInt(params.guestMax) : undefined;

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
    ...(priceTier && { priceTier }),
    ...((budgetMin !== undefined || budgetMax !== undefined) && {
      baseRentalMin: {
        ...(budgetMin !== undefined && { gte: budgetMin }),
        ...(budgetMax !== undefined && { lte: budgetMax }),
      },
    }),
    ...((guestMin !== undefined || guestMax !== undefined) && {
      maxGuests: {
        ...(guestMin !== undefined && { gte: guestMin }),
        ...(guestMax !== undefined && { lte: guestMax }),
      },
    }),
    ...(amenities.includes("hasBridalSuite") && { hasBridalSuite: true }),
    ...(amenities.includes("hasOutdoorSpace") && { hasOutdoorSpace: true }),
    ...(amenities.includes("hasIndoorSpace") && { hasIndoorSpace: true }),
    ...(amenities.includes("barSetup") && { barSetup: true }),
    ...(amenities.includes("onSiteCoordinator") && { onSiteCoordinator: true }),
    ...(amenities.includes("cateringKitchen") && { cateringKitchen: true }),
    ...(amenities.includes("tablesChairsIncluded") && { tablesChairsIncluded: true }),
    ...(amenities.includes("adaCompliant") && { adaCompliant: true }),
  };

  const orderBy: Prisma.VenueOrderByWithRelationInput[] = [];
  if (sort === "rating") orderBy.push({ googleRating: { sort: "desc", nulls: "last" } }, { googleReviews: { sort: "desc", nulls: "last" } });
  if (sort === "price_asc") orderBy.push({ baseRentalMin: { sort: "asc", nulls: "last" } });
  if (sort === "price_desc") orderBy.push({ baseRentalMin: { sort: "desc", nulls: "last" } });
  if (sort === "capacity") orderBy.push({ maxGuests: { sort: "desc", nulls: "last" } });
  orderBy.push({ id: "asc" });

  const totalVenues = await prisma.venue.count({ where });
  const venues = await prisma.venue.findMany({
    where,
    orderBy,
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  });

  // Top 20 cities by venue count
  const cityCounts = await prisma.venue.groupBy({
    by: ["city"],
    _count: { city: true },
    where: { isPublished: true, stateSlug: state },
    orderBy: { _count: { city: "desc" } },
    take: 20,
  });
  // Region counts
  const allCityCounts = await prisma.venue.groupBy({
    by: ["city"],
    _count: { city: true },
    where: { isPublished: true, stateSlug: state },
  });
  const allCityCountMap = Object.fromEntries(allCityCounts.map((c) => [c.city, c._count.city]));
  const regionCountMap = Object.fromEntries(
    Object.entries(stateConfig.regions).map(([region, rCities]) => [
      region,
      rCities.reduce((sum, city) => sum + (allCityCountMap[city] ?? 0), 0),
    ]),
  );

  const typeCounts = await prisma.venue.groupBy({
    by: ["venueType"],
    _count: { venueType: true },
    where: { isPublished: true, stateSlug: state },
  });
  const typeCountMap = Object.fromEntries(typeCounts.map((t) => [t.venueType, t._count.venueType]));

  const hasFilters = !!(
    q ||
    cities.length > 0 ||
    regions.length > 0 ||
    types.length > 0 ||
    styles.length > 0 ||
    amenities.length > 0 ||
    priceTier ||
    params.budgetMin ||
    params.budgetMax ||
    params.guestMin ||
    params.guestMax
  );

  const activeFilterCount =
    (q ? 1 : 0) +
    cities.length +
    regions.length +
    types.length +
    styles.length +
    amenities.length +
    (priceTier ? 1 : 0) +
    (params.budgetMin || params.budgetMax ? 1 : 0) +
    (params.guestMin || params.guestMax ? 1 : 0);

  const totalPages = Math.ceil(totalVenues / PAGE_SIZE);
  const basePath = `/venues/${state}`;

  const filterPanel = (
    <FilterPanel
      basePath={basePath}
      params={params}
      stateConfig={stateConfig}
      regionCountMap={regionCountMap}
      typeCountMap={typeCountMap}
      hasFilters={hasFilters}
    />
  );

  const budgetLabel = formatBudgetLabel(params.budgetMin, params.budgetMax);
  const guestLabel = formatGuestLabel(params.guestMin, params.guestMax);

  return (
    <>
      <div className="min-h-screen bg-[#f8f7f5]">
        <MobileFilters filterCount={activeFilterCount}>{filterPanel}</MobileFilters>

        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <p className="text-gray-600 text-sm">
              <span className="font-semibold text-gray-800">{totalVenues.toLocaleString()}</span> venue
              {totalVenues !== 1 ? "s" : ""} found in {stateConfig.name}
            </p>
            <div className="flex items-center gap-3">
              {/* List / Map toggle */}
              <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b6341] text-white">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </span>
                <Link
                  href="/map"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 hover:bg-green-50 hover:text-[#3b6341] transition-colors"
                >
                  <PinIcon className="w-4 h-4" />
                  Map
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-gray-600 hidden sm:block">
                  Sort:
                </label>
                <SortSelect current={sort} />
              </div>
            </div>
          </div>

          {/* Style pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4">
            <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">Style:</span>
            {STYLES.map((s) => (
              <Link
                key={s}
                href={buildFilterUrl(basePath, params, "style", s)}
                className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                  styles.includes(s)
                    ? "bg-pink-700 text-white border-pink-700"
                    : "bg-white text-gray-600 border-gray-300 hover:border-pink-400"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-gray-500 font-medium">Active:</span>

              {q &&
                (() => {
                  const p = new URLSearchParams();
                  [...cities].forEach((c) => p.append("city", c));
                  [...regions].forEach((r) => p.append("region", r));
                  [...types].forEach((t) => p.append("type", t));
                  [...styles].forEach((s) => p.append("style", s));
                  [...amenities].forEach((a) => p.append("amenities", a));
                  if (priceTier) p.set("priceTier", priceTier);
                  if (params.budgetMin) p.set("budgetMin", params.budgetMin);
                  if (params.budgetMax) p.set("budgetMax", params.budgetMax);
                  if (params.guestMin) p.set("guestMin", params.guestMin);
                  if (params.guestMax) p.set("guestMax", params.guestMax);
                  if (sort !== "rating") p.set("sort", sort);
                  return (
                    <Link
                      href={`${basePath}?${p.toString()}`}
                      className="inline-flex items-center gap-1.5 text-xs bg-pink-50 text-pink-700 border border-pink-200 px-2.5 py-1 rounded-full hover:bg-pink-100 transition-colors"
                    >
                      🔍 &ldquo;{q}&rdquo; <span className="font-bold">×</span>
                    </Link>
                  );
                })()}

              {cities.map((c) => (
                <Link
                  key={c}
                  href={buildFilterUrl(basePath, params, "city", c)}
                  className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors"
                >
                  📍 {c} <span className="font-bold">×</span>
                </Link>
              ))}

              {regions.map((r) => (
                <Link
                  key={r}
                  href={buildFilterUrl(basePath, params, "region", r)}
                  className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full hover:bg-green-100 transition-colors"
                >
                  🗺️ {r} <span className="font-bold">×</span>
                </Link>
              ))}

              {types.map((t) => (
                <Link
                  key={t}
                  href={buildFilterUrl(basePath, params, "type", t)}
                  className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full hover:bg-purple-100 transition-colors"
                >
                  🏛️ {t} <span className="font-bold">×</span>
                </Link>
              ))}

              {styles.map((s) => (
                <Link
                  key={s}
                  href={buildFilterUrl(basePath, params, "style", s)}
                  className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full hover:bg-amber-100 transition-colors"
                >
                  ✨ {s} <span className="font-bold">×</span>
                </Link>
              ))}

              {priceTier && (
                <Link
                  href={buildCustomUrl(basePath, params, { priceTier: undefined })}
                  className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors"
                >
                  {PRICE_TIERS.find((t) => t.value === priceTier)?.icon ?? "💰"}{" "}
                  {priceTier.charAt(0).toUpperCase() + priceTier.slice(1)}{" "}
                  <span className="font-bold">×</span>
                </Link>
              )}

              {budgetLabel && (
                <Link
                  href={buildCustomUrl(basePath, params, { budgetMin: undefined, budgetMax: undefined })}
                  className="inline-flex items-center gap-1.5 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full hover:bg-teal-100 transition-colors"
                >
                  💵 {budgetLabel} <span className="font-bold">×</span>
                </Link>
              )}

              {guestLabel && (
                <Link
                  href={buildCustomUrl(basePath, params, { guestMin: undefined, guestMax: undefined })}
                  className="inline-flex items-center gap-1.5 text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-full hover:bg-sky-100 transition-colors"
                >
                  👥 {guestLabel} <span className="font-bold">×</span>
                </Link>
              )}

              {amenities.map((key) => {
                const amenity = AMENITIES.find((a) => a.key === key);
                return (
                  <Link
                    key={key}
                    href={buildFilterUrl(basePath, params, "amenities", key)}
                    className="inline-flex items-center gap-1.5 text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full hover:bg-violet-100 transition-colors"
                  >
                    ✓ {amenity?.label ?? key} <span className="font-bold">×</span>
                  </Link>
                );
              })}

              <Link href={basePath} className="text-xs text-gray-400 hover:text-pink-600 underline ml-1">
                Clear all
              </Link>
            </div>
          )}

          <div className="flex gap-8 items-start">
            <aside className="hidden lg:block w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              {filterPanel}
            </aside>

            <main className="flex-1 min-w-0">
              {venues.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100">
                  <p className="text-lg mb-2 font-semibold">No venues found</p>
                  <p className="text-sm mb-4">Try adjusting your filters or clearing them to see all results.</p>
                  {hasFilters && (
                    <Link href={basePath} className="text-pink-600 hover:underline text-sm font-medium">
                      Clear all filters
                    </Link>
                  )}
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

function ComingSoonPage({ state }: { state: { name: string; description: string } }) {
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
