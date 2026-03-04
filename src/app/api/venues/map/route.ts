
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // TODO: Add filtering based on searchParams

  const venues = await prisma.venue.findMany({
    where: {
      isPublished: true,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      venueType: true,
      googleRating: true,
      primaryPhotoUrl: true,
      latitude: true,
      longitude: true,
      phone: true,
      website: true,
    }
  });

  return NextResponse.json(venues);
}
