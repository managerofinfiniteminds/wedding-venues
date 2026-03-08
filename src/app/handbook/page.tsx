import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Green Bowtie Handbook — Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

type Status = "live" | "setup" | "planned" | "paused";

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  live:    { label: "Live",    color: "#16a34a", bg: "#dcfce7" },
  setup:   { label: "Setup",   color: "#92400e", bg: "#fef3c7" },
  planned: { label: "Planned", color: "#1d4ed8", bg: "#dbeafe" },
  paused:  { label: "Paused",  color: "#6b7280", bg: "#f3f4f6" },
};

function Badge({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      color: cfg.color, background: cfg.bg,
      padding: "2px 10px", borderRadius: 999, whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 52 }}>
      <h2 className="playfair" style={{
        fontSize: 22, fontWeight: 700, color: "#1a1a1a",
        borderBottom: "2px solid #3b6341", paddingBottom: 8, marginBottom: 20,
      }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function Card({ title, status, account, url, children }: {
  title: string;
  status: Status;
  account?: string;
  url?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, fontSize: 16, color: "#3b6341", textDecoration: "none" }}>
              {title} ↗
            </a>
          ) : (
            <span style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>{title}</span>
          )}
          <Badge status={status} />
        </div>
        {account && (
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Account: <strong style={{ color: "#374151" }}>{account}</strong></span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, code, link, multiline }: {
  label: string;
  value: string | string[];
  code?: boolean;
  link?: string;
  multiline?: boolean;
}) {
  const strValue = Array.isArray(value) ? value.join("\n") : value;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: multiline ? "flex-start" : "baseline", flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", width: 150, flexShrink: 0 }}>
        {label}
      </span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: "#3b6341", textDecoration: "none" }}>
          {strValue} ↗
        </a>
      ) : code ? (
        <code style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 8px", borderRadius: 6, color: "#374151", whiteSpace: "pre-wrap", wordBreak: "break-all", flex: 1 }}>
          {strValue}
        </code>
      ) : multiline ? (
        <pre style={{ fontSize: 13, color: "#374151", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.8, flex: 1 }}>{strValue}</pre>
      ) : (
        <span style={{ fontSize: 14, color: "#374151", flex: 1 }}>{strValue}</span>
      )}
    </div>
  );
}

function EnvVars({ vars }: { vars: string[] }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", width: 150, flexShrink: 0 }}>
        Env Vars
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {vars.map((v) => (
          <code key={v} style={{ fontSize: 12, background: "#f3f4f6", padding: "2px 8px", borderRadius: 6, color: "#374151" }}>
            {v}
          </code>
        ))}
      </div>
    </div>
  );
}

