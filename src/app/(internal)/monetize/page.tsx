import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monetization Strategy — Green Bowtie Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

type StreamStatus = "built" | "progress" | "planned" | "future";

const STATUS: Record<StreamStatus, { label: string; color: string; bg: string }> = {
  built:    { label: "Built",       color: "#166534", bg: "#dcfce7" },
  progress: { label: "In Progress", color: "#92400e", bg: "#fef3c7" },
  planned:  { label: "Planned",     color: "#1e40af", bg: "#dbeafe" },
  future:   { label: "Future",      color: "#6b7280", bg: "#f3f4f6" },
};

function Badge({ status }: { status: StreamStatus }) {
  const s = STATUS[status];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: "2px 10px", borderRadius: 999 }}>
      {s.label}
    </span>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Tenor Sans', serif", fontSize: 22, fontWeight: 700,
      color: "#1a1a1a", borderBottom: "2px solid #e5e7eb",
      paddingBottom: 10, marginBottom: 24, marginTop: 0,
    }}>
      {children}
    </h2>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "24px 28px", ...style }}>
      {children}
    </div>
  );
}

const streams = [
  {
    n: "01", status: "progress" as StreamStatus, emoji: "⭐",
    name: "Featured Listings", group: "Venue-Side (B2B)",
    model: "$49–$149/mo · top placement + badge",
    mrr: "1% of 24,599 venues × $99 = $24K MRR. 3% = $73K MRR.",
    desc: "Venues pay monthly for priority placement in city/state search results. Non-paying venues still appear — just lower. Everyone is in the index; you pay for placement, not presence.",
    next: "isFeatured DB flag is built. Next: Stripe billing + Featured badge component. Cold email 50 premium venues.",
    t1: "$500–2.5K", t2: "$5–15K", t3: "$20–60K",
  },
  {
    n: "02", status: "built" as StreamStatus, emoji: "🏛️",
    name: "Claimed Listings — Freemium", group: "Venue-Side (B2B)",
    model: "Free to claim · $49–$199/mo for premium features",
    mrr: "500 venues × $99 = $49.5K MRR. 2,000 venues = $198K MRR.",
    desc: "Venue owners claim their listing for free, then upgrade for analytics, full photo gallery, inquiry management, priority placement. Same model as Yelp for Business and Google Business Profile.",
    next: "Claim flow + dashboard is built. Design premium tier feature set. Launch soft beta with 10 venue owners.",
    t1: "$500–3K", t2: "$8–25K", t3: "$30–80K",
  },
  {
    n: "03", status: "built" as StreamStatus, emoji: "📩",
    name: "Lead Generation / Pay-Per-Inquiry", group: "Venue-Side (B2B)",
    model: "Free tier capped · Premium: unlimited · or $10–25/lead",
    mrr: "2,000 inquiries/mo × $15 = $30K MRR at scale.",
    desc: "Inquiry forms are live on every venue page. Venues get leads; premium unlocks unlimited. The Knot charges $3K–10K/year for leads — we undercut significantly.",
    next: "Inquiry forms are live. Add pay-per-lead billing once volume justifies it.",
    t1: "$0–500", t2: "$3–15K", t3: "$20–80K",
  },
  {
    n: "04", status: "planned" as StreamStatus, emoji: "🥇",
    name: "Priority Placement by City", group: "Venue-Side (B2B)",
    model: "$299–$499/mo · top-3 guaranteed placement",
    mrr: "Fixed price for premium markets: LA, NYC, SF, Napa, Nashville.",
    desc: "Above standard featured — auction or fixed-price top-3 placement per city. A venue in Napa that wants to appear first in 'Napa Wedding Venues' pays $399/mo. Scarcity (3 spots) creates urgency.",
    next: "Build after Stripe billing is live and featured listings are proven.",
    t1: "$300–1.5K", t2: "$4–12K", t3: "$15–45K",
  },
  {
    n: "05", status: "planned" as StreamStatus, emoji: "📺",
    name: "Display Advertising (Programmatic)", group: "Couple-Side (B2C)",
    model: "$8–$40 RPM · Mediavine at 50K sessions · Raptive at 100K pageviews",
    mrr: "100K visitors × 2.5 pages × $15 RPM = $3.75K/mo. 500K visitors with Raptive = $40–80K/mo.",
    desc: "Wedding niche has some of the highest CPMs — $15–40 RPM vs $3–8 average. Advertisers (rings, dresses, florists) pay top dollar to reach active planners. Don't run ads before 50K sessions.",
    next: "Apply to Mediavine at 50K sessions/mo. Apply to Raptive at 100K pageviews.",
    t1: "$300–1.2K", t2: "$6–20K", t3: "$40–120K",
  },
  {
    n: "06", status: "planned" as StreamStatus, emoji: "🔗",
    name: "Affiliate Marketing", group: "Couple-Side (B2C)",
    model: "2–10% commission or $10–50/conversion",
    mrr: "Wedding insurance converts especially well. Amazon pays on everything after click.",
    desc: "WedSafe/Wedsure (wedding insurance $15–50/policy), Amazon Associates (registry 3–8%), Hotels.com (guest blocks $10–30/booking), Zola (registry referral). Add 'Planning Resources' to every venue page.",
    next: "Sign up for WedSafe, Amazon Associates, Booking.com. Add affiliate links to venue pages.",
    t1: "$200–800", t2: "$2–8K", t3: "$8–30K",
  },
  {
    n: "07", status: "planned" as StreamStatus, emoji: "📧",
    name: "Email List Monetization", group: "Couple-Side (B2C)",
    model: "$0.50–$2/subscriber/month at scale",
    mrr: "50K subscribers = $25–100K/mo. Wedding list has extremely high LTV.",
    desc: "Capture via 'Save this venue', venue comparison tool, checklist download. Monetize via sponsored newsletter sends, affiliate product drops, venue promotions.",
    next: "Email capture is live in footer. Add in-page capture on venue detail pages.",
    t1: "$0–200", t2: "$1.5–8K", t3: "$8–40K",
  },
  {
    n: "08", status: "future" as StreamStatus, emoji: "👥",
    name: "Vendor Directory", group: "Platform",
    model: "$99–$299/mo per vendor · photographers first",
    mrr: "0.1% of 1.2M US wedding vendors × $49 = $58K MRR.",
    desc: "Separate /vendors section. Photographers, caterers, florists, DJs, officiants. Same freemium model as venues. Natural cross-sell: couple finds venue → needs photographer.",
    next: "Build after venue monetization is stable and proven. Start with photographers.",
    t1: "$0–1K", t2: "$4–20K", t3: "$15–60K",
  },
  {
    n: "09", status: "future" as StreamStatus, emoji: "🗄️",
    name: "Data Licensing / API", group: "Platform",
    model: "$10K–$50K/year per contract · REST API or CSV",
    mrr: "B2B contracts are sticky — predictable ARR. Pure margin on existing data.",
    desc: "License the enriched venue database to wedding planning apps, insurance providers, event companies. Package as CSV or REST API. 24,599 venues with AI descriptions is genuinely valuable.",
    next: "Tier 3 play. Build after 50K+ venues and 100K+ monthly visitors.",
    t1: "$0", t2: "$1–5K", t3: "$5–20K",
  },
];

