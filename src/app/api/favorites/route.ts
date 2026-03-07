import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids");
  if (!ids) {
    return NextResponse.json({ error: "ids param required" }, { status: 400 });
  }

  const idList = ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 50);

  const venues = await prisma.venue.findMany({
    where: { id: { in: idList }, isPublished: true },
    select: {
      id: true,
      name: true,
      slug: true,
      stateSlug: true,
      city: true,
      state: true,
      street: true,
      zip: true,
      venueType: true,
      styleTags: true,
      primaryPhotoUrl: true,
      googleRating: true,
      googleReviews: true,
      description: true,
      baseRentalMin: true,
      priceTier: true,
      maxGuests: true,
      minGuests: true,
      phone: true,
      website: true,
      isFeatured: true,
    },
  });

  return NextResponse.json(venues);
}
