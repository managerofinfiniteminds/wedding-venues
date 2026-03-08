import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Playbook — Green Bowtie Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function PlaybookPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Nunito Sans', sans-serif", color: "#1a1a1a" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 className="playfair" style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>
            Green Bowtie — Setup Playbook
          </h1>
          <p style={{ color: "#6b7280", marginTop: 8, fontSize: 16 }}>
            Complete reference for everything deployed, configured, and running. No passwords or key values — just names and locations.
          </p>
          <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>Last updated: March 7, 2026</p>
        </div>

        {/* ── 1. THE PRODUCT ── */}
        <Section title="1. The Product">
          <Field label="Name" value="Green Bowtie" />
          <Field label="Description" value="US wedding venue directory — searchable, enriched, SEO-optimized. Free for couples, monetized via featured listings and venue owner subscriptions." />
          <Field label="Public URL" value="https://greenbowtie.com" link="https://greenbowtie.com" />
          <Field label="Internal Ops URL" value="https://internal.greenbowtie.com" link="https://internal.greenbowtie.com" />
          <Field label="Status" value="Pre-launch — live but not indexed by search engines" />
          <Field label="Started" value="March 2026" />
        </Section>

        {/* ── 2. CODEBASE ── */}
        <Section title="2. Codebase">
          <Field label="Local path" value="~/Projects/wedding-venues" />
          <Field label="GitHub repo" value="managerofinfiniteminds/wedding-venues" link="https://github.com/managerofinfiniteminds/wedding-venues" />
          <Field label="Primary branch" value="main — auto-deploys to Vercel on push" />
          <Field label="Framework" value="Next.js 16 (App Router), TypeScript, Tailwind CSS v4" />
          <Field label="ORM" value="Prisma 7 with pg adapter" />
          <Field label="Test framework" value="Vitest (unit) + Playwright (e2e)" />
          <Field label="Run dev server" value='cd ~/Projects/wedding-venues && npm run dev' code />
        </Section>

        {/* ── 3. HOSTING & DEPLOYMENT ── */}
        <Section title="3. Hosting & Deployment">
          <SubSection title="Vercel">
            <Field label="Purpose" value="Hosts the Next.js app. Auto-deploys from GitHub main." />
            <Field label="Account" value="managerofinfiniteminds" />
            <Field label="Dashboard" value="vercel.com" link="https://vercel.com" />
            <Field label="Project ID" value="prj_PxjnH6NWdNer5JrPPlt2EGkOV8Se" />
            <Field label="Domains" value="greenbowtie.com, internal.greenbowtie.com, www.greenbowtie.com" />
            <Field label="Plan" value="Free (Hobby)" />
            <Field label="Deploy command" value="git push origin main" code />
            <EnvVarList label="Environment variables in Vercel" vars={[
              "DATABASE_URL",
              "SENDGRID_API_KEY",
              "KLAVIYO_API_KEY",
              "NEXT_PUBLIC_KLAVIYO_SITE_ID",
              "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (if added)",
              "SITE_URL",
            ]} />
          </SubSection>

          <SubSection title="GitHub">
            <Field label="Purpose" value="Source control. Push to main triggers Vercel deploy." />
            <Field label="Account" value="managerofinfiniteminds" />
            <Field label="Repo" value="https://github.com/managerofinfiniteminds/wedding-venues" link="https://github.com/managerofinfiniteminds/wedding-venues" />
          </SubSection>
        </Section>

        {/* ── 4. DNS & NETWORK ── */}
        <Section title="4. DNS & Network">
          <SubSection title="Cloudflare (DNS)">
            <Field label="Purpose" value="DNS management for greenbowtie.com. All records live here." />
            <Field label="Account" value="wayne@managerofinfiniteminds.com" />
            <Field label="Dashboard" value="dash.cloudflare.com" link="https://dash.cloudflare.com" />
            <Field label="Nameservers" value="piper.ns.cloudflare.com + denver.ns.cloudflare.com" />
            <Field label="Key DNS records" value={[
              "CNAME @ → cname.vercel-dns.com (main site)",
              "CNAME www → cname.vercel-dns.com",
              "CNAME internal → 85da0ba0300c2237.vercel-dns-017.com",
              "CNAME url9983 → sendgrid.net (email auth)",
              "CNAME 60737467 → sendgrid.net (email auth)",
              "CNAME em7273 → u60737467.wl218.sendgrid.net (email auth)",
              "CNAME s1._domainkey → s1.domainkey.u60737467.wl218.sendgrid.net (DKIM)",
              "CNAME s2._domainkey → s2.domainkey.u60737467.wl218.sendgrid.net (DKIM)",
              "TXT _dmarc → v=DMARC1; p=quarantine (DMARC)",
            ].join("\n")} multiline />
            <Field label="Cloudflare Access" value="Protects internal.greenbowtie.com — requires Cloudflare login to access" />
          </SubSection>

          <SubSection title="GoDaddy (Domain Registrar)">
            <Field label="Purpose" value="Domain registration only. DNS delegated to Cloudflare." />
            <Field label="Account" value="wayne@managerofinfiniteminds.com" />
            <Field label="Domain" value="greenbowtie.com" />
            <Field label="Note" value="Only used for renewal. Do not change DNS here — use Cloudflare." />
          </SubSection>
        </Section>

        {/* ── 5. DATABASE ── */}
        <Section title="5. Database">
          <SubSection title="Neon (Production)">
            <Field label="Purpose" value="Production PostgreSQL. All venue, inquiry, venue owner, and claim data." />
            <Field label="Account" value="wayne@managerofinfiniteminds.com" />
            <Field label="Dashboard" value="console.neon.tech" link="https://console.neon.tech" />
            <Field label="Database name" value="neondb" />
            <Field label="Connection" value="Pooled endpoint, sslmode=require. Stored as DATABASE_URL in Vercel." />
            <Field label="Env var" value="DATABASE_URL" code />
            <Field label="Scale" value="29,734 total venues / 24,599 published as of March 7 2026" />
          </SubSection>

          <SubSection title="Local PostgreSQL (Development)">
            <Field label="Purpose" value="Local dev database. Separate from Neon." />
            <Field label="Connection" value="postgresql://waynekool@localhost:5432/wedding_venues" code />
            <Field label="Start" value="brew services start postgresql@16" code />
            <Field label="PATH required" value='export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' code />
          </SubSection>

          <SubSection title="Prisma Schema — Models">
            <Field label="Venue" value="Core model. 80+ fields: name, slug, address, geo, capacity, pricing, amenities, photos, enrichment metadata, audit flags." />
            <Field label="Inquiry" value="Couple inquiry submissions. Links to Venue. Stores couple info, wedding details, message." />
            <Field label="VenueOwner" value="Claimed venue owners. Plan (free/featured/pro), Stripe sub ID, magic link session." />
            <Field label="ClaimToken" value="One-time magic link tokens for venue owner auth." />
          </SubSection>
        </Section>

        {/* ── 6. EMAIL ── */}
        <Section title="6. Email">
          <SubSection title="SendGrid (Transactional)">
            <Field label="Purpose" value="Sends all transactional emails: inquiry confirmations to couples, inquiry notifications to venue owners, magic link login emails." />
            <Field label="Account" value="wayne@managerofinfiniteminds.com" />
            <Field label="Dashboard" value="app.sendgrid.com" link="https://app.sendgrid.com" />
            <Field label="Sending domain" value="greenbowtie.com (authenticated — SPF, DKIM, DMARC all verified)" />
            <Field label="From address" value="hello@greenbowtie.com" />
            <Field label="Env var" value="SENDGRID_API_KEY" code />
            <Field label="Code" value="src/lib/emails.ts — sendCoupleConfirmation(), sendVenueNotification(), sendMagicLink()" />
            <Field label="Plan" value="Free (100 emails/day). Upgrade to Essentials ($20/mo) at launch." />
          </SubSection>

          <SubSection title="Klaviyo (Marketing & Lists)">
            <Field label="Purpose" value="Email list management, marketing campaigns, automated flows. Two lists: Couples + Venue Owners." />
            <Field label="Account" value="wayne@greenbowtie.com" />
            <Field label="Dashboard" value="klaviyo.com" link="https://www.klaviyo.com" />
            <Field label="Public Site ID" value="YfAzsT" />
            <Field label="Lists" value="Couples (auto-subscribed on inquiry + footer signup) / Venue Owners (auto-subscribed on claim)" />
            <Field label="Env vars" value="KLAVIYO_API_KEY, NEXT_PUBLIC_KLAVIYO_SITE_ID" code />
            <Field label="Code" value="src/lib/klaviyo.ts — subscribeCouple(), subscribeVenueOwner()" />
            <Field label="Signup component" value="src/components/EmailCapture.tsx — used in Footer on every page" />
            <Field label="API route" value="POST /api/subscribe — handles footer form submissions" />
          </SubSection>
        </Section>

        {/* ── 7. DATA ENRICHMENT ── */}
        <Section title="7. Data Enrichment">
          <SubSection title="Google Places API">
            <Field label="Purpose" value="Enriches venues with ratings, review counts, photos, addresses, phone numbers, hours." />
            <Field label="Account" value="wayne@managerofinfiniteminds.com (Google Cloud Console)" />
            <Field label="Dashboard" value="console.cloud.google.com" link="https://console.cloud.google.com" />
            <Field label="Env var" value="GOOGLE_PLACES_API_KEY (used server-side in enrichment scripts)" code />
            <Field label="⚠️ Action needed" value="API key needs domain restriction to greenbowtie.com — currently unrestricted" />
          </SubSection>

          <SubSection title="The Knot Scraper — Phase 2">
            <Field label="Purpose" value="Scrapes The Knot venue listings across 8,089 US cities to enrich venue data with Knot URLs, pricing, and review data." />
            <Field label="Script" value="scripts/enrichment/phase2-knot-cities.ts" code />
            <Field label="Checkpoint file" value="scripts/enrichment/phase2-state.json" code />
            <Field label="Log" value="/tmp/knot-phase2.log" code />
            <Field label="Status" value="Running overnight — ~1,741/8,089 cities complete as of March 7 2026 evening" />
            <Field label="Run command" value="cd ~/Projects/wedding-venues && npx tsx scripts/enrichment/phase2-knot-cities.ts --resume 2>&1 | tee /tmp/knot-phase2.log &" code />
          </SubSection>

          <SubSection title="Deep Enrichment (AI Pipeline)">
            <Field label="Purpose" value="AI-powered enrichment of venue data using Google Places + GPT. Fills in descriptions, amenities, pricing, style tags." />
            <Field label="Script" value="scripts/enrichment/deep-enrich.ts" code />
            <Field label="Status" value="Complete — 17,635 venues enriched across all 50 states (72% of published)" />
            <Field label="Per-state checkpoints" value="scripts/enrichment/deep-enrich-state-{state}.json" code />
          </SubSection>
        </Section>

        {/* ── 8. SITE FEATURES ── */}
        <Section title="8. Site Features — What's Built">
          <SubSection title="Public Pages">
            <Field label="/ (root)" value="Redirects to /venues" />
            <Field label="/venues" value="Main search page — filter by state, city, type, style, price, capacity, amenities. Sort. Pagination." />
            <Field label="/venues/[state]" value="State landing page with hero, stats, city grid, venue list." />
            <Field label="/venues/[state]/[slug]" value="Venue detail page — hero photo, stats bar, description, amenities, pricing, ratings, inquiry form, Schema.org JSON-LD." />
            <Field label="/venues/[state]/[city-slug]" value="City landing page — all venues in that city. SEO-optimized." />
            <Field label="/favorites" value="Saved venues (localStorage, no login required)." />
            <Field label="/claim/[slug]" value="Venue owner claim page — magic link flow." />
            <Field label="/auth/verify" value="Magic link handler — sets session cookie." />
            <Field label="/dashboard" value="Venue owner portal — inquiry table, stats, upgrade CTA." />
          </SubSection>

          <SubSection title="Internal Pages (internal.greenbowtie.com)">
            <Field label="/internal-home" value="Ops dashboard with live DB stats and links to all internal tools." />
            <Field label="/data" value="Pipeline status, enrichment progress, rollout plan, backlog." />
            <Field label="/market" value="Investor-grade competitive analysis, market sizing, The Knot opposition dossier." />
            <Field label="/monetize" value="Revenue streams, pricing strategy, cautionary tales, 4-phase roadmap." />
            <Field label="/seo" value="SEO strategy — URL hierarchy, city page moat, ranking factors." />
            <Field label="/stack" value="Full tech stack reference, DB schema, auth, deployment checklist." />
            <Field label="/services" value="Every external service with account, status, purpose, notes." />
            <Field label="/playbook" value="This page — complete setup playbook." />
            <Field label="/audit" value="Venue data quality audit reports." />
          </SubSection>

          <SubSection title="API Routes">
            <Field label="POST /api/inquiries" value="Creates inquiry, sends SendGrid emails, subscribes couple to Klaviyo." />
            <Field label="POST /api/subscribe" value="Footer email capture → Klaviyo Couples list." />
            <Field label="POST /api/claim" value="Generates magic link token, sends email." />
            <Field label="GET /api/auth/verify" value="Validates magic link token, sets session cookie." />
            <Field label="GET /api/venues/[id]" value="Single venue data." />
            <Field label="GET /sitemap.xml" value="Dynamic sitemap — all published venues + state/city pages." />
            <Field label="GET /robots.txt" value="Currently blocks all crawlers (pre-launch)." />
          </SubSection>

          <SubSection title="Key Components">
            <Field label="VenueCard" value="Venue listing card with photo, rating, tags, price, favorite button." />
            <Field label="VenueList" value="Paginated venue grid with infinite scroll." />
            <Field label="FilterPanel" value="Sidebar filters — type, style, price tier, capacity, amenities." />
            <Field label="InquiryForm" value="Full inquiry form on venue detail pages. Sends to SendGrid + Klaviyo." />
            <Field label="EmailCapture" value="Email signup widget. Used in footer. Sends to Klaviyo." />
            <Field label="VenueSchema" value="Schema.org JSON-LD (LocalBusiness + EventVenue) on every venue detail page." />
            <Field label="FavoriteButton" value="Heart button. Saves to localStorage." />
            <Field label="USStateMap" value="Interactive SVG map of US states on /venues." />
            <Field label="Nav / Footer" value="Site navigation. Footer includes email capture band." />
            <Field label="InternalNav" value="Ops-only nav for internal.greenbowtie.com pages." />
          </SubSection>
        </Section>

        {/* ── 9. SEO ── */}
        <Section title="9. SEO">
          <Field label="Status" value="⛔ Pre-launch — robots.txt blocks all crawlers. noindex meta on all pages." />
          <Field label="robots.txt" value="public/robots.txt — Disallow: / (flip to Allow at launch)" />
          <Field label="Schema.org" value="LocalBusiness + EventVenue JSON-LD on every venue detail page" />
          <Field label="Sitemap" value="Dynamic at /sitemap.xml — all venues, states, cities" />
          <Field label="Google Search Console" value="⚠️ Not configured yet — submit sitemap at launch" link="https://search.google.com/search-console" />
          <Field label="City SEO pages" value="8,000+ city pages at /venues/[state]/[city] — each unique, Google-indexable" />
          <Field label="To enable indexing at launch" value="1. Flip robots: {index: false} → true in src/app/layout.tsx  2. Update public/robots.txt to Allow: /  3. Submit sitemap in Google Search Console" />
        </Section>

        {/* ── 10. PAYMENTS ── */}
        <Section title="10. Payments">
          <Field label="Stripe" value="Installed in codebase (stripe npm package) but not configured. No account set up yet." />
          <Field label="When needed" value="When first venue owner is ready to pay for Featured or Pro plan." />
          <Field label="Env var (when ready)" value="STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" code />
        </Section>

        {/* ── 11. STORAGE ── */}
        <Section title="11. Storage">
          <Field label="Cloudflare R2" value="Planned for venue photo storage. Not configured yet." />
          <Field label="Planned bucket" value="greenbowtie-backups" />
          <Field label="Planned domain" value="photos.greenbowtie.com" />
          <Field label="When needed" value="Before any major photo push or gallery feature." />
          <Field label="AWS S3 SDK" value="@aws-sdk/client-s3 installed — R2 is S3-compatible" />
        </Section>

        {/* ── 12. LOCAL DEV SETUP ── */}
        <Section title="12. Local Dev Setup">
          <Field label="Node version" value="v22.22.0" />
          <Field label="Package manager" value="npm" />
          <Field label="Start dev server" value="cd ~/Projects/wedding-venues && npm run dev" code />
          <Field label="Run tests" value="npm test" code />
          <Field label="Prisma studio" value="npx prisma studio" code />
          <Field label="Local DB connect" value='psql postgresql://waynekool@localhost:5432/wedding_venues' code />
          <Field label="Push schema to Neon" value="DATABASE_URL=$NEON_DATABASE_URL npx prisma db push" code />
          <Field label="Env file" value="~/Projects/wedding-venues/.env.local — contains all local keys" />
          <Field label="FFmpeg" value="Installed (v8) — used for video processing if needed" />
        </Section>

        {/* ── 13. LAUNCH CHECKLIST ── */}
        <Section title="13. Launch Checklist">
          {[
            { done: true,  item: "Vercel deployment live" },
            { done: true,  item: "Cloudflare DNS configured" },
            { done: true,  item: "Neon production database" },
            { done: true,  item: "SendGrid domain authenticated + transactional emails" },
            { done: true,  item: "Klaviyo list management + email capture" },
            { done: true,  item: "Schema.org structured data on venue pages" },
            { done: true,  item: "City SEO pages (8,000+)" },
            { done: true,  item: "robots.txt blocking crawlers (pre-launch)" },
            { done: false, item: "Google Search Console — submit sitemap" },
            { done: false, item: "Restrict Google Places API key to greenbowtie.com" },
            { done: false, item: "Cloudflare R2 + photos.greenbowtie.com" },
            { done: false, item: "Stripe account + featured listing payment flow" },
            { done: false, item: "Flip robots.txt + meta robots → index at launch" },
            { done: false, item: "Resend → remove from package.json (replaced by SendGrid)" },
            { done: false, item: "Knot Phase 2 scraper complete (overnight)" },
            { done: false, item: "WeddingWire Phase 3 scraping" },
          ].map(({ done, item }) => (
            <div key={item} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
              borderBottom: "1px solid #f3f4f6",
            }}>
              <span style={{ fontSize: 16 }}>{done ? "✅" : "⬜"}</span>
              <span style={{ fontSize: 14, color: done ? "#374151" : "#6b7280" }}>{item}</span>
            </div>
          ))}
        </Section>

        <p style={{ textAlign: "center", fontSize: 12, color: "#d1d5db", marginTop: 48 }}>
          Green Bowtie Internal · Keep this updated as the stack evolves
        </p>
      </div>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 className="playfair" style={{
        fontSize: 22, fontWeight: 700, color: "#1a1a1a",
        borderBottom: "2px solid #3b6341", paddingBottom: 8, marginBottom: 20,
      }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
      padding: "20px 24px", marginBottom: 4,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#3b6341", margin: "0 0 14px" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, link, code, multiline }: {
  label: string;
  value: string;
  link?: string;
  code?: boolean;
  multiline?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: multiline ? "flex-start" : "baseline", flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", width: 160, flexShrink: 0 }}>
        {label}
      </span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: "#3b6341", textDecoration: "none", fontWeight: 500 }}>
          {value} ↗
        </a>
      ) : code ? (
        <code style={{ fontSize: 13, background: "#f3f4f6", padding: "2px 8px", borderRadius: 6, color: "#374151", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {value}
        </code>
      ) : multiline ? (
        <pre style={{ fontSize: 13, color: "#374151", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{value}</pre>
      ) : (
        <span style={{ fontSize: 14, color: "#374151", flex: 1 }}>{value}</span>
      )}
    </div>
  );
}

function EnvVarList({ label, vars }: { label: string; vars: string[] }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", width: 160, flexShrink: 0 }}>
        {label}
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
