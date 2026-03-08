import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCoupleConfirmation, sendVenueNotification } from "@/lib/emails";
import { subscribeCouple } from "@/lib/klaviyo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      venueId, coupleName, partnerName, coupleEmail, couplePhone,
      weddingDate, weddingDateFlexible, guestCount, budgetMin, budgetMax,
      message, preferredContact, source,
    } = body;

    // Validate required fields
    if (!venueId || !coupleName || !coupleEmail || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coupleEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Load venue
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      select: { id: true, name: true, slug: true, stateSlug: true, email: true },
    });
    if (!venue || !venue.stateSlug) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        venueId,
        coupleName: coupleName.trim(),
        partnerName: partnerName?.trim() || null,
        coupleEmail: coupleEmail.toLowerCase().trim(),
        couplePhone: couplePhone?.trim() || null,
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        weddingDateFlexible: weddingDateFlexible ?? false,
        guestCount: guestCount ? parseInt(guestCount) : null,
        budgetMin: budgetMin ? parseInt(budgetMin) : null,
        budgetMax: budgetMax ? parseInt(budgetMax) : null,
        message: message.trim(),
        preferredContact: preferredContact ?? "email",
        source: source ?? "direct",
        venueNotified: !!venue.email,
        coupleConfirmed: true,
      },
    });

    // Send emails (non-blocking — don't fail the request if email fails)
    const emailPromises = [
      sendCoupleConfirmation({
        toEmail: coupleEmail,
        coupleName,
        venueName: venue.name,
        venueSlug: venue.slug,
        venueState: venue.stateSlug,
        weddingDate: weddingDate ? new Date(weddingDate) : null,
        guestCount,
        budgetMin,
        budgetMax,
      }).catch((e) => console.error("[inquiry] couple email failed:", e)),
    ];

    const venueNotificationsEnabled = process.env.VENUE_NOTIFICATIONS_ENABLED === "true";
    if (venue.email && venueNotificationsEnabled) {
      emailPromises.push(
        sendVenueNotification({
          venueEmail: venue.email,
          venueName: venue.name,
          venueSlug: venue.slug,
          venueState: venue.stateSlug,
          coupleName,
          partnerName,
          coupleEmail,
          couplePhone,
          weddingDate: weddingDate ? new Date(weddingDate) : null,
          weddingDateFlexible,
          guestCount,
          budgetMin,
          budgetMax,
          message,
          preferredContact,
          inquiryId: inquiry.id,
        }).catch((e) => console.error("[inquiry] venue email failed:", e))
      );
    } else if (venue.email && !venueNotificationsEnabled) {
      console.log("[inquiry] VENUE_NOTIFICATIONS_ENABLED=false — skipping venue notification for", venue.slug);
    }

    // Auto-subscribe couple to Klaviyo list (fire and forget)
    subscribeCouple({
      email: coupleEmail,
      firstName: coupleName.split(" ")[0],
      lastName: coupleName.split(" ").slice(1).join(" ") || undefined,
      weddingDate: weddingDate ?? undefined,
      city: venue ? undefined : undefined, // venue city not in scope here
    }).catch((e) => console.error("[inquiry] klaviyo subscribe failed:", e));

    // Fire and forget
    Promise.all(emailPromises);

    return NextResponse.json({ success: true, inquiryId: inquiry.id });
  } catch (error) {
    console.error("[inquiry] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
