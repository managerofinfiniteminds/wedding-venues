import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services & Accounts — Green Bowtie Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

type ServiceStatus = "live" | "setup" | "planned" | "paused";

interface Service {
  name: string;
  category: string;
  purpose: string;
  account: string;
  url: string;
  status: ServiceStatus;
  notes?: string;
}

const services: Service[] = [
  // Infrastructure
  {
    name: "Vercel",
    category: "Hosting & Deployment",
    purpose: "Hosts greenbowtie.com and internal.greenbowtie.com. Auto-deploys from GitHub main branch.",
    account: "managerofinfiniteminds",
    url: "https://vercel.com",
    status: "live",
    notes: "Free tier. Project: wedding-venues. Env vars stored here (DATABASE_URL, etc.)",
  },
  {
    name: "GitHub",
    category: "Hosting & Deployment",
    purpose: "Source code repository. Push to main → triggers Vercel deploy.",
    account: "managerofinfiniteminds",
    url: "https://github.com/managerofinfiniteminds/wedding-venues",
    status: "live",
  },
  {
    name: "Cloudflare",
    category: "Hosting & Deployment",
    purpose: "DNS management for greenbowtie.com. Nameservers: piper.ns.cloudflare.com + denver.ns.cloudflare.com. Also handles Cloudflare Access (protects internal subdomain).",
    account: "wayne@managerofinfiniteminds.com",
    url: "https://dash.cloudflare.com",
    status: "live",
    notes: "All DNS records live here — including SPF/DKIM/DMARC for email auth",
  },
  {
    name: "GoDaddy",
    category: "Hosting & Deployment",
    purpose: "Domain registrar for greenbowtie.com. Domain registered here but DNS delegated to Cloudflare.",
    account: "wayne@managerofinfiniteminds.com",
    url: "https://godaddy.com",
    status: "live",
    notes: "Only used for domain registration/renewal. All DNS is in Cloudflare.",
  },
  // Database
  {
    name: "Neon",
    category: "Database",
    purpose: "Production PostgreSQL database. All 29K+ venues, inquiries, venue owners, claim tokens. Serverless Postgres — scales to zero.",
    account: "wayne@managerofinfiniteminds.com",
    url: "https://console.neon.tech",
    status: "live",
    notes: "DB: neondb. Connection pooling enabled. DATABASE_URL in Vercel env vars.",
  },
  // Email
  {
    name: "SendGrid",
    category: "Email — Transactional",
    purpose: "Sends transactional emails: inquiry notifications, magic links (venue owner login), system alerts.",
    account: "wayne@managerofinfiniteminds.com",
    url: "https://app.sendgrid.com",
    status: "setup",
    notes: "Account created. Domain authentication (SPF/DKIM/DMARC) in progress. SENDGRID_API_KEY needed in Vercel.",
  },
  {
    name: "Klaviyo",
    category: "Email — Marketing",
    purpose: "Email list management, signup capture, marketing campaigns, automated flows. Couples list + venue owners list.",
    account: "TBD",
    url: "https://www.klaviyo.com",
    status: "planned",
    notes: "Not set up yet. Needed for: email capture on site, launch campaign, venue owner outreach.",
  },
  // Data & Enrichment
  {
    name: "Google Places API",
    category: "Data & Enrichment",
    purpose: "Enriches venue data with ratings, reviews, photos, addresses, phone numbers.",
    account: "wayne@managerofinfiniteminds.com",
    url: "https://console.cloud.google.com",
    status: "live",
    notes: "⚠️ API key needs domain restriction to greenbowtie.com (currently open). Billing enabled.",
  },
  {
    name: "The Knot (scraper)",
    category: "Data & Enrichment",
    purpose: "Phase 2 scraper enriches venue Knot URLs, reviews, pricing data across all 8,089 US cities.",
    account: "N/A — scraper",
    url: "https://www.theknot.com",
    status: "live",
    notes: "Running overnight. Script: scripts/enrichment/phase2-knot-cities.ts. Checkpoint: phase2-state.json.",
  },
  // Analytics / Search
  {
    name: "Google Search Console",
    category: "SEO & Analytics",
    purpose: "Submit sitemap, monitor indexing, track search performance once launched.",
    account: "wayne@managerofinfiniteminds.com",
    url: "https://search.google.com/search-console",
    status: "planned",
    notes: "Not configured yet. Sitemap at greenbowtie.com/sitemap.xml — needs submission at launch.",
  },
  // Payments
  {
    name: "Stripe",
    category: "Payments",
    purpose: "Payment processing for featured listing upgrades and Pro venue owner plans.",
    account: "TBD",
    url: "https://stripe.com",
    status: "planned",
    notes: "Not set up yet. Needed when first venue owner is ready to pay.",
  },
  // Storage
  {
    name: "Cloudflare R2",
    category: "Storage",
    purpose: "Photo storage for venue images. Custom domain: photos.greenbowtie.com (planned).",
    account: "wayne@managerofinfiniteminds.com",
    url: "https://dash.cloudflare.com",
    status: "planned",
    notes: "Bucket: greenbowtie-backups (planned). Custom domain not set up yet. Needed before major photo push.",
  },
];

const statusConfig: Record<ServiceStatus, { label: string; color: string; bg: string }> = {
  live:    { label: "Live",    color: "#16a34a", bg: "#dcfce7" },
  setup:   { label: "Setup",   color: "#92400e", bg: "#fef3c7" },
  planned: { label: "Planned", color: "#1d4ed8", bg: "#dbeafe" },
  paused:  { label: "Paused",  color: "#6b7280", bg: "#f3f4f6" },
};

const categories = Array.from(new Set(services.map((s) => s.category)));

export default function ServicesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Nunito Sans', sans-serif", color: "#1a1a1a" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 className="playfair" style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
            Services & Accounts
          </h1>
          <p style={{ color: "#6b7280", marginTop: 8, fontSize: 16 }}>
            Every external service Green Bowtie uses. No passwords or keys stored here.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <span key={key} style={{
                fontSize: 12, fontWeight: 700, color: cfg.color, background: cfg.bg,
                padding: "3px 12px", borderRadius: 999,
              }}>
                {cfg.label}: {services.filter((s) => s.status === key).length}
              </span>
            ))}
          </div>
        </div>

        {/* Categories */}
        {categories.map((cat) => (
          <div key={cat} style={{ marginBottom: 40 }}>
            <h2 style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "#9ca3af", marginBottom: 12,
            }}>
              {cat}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {services.filter((s) => s.category === cat).map((s) => {
                const st = statusConfig[s.status];
                return (
                  <div key={s.name} style={{
                    background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
                    padding: "20px 24px",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <a href={s.url} target="_blank" rel="noopener noreferrer" style={{
                            fontWeight: 700, fontSize: 16, color: "#3b6341", textDecoration: "none",
                          }}>
                            {s.name} ↗
                          </a>
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: st.color, background: st.bg,
                            padding: "2px 9px", borderRadius: 999,
                          }}>
                            {st.label}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{s.purpose}</p>
                        {s.notes && (
                          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#9ca3af", lineHeight: 1.5 }}>
                            💬 {s.notes}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Account</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>{s.account}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <p style={{ textAlign: "center", fontSize: 12, color: "#d1d5db", marginTop: 48 }}>
          Last updated manually — keep this in sync as new services are added.
        </p>
      </div>
    </div>
  );
}
