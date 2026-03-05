import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAX_VENUES = 500;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const state = searchParams.get('state') ?? undefined;
  const boundsParam = searchParams.get('bounds'); // "swLat,swLng,neLat,neLng"

  // Parse viewport bounds if provided
  let bounds: { swLat: number; swLng: number; neLat: number; neLng: number } | null = null;
  if (boundsParam) {
    const parts = boundsParam.split(',').map(Number);
    if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
      bounds = { swLat: parts[0], swLng: parts[1], neLat: parts[2], neLng: parts[3] };
    }
  }

  const where = {
    isPublished: true,
    latitude: { not: null as null },
    longitude: { not: null as null },
    ...(state && { stateSlug: state }),
    ...(bounds && {
      latitude: { gte: bounds.swLat, lte: bounds.neLat, not: null as null },
      longitude: { gte: bounds.swLng, lte: bounds.neLng, not: null as null },
    }),
  };

  const venues = await prisma.venue.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      stateSlug: true,
      venueType: true,
      googleRating: true,
      googleReviews: true,
      primaryPhotoUrl: true,
      latitude: true,
      longitude: true,
      phone: true,
      website: true,
      street: true,
      state: true,
      zip: true,
    },
    orderBy: { googleRating: { sort: 'desc', nulls: 'last' } },
    take: MAX_VENUES,
  });

  return NextResponse.json(venues);
}
