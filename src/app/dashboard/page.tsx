import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Venue Dashboard — Green Bowtie",
  robots: { index: false, follow: false },
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  viewed: "bg-yellow-100 text-yellow-700",
  responded: "bg-green-100 text-green-700",
  booked: "bg-purple-100 text-purple-700",
  lost: "bg-gray-100 text-gray-500",
};

function fmt(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtBudget(min?: number | null, max?: number | null) {
  if (!min && !max) return "Not specified";
  if (min && max && min !== max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  return `$${(min ?? max)!.toLocaleString()}`;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("gb_session")?.value;

  if (!sessionToken) redirect("/venues");

  const owner = await prisma.venueOwner.findUnique({
    where: { sessionToken },
    include: {
      venue: {
        select: {
          id: true, name: true, slug: true, stateSlug: true, city: true,
          primaryPhotoUrl: true, googleRating: true, isFeatured: true, featuredUntil: true,
          inquiries: {
            orderBy: { createdAt: "desc" },
            take: 100,
          },
        },
      },
    },
  });

  if (!owner || !owner.sessionExpires || owner.sessionExpires < new Date()) {
    redirect("/venues");
  }

  const venue = owner.venue;
  const inquiries = venue.inquiries;
  const newCount = inquiries.filter((i) => i.status === "new").length;
  const thisWeek = inquiries.filter((i) => i.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const isFeatured = venue.isFeatured && (!venue.featuredUntil || venue.featuredUntil > new Date());

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#3b6341] font-bold text-lg">🌿 Green Bowtie</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 text-sm font-medium">{venue.name}</span>
          </div>
          <div className="flex items-center gap-3">
            {isFeatured ? (
              <span className="bg-[#3b6341] text-white text-xs font-semibold px-3 py-1 rounded-full">⭐ Featured</span>
            ) : (
              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1 rounded-full">Free Plan</span>
            )}
            <Link
              href={`/venues/${venue.stateSlug}/${venue.slug}`}
              className="text-sm text-gray-500 hover:text-[#3b6341] transition-colors"
            >
              View listing →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Inquiries", value: inquiries.length },
            { label: "New (Unread)", value: newCount, highlight: newCount > 0 },
            { label: "This Week", value: thisWeek },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`bg-white rounded-2xl border p-5 text-center ${highlight ? "border-[#3b6341] bg-green-50" : "border-gray-200"}`}>
              <p className={`text-3xl font-bold ${highlight ? "text-[#3b6341]" : "text-gray-800"}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* Inquiries */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="playfair text-xl font-semibold text-gray-800">Inquiries</h2>
            {newCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                {newCount} new
              </span>
            )}
          </div>

          {inquiries.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 text-sm">No inquiries yet. Share your Green Bowtie listing to start receiving them.</p>
              <Link
                href={`/venues/${venue.stateSlug}/${venue.slug}`}
                className="inline-block mt-4 text-sm text-[#3b6341] font-semibold hover:underline"
              >
                View your listing →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left font-semibold">Couple</th>
                    <th className="px-4 py-3 text-left font-semibold">Wedding Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Guests</th>
                    <th className="px-4 py-3 text-left font-semibold">Budget</th>
                    <th className="px-4 py-3 text-left font-semibold">Received</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => (
                    <tr key={inq.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">
                          {[inq.coupleName, inq.partnerName].filter(Boolean).join(" & ")}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{inq.message}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {inq.weddingDate ? fmt(inq.weddingDate) : inq.weddingDateFlexible ? "Flexible" : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{inq.guestCount ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtBudget(inq.budgetMin, inq.budgetMax)}</td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmt(inq.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[inq.status] ?? "bg-gray-100 text-gray-500"}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${inq.coupleEmail}?subject=Re: Your inquiry about ${venue.name}`}
                          className="text-[#3b6341] text-xs font-semibold hover:underline"
                        >
                          Reply →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upgrade CTA (free plan only) */}
        {!isFeatured && (
          <div className="bg-gradient-to-br from-[#3b6341] to-[#2f5035] rounded-2xl p-8 text-white">
            <div className="max-w-2xl">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">Featured Placement</span>
              <h2 className="playfair text-2xl font-bold mt-3 mb-2">Get to the top of search results</h2>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Featured venues appear first when couples search your city and state. Stand out with a Featured badge, priority placement, and response time display.
              </p>
              <ul className="grid grid-cols-2 gap-2 mb-6 text-sm text-white/90">
                {[
                  "Priority position in search results",
                  "Featured badge on your listing card",
                  "Appear above 1,000+ other venues",
                  "Photo gallery (up to 10 photos)",
                  "Analytics — views & inquiry rate",
                  "Dedicated support",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-4">
                <button
                  disabled
                  className="bg-white text-[#3b6341] font-bold px-6 py-3 rounded-full text-sm hover:bg-green-50 transition-colors cursor-not-allowed opacity-75"
                  title="Stripe coming soon"
                >
                  Get Featured — $49/month
                </button>
                <span className="text-white/50 text-xs">Stripe billing coming soon</span>
              </div>
            </div>
          </div>
        )}

        {/* Your listing preview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="playfair text-xl font-semibold text-gray-800">Your Listing</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Edit listing — coming soon</span>
          </div>
          <div className="flex gap-4 items-start">
            {venue.primaryPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={venue.primaryPhotoUrl} alt={venue.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold text-gray-800">{venue.name}</p>
              <p className="text-sm text-gray-400">{venue.city}</p>
              {venue.googleRating && (
                <p className="text-sm text-yellow-500 mt-1">★ {venue.googleRating}</p>
              )}
              <Link
                href={`/venues/${venue.stateSlug}/${venue.slug}`}
                className="text-xs text-[#3b6341] font-semibold hover:underline mt-2 inline-block"
              >
                View public listing →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
