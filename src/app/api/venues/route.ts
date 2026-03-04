import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 24;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const cities = sp.getAll("city");
  const types = sp.getAll("type");
  const styles = sp.getAll("style");
  const sort = sp.get("sort") ?? "rating";
  const offset = parseInt(sp.get("offset") ?? "0");

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
  };

  const orderBy: Prisma.VenueOrderByWithRelationInput[] = [];
  if (sort === "rating") orderBy.push({ googleRating: { sort: "desc", nulls: "last" } }, { googleReviews: { sort: "desc", nulls: "last" } });
  if (sort === "price_asc") orderBy.push({ baseRentalMin: { sort: "asc", nulls: "last" } });
  if (sort === "price_desc") orderBy.push({ baseRentalMin: { sort: "desc", nulls: "last" } });
  if (sort === "capacity") orderBy.push({ maxGuests: { sort: "desc", nulls: "last" } });

  const [venues, total] = await Promise.all([
    prisma.venue.findMany({ where, orderBy, take: PAGE_SIZE, skip: offset }),
    prisma.venue.count({ where }),
  ]);

  return NextResponse.json({ venues, total, hasMore: offset + venues.length < total });
}
