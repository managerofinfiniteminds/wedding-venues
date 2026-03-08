import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Opportunity & Competitive Analysis — Green Bowtie",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

// ── Local components ──────────────────────────────────────────────────────────

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 ${className}`} style={style}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="playfair text-2xl font-bold text-gray-800 mb-5">{children}</h2>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#3b6341" }}>
      {children}
    </div>
  );
}

function Badge({
  children,
  color = "gray",
  style: s,
}: {
  children: React.ReactNode;
  color?: "green" | "blue" | "amber" | "red" | "purple" | "gray" | "navy";
  style?: React.CSSProperties;
}) {
  const COLORS: Record<string, { bg: string; color: string }> = {
    green:  { bg: "#dcfce7", color: "#166534" },
    blue:   { bg: "#dbeafe", color: "#1e40af" },
    navy:   { bg: "#1e3a5f", color: "#bfdbfe" },
    purple: { bg: "#ede9fe", color: "#6d28d9" },
    amber:  { bg: "#fef3c7", color: "#92400e" },
    red:    { bg: "#fee2e2", color: "#991b1b" },
    gray:   { bg: "#f3f4f6", color: "#374151" },
  };
  const c = COLORS[color] ?? COLORS.gray;
  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
      style={{ background: c.bg, color: c.color, ...s }}
    >
      {children}
    </span>
  );
}

function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-1">
      <div className="text-3xl font-bold" style={{ color: "#3b6341" }}>{value}</div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MarketPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f8f7f4", fontFamily: "Nunito Sans, sans-serif", color: "#1a1a1a" }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #3b6341 0%, #1e3a22 100%)" }} className="text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <Badge style={{ background: "rgba(255,255,255,0.18)", color: "white" }}>Investor Intelligence Report</Badge>
            <Badge style={{ background: "rgba(255,255,255,0.18)", color: "white" }}>March 2026</Badge>
            <Badge style={{ background: "rgba(255,255,255,0.18)", color: "white" }}>Confidential — Internal Only</Badge>
          </div>
          <h1 className="playfair font-bold mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.15 }}>
            Market Opportunity &amp;<br />Competitive Analysis
          </h1>
          <p style={{ color: "#bbf7d0", fontSize: 18, marginBottom: 40 }}>
            Green Bowtie — Investor Intelligence Report · March 2026
          </p>

          {/* Key stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "$64.9B", label: "US Market (2024)" },
              { value: "2.2M", label: "Weddings / Year" },
              { value: "$10,700", label: "Avg Venue Spend" },
              { value: "24,599", label: "Venues Indexed" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl px-5 py-4"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                <div className="text-2xl font-bold" style={{ color: "#fff" }}>{s.value}</div>
                <div className="text-xs font-medium mt-0.5" style={{ color: "#bbf7d0" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* ── Section 1: The Opportunity ──────────────────────────────────── */}
        <Card className="p-8">
          <SectionLabel>Section 1</SectionLabel>
          <SectionTitle>The Opportunity</SectionTitle>
          <div className="space-y-4 text-gray-700 leading-relaxed" style={{ fontSize: 15 }}>
            <p>
              The US wedding services market reached <strong>$64.93 billion in 2024</strong>, driven by ~2.2 million weddings annually and rising per-wedding spend that now averages <strong>$30,500</strong> — a 25% increase over 2019 levels. Venues are the single largest budget line item: couples allocate roughly <strong>40% of their total budget</strong> to the venue, putting average venue spend at <strong>$10,700–$12,000 per wedding</strong>, and 91% of couples hire a dedicated venue. At 2.2 million weddings per year, that is a <strong>~$23.5 billion annual venue spend opportunity</strong> in the US alone.
            </p>
            <p>
              Despite this scale, venue discovery is dominated by a single incumbent: The Knot Worldwide (theknot.com + weddingwire.com), which commands roughly <strong>46% combined market share</strong> of online wedding planning platforms and generates ~$455M in annual revenue almost entirely from vendor advertising. Their model is pay-to-play: venues pay <strong>$3,000–$10,000+ per year</strong> for a "storefront" listing just to be discoverable. Small businesses — which make up <strong>90% of the wedding vendor market</strong> — are priced out. Venues that can&apos;t afford The Knot&apos;s fees are effectively invisible online.
            </p>
            <p>
              At the same time, <strong>94% of couples begin their vendor search online</strong>, and most start with a Google search: "wedding venues in [city]." There is no independent, organic, comprehensive venue directory that owns this search surface. Green Bowtie is building exactly that — a free-to-list, SEO-first national venue directory designed to rank for every city-level venue query in the country, giving venues organic discoverability without a $10,000 annual platform fee.
            </p>
          </div>
        </Card>

        {/* ── Section 2: Market Size & Growth ─────────────────────────────── */}
        <div>
          <SectionLabel>Section 2</SectionLabel>
          <h2 className="playfair text-2xl font-bold text-gray-800 mb-5">Market Size &amp; Growth</h2>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatCard value="$64.93B" label="US Wedding Market (2024)" sub="Source: Grand View Research" />
            <StatCard value="$219.8B" label="Global Wedding Market (2024)" sub="Source: Nunify / IBISWorld" />
            <StatCard value="6.8%" label="US CAGR through 2030" sub="Source: Grand View Research" />
            <StatCard value="2.2M" label="US Weddings Annually" sub="Source: WeddingVenueOwners.com" />
            <StatCard value="$10,700" label="Average Venue Spend" sub="~40% of total wedding budget" />
            <StatCard value="91%" label="Couples Who Hire a Venue" sub="Source: Nunify (2024)" />
          </div>

          {/* Market trajectory visual */}
          <Card className="p-8">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Global Market Trajectory</div>
            <div className="space-y-4">
              {[
                { year: "2023", value: 196.58, formatted: "$196.6B", note: "Pre-rebound baseline" },
                { year: "2024", value: 219.8,  formatted: "$219.8B", note: "Current (Nunify / IBISWorld)" },
                { year: "2025", value: 250,    formatted: "~$250B",  note: "Est. at 4.6% CAGR" },
                { year: "2028", value: 327.19, formatted: "$327.2B", note: "Projected (IBISWorld)" },
                { year: "2032", value: 414,    formatted: "$414B+",  note: "Projected (StoryAmour)" },
              ].map((row) => {
                const pct = Math.round((row.value / 414) * 100);
                return (
                  <div key={row.year} className="flex items-center gap-4">
                    <div className="text-sm font-bold text-gray-600 w-10 flex-shrink-0">{row.year}</div>
                    <div className="flex-1 h-8 rounded-lg overflow-hidden" style={{ background: "#f3f4f6" }}>
                      <div
                        className="h-full rounded-lg flex items-center px-3"
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(90deg, #3b6341, #5a8f62)",
                          minWidth: 80,
                        }}
                      >
                        <span className="text-white text-xs font-bold">{row.formatted}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 w-48 flex-shrink-0 hidden md:block">{row.note}</div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-5">
              Sources: Grand View Research (2024), Nunify/IBISWorld (2024), StoryAmour (2024), WeddingVenueOwners.com
            </p>
          </Card>

          {/* Additional data points */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Card className="p-6">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Wedding Spend Trends</div>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Avg US wedding cost (2024)", value: "$30,500" },
                  { label: "Peak avg (2023)", value: "$35,000" },
                  { label: "NY / CA average", value: "$42,000+" },
                  { label: "Spend vs. 2019", value: "+25%" },
                  { label: "Planning budget under $10K (2024)", value: "39% of couples" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">{r.label}</span>
                    <span className="font-bold text-gray-800">{r.value}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Key Behavioral Signals</div>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Couples who start search online", value: "94%" },
                  { label: "Book venue 9–12 months ahead", value: "Majority" },
                  { label: "Choose outdoor/barn/garden venues", value: "65%" },
                  { label: "Micro-weddings (&lt;50 guests) in 2024", value: "53%" },
                  { label: "Destination weddings", value: "17–20%" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600" dangerouslySetInnerHTML={{ __html: r.label }} />
                    <span className="font-bold text-gray-800">{r.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ── Section 3: Competitive Landscape ────────────────────────────── */}
        <div>
          <SectionLabel>Section 3</SectionLabel>
          <h2 className="playfair text-2xl font-bold text-gray-800 mb-5">Competitive Landscape</h2>

          {/* Platform market share */}
          <Card className="p-8 mb-4">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
              Online Platform Market Share (Couples Using for Wedding Website) — CivicScience, April 2024
            </div>
            <div className="space-y-3">
              {[
                { name: "The Knot", share: 28, color: "#3b6341" },
                { name: "Zola", share: 19, color: "#5a8f62" },
                { name: "WeddingWire", share: 18, color: "#7ab87e" },
                { name: "WithJoy", share: 13, color: "#a3c5a6" },
                { name: "Minted", share: 7, color: "#c5d9c6" },
              ].map((row) => (
                <div key={row.name} className="flex items-center gap-4">
                  <div className="text-sm font-semibold text-gray-700 w-28 flex-shrink-0">{row.name}</div>
                  <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: "#f3f4f6" }}>
                    <div
                      className="h-full rounded-lg flex items-center px-3"
                      style={{ width: `${row.share * 2.5}%`, background: row.color, minWidth: 40 }}
                    >
                      <span className="text-white text-xs font-bold">{row.share}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              The Knot (28%) + WeddingWire (18%) = 46% combined. Both owned by The Knot Worldwide since their ~$1B merger in 2018.
            </p>
          </Card>

          {/* Competitor table */}
          <div className="space-y-4">
            {/* The Knot Worldwide */}
            <Card className="p-7">
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <h3 className="playfair text-xl font-bold text-gray-800">The Knot Worldwide</h3>
                  <div className="text-sm text-gray-500 mt-0.5">theknot.com + weddingwire.com</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge color="red">46% Combined Share</Badge>
                  <Badge color="gray">~$455M Revenue/yr</Badge>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="font-semibold text-gray-600 mb-2">Profile</div>
                  <ul className="space-y-1.5 text-gray-600">
                    <li>· Formed 2018 via ~$1B merger of XO Group (The Knot) + WeddingWire</li>
                    <li>· 4M+ couples served per year; 840,000+ registered vendors</li>
                    <li>· Revenue: ~$436–455M/year (Growjo, RocketReach, StoryAmour)</li>
                    <li>· Market share: 28% (The Knot) + 18% (WeddingWire) = 46% combined</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-gray-600 mb-2">Business Model</div>
                  <ul className="space-y-1.5 text-gray-600">
                    <li>· <strong>Pay-to-play:</strong> Venues pay $3,000–$10,000+/year for storefront listing</li>
                    <li>· Couples use for free; revenue entirely from vendor advertising</li>
                    <li>· Tiered listing packages drive upsell pressure on small venues</li>
                  </ul>
                  <div className="font-semibold text-gray-600 mt-4 mb-2">Weakness</div>
                  <ul className="space-y-1.5 text-gray-600">
                    <li>· Expensive for venues — widespread ROI complaints</li>
                    <li>· Ad-heavy, transactional UX; listings feel like yellow pages</li>
                    <li>· Venues that can&apos;t pay are completely invisible</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Other competitors */}
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  name: "Zola",
                  url: "zola.com",
                  share: "19%",
                  model: "Wedding registry + planning tools. Venue discovery is a secondary feature, not core. Monetizes via registry commissions and vendor ads.",
                  weakness: "Registry-first platform. Venue search is not differentiated.",
                },
                {
                  name: "WithJoy",
                  url: "withjoy.com",
                  share: "13%",
                  model: "Wedding website builder. Venue directory is not core to the product.",
                  weakness: "Website builder, not a discovery platform.",
                },
                {
                  name: "Junebug Weddings",
                  url: "junebugweddings.com",
                  share: "Editorial",
                  model: "Editorial/inspiration. Curated real weddings. Vendor directory invite-only.",
                  weakness: "Invite-only, editorial gatekeeping, not comprehensive at scale.",
                },
                {
                  name: "Wedding Spot",
                  url: "wedding-spot.com",
                  share: "Niche",
                  model: "Free venue search with pricing transparency. Acquired by Here Comes The Guide.",
                  weakness: "Limited scale and limited marketing investment.",
                },
              ].map((c) => (
                <Card key={c.name} className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{c.name}</h3>
                      <div className="text-xs text-gray-400">{c.url}</div>
                    </div>
                    <Badge color="gray">{c.share} share</Badge>
                  </div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Model</div>
                  <p className="text-sm text-gray-600 mb-3">{c.model}</p>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Weakness</div>
                  <p className="text-sm text-gray-600">{c.weakness}</p>
                </Card>
              ))}
            </div>

            {/* Green Bowtie — highlighted */}
            <Card
              className="p-7"
              style={{ border: "2px solid #3b6341", background: "#f0f7f1" }}
            >
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#3b6341" }}>Our Position</div>
                  <h3 className="playfair text-xl font-bold" style={{ color: "#1e3a22" }}>Green Bowtie</h3>
                  <div className="text-sm text-gray-500 mt-0.5">greenbowtie.com</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge color="green">SEO-First</Badge>
                  <Badge color="green">Free to List</Badge>
                  <Badge color="green">24,599 Venues</Badge>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="font-semibold mb-2" style={{ color: "#3b6341" }}>Model</div>
                  <ul className="space-y-1.5 text-gray-700">
                    <li>· SEO-first organic directory — no ad spend to acquire traffic</li>
                    <li>· Venues listed free vs. $3,000–$10,000/yr on The Knot</li>
                    <li>· Revenue from featured listings + inquiry lead gen</li>
                    <li>· 24,599 venues across all 50 states; 8,000+ city-level pages</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-2" style={{ color: "#3b6341" }}>Unfair Advantages</div>
                  <ul className="space-y-1.5 text-gray-700">
                    <li>· <strong>Organic moat:</strong> 8,000+ city pages, each a unique search target</li>
                    <li>· <strong>Proprietary dataset:</strong> 24,599 venues scraped nationally from scratch</li>
                    <li>· <strong>$0 CAC</strong> — organic traffic vs. $50–200/user for paid acquisition</li>
                    <li>· <strong>Venue-first:</strong> competitors treat venues as secondary; we don&apos;t</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Section 4: SEO Moat ──────────────────────────────────────────── */}
        <div>
          <SectionLabel>Section 4</SectionLabel>
          <h2 className="playfair text-2xl font-bold text-gray-800 mb-2">Our Unfair Advantage — The SEO Moat</h2>
          <p className="text-gray-500 text-sm mb-6">This is the core structural defensibility of Green Bowtie.</p>

          <div
            className="rounded-2xl p-7 mb-6 border-l-4"
            style={{ background: "#f0f7f1", borderColor: "#3b6341", borderWidth: "0 0 0 4px" }}
          >
            <p className="font-semibold text-gray-800 mb-1">The thesis in one sentence:</p>
            <p className="text-gray-700" style={{ fontSize: 16 }}>
              The Knot spends millions on paid ads. We spend $0 — because we have a dedicated, indexed page for every city-level venue search in the country.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              {
                title: "8,000+ City Pages",
                body: "Each page targets a unique query: \u201cWedding Venues in [City], [State].\u201d The Knot has one generic state page. We have a dedicated city page for every city we cover.",
              },
              {
                title: "60K New Searches / Week",
                body: "At 2.2M weddings per year, approximately 60,000 new couples begin their venue search each week. 94% start online. We're building the organic answer to their first search.",
              },
              {
                title: "$0 Cost to Acquire Traffic",
                body: "Organic search traffic costs nothing per visitor. Paid acquisition (Google Ads, Meta) runs $50–$200 per user in the wedding category. Our model scales without ad spend.",
              },
              {
                title: "24,599 Venues — Proprietary Dataset",
                body: "Built from scratch via national scraping of Google Places. This dataset — indexed, enriched, and structured — is not available anywhere else and forms the foundation of our content moat.",
              },
            ].map((c) => (
              <Card key={c.title} className="p-6">
                <div className="font-bold text-gray-800 mb-2" style={{ color: "#1e3a22" }}>{c.title}</div>
                <p className="text-sm text-gray-600">{c.body}</p>
              </Card>
            ))}
          </div>

          <Card className="p-7">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">How We Compare: Traffic Acquisition</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {["", "The Knot / WeddingWire", "Zola / WithJoy", "Green Bowtie"].map((h, i) => (
                      <th
                        key={i}
                        className="text-left py-2 pr-4 font-semibold"
                        style={{
                          color: i === 3 ? "#3b6341" : "#6b7280",
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Traffic source", "Paid ads + brand", "Paid ads + brand", "Organic SEO"],
                    ["CAC", "$50–200/user", "$50–200/user", "~$0"],
                    ["City-level pages", "None (state only)", "None", "8,000+"],
                    ["Venue listings", "840K (paid)", "Secondary", "24,599 (free)"],
                    ["Venue cost to list", "$3K–$10K/yr", "Varies", "$0"],
                    ["Revenue model", "Vendor advertising", "Commissions + ads", "Featured + leads"],
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className="py-3 pr-4"
                          style={{
                            fontWeight: j === 0 ? 600 : 400,
                            color: j === 3 ? "#1e3a22" : j === 0 ? "#4b5563" : "#6b7280",
                            background: j === 3 ? "#f0f7f1" : "transparent",
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ── Section 5: Revenue Model ─────────────────────────────────────── */}
        <div>
          <SectionLabel>Section 5</SectionLabel>
          <h2 className="playfair text-2xl font-bold text-gray-800 mb-5">Revenue Model &amp; Path to Monetization</h2>

          <div className="space-y-4">
            {/* Phase 1 */}
            <Card className="p-7">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: "#3b6341" }}
                >1</div>
                <div>
                  <div className="font-bold text-gray-800">Featured Listings</div>
                  <Badge color="green" style={{ marginTop: 2 }}>Now — Phase 1</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-5">
                Venues pay $49–$149/month to appear first in their city. Free base listing always available. Featured placement = priority rank + badge.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {["Conversion Rate", "Paying Venues", "Avg Price", "MRR", "ARR"].map((h) => (
                        <th key={h} className="text-left py-2 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["1%", "246 venues", "$99/mo", "$24,354", "$292K"],
                      ["3%", "738 venues", "$99/mo", "$73,062", "$877K"],
                      ["5%", "1,230 venues", "$99/mo", "$121,770", "$1.46M"],
                    ].map((row, i) => (
                      <tr key={i} className={`border-b border-gray-100 last:border-0 ${i === 1 ? "font-semibold" : ""}`}
                        style={i === 1 ? { background: "#f0f7f1" } : {}}>
                        {row.map((cell, j) => (
                          <td key={j} className="py-2.5 pr-4" style={{ color: i === 1 && j > 2 ? "#166534" : "#374151" }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-3">Based on 24,599 indexed venues. Highlighted row = base case projection.</p>
            </Card>

            {/* Phase 2 */}
            <Card className="p-7">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: "#5a8f62" }}
                >2</div>
                <div>
                  <div className="font-bold text-gray-800">Lead Generation</div>
                  <Badge color="blue" style={{ marginTop: 2 }}>Q2 2026 — Phase 2</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Inquiry forms are already live on every venue page. Phase 2 monetizes this by charging venues per qualified inquiry: $5–$25/lead.
              </p>
              <div className="rounded-xl p-5 text-sm space-y-2" style={{ background: "#f8f7f4", border: "1px solid #e5e7eb" }}>
                <div className="flex justify-between"><span className="text-gray-600">US weddings / year</span><strong>2.2M</strong></div>
                <div className="flex justify-between"><span className="text-gray-600">Couples who hire a venue</span><strong>91% ≈ 2M decisions/yr</strong></div>
                <div className="flex justify-between"><span className="text-gray-600">At 0.1% inquiry flow through Green Bowtie</span><strong>2,000 leads/mo</strong></div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2" style={{ color: "#166534", fontWeight: 700 }}><span>At $10/lead avg</span><strong>$20,000 MRR</strong></div>
              </div>
            </Card>

            {/* Phase 3 */}
            <Card className="p-7">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: "#7ab87e" }}
                >3</div>
                <div>
                  <div className="font-bold text-gray-800">Venue Owner Platform</div>
                  <Badge color="amber" style={{ marginTop: 2 }}>Q3 2026 — Phase 3</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Venue owners claim their listing, manage photos, availability, and profile. Pro tier at $199/month includes analytics, inquiry management, and photo gallery — equivalent to Google Business Profile for wedding venues.
              </p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                {[
                  { tier: "Free", price: "$0/mo", features: "Basic listing, appears in search" },
                  { tier: "Featured", price: "$49–$149/mo", features: "Priority placement, badge, profile boost" },
                  { tier: "Pro", price: "$199/mo", features: "Analytics, inquiries, gallery, availability" },
                ].map((t) => (
                  <div
                    key={t.tier}
                    className="rounded-xl p-4 text-center"
                    style={{
                      border: t.tier === "Pro" ? "2px solid #3b6341" : "1px solid #e5e7eb",
                      background: t.tier === "Pro" ? "#f0f7f1" : "#fafafa",
                    }}
                  >
                    <div className="font-bold text-gray-800 mb-1">{t.tier}</div>
                    <div className="text-lg font-bold mb-2" style={{ color: "#3b6341" }}>{t.price}</div>
                    <div className="text-xs text-gray-500">{t.features}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* TAM for venues */}
            <div
              className="rounded-2xl p-7"
              style={{ background: "linear-gradient(135deg, #3b6341 0%, #1e3a22 100%)", color: "white" }}
            >
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#bbf7d0" }}>Total Addressable Revenue</div>
              <p className="text-xl font-bold mb-3">
                The Knot has 840,000 registered vendors paying avg ~$5,000/year = <span style={{ color: "#bbf7d0" }}>$4.2B annual vendor revenue opportunity</span> in this market.
              </p>
              <p style={{ color: "#d1fae5", fontSize: 14 }}>
                Green Bowtie targets venues specifically — estimated 25,000–50,000 US wedding venues. Even at modest conversion and lower price points, the venue advertising TAM alone supports a significant business.
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 6: Traction ───────────────────────────────────────────── */}
        <div>
          <SectionLabel>Section 6</SectionLabel>
          <h2 className="playfair text-2xl font-bold text-gray-800 mb-5">Traction &amp; Proof Points</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <StatCard value="24,599" label="Venues Indexed Nationally" sub="All 50 states · From scratch via Google Places scraping" />
            <StatCard value="17,635" label="Venues AI-Enriched" sub="Descriptions, pricing, capacity via pipeline" />
            <StatCard value="8,000+" label="City-Level SEO Pages" sub="Each targeting a unique 'venues in [city]' query" />
            <StatCard value="~$60" label="Cost to Build National Dataset" sub="Proprietary data at near-zero marginal cost" />
          </div>

          <Card className="p-7">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">What&apos;s Already Built</div>
            <div className="space-y-3">
              {[
                { status: "✓", label: "National venue database — 24,599 venues, all 50 states" },
                { status: "✓", label: "AI enrichment pipeline — 17,635 venues enriched with descriptions, pricing, capacity" },
                { status: "✓", label: "Phase 2 Knot scraper — 1,000+ cities processed for pricing data" },
                { status: "✓", label: "Inquiry system — live on every venue page" },
                { status: "✓", label: "Venue claiming flow — built and functional" },
                { status: "✓", label: "Internal ops dashboard — internal.greenbowtie.com" },
                { status: "✓", label: "Tech stack: Next.js, Neon, Vercel — near-zero hosting costs at current scale" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 text-sm">
                  <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: "#3b6341" }}>{item.status}</span>
                  <span className="text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Section 7: The Ask ────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Section 7</SectionLabel>
          <h2 className="playfair text-2xl font-bold text-gray-800 mb-5">The Ask</h2>

          <Card className="p-8">
            <p className="text-gray-700 leading-relaxed mb-6" style={{ fontSize: 15 }}>
              We are currently in early discussions with accredited investors for a seed round to accelerate growth. Proceeds would be deployed across three areas:
            </p>
            <div className="space-y-4">
              {[
                {
                  num: "01",
                  title: "Sales & Venue Onboarding",
                  body: "Hire one outbound sales / venue success person to drive featured listing adoption. The product is built — we need systematic outreach to convert venues at scale.",
                },
                {
                  num: "02",
                  title: "Paid Search Validation",
                  body: "Run controlled paid search experiments to validate CAC and LTV assumptions before scaling. Establish unit economics before any significant paid commitment.",
                },
                {
                  num: "03",
                  title: "Product — Billing & Analytics",
                  body: "Complete photo gallery, Stripe billing integration, and analytics dashboard to support the featured listing and Pro tier rollout.",
                },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-4 rounded-xl p-5" style={{ background: "#f8f7f4", border: "1px solid #e5e7eb" }}>
                  <div className="text-lg font-bold flex-shrink-0" style={{ color: "#d1d5db" }}>{item.num}</div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">{item.title}</div>
                    <p className="text-sm text-gray-600">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="rounded-xl p-5 mt-6 text-sm"
              style={{ background: "#f0f7f1", border: "1px solid #bbf7d0" }}
            >
              <strong style={{ color: "#3b6341" }}>Investor contact:</strong>
              <span className="text-gray-600 ml-2">For terms, deck, or financial model — reach out directly via internal.greenbowtie.com.</span>
            </div>
          </Card>
        </div>

        {/* ── Section 8: Sources ────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Section 8</SectionLabel>
          <h2 className="playfair text-2xl font-bold text-gray-800 mb-5">Sources &amp; Methodology</h2>

          <Card className="p-7">
            <p className="text-sm text-gray-600 mb-5">
              All market data is sourced from third-party research firms, industry publications, and primary data collection. Green Bowtie does not independently verify third-party figures but has cross-referenced data points across multiple sources where possible.
            </p>
            <div className="space-y-3 text-sm">
              {[
                {
                  source: "Grand View Research",
                  detail: "US Wedding Services Market Size, Share & Trends Analysis Report (2024). grandviewresearch.com. Cited for: $64.93B US market, 6.8% CAGR 2024–2030.",
                },
                {
                  source: "Nunify / IBISWorld",
                  detail: "Wedding Statistics: Industry Data & Trends (2024). nunify.com/blogs/wedding-statistics. Cited for: $219.8B global market, $327.19B 2028 projection, 91% venue hire rate, $10,700 avg venue spend.",
                },
                {
                  source: "WeddingVenueOwners.com",
                  detail: "Top 50 Wedding Industry Statistics 2024–2025. Cited for: 2.2M annual US weddings, $30,500 avg cost, 94% online search start, 25,000+ US venues, 90% small business vendor share, 9–12 month booking window, 65% outdoor venues.",
                },
                {
                  source: "StoryAmour",
                  detail: "Biggest Wedding Companies & Industry Revenue (2024). storyamour.com. Cited for: The Knot Worldwide ~$455M revenue, $1B merger valuation, 4M+ couples, 840K+ vendors, $414B global 2025 projection.",
                },
                {
                  source: "CivicScience",
                  detail: "Wedding Trends & Statistics 2024. civicscience.com (April 2024). Cited for: Platform market share (The Knot 28%, Zola 19%, WeddingWire 18%, WithJoy 13%, Minted 7%), 53% micro-weddings, 39% budget under $10K.",
                },
                {
                  source: "Growjo / RocketReach",
                  detail: "The Knot Worldwide revenue estimates (~$436–455M). Used as secondary confirmation alongside StoryAmour.",
                },
                {
                  source: "Green Bowtie Proprietary Data",
                  detail: "National venue scraping dataset (March 2026). 24,599 venues sourced from Google Places across all 50 US states. This figure represents Green Bowtie's own primary data collection and is not derived from any third-party source.",
                },
              ].map((s) => (
                <div key={s.source} className="rounded-xl p-4" style={{ background: "#f8f7f4", border: "1px solid #e5e7eb" }}>
                  <div className="font-semibold text-gray-800 mb-1">{s.source}</div>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid #e5e7eb", padding: "20px 24px", textAlign: "center", marginTop: 40 }}>
        <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
          Green Bowtie Internal · Market Intelligence · Confidential · Not indexed · Protected by Cloudflare Access
        </p>
      </footer>
    </div>
  );
}