export default function HandbookPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Nunito Sans', sans-serif", color: "#1a1a1a" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 className="playfair" style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>
            Green Bowtie Handbook
          </h1>
          <p style={{ color: "#6b7280", marginTop: 8, fontSize: 16 }}>
            Everything deployed, configured, and running — accounts, env vars, DNS, features, commands, and launch checklist. No passwords or key values.
          </p>
          <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>Last updated: March 7, 2026</p>

          {/* Status summary */}
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            {(["live", "setup", "planned", "paused"] as Status[]).map((s) => {
              const cfg = statusConfig[s];
              return (
                <span key={s} style={{ fontSize: 12, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: "3px 12px", borderRadius: 999 }}>
                  {cfg.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── 1. PRODUCT ── */}
        <Section title="1. The Product">
          <Card title="Green Bowtie" status="live">
            <Row label="What it is" value="US wedding venue directory — searchable, enriched, SEO-optimized. Free for couples, monetized via featured listings and venue owner subscriptions." />
            <Row label="Public site" value="https://greenbowtie.com" link="https://greenbowtie.com" />
            <Row label="Internal ops" value="https://internal.greenbowtie.com" link="https://internal.greenbowtie.com" />
            <Row label="Launch status" value="Live but pre-launch — search engines blocked, not publicly announced" />
            <Row label="Started" value="March 2026" />
            <Row label="DB scale" value="29,734 total venues · 24,599 published · 18,771 with AI-generated descriptions" />
          </Card>
        </Section>

        {/* ── 2. CODEBASE ── */}
        <Section title="2. Codebase">
          <Card title="wedding-venues" status="live" account="managerofinfiniteminds" url="https://github.com/managerofinfiniteminds/wedding-venues">
            <Row label="Local path" value="~/Projects/wedding-venues" code />
            <Row label="Framework" value="Next.js 16 (App Router) · TypeScript · Tailwind CSS v4" />
            <Row label="ORM" value="Prisma 7 with pg adapter · 4 models: Venue, Inquiry, VenueOwner, ClaimToken" />
            <Row label="Tests" value="Vitest (unit) · Playwright (e2e)" />
            <Row label="Deploy" value="Push to main → Vercel auto-deploys (~45s)" code />
            <Row label="Dev server" value="cd ~/Projects/wedding-venues && npm run dev" code />
            <Row label="Run tests" value="npm test" code />
          </Card>
        </Section>

        {/* ── 3. HOSTING & DEPLOYMENT ── */}
        <Section title="3. Hosting & Deployment">
          <Card title="Vercel" status="live" account="managerofinfiniteminds" url="https://vercel.com">
            <Row label="Purpose" value="Hosts the Next.js app. Auto-deploys on push to main." />
            <Row label="Project ID" value="prj_PxjnH6NWdNer5JrPPlt2EGkOV8Se" />
            <Row label="Domains" value="greenbowtie.com · internal.greenbowtie.com · www.greenbowtie.com" />
            <Row label="Plan" value="Free (Hobby)" />
            <EnvVars vars={["DATABASE_URL", "SENDGRID_API_KEY", "KLAVIYO_API_KEY", "NEXT_PUBLIC_KLAVIYO_SITE_ID", "SITE_URL"]} />
          </Card>

          <Card title="GitHub" status="live" account="managerofinfiniteminds" url="https://github.com/managerofinfiniteminds/wedding-venues">
            <Row label="Purpose" value="Source control. Push to main triggers Vercel deploy." />
            <Row label="Branch" value="main" />
          </Card>
        </Section>

        {/* ── 4. DNS & NETWORK ── */}
        <Section title="4. DNS & Network">
          <Card title="Cloudflare" status="live" account="wayne@managerofinfiniteminds.com" url="https://dash.cloudflare.com">
            <Row label="Purpose" value="DNS for greenbowtie.com + Cloudflare Access protecting internal subdomain" />
            <Row label="Nameservers" value="piper.ns.cloudflare.com · denver.ns.cloudflare.com" />
            <Row label="Key DNS records" multiline value={[
              "CNAME @               → cname.vercel-dns.com          (main site)",
              "CNAME www             → cname.vercel-dns.com          (www)",
              "CNAME internal        → 85da0ba0300c2237.vercel-dns-017.com  (ops)",
              "CNAME url9983         → sendgrid.net                  (email)",
              "CNAME 60737467        → sendgrid.net                  (email)",
              "CNAME em7273          → u60737467.wl218.sendgrid.net  (email)",
              "CNAME s1._domainkey   → s1.domainkey.u60737467.wl218.sendgrid.net  (DKIM)",
              "CNAME s2._domainkey   → s2.domainkey.u60737467.wl218.sendgrid.net  (DKIM)",
              "TXT   _dmarc          → v=DMARC1; p=quarantine ...    (DMARC)",
            ]} />
            <Row label="Note" value="All CNAMEs for SendGrid must be DNS Only (grey cloud, not proxied)" />
          </Card>

          <Card title="GoDaddy" status="live" account="wayne@managerofinfiniteminds.com" url="https://godaddy.com">
            <Row label="Purpose" value="Domain registrar only. DNS delegated to Cloudflare — do not edit DNS here." />
            <Row label="Domain" value="greenbowtie.com" />
          </Card>
        </Section>

        {/* ── 5. DATABASE ── */}
        <Section title="5. Database">
          <Card title="Neon (Production)" status="live" account="wayne@managerofinfiniteminds.com" url="https://console.neon.tech">
            <Row label="Purpose" value="Production PostgreSQL. All venue, inquiry, owner, and claim data." />
            <Row label="DB name" value="neondb" />
            <Row label="Connection" value="Pooled endpoint · sslmode=require · stored as DATABASE_URL in Vercel" />
            <EnvVars vars={["DATABASE_URL"]} />
            <Row label="Prisma push" value="DATABASE_URL=$NEON_DATABASE_URL npx prisma db push" code />
          </Card>

          <Card title="PostgreSQL (Local Dev)" status="live">
            <Row label="Connection" value="postgresql://waynekool@localhost:5432/wedding_venues" code />
            <Row label="Start" value="brew services start postgresql@16" code />
            <Row label="PATH" value={'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"'} code />
            <Row label="Connect" value="psql postgresql://waynekool@localhost:5432/wedding_venues" code />
          </Card>
        </Section>

        {/* ── 6. EMAIL ── */}
        <Section title="6. Email">
          <Card title="SendGrid" status="live" account="wayne@managerofinfiniteminds.com" url="https://app.sendgrid.com">
            <Row label="Purpose" value="Transactional emails — inquiry confirmations, venue owner notifications, magic link logins" />
            <Row label="From address" value="hello@greenbowtie.com" />
            <Row label="Domain auth" value="✅ SPF, DKIM (s1+s2), DMARC all verified on greenbowtie.com" />
            <Row label="Plan" value="Free (100/day) → upgrade to Essentials $20/mo at launch" />
            <Row label="Code" value="src/lib/emails.ts — sendCoupleConfirmation() · sendVenueNotification() · sendMagicLink()" />
            <EnvVars vars={["SENDGRID_API_KEY"]} />
          </Card>

          <Card title="Klaviyo" status="live" account="wayne@greenbowtie.com" url="https://www.klaviyo.com">
            <Row label="Purpose" value="Email list management, marketing campaigns, automated flows" />
            <Row label="Lists" value="Couples (auto-subscribed on inquiry + footer signup) · Venue Owners (on claim)" />
            <Row label="Public site ID" value="YfAzsT" />
            <Row label="Footer signup" value="src/components/EmailCapture.tsx — appears in footer on every page" />
            <Row label="API route" value="POST /api/subscribe" />
            <Row label="Code" value="src/lib/klaviyo.ts — subscribeCouple() · subscribeVenueOwner()" />
            <EnvVars vars={["KLAVIYO_API_KEY", "NEXT_PUBLIC_KLAVIYO_SITE_ID"]} />
          </Card>
        </Section>

        {/* ── 7. DATA ENRICHMENT ── */}
        <Section title="7. Data & Enrichment">
          <Card title="Google Places API" status="live" account="wayne@managerofinfiniteminds.com" url="https://console.cloud.google.com">
            <Row label="Purpose" value="Enriches venues with ratings, review counts, photos, addresses, phone numbers" />
            <Row label="⚠️ Action needed" value="Restrict API key to greenbowtie.com domain — currently unrestricted" />
            <EnvVars vars={["GOOGLE_PLACES_API_KEY"]} />
          </Card>

          <Card title="Knot Scraper — Phase 2" status="live">
            <Row label="Purpose" value="Scrapes The Knot across 8,089 US cities to enrich venue data with Knot URLs, pricing, reviews" />
            <Row label="Status" value="Running overnight — ~1,741 / 8,089 cities done as of March 7 2026" />
            <Row label="Script" value="scripts/enrichment/phase2-knot-cities.ts" code />
            <Row label="Checkpoint" value="scripts/enrichment/phase2-state.json" code />
            <Row label="Log" value="/tmp/knot-phase2.log" code />
            <Row label="Resume" value="npx tsx scripts/enrichment/phase2-knot-cities.ts --resume" code />
          </Card>

          <Card title="Deep Enrichment (AI Pipeline)" status="live">
            <Row label="Purpose" value="AI enrichment — descriptions, amenities, pricing, style tags via Google Places + GPT" />
            <Row label="Status" value="Complete — 17,635 venues enriched across all 50 states (72% of published)" />
            <Row label="Script" value="scripts/enrichment/deep-enrich.ts" code />
            <Row label="Checkpoints" value="scripts/enrichment/deep-enrich-state-{state}.json" code />
          </Card>
        </Section>

        {/* ── 8. PAYMENTS ── */}
        <Section title="8. Payments">
          <Card title="Stripe" status="planned">
            <Row label="Purpose" value="Payment processing for Featured and Pro venue owner plans" />
            <Row label="Status" value="stripe npm package installed. No account or config yet." />
            <Row label="When needed" value="When first venue owner is ready to pay" />
            <EnvVars vars={["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]} />
          </Card>
        </Section>

        {/* ── 9. STORAGE ── */}
        <Section title="9. Storage">
          <Card title="Cloudflare R2" status="planned" account="wayne@managerofinfiniteminds.com" url="https://dash.cloudflare.com">
            <Row label="Purpose" value="Venue photo storage. S3-compatible." />
            <Row label="Planned bucket" value="greenbowtie-backups" />
            <Row label="Planned domain" value="photos.greenbowtie.com" />
            <Row label="SDK" value="@aws-sdk/client-s3 installed (R2 is S3-compatible)" />
            <Row label="When needed" value="Before any major photo push or gallery feature" />
          </Card>
        </Section>

        {/* ── 10. ANALYTICS & SEO ── */}
        <Section title="10. Analytics & SEO">
          <Card title="Search Engine Indexing" status="setup">
            <Row label="Status" value="⛔ Blocked — robots.txt Disallow: / + noindex meta on all pages" />
            <Row label="robots.txt" value="public/robots.txt" code />
            <Row label="Meta robots" value="src/app/layout.tsx — robots: { index: false }" code />
            <Row label="To enable at launch" value="1. Flip index: false → true in layout.tsx  2. Update robots.txt to Allow: /  3. Submit sitemap in Google Search Console" />
          </Card>

          <Card title="Schema.org Structured Data" status="live">
            <Row label="Purpose" value="LocalBusiness + EventVenue JSON-LD on every venue detail page — enables Google rich snippets" />
            <Row label="Component" value="src/components/VenueSchema.tsx" code />
            <Row label="Fields" value="name, address, geo, aggregateRating, priceRange, capacity, amenityFeature, image, canonical URL" />
          </Card>

          <Card title="Google Search Console" status="planned" url="https://search.google.com/search-console">
            <Row label="Purpose" value="Submit sitemap, monitor indexing, track search performance" />
            <Row label="Sitemap" value="https://greenbowtie.com/sitemap.xml (dynamic — all venues + state/city pages)" />
            <Row label="When" value="Submit at launch after enabling indexing" />
          </Card>
        </Section>

        {/* ── 11. SITE FEATURES ── */}
        <Section title="11. Site Features — What's Built">
          <Card title="Public Pages" status="live">
            {[
              ["/", "Redirects to /venues"],
              ["/venues", "Main search — filter by state, city, type, style, price, capacity, amenities. Sort. Pagination."],
              ["/venues/[state]", "State landing page — hero, stats, city grid, venue list"],
              ["/venues/[state]/[slug]", "Venue detail — hero photo, stats bar, description, amenities, pricing, ratings, inquiry form, Schema.org JSON-LD"],
              ["/venues/[state]/[city]", "City page — all venues in that city. 8,000+ unique SEO pages."],
              ["/favorites", "Saved venues (localStorage, no login required)"],
              ["/claim/[slug]", "Venue owner claim page — magic link flow"],
              ["/auth/verify", "Magic link handler — sets session cookie"],
              ["/dashboard", "Venue owner portal — inquiry table, stats, upgrade CTA"],
            ].map(([route, desc]) => (
              <Row key={route} label={route} value={desc} />
            ))}
          </Card>

          <Card title="Internal Pages (internal.greenbowtie.com)" status="live">
            {[
              ["/internal-home", "Ops dashboard — live DB stats + links to all tools"],
              ["/handbook", "This page"],
              ["/data", "Pipeline status, enrichment progress, rollout plan, backlog"],
              ["/market", "Investor-grade competitive analysis, market sizing, The Knot opposition dossier"],
              ["/monetize", "Revenue streams, 13 streams, cautionary tales, 4-phase roadmap"],
              ["/seo", "SEO strategy — URL hierarchy, city moat, ranking factors"],
              ["/stack", "Full tech stack reference, DB schema, auth, deployment checklist"],
              ["/audit", "Venue data quality audit reports"],
            ].map(([route, desc]) => (
              <Row key={route} label={route} value={desc} />
            ))}
          </Card>

          <Card title="API Routes" status="live">
            {[
              ["POST /api/inquiries", "Creates inquiry, sends SendGrid emails, subscribes couple to Klaviyo"],
              ["POST /api/subscribe", "Footer email capture → Klaviyo Couples list"],
              ["POST /api/claim", "Generates magic link token, sends login email"],
              ["GET /api/auth/verify", "Validates magic link, sets session cookie"],
              ["GET /sitemap.xml", "Dynamic sitemap — all published venues + state/city pages"],
              ["GET /robots.txt", "Currently blocks all crawlers (pre-launch)"],
            ].map(([route, desc]) => (
              <Row key={route} label={route} value={desc} />
            ))}
          </Card>

          <Card title="Key Components" status="live">
            {[
              ["VenueCard", "Listing card with photo, rating, tags, price, favorite button"],
              ["VenueList", "Paginated venue grid"],
              ["FilterPanel", "Sidebar filters — type, style, price, capacity, amenities"],
              ["InquiryForm", "Full inquiry form on venue detail pages → SendGrid + Klaviyo"],
              ["EmailCapture", "Email signup widget in footer → Klaviyo Couples list"],
              ["VenueSchema", "Schema.org JSON-LD on every venue detail page"],
              ["FavoriteButton", "Heart button → localStorage"],
              ["USStateMap", "Interactive SVG map of US states"],
              ["Nav / Footer", "Site navigation. Footer includes email capture band."],
              ["InternalNav", "Ops-only nav for internal pages"],
            ].map(([name, desc]) => (
              <Row key={name} label={name} value={desc} />
            ))}
          </Card>
        </Section>

        {/* ── 12. DATABASE SCHEMA ── */}
        <Section title="12. Database Schema">
          <Card title="Venue" status="live">
            <Row label="Fields" value="80+ fields" />
            <Row label="Identity" value="name, slug, phone, email, website, instagram, facebook, tiktok" />
            <Row label="Location" value="street, city, state, stateSlug, zip, latitude, longitude" />
            <Row label="Capacity" value="minGuests, maxGuests, seatedMax, standingMax, ceremonyOnly" />
            <Row label="Pricing" value="baseRentalMin, baseRentalMax, priceTier (budget/moderate/luxury), perHeadMin, perHeadMax, depositPercent, allInclusive" />
            <Row label="Spaces" value="hasIndoorSpace, hasOutdoorSpace, hasBridalSuite, hasGroomSuite, parkingSpots" />
            <Row label="Inclusions" value="tablesChairsIncluded, linensIncluded, avIncluded, lightingIncluded, cateringKitchen, barSetup, onSiteCoordinator, adaCompliant, nearbyLodging" />
            <Row label="Vendor policy" value="preferredVendorList, outsideVendorsAllowed, inHouseCateringRequired, byobPolicy" />
            <Row label="Enrichment" value="description, styleTags, venueType, photoTags, completenessScore, pipelineProcessedAt, googleRating, googleReviews, primaryPhotoUrl" />
            <Row label="Monetization" value="isPublished, isFeatured, featuredUntil" />
          </Card>

          <Card title="Inquiry" status="live">
            <Row label="Purpose" value="Couple contact form submissions from venue detail pages" />
            <Row label="Key fields" value="venueId, coupleName, partnerName, coupleEmail, couplePhone, weddingDate, weddingDateFlexible, guestCount, budgetMin, budgetMax, message, preferredContact, source" />
            <Row label="Status flow" value="new → viewed → responded → booked / lost" />
          </Card>

          <Card title="VenueOwner" status="live">
            <Row label="Purpose" value="Claimed venue owner accounts — magic link auth, no passwords" />
            <Row label="Key fields" value="venueId, email, name, phone, verified, plan (free/featured/pro), planStartedAt, planExpiresAt, stripeCustomerId, stripeSubId, sessionToken, sessionExpires" />
          </Card>

          <Card title="ClaimToken" status="live">
            <Row label="Purpose" value="One-time magic link tokens for venue claiming flow" />
            <Row label="Key fields" value="venueId, email, token, expiresAt, usedAt — consumed on first use" />
          </Card>
        </Section>

        {/* ── 13. TECH STACK ── */}
        <Section title="13. Tech Stack">
          <Card title="Frontend" status="live">
            <Row label="Next.js 16" value="App Router, SSR + SSG. SEO is mission-critical so server rendering is required." />
            <Row label="TypeScript" value="Throughout — frontend, backend, scripts. Build fails on type errors." />
            <Row label="Tailwind CSS v4" value='Uses @import "tailwindcss" syntax — NOT the v3 @tailwind directives. Breaking change.' />
            <Row label="Leaflet.js" value="Interactive venue map. OpenStreetMap tiles. No API key. Dynamic import with ssr: false." />
          </Card>

          <Card title="Backend & Data" status="live">
            <Row label="Prisma 7" value="ORM for all DB access. Requires @prisma/adapter-pg for Neon serverless compatibility." />
            <Row label="Playwright" value="Browser automation for scraping The Knot and venue sites. Connects via CDP to Chrome at port 18800." />
            <Row label="tsx / ts-node" value="Runs enrichment scripts directly without compile step." />
          </Card>
        </Section>

        {/* ── 14. AUTH & SECURITY ── */}
        <Section title="14. Auth & Security">
          <Card title="Access Control" status="live">
            <Row label="Internal subdomain" value="internal.greenbowtie.com protected by Cloudflare Access — OTP email gate. Only whitelisted emails can access." />
            <Row label="Venue owner auth" value="Magic link flow. No passwords. Claim → ClaimToken created → email sent → token consumed → VenueOwner session set. 7-day session cookie." />
            <Row label="No public admin" value="All admin via internal subdomain or direct Neon console. No exposed admin routes on the public site." />
          </Card>

          <Card title="API Key Security" status="live">
            <Row label="Storage" value="All keys in Vercel env vars. Never committed to repo. Local dev uses .env.local (gitignored)." />
            <Row label="Google Places key" value="⚠️ Should be restricted to greenbowtie.com domain in Google Cloud Console — action needed." />
            <Row label="Photo URLs" value="Google Places photo URLs embed the API key — need a caching proxy before serving to users at scale." />
          </Card>
        </Section>

        {/* ── 15. DEPLOYMENT FLOW ── */}
        <Section title="15. Deployment Flow">
          <Card title="Pipeline" status="live">
            <Row label="Flow" value="Push to GitHub main → Vercel auto-deploys → live on greenbowtie.com (~45s)" />
            <Row label="SSL" value="Auto-managed by Vercel (Let's Encrypt)" />
            <Row label="Env vars" value="Live in Vercel dashboard only — never in repo" />
            <Row label="Hosting" value="Vercel (NOT Cloudflare Pages)" />
            <Row label="DNS" value="Cloudflare — all records there, GoDaddy is registrar only" />
          </Card>
        </Section>

        {/* ── 16. LAUNCH CHECKLIST ── */}
        <Section title="16. Launch Checklist">
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px" }}>
            {[
              { done: true,  item: "Vercel deployment live on greenbowtie.com" },
              { done: true,  item: "Cloudflare DNS configured (main + www + internal)" },
              { done: true,  item: "Neon production database" },
              { done: true,  item: "SendGrid domain authenticated (SPF/DKIM/DMARC) + transactional emails live" },
              { done: true,  item: "Klaviyo list management + email capture in footer" },
              { done: true,  item: "Schema.org structured data on all venue detail pages" },
              { done: true,  item: "City SEO pages (8,000+)" },
              { done: true,  item: "robots.txt + noindex blocking crawlers (pre-launch)" },
              { done: true,  item: "Venue owner claim + magic link login flow" },
              { done: true,  item: "Inquiry form → SendGrid + Klaviyo" },
              { done: true,  item: "Internal ops site (internal.greenbowtie.com)" },
              { done: false, item: "Restrict Google Places API key to greenbowtie.com domain" },
              { done: false, item: "Google Search Console — submit sitemap at launch" },
              { done: false, item: "Flip robots.txt + meta robots to allow indexing at launch" },
              { done: false, item: "Cloudflare R2 + photos.greenbowtie.com for venue photos" },
              { done: false, item: "Stripe account + featured listing payment flow" },
              { done: false, item: "Knot Phase 2 scraper complete (~8,089 cities)" },
              { done: false, item: "WeddingWire Phase 3 scraping" },
              { done: false, item: "Remove unused resend package (replaced by SendGrid)" },
              { done: false, item: "Vercel Pro or upgrade plan before high traffic" },
            ].map(({ done, item }) => (
              <div key={item} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 0", borderBottom: "1px solid #f3f4f6",
              }}>
                <span style={{ fontSize: 16 }}>{done ? "✅" : "⬜"}</span>
                <span style={{ fontSize: 14, color: done ? "#374151" : "#6b7280" }}>{item}</span>
              </div>
            ))}
          </div>
        </Section>

        <p style={{ textAlign: "center", fontSize: 12, color: "#d1d5db", marginTop: 48 }}>
          Green Bowtie Handbook · Keep this updated as the stack evolves · Not indexed
        </p>
      </div>
    </div>
  );
}
