import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const cities = await prisma.venue.groupBy({
    by: ["city"],
    _count: { city: true },
    where: {
      isPublished: true,
      city: { contains: q, mode: "insensitive" },
    },
    orderBy: { _count: { city: "desc" } },
    take: 10,
  });

  return NextResponse.json(cities.map((c: { city: string; _count: { city: number } }) => ({ city: c.city, count: c._count.city })));
}
