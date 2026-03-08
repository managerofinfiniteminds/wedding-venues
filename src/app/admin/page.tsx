import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard — Green Bowtie Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export const revalidate = 0; // always fresh

async function getData() {
  const [inquiries, claims, totalVenues, publishedVenues, recentInquiries] = await Promise.all([
    prisma.inquiry.count(),
    prisma.venueOwner.count(),
    prisma.venue.count(),
    prisma.venue.count({ where: { isPublished: true } }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        venue: { select: { name: true, slug: true, stateSlug: true } },
      },
    }),
  ]);
  return { inquiries, claims, totalVenues, publishedVenues, recentInquiries };
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 700, color: color ?? "#1a1a1a", margin: "0 0 2px" }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{sub}</p>}
    </div>
  );
}

export default async function AdminPage() {
  const { inquiries, claims, totalVenues, publishedVenues, recentInquiries } = await getData();

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Nunito Sans', sans-serif", color: "#1a1a1a" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Tenor Sans', serif", fontSize: 32, fontWeight: 700, margin: "0 0 6px" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>Green Bowtie Operations — real-time data from Neon</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 40 }}>
          <StatCard label="Total Inquiries" value={inquiries} sub="all time" color="#3b6341" />
          <StatCard label="Claimed Venues" value={claims} sub="verified owners" />
          <StatCard label="Published Venues" value={publishedVenues.toLocaleString()} sub={`of ${totalVenues.toLocaleString()} total`} />
          <StatCard label="Venue Notifications" value="OFF" sub="enable when ready to launch" color="#dc2626" />
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: 40, flexWrap: "wrap" }}>
          {[
            { label: "🔍 Venue Audit", href: "/admin/audit" },
            { label: "📖 Handbook", href: "/handbook" },
            { label: "🗺️ Feature Plans", href: "/features" },
            { label: "📊 Data Pipeline", href: "/data" },
            { label: "📈 Market Intel", href: "/market" },
            { label: "💰 Monetization", href: "/monetize" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
              padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#374151",
              textDecoration: "none",
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Inquiries Table */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Tenor Sans', serif", fontSize: 20, fontWeight: 700, margin: 0 }}>
              Recent Inquiries
            </h2>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>{inquiries} total</span>
          </div>

          {recentInquiries.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
              No inquiries yet. They'll appear here when couples submit the inquiry form.
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f7f4", borderBottom: "1px solid #e5e7eb" }}>
                    {["Date", "Couple", "Email", "Venue", "Wedding Date", "Guests", "Budget"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentInquiries.map((inq, i) => {
                    const names = [inq.coupleName, inq.partnerName].filter(Boolean).join(" & ");
                    const budget = inq.budgetMin && inq.budgetMax
                      ? `$${(inq.budgetMin / 1000).toFixed(0)}k–$${(inq.budgetMax / 1000).toFixed(0)}k`
                      : inq.budgetMin ? `$${(inq.budgetMin / 1000).toFixed(0)}k+` : "—";
                    const weddingDate = inq.weddingDate
                      ? new Date(inq.weddingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : inq.weddingDateFlexible ? "Flexible" : "—";
                    return (
                      <tr key={inq.id} style={{ borderBottom: i < recentInquiries.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>
                          {new Date(inq.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{names}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13 }}>
                          <a href={`mailto:${inq.coupleEmail}`} style={{ color: "#3b6341", textDecoration: "none" }}>{inq.coupleEmail}</a>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13 }}>
                          <Link href={`/venues/${inq.venue.stateSlug}/${inq.venue.slug}`} style={{ color: "#374151", textDecoration: "none" }}>
                            {inq.venue.name}
                          </Link>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>{weddingDate}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>{inq.guestCount ? `${inq.guestCount}` : "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>{budget}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Claims section */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Tenor Sans', serif", fontSize: 20, fontWeight: 700, margin: 0 }}>
              Venue Claims
            </h2>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>{claims} claimed venues</span>
          </div>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
            {claims === 0
              ? "No venue claims yet. They'll appear here when venue owners claim their listings."
              : `${claims} venue owners have claimed their listings.`}
          </div>
        </div>

      </div>
    </div>
  );
}