const groups = [...new Set(streams.map((s) => s.group))];

export default function MonetizePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Nunito Sans', sans-serif", color: "#1a1a1a" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontFamily: "'Tenor Sans', serif", fontSize: 34, fontWeight: 700, margin: "0 0 8px" }}>
            Monetization Strategy
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: "0 0 6px" }}>
            Free supply → massive inventory → premium monetization on top.
          </p>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
            Updated March 2026 · 24,599 venues indexed · Pre-launch
          </p>
        </div>

        {/* ── Core Philosophy ── */}
        <section style={{ marginBottom: 52 }}>
          <H2>The Foundation — Why Free Listings Win</H2>
          <Card>
            <p style={{ fontSize: 15, lineHeight: 1.8, margin: "0 0 20px", color: "#374151" }}>
              The instinct is to charge venues to appear. That's the wrong model. Charging for listings kills completeness, which kills user trust, which kills the value that makes venues want to pay. It's a death spiral before you start.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { company: "Airbnb", model: "Free to list → commission per booking" },
                { company: "Yelp", model: "Free to claim → ads for premium placement" },
                { company: "Google Maps", model: "Free to list → Local Service Ads" },
                { company: "Zillow", model: "Free to list → Premier Agent program" },
                { company: "TripAdvisor", model: "Free to list → promoted placements" },
                { company: "Green Bowtie", model: "Free to list → featured + leads + ads", highlight: true },
              ].map((m) => (
                <div key={m.company} style={{
                  padding: "12px 16px", borderRadius: 10,
                  background: (m as { highlight?: boolean }).highlight ? "#2d4f33" : "#f8f7f4",
                  border: `1px solid ${(m as { highlight?: boolean }).highlight ? "#2d4f33" : "#e5e7eb"}`,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: (m as { highlight?: boolean }).highlight ? "#86efac" : "#1a1a1a" }}>{m.company}</div>
                  <div style={{ fontSize: 12, color: (m as { highlight?: boolean }).highlight ? "rgba(255,255,255,0.7)" : "#6b7280" }}>{m.model}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: "#374151", margin: 0, padding: "16px 20px", background: "#f8f7f4", borderRadius: 10, borderLeft: "3px solid #3b6341" }}>
              <strong>The Knot charges $3,000–10,000/year</strong> to appear in their directory. Thousands of beautiful, legitimate venues don't appear because they can't or won't pay. <strong>That's Green Bowtie's moat</strong> — be the complete directory The Knot can never be.
            </p>
          </Card>
        </section>

        {/* ── Revenue Streams ── */}
        <section style={{ marginBottom: 52 }}>
          <H2>Revenue Streams</H2>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(Object.entries(STATUS) as [StreamStatus, typeof STATUS[StreamStatus]][]).map(([k, v]) => (
              <span key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 700, color: v.color, background: v.bg, padding: "2px 8px", borderRadius: 999, fontSize: 11 }}>{v.label}</span>
              </span>
            ))}
          </div>

          {groups.map((group) => (
            <div key={group} style={{ marginBottom: 36 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                {group}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {streams.filter((s) => s.group === group).map((s) => (
                  <Card key={s.n}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, width: 24 }}>{s.n}</span>
                        <span style={{ fontSize: 20 }}>{s.emoji}</span>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{s.name}</span>
                          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{s.model}</div>
                        </div>
                      </div>
                      <Badge status={s.status} />
                    </div>

                    <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "0 0 16px" }}>{s.desc}</p>

                    {/* Revenue tiers */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
                      {[
                        { label: "10K visitors/mo", value: s.t1 },
                        { label: "100K visitors/mo", value: s.t2 },
                        { label: "500K visitors/mo", value: s.t3 },
                      ].map((t) => (
                        <div key={t.label} style={{ background: "#f8f7f4", borderRadius: 8, padding: "10px 14px" }}>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 3 }}>{t.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#3b6341" }}>{t.value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ background: "#f8f7f4", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Scale estimate</div>
                        <div style={{ fontSize: 12, color: "#374151" }}>{s.mrr}</div>
                      </div>
                      <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Next step</div>
                        <div style={{ fontSize: 12, color: "#374151" }}>{s.next}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ── Revenue Projections ── */}
        <section style={{ marginBottom: 52 }}>
          <H2>Revenue Projections — Blended</H2>
          <Card>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    {["Traffic", "Conservative", "Realistic", "Optimistic", "Active Streams"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["10K/mo",   "$800",   "$2,500",    "$5K",     "Featured listings + affiliates"],
                    ["50K/mo",   "$3K",    "$9,000",    "$18K",    "Mediavine display + featured + affiliates"],
                    ["100K/mo",  "$8K",    "$22,000",   "$45K",    "Raptive + lead gen + claimed listings"],
                    ["500K/mo",  "$40K",   "$110,000",  "$220K",   "Full stack + vendor SaaS + email + data"],
                    ["1M+/mo",   "$120K",  "$300,000",  "$600K+",  "All streams + API + transaction fees"],
                  ].map(([tier, c, r, o, streams], i) => (
                    <tr key={tier} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 1 ? "#fafaf9" : "#fff" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 13 }}>{tier}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: 13 }}>{c}</td>
                      <td style={{ padding: "12px 14px", color: "#3b6341", fontWeight: 700, fontSize: 14 }}>{r}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: 13 }}>{o}</td>
                      <td style={{ padding: "12px 14px", color: "#9ca3af", fontSize: 12 }}>{streams}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "16px 0 0" }}>
              The Knot acquired WeddingWire for ~$1B at ~20M monthly visitors. Green Bowtie at 1M visitors (5% of their scale) with a leaner model should reach $2–5M ARR.
            </p>
          </Card>
        </section>

        {/* ── Launch Priority ── */}
        <section style={{ marginBottom: 52 }}>
          <H2>Priority Action Plan</H2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              {
                phase: "Now — 6 months",
                goal: "First revenue",
                color: "#dcfce7", border: "#86efac",
                items: [
                  "Stripe billing for featured listings",
                  "Cold email 50 premium venues at $49–149/mo",
                  "Add affiliate links (insurance, registry, hotels)",
                  "Email capture on every venue page",
                ],
              },
              {
                phase: "6–18 months",
                goal: "Hit 50K sessions/mo",
                color: "#dbeafe", border: "#93c5fd",
                items: [
                  "Apply to Mediavine ($15–40 RPM)",
                  "Pay-per-lead routing to venues",
                  "Vendor directory beta (photographers)",
                  "Email list growth push",
                ],
              },
              {
                phase: "18+ months",
                goal: "100K+ sessions/mo",
                color: "#fef3c7", border: "#fcd34d",
                items: [
                  "Raptive/AdThrive display ads",
                  "Full vendor SaaS ($149–299/mo)",
                  "Email list sponsorships at scale",
                  "Data licensing + API contracts",
                ],
              },
            ].map((p) => (
              <div key={p.phase} style={{ background: p.color, border: `1px solid ${p.border}`, borderRadius: 12, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{p.phase}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "#1a1a1a" }}>Goal: {p.goal}</div>
                {p.items.map((item) => (
                  <div key={item} style={{ fontSize: 13, color: "#374151", marginBottom: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#3b6341", fontWeight: 700, flexShrink: 0 }}>→</span>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <p style={{ textAlign: "center", fontSize: 12, color: "#d1d5db" }}>
          Green Bowtie Monetization Strategy · March 2026 · Internal Only
        </p>
      </div>
    </div>
  );
}
