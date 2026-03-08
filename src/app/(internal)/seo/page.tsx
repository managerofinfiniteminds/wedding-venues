import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Strategy — Green Bowtie Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function SeoPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f8f7f4", fontFamily: "Nunito Sans, sans-serif", color: "#1a1a1a" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #3b6341 0%, #2f5035 100%)" }} className="text-white py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>Internal Reference</Badge>
            <Badge style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>Last updated: March 2026</Badge>
          </div>
          <h1 className="playfair text-5xl font-bold mb-3">SEO Strategy</h1>
          <p className="text-xl" style={{ color: "#bbf7d0" }}>
            URL hierarchy, city page moat, ranking factors, and open TODOs
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">

        {/* ── URL Hierarchy ─────────────────────────────── */}
        <Card className="p-8">
          <SectionTitle>URL Hierarchy</SectionTitle>
          <p className="text-sm text-gray-500 mb-6">
            Four levels of URL depth — each level targets a progressively more specific keyword, from national to individual venue.
          </p>
          <div className="space-y-2 font-mono text-sm mb-6">
            {[
              { path: "/venues", desc: "US hub — state picker. Ranks for 'wedding venues in the US'" },
              { path: "/venues/california", desc: "State page — 'Wedding Venues in California'" },
              { path: "/venues/california/los-angeles", desc: "City page — 'Wedding Venues in Los Angeles, California'" },
              { path: "/venues/california/calamigos-ranch", desc: "Detail page — 'Calamigos Ranch Wedding Venue Malibu CA'" },
            ].map(r => (
              <div key={r.path} className="flex items-start gap-3 flex-wrap">
                <code className="text-sm px-2 py-0.5 rounded flex-shrink-0" style={{ background: "#f3f4f6", color: "#374151" }}>{r.path}</code>
                <span className="text-gray-500 text-xs leading-6">{r.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Each level links to the next via breadcrumbs, passing link equity down the chain. Google reads this hierarchy and understands the site structure without additional configuration.
          </p>
        </Card>

        {/* ── Why City Pages Are the Moat ─────────────────────────────── */}
        <Card className="p-8">
          <SectionTitle>Why City Pages Are the Moat</SectionTitle>
          <div className="rounded-xl p-5 mb-6 border-l-4 text-sm space-y-3" style={{ background: "#f0f7f1", borderColor: "#3b6341" }}>
            <p>Google indexes <strong>&ldquo;Wedding Venues in Los Angeles, California&rdquo;</strong> as a unique page with unique content. Each city = a unique keyword target with its own SERP.</p>
            <p>We have <strong>8,000+ cities</strong> = 8,000+ potential ranking pages. Competitors like The Knot have 1 generic page per state. At scale, we win simply by existing at every city URL they don&apos;t.</p>
            <p>State pages work the same way but are harder to rank (more competition). City pages are lower competition = faster to rank = faster traffic.</p>
            <p>Organic search = free traffic. The Knot and WeddingWire spend millions on ads. We rank organically by having more indexed pages than any competitor.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {[
              { label: "Our city pages", value: "8,000+", color: "#16a34a", bg: "#dcfce7" },
              { label: "The Knot (est.)", value: "~50", color: "#92400e", bg: "#fef3c7" },
              { label: "WeddingWire (est.)", value: "~50", color: "#92400e", bg: "#fef3c7" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 text-center border" style={{ background: s.bg, borderColor: "#e5e7eb" }}>
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── What Makes Each Page Rank ─────────────────────────────── */}
        <Card className="p-8">
          <SectionTitle>What Makes Each Page Rank</SectionTitle>
          <p className="text-sm text-gray-500 mb-6">
            Every city and state page is dynamically generated with these ranking signals baked in.
          </p>
          <div className="space-y-3">
            {[
              {
                signal: "Unique meta title + description",
                detail: "Dynamically generated per page with city/state/keyword. Never duplicated. Example: \"Wedding Venues in Los Angeles, CA — 142 venues | Green Bowtie\"",
              },
              {
                signal: "H1 matches search intent exactly",
                detail: "\"Wedding Venues in [City], [State]\" — the H1 is the exact phrase someone types into Google. Direct keyword match = strong relevance signal.",
              },
              {
                signal: "Breadcrumb navigation",
                detail: "Home → Venues → California → Los Angeles tells Google the page hierarchy. Also renders as rich breadcrumb snippets in search results.",
              },
              {
                signal: "Venue detail pages = long-tail keywords",
                detail: "Each individual venue page targets low-competition, high-intent keywords. Someone searching 'Calamigos Ranch wedding cost' is ready to book.",
              },
              {
                signal: "Dynamic sitemap.xml",
                detail: "Every venue + city + state URL is listed in the sitemap so Googlebot can discover and index all 8,000+ pages without waiting for organic link discovery.",
              },
            ].map(item => (
              <div key={item.signal} className="flex items-start gap-4 rounded-xl p-4 border text-sm" style={{ background: "#fafafa", borderColor: "#e5e7eb" }}>
                <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ background: "#3b6341" }} />
                <div>
                  <div className="font-semibold text-gray-800 mb-0.5">{item.signal}</div>
                  <div className="text-gray-500">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Open SEO TODOs ─────────────────────────────── */}
        <Card className="p-8">
          <SectionTitle>Open SEO TODOs</SectionTitle>
          <p className="text-sm text-gray-500 mb-6">These are the highest-leverage remaining SEO items. Complete these before scaling to new states.</p>
          <div className="space-y-3">
            <TodoRow priority="high" label="Schema.org LocalBusiness markup">
              Unlocks rich snippets in Google — stars, price range, hours shown directly in search results. Add to every venue detail page. High SEO value, relatively low implementation effort.
            </TodoRow>
            <TodoRow priority="high" label="Google Search Console — submit sitemap">
              Without this, Google discovers pages slowly via crawl. Submitting the sitemap gets all 8,000+ city pages indexed faster. Takes 5 minutes. Do this immediately.
            </TodoRow>
            <TodoRow priority="high" label="Photo alt text — keyword-rich on every image">
              Every venue photo needs alt text like &ldquo;Calamigos Ranch outdoor ceremony space Malibu CA&rdquo;. Google image search is a real traffic source for wedding venues.
            </TodoRow>
            <TodoRow priority="medium" label="Canonical URLs on filtered pages">
              When users filter venues by style/capacity/price, duplicate content is created. Canonical tags tell Google which URL is the &ldquo;real&rdquo; one to index. Prevents duplicate content penalties.
            </TodoRow>
          </div>
        </Card>

        <div className="text-center text-sm text-gray-400 pb-8">
          Green Bowtie SEO Strategy &middot; March 2026 &middot; Internal — not indexed
        </div>
      </div>
    </div>
  );
}

// ── Mini component helpers ────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-gray-200 ${className}`}>{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="playfair text-2xl font-bold text-gray-800 mb-5">{children}</h2>;
}

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  green:  { bg: "#dcfce7", color: "#166534" },
  blue:   { bg: "#dbeafe", color: "#1e40af" },
  purple: { bg: "#ede9fe", color: "#6d28d9" },
  amber:  { bg: "#fef3c7", color: "#92400e" },
  red:    { bg: "#fee2e2", color: "#991b1b" },
  gray:   { bg: "#f3f4f6", color: "#374151" },
};

function Badge({
  children,
  color = "gray",
  style: s,
}: {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}) {
  const c = BADGE_COLORS[color] ?? BADGE_COLORS.gray;
  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
      style={{ background: c.bg, color: c.color, ...s }}
    >
      {children}
    </span>
  );
}

function TodoRow({
  priority,
  label,
  children,
}: {
  priority: "high" | "medium" | "low";
  label: string;
  children: React.ReactNode;
}) {
  const pMap = {
    high:   { color: "red",   label: "High" },
    medium: { color: "amber", label: "Medium" },
    low:    { color: "gray",  label: "Low" },
  };
  const p = pMap[priority];
  return (
    <div className="flex items-start gap-3 rounded-xl p-4 border text-sm" style={{ background: "#fafafa", borderColor: "#e5e7eb" }}>
      <span className="text-lg flex-shrink-0 mt-0.5">○</span>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-gray-800">{label}</span>
          <Badge color={p.color}>{p.label} priority</Badge>
        </div>
        <div className="text-gray-500">{children}</div>
      </div>
    </div>
  );
}
