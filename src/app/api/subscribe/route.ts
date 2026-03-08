import { NextRequest, NextResponse } from "next/server";
import { subscribeCouple } from "@/lib/klaviyo";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, weddingDate, city, state } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    await subscribeCouple({ email, firstName, lastName, weddingDate, city, state });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/subscribe] error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
