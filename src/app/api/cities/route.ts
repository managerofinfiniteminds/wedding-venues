import { prisma } from "@/lib/prisma";
import { getState } from "@/lib/states";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const results = await prisma.venue.groupBy({
    by: ["city", "stateSlug"],
    _count: { city: true },
    where: {
      isPublished: true,
      city: { contains: q, mode: "insensitive" },
    },
    orderBy: { _count: { city: "desc" } },
    take: 10,
  });

  return NextResponse.json(
    results.map((r) => ({
      city: r.city,
      stateSlug: r.stateSlug,
      stateAbbr: getState(r.stateSlug ?? "")?.abbr ?? r.stateSlug?.toUpperCase().slice(0, 2) ?? "",
      count: r._count.city,
    }))
  );
}
