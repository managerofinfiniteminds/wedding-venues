import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Green Bowtie Ops",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

function getGreeting(): string {
  const hour = new Date().getUTCHours() - 8; // rough PT offset
  const h = ((hour % 24) + 24) % 24;
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

async function getStats() {
  const [totalVenues, enrichedStates, totalInquiries, claimedVenues] = await Promise.all([
    prisma.venue.count({ where: { isPublished: true } }),
    prisma.venue.findMany({
      where: { pipelineProcessedAt: { not: null } },
      select: { stateSlug: true },
      distinct: ["stateSlug"],
    }).then((rows) => rows.length),
    prisma.inquiry.count(),
    prisma.venueOwner.count(),
  ]);
  return { totalVenues, enrichedStates, totalInquiries, claimedVenues };
}

const cards = [
  {
    icon: "📊",
    title: "Data Strategy",
    href: "/data",
    desc: "Pipeline status, enrichment progress, rollout plan, backlog",
    badge: "Live",
    badgeColor: "#16a34a",
    badgeBg: "#dcfce7",
  },
  {
    icon: "💰",
    title: "Monetization",
    href: "/monetize",
    desc: "Revenue streams, pricing strategy, phase roadmap",
    badge: "Planning",
    badgeColor: "#92400e",
    badgeBg: "#fef3c7",
  },
  {
    icon: "📈",
    title: "SEO Strategy",
    href: "/seo",
    desc: "URL hierarchy, city page moat, ranking factors, open TODOs",
    badge: "Strategy",
    badgeColor: "#1d4ed8",
    badgeBg: "#dbeafe",
  },
  {
    icon: "📋",
    title: "Dashboard",
    href: "/dashboard",
    desc: "Venue owner inquiries and claims",
    badge: "Live",
    badgeColor: "#16a34a",
    badgeBg: "#dcfce7",
  },
  {
    icon: "🔍",
    title: "Audit",
    href: "/audit",
    desc: "Venue data quality audit reports",
    badge: "Live",
    badgeColor: "#16a34a",
    badgeBg: "#dcfce7",
  },

  {
    icon: "📖",
    title: "Handbook",
    href: "/handbook",
    desc: "Complete reference — all services, accounts, env vars, features, commands, and launch checklist",
    badge: "Reference",
    badgeColor: "#1d4ed8",
    badgeBg: "#dbeafe",
  },
  {
    icon: "🎛️",
    title: "Admin Dashboard",
    href: "/admin",
    desc: "Inquiries feed, venue claims queue, operations center",
    badge: "Live",
    badgeColor: "#16a34a",
    badgeBg: "#dcfce7",
  },
  {
    icon: "🗺️",
    title: "Feature Plans",
    href: "/features",
    desc: "Storyboards, monetization plans, and rollout strategies for each major feature",
    badge: "Planning",
    badgeColor: "#92400e",
    badgeBg: "#fef3c7",
  },
  {
    icon: "📊",
    title: "Market Intelligence",
    href: "/market",
    desc: "Competitive analysis, market sizing, investor brief",
    badge: "Investor",
    badgeColor: "#1e40af",
    badgeBg: "#dbeafe",
  },
];

export default async function InternalHomePage() {
  const greeting = getGreeting();
  const { totalVenues, enrichedStates, totalInquiries, claimedVenues } = await getStats();

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Nunito Sans', sans-serif", color: "#1a1a1a" }}>
      {/* Header */}
      <header style={{ background: "#3b6341", padding: "0 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, height: 64 }}>
          <span className="playfair" style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Green Bowtie
          </span>
          <span style={{
            background: "rgba(255,255,255,0.18)",
            color: "#e8f5e9",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.25)",
          }}>
            Internal
          </span>
        </div>
      </header>

      {/* Hero */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 0" }}>
        <h1 className="playfair" style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
          Good {greeting}, Wayne 👋
        </h1>
        <p style={{ color: "#6b7280", marginTop: 6, marginBottom: 40, fontSize: 16 }}>
          Green Bowtie Operations Center
        </p>

        {/* Cards grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          gap: 16,
          marginBottom: 48,
        }}>
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="internal-card" style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                cursor: "pointer",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{c.icon}</span>
                    <span className="playfair" style={{ fontSize: 18, fontWeight: 700 }}>{c.title}</span>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    color: c.badgeColor,
                    background: c.badgeBg,
                    padding: "3px 10px",
                    borderRadius: 999,
                  }}>
                    {c.badge}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 56,
        }}>
          {[
            { label: "Published Venues", value: totalVenues.toLocaleString() },
            { label: "States Enriched", value: enrichedStates.toString() },
            { label: "Total Inquiries", value: totalInquiries.toLocaleString() },
            { label: "Claimed Venues", value: claimedVenues.toLocaleString() },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "20px 24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#3b6341" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e5e7eb", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
          Green Bowtie Internal &middot; Not indexed &middot; Protected by Cloudflare Access
        </p>
      </footer>
    </div>
  );
}
