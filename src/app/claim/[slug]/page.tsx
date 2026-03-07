import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ClaimForm } from "./ClaimForm";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const venue = await prisma.venue.findUnique({ where: { slug }, select: { name: true } });
  return { title: venue ? `Claim ${venue.name} — Green Bowtie` : "Claim Listing — Green Bowtie" };
}

export default async function ClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = await prisma.venue.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, city: true, stateSlug: true, primaryPhotoUrl: true, _count: { select: { inquiries: true } } },
  });

  if (!venue) notFound();

  const inquiryCount = venue._count.inquiries;

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="max-w-screen-xl mx-auto px-4 pt-6">
        <Link href={`/venues/${venue.stateSlug}/${venue.slug}`} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to listing
        </Link>
      </div>

      <div className="max-w-lg mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🌿 Green Bowtie for Venues
          </div>
          <h1 className="playfair text-3xl font-bold text-gray-800 mb-3">
            Claim {venue.name}
          </h1>
          <p className="text-gray-500 text-base">
            {venue.city} · Free to claim · No credit card required
          </p>
        </div>

        {/* Inquiry count teaser */}
        {inquiryCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-center">
            <span className="text-3xl font-bold text-amber-700">{inquiryCount}</span>
            <p className="text-amber-800 text-sm font-medium mt-1">
              {inquiryCount === 1 ? "couple has" : "couples have"} already inquired about {venue.name} on Green Bowtie.
            </p>
            <p className="text-amber-600 text-xs mt-1">Claim your listing to respond to them.</p>
          </div>
        )}

        {/* Benefits */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">What you get</h2>
          <ul className="space-y-3">
            {[
              ["📬", "Receive couple inquiries instantly", "Couples who find you on Green Bowtie can contact you directly"],
              ["✏️", "Update your listing", "Keep pricing, photos, and amenities current"],
              ["✅", "Verified badge", "Show couples your listing is managed by the real venue"],
              ["📊", "Inquiry dashboard", "Track all inquiries, dates, budgets in one place"],
              ["⭐", "Featured placement (optional)", "Appear at the top of search results for $49/mo"],
            ].map(([icon, title, desc]) => (
              <li key={title as string} className="flex gap-3">
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title as string}</p>
                  <p className="text-xs text-gray-400">{desc as string}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Claim form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="playfair text-lg font-semibold text-gray-800 mb-1">Get started</h2>
          <p className="text-gray-400 text-xs mb-5">Enter your work email to receive a sign-in link.</p>
          <ClaimForm venueSlug={venue.slug} />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By claiming this listing you confirm you are authorized to represent {venue.name}.
        </p>
      </div>
    </div>
  );
}
