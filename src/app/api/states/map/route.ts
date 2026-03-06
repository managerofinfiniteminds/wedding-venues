import { NextResponse } from "next/server";
import { getLiveStates } from "@/lib/states";
import { prisma } from "@/lib/prisma";

// Approximate centroids for all 50 states
const STATE_CENTROIDS: Record<string, [number, number]> = {
  "alabama": [32.8, -86.8], "alaska": [64.2, -153.4], "arizona": [34.3, -111.1],
  "arkansas": [34.8, -92.2], "california": [36.8, -119.4], "colorado": [39.0, -105.5],
  "connecticut": [41.6, -72.7], "delaware": [39.0, -75.5], "florida": [27.8, -81.7],
  "georgia": [32.7, -83.4], "hawaii": [20.8, -156.3], "idaho": [44.4, -114.5],
  "illinois": [40.0, -89.2], "indiana": [39.9, -86.3], "iowa": [42.1, -93.5],
  "kansas": [38.5, -98.4], "kentucky": [37.5, -85.3], "louisiana": [31.1, -91.8],
  "maine": [45.4, -69.0], "maryland": [39.1, -76.8], "massachusetts": [42.2, -71.5],
  "michigan": [44.3, -85.4], "minnesota": [46.4, -93.1], "mississippi": [32.7, -89.7],
  "missouri": [38.5, -92.5], "montana": [47.0, -110.5], "nebraska": [41.5, -99.8],
  "nevada": [39.3, -116.6], "new-hampshire": [43.7, -71.6], "new-jersey": [40.1, -74.5],
  "new-mexico": [34.5, -106.0], "new-york": [42.9, -75.6], "north-carolina": [35.5, -79.4],
  "north-dakota": [47.5, -100.5], "ohio": [40.4, -82.8], "oklahoma": [35.6, -97.5],
  "oregon": [44.1, -120.5], "pennsylvania": [40.9, -77.8], "rhode-island": [41.7, -71.5],
  "south-carolina": [33.9, -80.9], "south-dakota": [44.4, -100.2], "tennessee": [35.9, -86.4],
  "texas": [31.5, -99.3], "utah": [39.5, -111.1], "vermont": [44.0, -72.7],
  "virginia": [37.8, -78.2], "washington": [47.4, -120.6], "west-virginia": [38.6, -80.6],
  "wisconsin": [44.3, -89.8], "wyoming": [43.0, -107.6],
};

export async function GET() {
  const liveStates = getLiveStates();

  const counts = await prisma.venue.groupBy({
    by: ["stateSlug"],
    where: { isPublished: true },
    _count: { id: true },
  });
  const countMap = new Map(counts.map((c) => [c.stateSlug, c._count.id]));

  const result = liveStates
    .map((s) => {
      const centroid = STATE_CENTROIDS[s.slug];
      if (!centroid) return null;
      return {
        slug: s.slug,
        name: s.name,
        abbr: s.abbr,
        count: countMap.get(s.slug) ?? 0,
        lat: centroid[0],
        lng: centroid[1],
      };
    })
    .filter(Boolean);

  return NextResponse.json(result);
}
