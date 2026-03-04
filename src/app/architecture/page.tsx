import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architecture & Tech Stack",
  description: "Green Bowtie technology architecture — stack, infrastructure, testing, CI/CD pipeline, and data pipeline overview.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen" style={{ background: "#f8f7f5", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #3b6341 0%, #2f5035 100%)" }} className="text-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Badge style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>Architecture Doc</Badge>
            <Badge style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>v2.0 · March 2026</Badge>
          </div>
          <h1 className="playfair text-5xl font-bold mb-3">Green Bowtie</h1>
          <p className="text-xl mb-6" style={{ color: "#bbf7d0" }}>Technology Architecture &amp; Infrastructure Overview</p>
          <div className="flex flex-wrap gap-6 text-sm">
            {[
              { label: "Domain", value: "greenbowtie.com" },
              { label: "Venues", value: "2,786 live" },
              { label: "Geocoded", value: "2,115 pins" },
              { label: "States", value: "51 configured" },
              { label: "Tests", value: "52 unit + 10 E2E" },
            ].map((s, i) => (
              <div key={s.label} className={i > 0 ? "border-l pl-6" : ""} style={{ borderColor: "#4a7a50" }}>
                <div style={{ color: "#86efac" }}>{s.label}</div>
                <strong>{s.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: "52", label: "Unit Tests" },
            { num: "10", label: "End-to-End (E2E) Tests" },
            { num: "2,786", label: "Live CA Venues" },
            { num: "51", label: "States Configured" },
          ].map(s => (
            <Card key={s.label} className="p-5 text-center">
              <div className="text-4xl font-bold" style={{ color: "#3b6341" }}>{s.num}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Tech Stack */}
        <Card className="p-8">
          <SectionTitle>Technology Stack</SectionTitle>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <SubTitle>Frontend</SubTitle>
              <div className="space-y-4">
                <StackItem icon="⚛️" title="Next.js 16" badge="App Router" badgeColor="blue">React framework — SSR, SSG, API routes. Chosen for SEO and performance.</StackItem>
                <StackItem icon="🎨" title="Tailwind CSS v4" badge="Utility-first" badgeColor="blue">Uses <Code>@import "tailwindcss"</Code> syntax (v4 breaking change from v3).</StackItem>
                <StackItem icon="🔤" title="Playfair Display + Inter">Playfair for headings (elegant), Inter for body (clean, readable).</StackItem>
                <StackItem icon="🗺️" title="Leaflet.js" badge="Free · No API key" badgeColor="green">Interactive map. OpenStreetMap tiles. Dynamic import (SSR disabled).</StackItem>
              </div>
            </div>
            <div>
              <SubTitle>Backend &amp; Data</SubTitle>
              <div className="space-y-4">
                <StackItem icon="🐘" title="PostgreSQL 17 via Neon" badge="Serverless" badgeColor="purple">Hosted on Neon.tech. Serverless Postgres — scales to zero, HTTP-compatible.</StackItem>
                <StackItem icon="🔷" title="Prisma 7 ORM" badge="pg adapter" badgeColor="blue">Uses <Code>@prisma/adapter-pg</Code> — required for Neon serverless compatibility.</StackItem>
                <StackItem icon="📍" title="Nominatim Geocoding" badge="Free · No key" badgeColor="green">OpenStreetMap geocoding. 1 req/sec rate limit. 2,115/2,786 venues geocoded.</StackItem>
                <StackItem icon="🌎" title="Google Places API" badge="Paid · Key restricted" badgeColor="amber">Used for initial data scraping only. Key restricted to greenbowtie.com domain.</StackItem>
              </div>
            </div>
          </div>
        </Card>

        {/* Infrastructure */}
        <Card className="p-8">
          <SectionTitle>Infrastructure &amp; Services</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <InfraCard icon="▲" title="Vercel" badge="Hosting" bg="#f0f7f1" border="#c6e0c8">Auto-deploys on every GitHub push to <Code>main</Code>. ~45 second deploy time. Free tier. Global CDN.</InfraCard>
            <InfraCard icon="🐘" title="Neon" badge="Database" bg="#eff6ff" border="#bfdbfe">Serverless PostgreSQL. Pooled connection URL for app. Direct URL for migrations. Free tier.</InfraCard>
            <InfraCard icon="📊" title="Plausible" badge="Analytics" bg="#fff7ed" border="#fed7aa">Privacy-first analytics. No cookies, no GDPR banner. Tracks visitors, top pages, referrers.</InfraCard>
            <InfraCard icon="🐙" title="GitHub" badge="Source Control" bg="#fdf4ff" border="#e9d5ff">Repo: <Code>managerofinfiniteminds/wedding-venues</Code>. CI on every push. v0.1.0 and v0.2.0 tagged.</InfraCard>
            <InfraCard icon="⚙️" title="GitHub Actions CI" badge="CI/CD" bg="#f0fdf4" border="#bbf7d0">Runs on every push: install → prisma generate → unit tests → build. Blocks bad code.</InfraCard>
            <InfraCard icon="🌐" title="GoDaddy + Vercel DNS" badge="Domain" bg="#fff1f2" border="#fecdd3">A record → 216.198.79.1 (Vercel). CNAME www → cname.vercel-dns.com. SSL auto-managed.</InfraCard>
          </div>
        </Card>

        {/* URL Architecture */}
        <Card className="p-8">
          <SectionTitle>URL Architecture</SectionTitle>
          <p className="text-sm text-gray-500 mb-5">Hierarchical routing — built to scale from 1 state to 50+</p>
          <div className="space-y-2.5 font-mono text-sm">
            {[
              { method: "GET", color: "green", path: "/venues", desc: "US hub — state picker (51 states)" },
              { method: "GET", color: "green", path: "/venues/california", desc: "CA results — filters, sort, search, 2,786 venues" },
              { method: "GET", color: "green", path: "/venues/texas", desc: "Coming Soon page with email capture" },
              { method: "GET", color: "green", path: "/venues/california/[slug]", desc: "Venue detail — SEO, JSON-LD, Open Graph" },
              { method: "301", color: "amber", path: "/venues/[slug]", desc: "Legacy redirect → /venues/california/[slug]" },
              { method: "GET", color: "blue", path: "/map", desc: "Leaflet map — 2,115 geocoded pins" },
              { method: "API", color: "blue", path: "/api/venues", desc: "Paginated venue results (Load More)" },
              { method: "API", color: "blue", path: "/api/venues/map", desc: "Geocoded venues for map pins" },
              { method: "API", color: "blue", path: "/api/cities", desc: "City autocomplete for search bar" },
              { method: "AUTO", color: "gray", path: "/sitemap.xml", desc: "Dynamic sitemap — all 2,786 venue URLs" },
              { method: "AUTO", color: "gray", path: "/robots.txt", desc: "Search engine crawl rules" },
            ].map(r => (
              <div key={r.path} className="flex items-center gap-3">
                <Badge color={r.color}>{r.method}</Badge>
                <code className="text-sm px-2 py-0.5 rounded" style={{ background: "#f3f4f6" }}>{r.path}</code>
                <span className="text-gray-400 text-xs">{r.desc}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Data Pipeline */}
        <Card className="p-8">
          <SectionTitle>Data Pipeline</SectionTitle>
          <p className="text-sm text-gray-500 mb-6">How 2,786 real wedding venues got into the database</p>
          <div className="flex flex-wrap items-center gap-3 mb-6 text-xs">
            {[
              { label: "Google Places API", sub: "scrape-venues-full.ts" },
              { label: "Raw JSON", sub: "7,928 venues" },
              { label: "Quality Filter v1", sub: "quality-filter.ts" },
              { label: "AI Filter v2", sub: "quality-filter-v2.ts" },
              { label: "Seed DB", sub: "2,786 venues" },
              { label: "Nominatim Geocode", sub: "2,115 pins" },
              { label: "Bounds Check", sub: "fix-bad-coords.ts" },
            ].map((s, i, arr) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="rounded-xl px-3 py-2 text-center font-semibold border-2 text-xs" style={{ background: "#f0f7f1", borderColor: "#3b6341", color: "#3b6341", minWidth: 90 }}>
                  {s.label}<br /><span className="font-normal text-gray-400">{s.sub}</span>
                </div>
                {i < arr.length - 1 && <span className="text-gray-400 font-bold">→</span>}
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg p-4 border" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
              <div className="font-semibold mb-1">📡 Scraping</div>
              <div className="text-gray-600">159 Google Places text queries + geographic grid scan. API key env-var only — never in code.</div>
            </div>
            <div className="rounded-lg p-4 border" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
              <div className="font-semibold mb-1">🧹 Filtering</div>
              <div className="text-gray-600">Removed racetracks, churches, simulators, community centers. 2 rounds — rules-based then AI.</div>
            </div>
            <div className="rounded-lg p-4 border" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
              <div className="font-semibold mb-1">📍 Geocoding</div>
              <div className="text-gray-600">Nominatim free geocoding (~1 req/sec). CA bounds check: lat 32.5–42.0, lng -124.5 to -114.1.</div>
            </div>
          </div>
        </Card>

        {/* Testing */}
        <Card className="p-8">
          <SectionTitle>Testing Strategy</SectionTitle>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge color="blue">Vitest + React Testing Library</Badge>
                <span className="font-semibold text-sm">52 Unit Tests</span>
              </div>
              <div className="space-y-1.5 text-sm">
                {[
                  "states.test.ts — 15 tests (all 51 states valid, slugs match keys, live/coming-soon)",
                  "filters.test.ts — 12 tests (where clause logic, multi-filter combos)",
                  "urlParams.test.ts — 13 tests (filter URL building, toggle, clear)",
                  "VenueCard.test.tsx — 12 tests (renders, expand/collapse, contact info)",
                ].map(t => <TestPass key={t}>{t}</TestPass>)}
              </div>
              <pre className="mt-4 text-xs rounded-xl p-4" style={{ background: "#0f1117", color: "#e2e8f0", lineHeight: 1.7 }}>
{`npm test
`}<span style={{ color: "#6b7280" }}>{` Test Files  4 passed (4)
      Tests  52 passed (52)
   Duration  533ms`}</span>
              </pre>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge color="purple">Playwright · Chromium</Badge>
                <span className="font-semibold text-sm">10 End-to-End (E2E) Smoke Tests</span>
              </div>
              <p className="text-xs text-gray-400 mb-3 italic">E2E = End-to-End. Opens a real Chromium browser, navigates pages, and verifies content like a real user — catches broken routes, DB failures, and missing pages that unit tests can&apos;t.</p>
              <div className="space-y-1.5 text-sm">
                {[
                  "US hub loads — all 51 state cards visible",
                  "CA results page loads venues + List/Map toggle",
                  "Filter by region works (Napa Valley)",
                  "Coming soon state page (Texas)",
                  "Legacy URL redirect /venues/[slug] → /venues/california/[slug]",
                  "Map page loads",
                  "sitemap.xml returns 200 + contains venue URLs",
                  "robots.txt accessible",
                  "Nav has Browse States + Map links",
                  "Unknown routes return 404",
                ].map(t => <TestPass key={t}>{t}</TestPass>)}
              </div>
            </div>
          </div>
        </Card>

        {/* CI/CD */}
        <Card className="p-8">
          <SectionTitle>CI/CD Pipeline</SectionTitle>
          <p className="text-sm text-gray-500 mb-5">Every push to GitHub triggers this pipeline. Bad code can&apos;t reach production.</p>
          <div className="flex flex-wrap items-center gap-3 mb-6 text-xs">
            {[
              "👨‍💻 Push to GitHub",
              "⚙️ GitHub Actions CI",
              "📦 npm install + prisma generate",
              "🧪 52 Unit Tests",
              "🏗️ next build (TypeScript)",
              "▲ Vercel Deploy (~45s)",
              "🌐 Live on greenbowtie.com",
            ].map((s, i, arr) => (
              <div key={s} className="flex items-center gap-3">
                <div className="rounded-xl px-3 py-2 text-center font-semibold border-2 text-xs" style={{ background: "#f0f7f1", borderColor: "#3b6341", color: "#3b6341", minWidth: 90 }}>
                  {s}
                </div>
                {i < arr.length - 1 && <span className="text-gray-400 font-bold">→</span>}
              </div>
            ))}
          </div>
          <pre className="text-xs rounded-xl p-4" style={{ background: "#0f1117", color: "#e2e8f0", lineHeight: 1.7 }}>
{`# .github/workflows/ci.yml
`}<span style={{ color: "#c084fc" }}>on:</span>{` push to main or feature/** branches
`}<span style={{ color: "#c084fc" }}>services:</span>{` postgres:16 (test DB)

`}<span style={{ color: "#c084fc" }}>steps:</span>{`
  `}<span style={{ color: "#fbbf24" }}>1.</span>{` checkout + node 22 setup
  `}<span style={{ color: "#fbbf24" }}>2.</span>{` npm ci
  `}<span style={{ color: "#fbbf24" }}>3.</span>{` npx prisma generate
  `}<span style={{ color: "#fbbf24" }}>4.</span>{` npx prisma migrate deploy
  `}<span style={{ color: "#fbbf24" }}>5.</span>{` npm test  `}<span style={{ color: "#6b7280" }}>← 52 tests must pass</span>{`
  `}<span style={{ color: "#fbbf24" }}>6.</span>{` npm run build  `}<span style={{ color: "#6b7280" }}>← TypeScript must compile clean
  → if any step fails: deployment blocked</span>
          </pre>
        </Card>

        {/* SEO + Security */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8">
            <SectionTitle>SEO Configuration</SectionTitle>
            <div className="space-y-2.5 text-sm">
              <CheckItem done>generateMetadata() on every venue detail page</CheckItem>
              <CheckItem done>JSON-LD LocalBusiness structured data</CheckItem>
              <CheckItem done>Open Graph + Twitter card meta tags</CheckItem>
              <CheckItem done>Dynamic /sitemap.xml — 2,786+ venue URLs</CheckItem>
              <CheckItem done>/robots.txt — crawl rules configured</CheckItem>
              <CheckItem done>metadataBase set to greenbowtie.com</CheckItem>
              <CheckItem done>Plausible Analytics — privacy-first, GDPR compliant</CheckItem>
              <CheckItem>Google Search Console — submit sitemap</CheckItem>
              <CheckItem>Canonical URLs for filtered pages</CheckItem>
            </div>
          </Card>
          <Card className="p-8">
            <SectionTitle>Security</SectionTitle>
            <div className="space-y-2.5 text-sm">
              <CheckItem done>All API keys in environment variables — never in code</CheckItem>
              <CheckItem done>Git history scrubbed via git filter-repo (42 commits)</CheckItem>
              <CheckItem done>.gitignore covers .env*, raw JSON scrape files</CheckItem>
              <CheckItem done>SSL auto-managed by Vercel (Let&apos;s Encrypt)</CheckItem>
              <CheckItem done>DATABASE_URL uses pooled Neon connection</CheckItem>
              <CheckItem>Google Places API key — restrict to greenbowtie.com in Google Cloud</CheckItem>
            </div>
          </Card>
        </div>

        {/* Version History */}
        <Card className="p-8">
          <SectionTitle>Version History</SectionTitle>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-16 text-right flex-shrink-0"><Badge color="green">v0.2.0</Badge></div>
              <div>
                <div className="font-semibold text-gray-800">US Routing — March 2026</div>
                <div className="text-sm text-gray-500">Multi-state URL structure, /venues hub, all 50 US states + Puerto Rico, states.ts single source of truth, 52 tests, Vercel deploy, Neon DB</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-16 text-right flex-shrink-0"><Badge color="gray">v0.1.0</Badge></div>
              <div>
                <div className="font-semibold text-gray-800">California Beta — March 2026</div>
                <div className="text-sm text-gray-500">2,786 CA venues from Google Places, expandable cards, Leaflet map, SEO, sitemap, mobile responsive, Plausible analytics</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center text-sm text-gray-400 pb-8">
          Green Bowtie Architecture Doc · March 2026 · <a href="https://greenbowtie.com" className="hover:text-gray-600">greenbowtie.com</a>
        </div>
      </div>
    </div>
  );
}

// ── Mini component helpers ──────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-gray-200 ${className}`}>{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="playfair text-2xl font-bold text-gray-800 mb-5">{children}</h2>;
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{children}</h3>;
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: "#f3f4f6", color: "#374151" }}>{children}</code>;
}

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  green:  { bg: "#dcfce7", color: "#166534" },
  blue:   { bg: "#dbeafe", color: "#1e40af" },
  purple: { bg: "#ede9fe", color: "#6d28d9" },
  amber:  { bg: "#fef3c7", color: "#92400e" },
  pink:   { bg: "#fce7f3", color: "#9d174d" },
  gray:   { bg: "#f3f4f6", color: "#374151" },
};

function Badge({ children, color = "gray", style: s }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  const c = BADGE_COLORS[color] ?? BADGE_COLORS.gray;
  return (
    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
      style={{ background: c.bg, color: c.color, ...s }}>
      {children}
    </span>
  );
}

function StackItem({ icon, title, badge, badgeColor, children }: { icon: string; title: string; badge?: string; badgeColor?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
          {title} {badge && <Badge color={badgeColor}>{badge}</Badge>}
        </div>
        <div className="text-sm text-gray-500 mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function InfraCard({ icon, title, badge, bg, border, children }: { icon: string; title: string; badge: string; bg: string; border: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 text-sm" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold text-gray-800 mb-1">{title}</div>
      <Badge color="gray" style={{ marginBottom: 8 }}>{badge}</Badge>
      <div className="text-gray-600 mt-2">{children}</div>
    </div>
  );
}

function TestPass({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-2" style={{ color: "#16a34a" }}>✓ <span className="text-gray-700">{children}</span></div>;
}

function CheckItem({ children, done }: { children: React.ReactNode; done?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-lg" style={{ color: done ? "#16a34a" : "#f59e0b" }}>{done ? "✓" : "○"}</span>
      <span>{children}</span>
    </div>
  );
}
