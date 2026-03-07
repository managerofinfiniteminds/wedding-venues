import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMagicLink } from "@/lib/emails";
import { randomUUID } from "crypto";

const SITE_URL = process.env.SITE_URL ?? "https://greenbowtie.com";

export async function POST(req: NextRequest) {
  try {
    const { venueSlug, email } = await req.json();

    if (!venueSlug || !email) {
      return NextResponse.json({ error: "Missing venueSlug or email" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const venue = await prisma.venue.findUnique({
      where: { slug: venueSlug },
      select: { id: true, name: true, slug: true },
    });
    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    // Expire any previous unused tokens for this venue+email
    await prisma.claimToken.updateMany({
      where: { venueId: venue.id, email: email.toLowerCase(), usedAt: null },
      data: { expiresAt: new Date() },
    });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.claimToken.create({
      data: {
        venueId: venue.id,
        email: email.toLowerCase().trim(),
        token,
        expiresAt,
      },
    });

    const magicLink = `${SITE_URL}/auth/verify?token=${token}`;

    await sendMagicLink({
      toEmail: email,
      venueName: venue.name,
      magicLink,
    }).catch((e) => console.error("[claim] magic link email failed:", e));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[claim] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
