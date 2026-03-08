import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stack & SEO Reference — Green Bowtie Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function StackPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f8f7f4", fontFamily: "Nunito Sans, sans-serif", color: "#1a1a1a" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #3b6341 0%, #2f5035 100%)" }} className="text-white py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>Internal Reference</Badge>
            <Badge style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>Last updated: March 2026</Badge>
          </div>
          <h1 className="playfair text-5xl font-bold mb-3">Stack &amp; SEO</h1>
          <p className="text-xl" style={{ color: "#bbf7d0" }}>
            Complete technical reference — services, SEO strategy, data pipeline, auth &amp; deployment
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">

        {/* ── 1. SEO Strategy ─────────────────────────────── */}
        <Card className="p-8">
          <SectionTitle>1. SEO Strategy</SectionTitle>
          <p className="text-sm text-gray-500 mb-6">
            Organic search = free traffic. The Knot and WeddingWire spend millions on ads. We rank organically by having more indexed pages than any competitor.
          </p>

          <SubTitle>URL Hierarchy</SubTitle>
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

          <SubTitle>Why City Pages Are the Moat</SubTitle>
          <div className="rounded-xl p-5 mb-6 border-l-4 text-sm space-y-2" style={{ background: "#f0f7f1", borderColor: "#3b6341" }}>
            <p>Google indexes <strong>&ldquo;Wedding Venues in Los Angeles, California&rdquo;</strong> as a unique page with unique content. Each city = a unique keyword target with its own SERP.</p>
            <p>We have <strong>8,000+ cities</strong> = 8,000+ potential ranking pages. Competitors like The Knot have 1 generic page per state. At scale, we win simply by existing at every city URL they don&apos;t.</p>
            <p>State pages work the same way but are harder to rank (more competition). City pages are lower competition = faster to rank = faster traffic.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <SubTitle>What Makes Each Page Rank</SubTitle>
              <div className="space-y-2 text-sm text-gray-700">
                <BulletItem>Unique meta title + description per page, dynamically generated with city/state/keyword</BulletItem>
                <BulletItem>H1 tag matches search intent exactly: &ldquo;Wedding Venues in [City], [State]&rdquo;</BulletItem>
                <BulletItem>Breadcrumbs (Home → Venues → California → Los Angeles) tell Google the page hierarchy</BulletItem>
                <BulletItem>Venue detail pages = long-tail keywords with low competition and high purchase intent</BulletItem>
                <BulletItem>Dynamic sitemap.xml lists every venue + city + state URL for Googlebot to find</BulletItem>
              </div>
            </div>
            <div>
              <SubTitle>Still Needed (High Priority)</SubTitle>
              <div className="space-y-2 text-sm text-gray-700">
                <TodoItem>Schema.org LocalBusiness markup — unlocks rich snippets (stars, hours, price) in Google results</TodoItem>
                <TodoItem>Google Search Console — submit sitemap so Google knows to crawl all 8,000+ pages</TodoItem>
                <TodoItem>Photo alt text — every venue photo needs keyword-rich alt text for image search</TodoItem>
                <TodoItem>Canonical URLs on filtered pages — prevent duplicate content penalties</TodoItem>
              </div>
            </div>
          </div>
        </Card>

        {/* ── 2. Services & APIs ──────────────────────────── */}
        <Card className="p-8">
          <SectionTitle>2. Services &amp; APIs</SectionTitle>

          <SubTitle>Hosting &amp; Infrastructure</SubTitle>
          <div className="space-y-3 mb-8">
            <ServiceRow name="Vercel" badge="CRITICAL" badgeLevel="critical" icon="▲">
              Next.js hosting. Auto-deploys on every push to <Code>main</Code> (~45s deploy). Global edge network, SSL auto-managed. Free tier.
            </ServiceRow>
            <ServiceRow name="Cloudflare" badge="CRITICAL" badgeLevel="critical" icon="🌐">
              DNS, CDN, DDoS protection. Also provides <strong>Cloudflare Access</strong> for the internal subdomain (OTP email gate). Free tier.
            </ServiceRow>
            <ServiceRow name="Neon" badge="CRITICAL" badgeLevel="critical" icon="🐘">
              Serverless PostgreSQL. Production database. Scales to zero when idle. Free tier (0.5 GB storage). Uses pooled connection URL for app, direct URL for migrations.
            </ServiceRow>
          </div>

          <SubTitle>APIs</SubTitle>
          <div className="space-y-3 mb-8">
            <ServiceRow name="Google Places API" badge="IMPORTANT" badgeLevel="important" icon="📍">
              Used for initial venue data scraping — name, address, phone, website, photos, ratings. Paid per request. Key restricted to <Code>greenbowtie.com</Code>. <strong>One-time scraping only, not ongoing.</strong>
            </ServiceRow>
            <ServiceRow name="Outscraper" badge="IMPORTANT" badgeLevel="important" icon="🔍">
              Alternative Google Places scraper used for some states. Paid per result. One-time use. Good for bulk scraping without hitting Google rate limits.
            </ServiceRow>
            <ServiceRow name="OpenRouter" badge="IMPORTANT" badgeLevel="important" icon="🤖">
              AI API aggregator. Used for deep enrichment — venue descriptions, style tag classification, completeness scoring. Pay per token. Supports multiple model providers (Gemini, Grok, etc.).
            </ServiceRow>
            <ServiceRow name="Resend" badge="IMPORTANT" badgeLevel="important" icon="📧">
              Transactional email. Inquiry notifications to venue owners + confirmation emails to couples. Free tier (3,000/mo). Requires <Code>RESEND_API_KEY</Code> in Vercel env vars. <strong>Currently NOT active — inquiries silently fail without it.</strong>
            </ServiceRow>
            <ServiceRow name="Anthropic Claude (Claude Code CLI)" badge="DEV ONLY" badgeLevel="optional" icon="🤖">
              Used for coding via Claude Code CLI. Not in production app — dev tooling only.
            </ServiceRow>
            <ServiceRow name="Nominatim (OpenStreetMap)" badge="OPTIONAL" badgeLevel="optional" icon="🗺️">
              Free geocoding. Converts venue addresses to lat/lng coordinates for map pins. No API key required. Rate limit: 1 req/sec. Run the geocoding script periodically as new venues are added.
            </ServiceRow>
          </div>

          <SubTitle>Data Sources (Scraping)</SubTitle>
          <div className="space-y-3 mb-8">
            <ServiceRow name="The Knot" badge="IMPORTANT" badgeLevel="important" icon="💍">
              Scraped for pricing, guest capacity, and venue presence signal. Uses Playwright + CDP connecting to persistent Chrome at port 18800. Phase 2 scraper currently running (~1,156 / 8,089 cities done).
            </ServiceRow>
            <ServiceRow name="WeddingWire" badge="PLANNED" badgeLevel="optional" icon="💐">
              Planned enrichment. Similar to The Knot — pricing, capacity, reviews. Not yet started.
            </ServiceRow>
            <ServiceRow name="Venue Websites (Phase 1)" badge="IMPORTANT" badgeLevel="important" icon="🌍">
              Phase 1 scraper visits each venue&apos;s own website to extract descriptions, amenities, policies. Richer than aggregator data. Script: <Code>phase1-website.ts</Code>.
            </ServiceRow>
          </div>

          <SubTitle>Storage</SubTitle>
          <div className="space-y-3">
            <ServiceRow name="Cloudflare R2" badge="IMPORTANT" badgeLevel="important" icon="🪣">
              Object storage for venue photos. Bucket: <Code>greenbowtie-photos</Code>. Cheaper than AWS S3 (zero egress fees). Photos served via custom domain <Code>photos.greenbowtie.com</Code> (planned). Currently in use for CA photos.
            </ServiceRow>
          </div>
        </Card>

        {/* ── 3. Database Schema ──────────────────────────── */}
        <Card className="p-8">
          <SectionTitle>3. Database Schema</SectionTitle>
          <p className="text-sm text-gray-500 mb-6">4 models. Managed via Prisma migrations. Production on Neon.</p>

          <div className="grid md:grid-cols-2 gap-5">
            <SchemaCard name="Venue" icon="🏛️" fieldCount="80+ fields">
              Core model. Fields cover: identity (name, slug, phone, website), location (address, city, state, lat/lng), capacity (min/max guests), pricing (starting price, pricing model), spaces (indoor/outdoor/# of spaces), inclusions (catering, bar, planner), vendor policy (preferred/open), aesthetics (style tags), social proof (rating, review count), media (photos array), data quality (completeness score, pipeline status), audit (enriched at timestamps), monetization (owner claimed, Stripe plan).
            </SchemaCard>
            <SchemaCard name="Inquiry" icon="💌" fieldCount="~15 fields">
              Contact form submissions from couples. Captures: wedding date, guest count, budget, message, couple name/email. Status workflow: <Code>new</Code> → <Code>viewed</Code> → <Code>responded</Code> → <Code>booked</Code> / <Code>lost</Code>. Linked to a Venue.
            </SchemaCard>
            <SchemaCard name="VenueOwner" icon="👤" fieldCount="~10 fields">
              Claimed venue accounts. Magic link auth (no passwords). Fields: email, linked venue, Stripe plan (<Code>free</Code> / <Code>featured</Code> / <Code>pro</Code>), sessionToken, sessionExpiry (7-day). Created when a venue owner claims their listing.
            </SchemaCard>
            <SchemaCard name="ClaimToken" icon="🔑" fieldCount="~5 fields">
              One-time magic link tokens for the venue claiming flow. Token string, email, venue ID, expiry, used flag. Consumed on first use. Sent via Resend.
            </SchemaCard>
          </div>
        </Card>

        {/* ── 4. Data Pipeline ────────────────────────────── */}
        <Card className="p-8">
          <SectionTitle>4. Data Pipeline</SectionTitle>
          <p className="text-sm text-gray-500 mb-6">Run in order. Each step builds on the previous. All scripts in <Code>scripts/</Code>.</p>

          <div className="space-y-3">
            <PipelineStep num={1} name="Seed" script="outscraper-scrape.ts, outscraper-seed.ts" status="done">
              Raw data from Google Places API or Outscraper. Gets: venue name, address, phone, website URL, Google rating, review count, Google photo references. This is the foundation row — all other steps enrich it.
            </PipelineStep>
            <PipelineStep num={2} name="Phase 1 — Website Scrape" script="phase1-website.ts" status="done">
              Playwright visits each venue&apos;s own website. Extracts: description text, amenities list, policies, contact info, og:image for photos. Higher quality than aggregator data because it&apos;s directly from the venue.
            </PipelineStep>
            <PipelineStep num={3} name="Deep Enrich (AI)" script="deep-enrich.ts" status="done">
              OpenRouter AI generates polished venue descriptions, classifies style tags (rustic, modern, garden, etc.), and scores data completeness. Per-state checkpoints so it can resume after interruption. Pay-per-token via OpenRouter.
            </PipelineStep>
            <PipelineStep num={4} name="Phase 2 — The Knot Scrape" script="phase2-knot-cities.ts" status="running">
              Playwright scrapes The Knot city pages. Fuzzy-matches venues by name. Adds: starting price, guest capacity (min/max). Currently running — ~1,156 / 8,089 cities done. State stored in <Code>phase2-state.json</Code>.
            </PipelineStep>
            <PipelineStep num={5} name="Geocoding" script="geocode-venues.ts" status="done">
              Nominatim (OpenStreetMap) converts venue addresses to lat/lng. Required for map page pins. 1 req/sec rate limit — run overnight for large batches. Idempotent (skips already-geocoded venues).
            </PipelineStep>
            <PipelineStep num={6} name="Photo Sync" script="scripts/photos/" status="partial">
              Downloads og:image from venue websites, uploads to Cloudflare R2 bucket <Code>greenbowtie-photos</Code>. Google Places photo URLs embed the API key so they need to be proxied/cached. Currently done for CA.
            </PipelineStep>
            <PipelineStep num={7} name="Neon Sync" script="sync_to_neon.ts" status="done">
              Pushes local SQLite enrichment results to production Neon PostgreSQL. Run after any enrichment step to make changes live. Idempotent upsert by venue ID.
            </PipelineStep>
          </div>
        </Card>

        {/* ── 5. Tech Stack ───────────────────────────────── */}
        <Card className="p-8">
          <SectionTitle>5. Tech Stack</SectionTitle>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <SubTitle>Frontend</SubTitle>
              <div className="space-y-4">
                <StackItem icon="⚛️" title="Next.js 15 (App Router)" badge="SSR + SSG" badgeColor="blue">
                  React framework. Server-side rendering for SEO, static generation for performance. API routes co-located. Chosen because SEO is mission-critical.
                </StackItem>
                <StackItem icon="🎨" title="Tailwind CSS v4" badge="v4 — @import syntax" badgeColor="amber">
                  Uses <Code>@import &quot;tailwindcss&quot;</Code> syntax — this is a <strong>v4 breaking change from v3</strong>. Do not use the old <Code>@tailwind base/components/utilities</Code> directives.
                </StackItem>
                <StackItem icon="🗺️" title="Leaflet.js" badge="Free · No API key" badgeColor="green">
                  Interactive venue map. OpenStreetMap tiles. Dynamic import with <Code>ssr: false</Code> (Leaflet requires browser). No API key, no cost.
                </StackItem>
                <StackItem icon="🧩" title="shadcn/ui" badge="Component library" badgeColor="gray">
                  Radix-based component library. Copy-paste into codebase. Tailwind-styled. Used for dialog, select, badge, etc.
                </StackItem>
              </div>
            </div>
            <div>
              <SubTitle>Backend &amp; Data</SubTitle>
              <div className="space-y-4">
                <StackItem icon="🔷" title="TypeScript" badge="Throughout" badgeColor="blue">
                  Type safety on all code — frontend, backend, scripts. Catches errors at compile time. Required for Vercel build to pass.
                </StackItem>
                <StackItem icon="🐘" title="Prisma 7 ORM" badge="@prisma/adapter-pg" badgeColor="purple">
                  ORM for all DB access. Uses <Code>@prisma/adapter-pg</Code> — this is <strong>required for Neon serverless</strong> compatibility. Standard Prisma client doesn&apos;t work with Neon&apos;s serverless driver.
                </StackItem>
                <StackItem icon="🎭" title="Playwright" badge="Scraping + CDP" badgeColor="gray">
                  Browser automation for scraping The Knot and venue websites. Connects via CDP to a persistent Chrome instance at port 18800. Avoids spinning up a new browser per run.
                </StackItem>
              </div>
            </div>
          </div>
        </Card>

        {/* ── 6. Auth & Security ──────────────────────────── */}
        <Card className="p-8">
          <SectionTitle>6. Auth &amp; Security</SectionTitle>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <SubTitle>Access Control</SubTitle>
              <div className="space-y-3 text-sm">
                <SecurityItem icon="🛡️" label="Internal subdomain">
                  <Code>internal.greenbowtie.com</Code> protected by <strong>Cloudflare Access</strong>. OTP email login — only <Code>wayne@elsalvadorimports.com</Code> is allowed. No passwords, no session management needed in the app.
                </SecurityItem>
                <SecurityItem icon="🔗" label="Venue owner auth">
                  Magic link email flow. No passwords ever. On claim: generate <Code>ClaimToken</Code>, send via Resend, consume on click, create <Code>VenueOwner</Code> session. <Code>sessionToken</Code> in DB, 7-day expiry.
                </SecurityItem>
                <SecurityItem icon="🚫" label="No public admin panel">
                  All admin via internal subdomain or direct Neon DB access (Neon console / psql). No exposed admin routes on the public site.
                </SecurityItem>
              </div>
            </div>
            <div>
              <SubTitle>API Key Security</SubTitle>
              <div className="space-y-3 text-sm">
                <SecurityItem icon="🔑" label="Google Places API key">
                  Restricted to <Code>greenbowtie.com</Code> domain in Google Cloud Console. If the key leaks, it can only be used from that domain.
                </SecurityItem>
                <SecurityItem icon="🌍" label="All keys in Vercel env vars">
                  Never committed to the repo. Live in Vercel dashboard under Environment Variables. Local dev uses <Code>.env.local</Code> (gitignored).
                </SecurityItem>
                <SecurityItem icon="📷" label="Google Places photo URLs">
                  Embed the API key in the URL — dangerous to expose publicly. Need a caching proxy layer before serving these to end users. Currently stored in R2 instead.
                </SecurityItem>
              </div>
            </div>
          </div>
        </Card>

        {/* ── 7. Deployment ───────────────────────────────── */}
        <Card className="p-8">
          <SectionTitle>7. Deployment</SectionTitle>
          <div className="flex flex-wrap items-center gap-3 mb-6 text-xs">
            {[
              "👨‍💻 Push to GitHub main",
              "⚙️ GitHub Actions CI",
              "🧪 Tests + build",
              "▲ Vercel auto-deploy",
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
          <div className="grid md:grid-cols-2 gap-5 text-sm">
            <div className="space-y-2">
              <div className="font-semibold text-gray-700 mb-2">Key facts</div>
              <BulletItem>GitHub push to <Code>main</Code> → Vercel auto-deploys in ~45 seconds</BulletItem>
              <BulletItem>Env vars live in Vercel dashboard — not in the repo</BulletItem>
              <BulletItem>DNS at Cloudflare. Two CNAMEs pointing to Vercel</BulletItem>
              <BulletItem>We use <strong>Vercel</strong>, NOT Cloudflare Pages</BulletItem>
              <BulletItem>SSL auto-managed by Vercel (Let&apos;s Encrypt)</BulletItem>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-gray-700 mb-2">DNS records (Cloudflare)</div>
              <div className="font-mono text-xs space-y-1.5">
                {[
                  { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
                  { type: "CNAME", name: "@", value: "cname.vercel-dns.com" },
                  { type: "CNAME", name: "internal", value: "cname.vercel-dns.com" },
                  { type: "CNAME", name: "photos", value: "R2 bucket (planned)" },
                ].map(r => (
                  <div key={r.name} className="flex gap-2">
                    <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: "#dbeafe", color: "#1e40af", minWidth: 52 }}>{r.type}</span>
                    <span style={{ minWidth: 64 }}>{r.name}</span>
                    <span className="text-gray-400">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* ── 8. TODO Checklist ───────────────────────────── */}
        <Card className="p-8">
          <SectionTitle>8. TODO Checklist</SectionTitle>
          <p className="text-sm text-gray-500 mb-6">Open items to get to full production readiness.</p>
          <div className="space-y-3">
            <TodoRow priority="high" label="Schema.org structured data (LocalBusiness markup)">
              Unlocks rich snippets in Google — stars, price range, hours shown directly in search results. High SEO value.
            </TodoRow>
            <TodoRow priority="high" label="Google Search Console — submit sitemap">
              Without this, Google discovers pages slowly via crawl. Submitting sitemap gets all 8,000+ city pages indexed faster.
            </TodoRow>
            <TodoRow priority="high" label="Resend API key in Vercel env vars">
              <Code>RESEND_API_KEY</Code> missing = inquiry emails silently fail. Couples and venue owners get no confirmation. Fix before any real traffic.
            </TodoRow>
            <TodoRow priority="medium" label="Google Places API key — restrict to greenbowtie.com domain">
              Currently may be unrestricted. Restrict in Google Cloud Console to prevent unauthorized use.
            </TodoRow>
            <TodoRow priority="medium" label="Photo URL proxy / caching layer">
              Google Places photo URLs embed the API key. Need a server-side proxy or to store all photos in R2 before surfacing to users.
            </TodoRow>
            <TodoRow priority="medium" label="WeddingWire scraping">
              Pricing and capacity data from a second source = higher confidence. Planned but not started.
            </TodoRow>
            <TodoRow priority="low" label="Stripe — venue owner paid plans">
              Needed when the first venue owner is ready to upgrade to Featured or Pro. Set up Stripe products + webhook in Vercel.
            </TodoRow>
            <TodoRow priority="low" label="R2 custom domain — photos.greenbowtie.com">
              Currently R2 bucket serves photos from a raw R2 URL. Map to <Code>photos.greenbowtie.com</Code> via Cloudflare CNAME.
            </TodoRow>
            <TodoRow priority="low" label="Cloudflare R2 backup bucket — greenbowtie-backups">
              Neon has point-in-time recovery on free tier but an R2 backup of periodic DB dumps would add safety.
            </TodoRow>
          </div>
        </Card>

        <div className="text-center text-sm text-gray-400 pb-8">
          Green Bowtie Stack Reference &middot; March 2026 &middot; Internal — not indexed
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

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-1">{children}</h3>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: "#f3f4f6", color: "#374151" }}>
      {children}
    </code>
  );
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

function ImportanceBadge({ level }: { level: "critical" | "important" | "optional" }) {
  const map = {
    critical: { label: "Critical",  color: "red" },
    important: { label: "Important", color: "amber" },
    optional:  { label: "Optional",  color: "green" },
  };
  const { label, color } = map[level];
  return <Badge color={color}>{label}</Badge>;
}

function ServiceRow({
  name, badge, badgeLevel, icon, children,
}: {
  name: string;
  badge: string;
  badgeLevel: "critical" | "important" | "optional";
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl p-4 border text-sm" style={{ background: "#fafafa", borderColor: "#e5e7eb" }}>
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-bold text-gray-800">{name}</span>
          <ImportanceBadge level={badgeLevel} />
        </div>
        <div className="text-gray-600">{children}</div>
      </div>
    </div>
  );
}

function SchemaCard({ name, icon, fieldCount, children }: { name: string; icon: string; fieldCount: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 border text-sm" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="font-bold text-gray-800 text-base">{name}</span>
        <Badge color="gray">{fieldCount}</Badge>
      </div>
      <div className="text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}

function PipelineStep({
  num, name, script, status, children,
}: {
  num: number;
  name: string;
  script: string;
  status: "done" | "running" | "partial" | "planned";
  children: React.ReactNode;
}) {
  const statusMap = {
    done:    { label: "Done",    color: "green" },
    running: { label: "Running", color: "blue" },
    partial: { label: "Partial", color: "amber" },
    planned: { label: "Planned", color: "gray" },
  };
  const s = statusMap[status];
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "#3b6341" }}>
        {num}
      </div>
      <div className="flex-1 rounded-xl p-4 border text-sm" style={{ background: "#fafafa", borderColor: "#e5e7eb" }}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-bold text-gray-800">{name}</span>
          <Badge color={s.color}>{s.label}</Badge>
          <Code>{script}</Code>
        </div>
        <div className="text-gray-600">{children}</div>
      </div>
    </div>
  );
}

function StackItem({
  icon, title, badge, badgeColor, children,
}: {
  icon: string;
  title: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
}) {
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

function SecurityItem({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 border" style={{ background: "#fafafa", borderColor: "#e5e7eb" }}>
      <span>{icon}</span>
      <div>
        <div className="font-semibold text-gray-700 mb-0.5">{label}</div>
        <div className="text-gray-600">{children}</div>
      </div>
    </div>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: "#3b6341", marginTop: 7 }} />
      <span>{children}</span>
    </div>
  );
}

function TodoItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-amber-700">
      <span className="font-bold flex-shrink-0">○</span>
      <span>{children}</span>
    </div>
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
