import { prisma } from "@/lib/prisma";
import { getLiveStates } from "@/lib/states";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const liveStates = getLiveStates();

  const venueUrls = (
    await Promise.all(
      liveStates.map(async (state) => {
        const venues = await prisma.venue.findMany({
          where: { isPublished: true, stateSlug: state.slug },
          select: { slug: true, updatedAt: true },
        });
        return venues.map((v) => ({
          url: `https://greenbowtie.com/venues/${state.slug}/${v.slug}`,
          lastModified: v.updatedAt,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        }));
      })
    )
  ).flat();

  return [
    { url: "https://greenbowtie.com", lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: "https://greenbowtie.com/venues", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    ...liveStates.map((s) => ({
      url: `https://greenbowtie.com/venues/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    { url: "https://greenbowtie.com/map", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...venueUrls,
  ];
}
