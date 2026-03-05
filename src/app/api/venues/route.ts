import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getState } from "@/lib/states";

const PAGE_SIZE = 24;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const state = sp.get("state") ?? undefined;       // stateSlug filter — required to prevent cross-state leak
  const cities = sp.getAll("city");
  const regions = sp.getAll("region");
  const types = sp.getAll("type");
  const styles = sp.getAll("style");
  const sort = sp.get("sort") ?? "rating";
  const offset = parseInt(sp.get("offset") ?? "0");

  // Expand region names → city lists (same logic as state page SSR)
  let effectiveCities = [...cities];
  if (state && regions.length > 0) {
    const stateConfig = getState(state);
    if (stateConfig) {
      const regionCities = regions.flatMap((r) => stateConfig.regions[r] ?? []);
      effectiveCities = [...cities, ...regionCities.filter((c) => !cities.includes(c))];
    }
  }

  const where: Prisma.VenueWhereInput = {
    isPublished: true,
    // Always scope to the requested state to prevent cross-state data leaks
    ...(state && { stateSlug: state }),
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
  if (sort === "rating") orderBy.push({ googleRating: { sort: "desc", nulls: "last" } }, { googleReviews: { sort: "desc", nulls: "last" } });
  if (sort === "price_asc") orderBy.push({ baseRentalMin: { sort: "asc", nulls: "last" } });
  if (sort === "price_desc") orderBy.push({ baseRentalMin: { sort: "desc", nulls: "last" } });
  if (sort === "capacity") orderBy.push({ maxGuests: { sort: "desc", nulls: "last" } });
  // Stable tiebreaker — prevents duplicates across pages when sort values are equal
  orderBy.push({ id: "asc" });

  const [venues, total] = await Promise.all([
    prisma.venue.findMany({ where, orderBy, take: PAGE_SIZE, skip: offset }),
    prisma.venue.count({ where }),
  ]);

  return NextResponse.json({ venues, total, hasMore: offset + venues.length < total });
}
