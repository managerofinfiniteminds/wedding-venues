import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Feature Plans — Green Bowtie Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

const features = [
  {
    href: "/features/venue-ownership",
    icon: "🏛️",
    title: "Venue Ownership & Claim Flow",
    status: "Pre-Launch Priority",
    statusColor: "#92400e", statusBg: "#fef3c7",
    desc: "How venue owners claim, verify, and manage their listing. Full storyboard + monetization plan.",
  },
];

export default function FeaturesIndexPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Nunito Sans', sans-serif" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontFamily: "'Tenor Sans', serif", fontSize: 32, fontWeight: 700, margin: "0 0 8px" }}>
          Feature Plans
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 40 }}>
          Storyboards, monetization plans, and rollout strategies for each major feature.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {features.map((f) => (
            <Link key={f.href} href={f.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
                padding: "24px 28px", display: "flex", alignItems: "center", gap: 16,
                cursor: "pointer", transition: "all 0.15s",
              }} className="internal-card">
                <span style={{ fontSize: 28 }}>{f.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{f.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: f.statusColor, background: f.statusBg, padding: "2px 9px", borderRadius: 999 }}>{f.status}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{f.desc}</p>
                </div>
                <span style={{ color: "#9ca3af", fontSize: 20 }}>→</span>
              </div>
            </Link>
          ))}
        </div>

        <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 32 }}>
          More feature plans will be added here as we define them.
        </p>
      </div>
    </div>
  );
}
