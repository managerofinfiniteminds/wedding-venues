import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorPage message="Invalid or missing link." />;
  }

  const claim = await prisma.claimToken.findUnique({
    where: { token },
    include: { venue: { select: { id: true, name: true, slug: true } } },
  });

  if (!claim) return <ErrorPage message="This link is invalid." />;
  if (claim.usedAt) return <ErrorPage message="This link has already been used. Request a new one." />;
  if (claim.expiresAt < new Date()) return <ErrorPage message="This link has expired. Request a new one." />;

  // Mark token used
  await prisma.claimToken.update({ where: { id: claim.id }, data: { usedAt: new Date() } });

  // Create or update venue owner
  const sessionToken = randomUUID();
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.venueOwner.upsert({
    where: { email: claim.email },
    create: {
      venueId: claim.venueId,
      email: claim.email,
      verified: true,
      verifiedAt: new Date(),
      sessionToken,
      sessionExpires,
      lastLoginAt: new Date(),
    },
    update: {
      sessionToken,
      sessionExpires,
      lastLoginAt: new Date(),
      verified: true,
      verifiedAt: new Date(),
    },
  });

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set("gb_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: sessionExpires,
  });

  redirect("/dashboard");
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">🔗</div>
        <h1 className="playfair text-xl font-semibold text-gray-800 mb-2">Link Problem</h1>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <a
          href="/venues"
          className="inline-block bg-[#3b6341] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#2f5035] transition-colors"
        >
          Back to Green Bowtie
        </a>
      </div>
    </div>
  );
}
