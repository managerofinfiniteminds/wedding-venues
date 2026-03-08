import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_ACTIONS = ["publish", "unpublish", "hide", "unhide", "delete", "restore"] as const;
type Action = typeof VALID_ACTIONS[number];

export async function POST(req: NextRequest) {
  try {
    let venueId: string;
    let action: Action;

    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      venueId = body.venueId;
      action = body.action;
    } else {
      // Form submission
      const formData = await req.formData();
      venueId = formData.get("venueId") as string;
      action = formData.get("action") as Action;
    }

    if (!venueId || !action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Verify venue exists
    const venue = await prisma.venue.findUnique({ where: { id: venueId }, select: { id: true, name: true } });
    if (!venue) return NextResponse.json({ error: "Venue not found" }, { status: 404 });

    let update: Record<string, unknown> = {};
    switch (action) {
      case "publish":
        update = { isPublished: true, isHidden: false };
        break;
      case "unpublish":
        update = { isPublished: false };
        break;
      case "hide":
        update = { isHidden: true, isPublished: false };
        break;
      case "unhide":
        update = { isHidden: false };
        break;
      case "delete":
        // Soft delete — sets deletedAt, hides from all public views
        update = { deletedAt: new Date(), isPublished: false, isHidden: true };
        break;
      case "restore":
        // Reverse soft delete — restores to unpublished hidden state
        update = { deletedAt: null, isHidden: false, isPublished: false };
        break;
    }

    await prisma.venue.update({ where: { id: venueId }, data: update });

    // For form submissions, redirect back to audit page
    if (!contentType.includes("application/json")) {
      const referer = req.headers.get("referer") ?? "/admin/audit";
      return NextResponse.redirect(referer, 303);
    }

    return NextResponse.json({ success: true, action, venueId });
  } catch (err) {
    console.error("[venue-action] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
