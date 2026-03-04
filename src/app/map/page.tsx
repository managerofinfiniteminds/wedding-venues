import { prisma } from "@/lib/prisma";
import { VenueMapLoader } from "@/components/VenueMapLoader";

export const metadata = {
  title: "Venue Map",
  description: "Explore California wedding venues on an interactive map.",
};

async function getMapVenues() {
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
    },
  });
  return venues;
}

export default async function MapPage() {
  const venues = await getMapVenues();

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <VenueMapLoader venues={venues} />
    </div>
  );
}
