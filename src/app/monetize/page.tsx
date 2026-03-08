import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monetization Strategy — Green Bowtie Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function MonetizePage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "48px 24px", fontFamily: "'Nunito Sans', sans-serif", color: "#1a1a1a", lineHeight: 1.7 }}>

      <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: "12px 16px", marginBottom: 32, fontSize: 13 }}>
        🔒 Internal strategy doc — not indexed. Do not share publicly.
      </div>

      <h1 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 36, fontWeight: 700, marginBottom: 4 }}>💰 Green Bowtie Monetization Strategy</h1>
      <p style={{ color: "#6b7280", marginBottom: 8 }}>Investor-grade. Every angle, every number. Built for a solo operator moving fast.</p>
      <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 48 }}>Updated: March 2026 · CA live · National rollout in progress · 24,599 venues indexed</p>

      {/* ── SECTION 1: WHY FREE LISTINGS ── */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ background: "#1e3d22", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "32px 36px 8px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#86efac", marginBottom: 8 }}>Section 1 — The Foundation</div>
            <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 28, fontWeight: 700, color: "#ffffff", margin: "0 0 12px" }}>Why Free Listings Aren&apos;t Charity — They&apos;re Strategy</h2>
            <p style={{ color: "#d1fae5", fontSize: 16, maxWidth: 720, margin: "0 0 24px", lineHeight: 1.8 }}>
              The most common instinct when you see &ldquo;25,000 venues&rdquo; is to charge each of them $X/year to be listed. That&apos;s $X million in recurring revenue, right? Wrong. Charging for listings is a supply-side tax that kills the very thing that creates value. Here&apos;s the death spiral:
            </p>
          </div>
          <div style={{ padding: "0 36px 28px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 0, marginBottom: 24 }}>
              {[
                ["Listings cost money", "Venues don't list"],
                ["Directory is incomplete", "Users don't come"],
                ["No user traffic", "Directory has no value"],
                ["No value", "Venues won't pay anyway"],
              ].map(([cause, effect], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#d1fae5", fontWeight: 600 }}>
                    <div style={{ fontSize: 11, color: "#6ee7b7", marginBottom: 2 }}>If...</div>
                    {cause}
                  </div>
                  <div style={{ padding: "0 8px", color: "#6ee7b7", fontSize: 18, fontWeight: 700 }}>→</div>
                  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#d1fae5", fontWeight: 600 }}>
                    <div style={{ fontSize: 11, color: "#6ee7b7", marginBottom: 2 }}>Then...</div>
                    {effect}
                  </div>
                  {i < 3 && <div style={{ padding: "0 8px", color: "#6ee7b7", fontSize: 18, fontWeight: 700 }}>→</div>}
                </div>
              ))}
            </div>
            <p style={{ color: "#bbf7d0", fontSize: 15, fontStyle: "italic", marginBottom: 28, maxWidth: 680 }}>
              &ldquo;It&apos;s a death spiral before you start.&rdquo;
            </p>

            <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 24px", marginBottom: 28 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#6ee7b7", marginBottom: 16 }}>The Google Analogy That Settles It</div>
              <p style={{ color: "#d1fae5", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                Google doesn&apos;t charge websites to appear in search results. They index everything for free, then sell ads. Their free index is what makes the ads worth buying. Green Bowtie is exactly the same: <strong style={{ color: "#ffffff" }}>free listings build the inventory → inventory builds the audience → audience creates the monetization opportunity.</strong>
              </p>
            </div>

            <div style={{ fontWeight: 700, fontSize: 15, color: "#86efac", marginBottom: 16 }}>Every Dominant Marketplace Follows This Pattern</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { name: "Airbnb", free: "Free to list", paid: "Commission per booking (not upfront)" },
                { name: "Uber", free: "Free to sign up", paid: "Commission per ride" },
                { name: "Yelp", free: "Free to claim listing", paid: "Ads & promoted placement" },
                { name: "Google Maps", free: "Free to list business", paid: "Local Service Ads" },
                { name: "Zillow", free: "Free to list your home", paid: "Premier Agent program" },
                { name: "TripAdvisor", free: "Free to list", paid: "Promoted placements" },
              ].map(m => (
                <div key={m.name} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#ffffff", marginBottom: 6 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "#6ee7b7", marginBottom: 3 }}>✓ {m.free}</div>
                  <div style={{ fontSize: 12, color: "#fbbf24" }}>$ {m.paid}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#86efac", marginBottom: 16 }}>Real-World Cautionary Tales</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  {
                    name: "Yellow Pages",
                    verdict: "Dead",
                    story: "Charged businesses to be listed — businesses that couldn't afford it didn't appear. Result: incomplete, untrustworthy directory. Yellow Pages is essentially dead while Google Business Profile (free to list) has 200M+ businesses and dominates local search.",
                  },
                  {
                    name: "Angie's List",
                    verdict: "Sold for $500M (less than VC raised)",
                    story: "Charged both consumers AND businesses for access. Yelp and Google were free. Angie's List stagnated, dropped consumer fees, and sold for $500M — less than its VC funding. Yelp, which went free, built a $2B+ company.",
                  },
                  {
                    name: "Early Zagat",
                    verdict: "Acquired for $151M, absorbed into Google Maps",
                    story: "Paid directory model. Google acquired them specifically to integrate into free Google Maps. The free model won. Zagat brand is barely remembered today.",
                  },
                  {
                    name: "Craigslist job fees",
                    verdict: "Opened the door for Indeed & LinkedIn",
                    story: "Free listings dominated classifieds. When they introduced fees for job postings in major markets, it opened the door for Indeed and LinkedIn — both with free-to-post models — to capture that market entirely.",
                  },
                  {
                    name: "The Knot / WeddingWire",
                    verdict: "Green Bowtie's biggest opportunity",
                    story: "Their pay-to-play model ($3,000–$10,000/year) means thousands of legitimate, beautiful venues don't appear. This is Green Bowtie's moat: be the complete directory The Knot can never be because they charge for listings.",
                    highlight: true,
                  },
                ].map(ex => (
                  <div key={ex.name} style={{ background: ex.highlight ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.06)", border: ex.highlight ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: ex.highlight ? "#fbbf24" : "#ffffff", marginBottom: 4 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: "#f87171", marginBottom: 8, fontStyle: "italic" }}>{ex.verdict}</div>
                    <div style={{ fontSize: 12, color: "#d1fae5", lineHeight: 1.6 }}>{ex.story}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(134,239,172,0.12)", borderTop: "1px solid rgba(134,239,172,0.2)", padding: "20px 36px" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#ffffff", marginBottom: 8 }}>The Correct Model</div>
            <p style={{ color: "#d1fae5", fontSize: 14, margin: 0, lineHeight: 1.8 }}>
              Build the most complete, highest-quality venue directory in the country by making listing free and automatic. Become the place every couple checks because it has every venue. <strong style={{ color: "#ffffff" }}>THEN monetize the attention, the intent, and the premium features — not the listings themselves.</strong> Free supply → massive inventory → high-intent users → premium monetization.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TRAFFIC-FIRST THESIS ── */}
      <Section title="The Traffic-First Thesis">
        <div style={{ background: "#f0f7f1", border: "1px solid #c6e0c8", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#3b6341", marginBottom: 12 }}>The Flywheel</div>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, fontSize: 13, color: "#374151" }}>
            {[
              "Complete listings",
              "Couples use the site",
              "Google ranks the site",
              "More couples",
              "Venue owners notice",
              "Venues engage",
              "Venues pay for premium",
              "Revenue",
            ].map((step, i, arr) => (
              <span key={step} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ background: "#3b6341", color: "#fff", borderRadius: 99, padding: "3px 12px", fontWeight: 600, fontSize: 12 }}>{step}</span>
                {i < arr.length - 1 && <span style={{ color: "#9ca3af", fontWeight: 700 }}>→</span>}
              </span>
            ))}
          </div>
        </div>

        <p style={{ marginBottom: 16, color: "#374151" }}>
          The goal of <strong>Year 1 is not revenue</strong>. It&apos;s traffic. Revenue is the natural consequence of traffic in this market.
          Couples spend an average of <strong>$33,900</strong> on their wedding — every venue page is a high-intent landing page visited by someone about to spend $10K+. That intent is the asset.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 8 }}>
          {[
            { traffic: "10,000/mo", revenue: "$2,500/mo", note: "A few hundred dollars. Prove the model.", color: "#f9fafb", border: "#e5e7eb" },
            { traffic: "100,000/mo", revenue: "$22,000/mo", note: "Real revenue. Mediavine + lead gen + featured listings.", color: "#f0f7f1", border: "#c6e0c8" },
            { traffic: "500,000/mo", revenue: "$110,000/mo", note: "Life-changing. Raptive display + full stack.", color: "#dcfce7", border: "#86efac" },
            { traffic: "1M+/mo", revenue: "Acquisition territory", note: "The Knot paid ~$1B for WeddingWire's traffic.", color: "#fef3c7", border: "#fcd34d" },
          ].map(t => (
            <div key={t.traffic} style={{ background: t.color, border: `1px solid ${t.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{t.traffic}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#3b6341", marginBottom: 6, fontFamily: "'Tenor Sans', sans-serif" }}>{t.revenue}</div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{t.note}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SECTION 3: REVENUE STREAMS ── */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 22, fontWeight: 700, color: "#3b6341", marginBottom: 4, paddingBottom: 8, borderBottom: "2px solid #e5e7eb" }}>All Monetization Options — Every Angle</h2>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 8 }}>Status: <StatusBadge status="built" /> Built&nbsp;&nbsp;<StatusBadge status="progress" /> In Progress&nbsp;&nbsp;<StatusBadge status="planned" /> Planned&nbsp;&nbsp;<StatusBadge status="future" /> Future</p>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 16, paddingBottom: 6, borderBottom: "1px solid #e5e7eb" }}>
            Venue-Side Monetization (B2B)
          </div>

          <StreamCard
            status="progress"
            number="1"
            emoji="⭐"
            name="Featured / Sponsored Listings"
            model="$49–$149/month · top placement + badge"
            effort="Low"
            effortColor="#dcfce7"
            tier1="$500–$2,500/mo"
            tier2="$5,000–$15,000/mo"
            tier3="$20,000–$60,000/mo"
            mrr="1% of 24,599 venues × $99/mo = $24K MRR. 3% = $73K MRR."
            nextStep='isFeatured DB flag is built. Next: Stripe billing page + "Featured" badge component. Cold email 50 premium venues in Napa, LA, SF at $49-149/mo.'
            pros={[
              "Revenue before traffic — close deals by phone, not SEO",
              "Recurring monthly — predictable cash flow",
              "Venues that don't pay still appear — just lower. Fair, defensible.",
            ]}
            cons={[
              "Cold outreach is manual work — needs a sales process",
              "Churns if traffic never builds — venues want ROI",
              "Need Stripe billing + venue dashboard to self-serve",
            ]}
          >
            Like Google Ads but for venue directories. Venues pay a monthly fee for top placement in city/state search results + a Featured badge. Venues that don&apos;t pay still appear in the directory — they just appear lower. This is the critical distinction from pay-to-list: <strong>everyone is in the index; you&apos;re paying for placement, not presence.</strong>
          </StreamCard>

          <StreamCard
            status="built"
            number="2"
            emoji="🏆"
            name="Verified / Claimed Listings (Freemium)"
            model="Free to claim · Premium $49–$199/mo for enhanced features"
            effort="Low"
            effortColor="#dcfce7"
            tier1="$500–$3,000/mo"
            tier2="$8,000–$25,000/mo"
            tier3="$30,000–$80,000/mo"
            mrr="500 venues on $99/mo = $49.5K MRR. 2,000 venues = $198K MRR."
            nextStep="Claim flow + venue owner dashboard is built. Design the premium tier feature set and set a price. Launch soft beta with 10 venue owners."
            pros={[
              "Exact same model as Yelp for Business, Google Business Profile, TripAdvisor Management",
              "Self-serve once built — no ongoing sales motion",
              "Upsell path from free claim → $99/mo → $199/mo is natural",
            ]}
            cons={[
              "Premium feature set needs to be compelling enough to convert",
              "Support burden: venues want to change photos, report bugs",
              "Churn risk if venue doesn't see inquiries from the listing",
            ]}
          >
            Free to claim your listing. A premium tier unlocks: full photo gallery, response analytics, inquiry management, highlight badge, availability calendar, and priority in city results. The same model Yelp, Google, and TripAdvisor use — and it works because the venues are already in the index whether they pay or not.
          </StreamCard>

          <StreamCard
            status="built"
            number="3"
            emoji="📩"
            name="Lead Generation / Pay-Per-Inquiry"
            model="$10–$25/lead (free tier: capped) · Premium: unlimited"
            effort="Low"
            effortColor="#dcfce7"
            tier1="$0–$500/mo"
            tier2="$3,000–$15,000/mo"
            tier3="$20,000–$80,000/mo"
            mrr="2,000 inquiries/month × $15/inquiry = $30K MRR at scale."
            nextStep="Inquiry forms are built on every venue page. Route leads to venues via email for now. Add pay-per-lead billing once volume justifies it."
            pros={[
              "Venues already pay The Knot $3K–10K/year for leads — we can undercut significantly",
              "High-intent leads — someone on a venue page is actively shopping",
              "Can sell leads manually before building automated routing",
            ]}
            cons={[
              "Needs traffic to generate lead volume",
              "Lead quality tracking is complex — venues want conversion proof",
              "FTC requires disclosure if reselling user data — needs clear privacy policy",
            ]}
          >
            Inquiry forms are live on every venue page. Collect: name, email, wedding date, guest count. On the free tier, venues get limited monthly inquiries. Premium unlocks all. Alternatively, charge per verified inquiry ($5–25 each). Wedding leads are worth $50–200 to venues on The Knot. We can offer qualified leads at lower CPL.
          </StreamCard>

          <StreamCard
            status="planned"
            number="4"
            emoji="🥇"
            name="Priority Placement by City / Region"
            model="$299–$499/month · top-3 city placement"
            effort="Low"
            effortColor="#dcfce7"
            tier1="$300–$1,500/mo"
            tier2="$4,000–$12,000/mo"
            tier3="$15,000–$45,000/mo"
            mrr="Fixed price for premium markets: LA, NYC, SF, Napa, Nashville. Different from featured — this is market-level dominance."
            nextStep="Define which cities qualify as 'premium markets.' Build city-level auction or fixed-price placement system after Stripe billing is live."
            pros={[
              "Premium markets have venues willing to pay significantly more",
              "Auction model creates competitive bidding — revenue goes up naturally",
              "Scarcity (only 3 top spots per city) creates urgency",
            ]}
            cons={[
              "Requires enough venue awareness in each market to run an auction",
              "Losing venues may complain — need clear, public rules",
              "More complex to manage than flat featured flag",
            ]}
          >
            A tier above standard featured listings: auction-style or fixed-price top-3 placement at the city level. A venue in Napa that wants to appear first in &ldquo;Napa Wedding Venues&rdquo; searches pays $399/mo. Different from basic featured (which just floats them above free listings) — this is market-level dominance with explicit ranking guarantees.
          </StreamCard>

          <StreamCard
            status="future"
            number="5"
            emoji="📸"
            name="Enhanced Media Packages"
            model="$500–$2,000 one-time + $49/mo hosting"
            effort="Medium"
            effortColor="#fef3c7"
            tier1="$0"
            tier2="$1,000–$5,000/mo"
            tier3="$5,000–$20,000/mo"
            mrr="Niche but high-margin. Professional photos + video make listings dramatically more effective — venues see direct ROI."
            nextStep="Partner with 1 real estate/venue photographer per major market. Revenue share: they provide the shoot, you sell the package, split the fee."
            pros={[
              "High-margin — partner with existing photographers, don't hire in-house",
              "Dramatically improves listing quality → better for SEO and conversions",
              "Natural upsell once venues are on premium tier",
            ]}
            cons={[
              "Requires photographer partner network — operational complexity",
              "Not scalable in-house — must be a partnership model",
              "Lower priority than core monetization streams",
            ]}
          >
            Sell professional photo shoots, virtual tours, and video integration directly to venues who want to stand out. Partner with regional photographers on a revenue-share model. This improves the overall quality of the directory while generating one-time + recurring revenue per venue.
          </StreamCard>
        </div>

        <div style={{ marginTop: 36 }}>
          <div style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 16, paddingBottom: 6, borderBottom: "1px solid #e5e7eb" }}>
            Couple-Side Monetization (B2C)
          </div>

          <StreamCard
            status="planned"
            number="6"
            emoji="📺"
            name="Display Advertising (Programmatic)"
            model="$8–$40 RPM depending on network and traffic"
            effort="Low"
            effortColor="#dcfce7"
            tier1="$300–$1,200/mo"
            tier2="$6,000–$20,000/mo"
            tier3="$40,000–$120,000/mo"
            mrr="At 100K visitors, 2.5 pages/session = 250K pageviews × $15 RPM = $3,750/mo. At 500K visitors with Raptive = $40K–$80K/mo."
            nextStep="Plausible analytics installed. Add Google AdSense now for low-traffic baseline. Apply to Mediavine at 50K sessions/mo. Apply to Raptive/AdThrive at 100K pageviews."
            pros={[
              "Wedding niche has some of the highest CPMs — $15–40 RPM vs $3–8 average",
              "Fully passive — Mediavine/Raptive handle all ad ops after setup",
              "Advertisers (rings, dresses, florists) pay top dollar to reach active planners",
            ]}
            cons={[
              "Mediavine requires 50K sessions/mo, Raptive requires 100K pageviews — traffic first",
              "Ads hurt UX if overdone — keep tasteful, don't run AdSense on low-traffic pages",
              "Early AdSense RPM is low ($3–8) — placeholder until Mediavine",
            ]}
          >
            Wedding content commands premium CPMs because high-spend advertisers (rings, dresses, photographers, florists) pay top dollar to reach people actively planning a $34K event.
            Thresholds: <strong>Google AdSense</strong> (any traffic), <strong>Mediavine</strong> (50K sessions/mo), <strong>Raptive</strong> (100K pageviews/mo). Don&apos;t overload ads on a site with &lt;50K visitors — it looks desperate and hurts venue credibility.
          </StreamCard>

          <StreamCard
            status="planned"
            number="7"
            emoji="🔗"
            name="Affiliate Marketing"
            model="2–10% commission or $10–50/conversion"
            effort="Low"
            effortColor="#dcfce7"
            tier1="$200–$800/mo"
            tier2="$2,000–$8,000/mo"
            tier3="$8,000–$30,000/mo"
            mrr="Wedding insurance converts especially well — couples are already anxious about deposits. Amazon pays on everything bought after clicking, not just registry items."
            nextStep="Sign up for: WedSafe/Wedsure (wedding insurance — $15–50/conversion), Amazon Associates (registry — 2–4%), Booking.com (guest blocks — $10–30/booking), Zola (registry referral)."
            pros={[
              "Zero ongoing work after setup — passive income",
              "Multiple high-converting verticals: insurance, registry, travel, apparel",
              "Amazon link pays on everything in the cart after clicking — not just wedding items",
            ]}
            cons={[
              "Low revenue at low traffic — needs scale",
              "The Knot / WeddingWire affiliate programs pay poorly ($1–5 CPC)",
              "Affiliate links must be contextual — avoid looking spammy",
            ]}
          >
            Programs to activate: wedding insurance (WedSafe, Markel — $15–50/policy), registry (Amazon Associates 3–8%, Zola referral), guest accommodations (Hotels.com/Booking.com — 4%, $10–30/booking), honeymoon travel (Honeyfund referral), wedding apparel (Azazie, BHLDN — 5–10%). Add a &ldquo;Planning Resources&rdquo; section to every venue detail page.
          </StreamCard>

          <StreamCard
            status="planned"
            number="8"
            emoji="📧"
            name="Email List Monetization"
            model="$0.50–$2/subscriber/month at scale"
            effort="Medium"
            effortColor="#fef3c7"
            tier1="$0–$200/mo"
            tier2="$1,500–$8,000/mo"
            tier3="$8,000–$40,000/mo"
            mrr="50,000 subscribers = $25K–100K/mo. Wedding list has extremely high LTV — couples spending $34K will click anything relevant."
            nextStep='Add email capture to every venue page now: "Save this venue", venue comparison tool, wedding checklist download. Even 50 signups/mo compounds into a valuable list.'
            pros={[
              "Owned channel — not dependent on Google rankings",
              "Sponsored sends to 10K subscribers = $1K–3K/send from dress brands, jewelers",
              "Drip sequences with affiliate links earn passively on every send",
            ]}
            cons={[
              "Slow to build — 12+ months to meaningful list size organically",
              "Requires consistent content to keep subscribers engaged",
              "CAN-SPAM compliance required from day one",
            ]}
          >
            Capture emails via: &ldquo;Save this venue&rdquo; button, venue comparison tool, wedding checklist download. Monetize via: sponsored newsletter sends, affiliate product drops, venue promotions. At 10K subscribers, sell sponsorships to wedding dress brands, jewelry companies, travel agencies. Email is the one channel you own outright — not rented from Google.
          </StreamCard>

          <StreamCard
            status="future"
            number="9"
            emoji="📰"
            name="Sponsored Content / Native Advertising"
            model="$500–$2,000 per sponsored story"
            effort="Low"
            effortColor="#dcfce7"
            tier1="$0"
            tier2="$500–$3,000/mo"
            tier3="$3,000–$15,000/mo"
            mrr="Editorial-style content that reads naturally. Must be disclosed as sponsored. High margin — no ad infrastructure needed."
            nextStep="Build an editorial section first (/blog or /inspiration). Earn organic traffic on wedding content. Sponsored posts become valuable once the editorial section has SEO traction."
            pros={[
              "High CPM equivalent — $500–2K per post vs display ads earning cents",
              "Builds brand credibility alongside the directory",
              "Low infrastructure cost — just write and publish",
            ]}
            cons={[
              "Must be FTC-disclosed as sponsored",
              "Risk of editorial credibility if done poorly",
              "Requires editorial traffic first — Tier 2+ play",
            ]}
          >
            Venues or vendors pay for editorial-style &ldquo;featured story&rdquo; content: &ldquo;The 7 Most Breathtaking Barn Venues in Tennessee&rdquo; (sponsored by Venue X). Pairs naturally with an editorial/inspiration section of the site. At scale, this is how media companies print money — sponsored content at scale is pure margin.
          </StreamCard>
        </div>

        <div style={{ marginTop: 36 }}>
          <div style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 16, paddingBottom: 6, borderBottom: "1px solid #e5e7eb" }}>
            Data &amp; Platform Monetization
          </div>

          <StreamCard
            status="future"
            number="10"
            emoji="📸"
            name="Vendor Directory (Photographers, Caterers, DJs)"
            model="$99–$299/month per vendor listing"
            effort="Medium"
            effortColor="#fef3c7"
            tier1="$0–$1,000/mo"
            tier2="$4,000–$20,000/mo"
            tier3="$15,000–$60,000/mo"
            mrr="1.2M wedding vendors in the US. 0.1% paying $49/mo = $58K MRR. Same freemium model as venues — free to list, pay for premium placement + leads."
            nextStep="Build /vendors section after venue monetization is stable. Start with photographers (highest willingness to pay for leads in the wedding market)."
            pros={[
              "Multiplies monetized surface area — venues + vendors = 2x+ the paying customers",
              "Natural cross-sell: couple finds venue → needs photographer → sees vendor directory",
              "Photographers/caterers/florists all pay The Knot $3K–10K/year — same opportunity",
            ]}
            cons={[
              "Separate sales motion to vendors — different audience, different pitch",
              "Needs meaningful traffic before vendors see ROI",
              "Content for vendor pages adds significant scope",
            ]}
          >
            A separate directory section (/vendors) where photographers, caterers, florists, DJs, officiants, and coordinators pay for listing placement. The Knot charges vendors the same $3K–10K/year they charge venues. Same opportunity, same model: free to list, pay for premium placement and leads. Couples on venue pages are the exact audience vendors want — cross-link heavily.
          </StreamCard>

          <StreamCard
            status="future"
            number="11"
            emoji="🗄️"
            name="Data Licensing / Market Intelligence"
            model="$10K–$50K/year per data contract"
            effort="Low"
            effortColor="#dcfce7"
            tier1="$0"
            tier2="$1,000–$5,000/mo"
            tier3="$5,000–$20,000/mo"
            mrr="B2B buyers pay on contract — predictable recurring revenue. 24,599 venues with AI-enriched descriptions + photos is genuinely valuable market intelligence."
            nextStep="Identify 5 potential buyers: wedding planning apps, event rental companies, wedding insurance providers, regional event agencies. Cold email with a sample dataset."
            pros={[
              "Zero marginal cost — data already exists",
              "B2B contracts are sticky — annual recurring revenue",
              "AI-enriched data with quality scores is a real differentiator",
            ]}
            cons={[
              "Need to audit terms of service for all data sources before licensing",
              "Requires legal agreement / data licensing terms for each buyer",
              "Likely a $5–20K/mo ceiling — not a primary stream, but pure margin",
            ]}
          >
            License the venue database (name, address, AI descriptions, photos, website, venue type, capacity, quality score) to wedding planning apps, event companies, insurance providers, or travel agencies. Package as CSV export or REST API. Buyers: wedding software companies, real estate developers (venue development intel), event planning platforms, hotel concierge apps.
          </StreamCard>

          <StreamCard
            status="future"
            number="12"
            emoji="⚙️"
            name="White Label / API Access"
            model="$500–$5,000/month per API customer"
            effort="Medium"
            effortColor="#fef3c7"
            tier1="$0"
            tier2="$500–$3,000/mo"
            tier3="$5,000–$25,000/mo"
            mrr="Requires scale to be credible. Target customers: wedding planning apps, hotel concierge services, corporate event planners, destination wedding companies."
            nextStep="Tier 3 play — don't build until the venue database is 50K+ strong and the site has 100K+ monthly visitors. The data needs to be undeniably the best in the category."
            pros={[
              "Highest revenue per customer of any stream",
              "B2B SaaS economics — high margins, predictable MRR",
              "Positions Green Bowtie as infrastructure, not just a directory",
            ]}
            cons={[
              "Requires significant scale and data quality before anyone will pay for API access",
              "API support and SLA maintenance is real engineering overhead",
              "Long sales cycles for B2B API contracts",
            ]}
          >
            License the venue database and search API to wedding planning apps, hotel concierge services, and event planners who want to offer venue discovery without building the index themselves. At scale, Green Bowtie becomes the venue data layer for the wedding industry — the way Clearbit became the company data layer for SaaS.
          </StreamCard>

          <StreamCard
            status="future"
            number="13"
            emoji="💳"
            name="Stripe Payments — Venue Deposits"
            model="1–2% transaction fee on deposits"
            effort="High"
            effortColor="#fee2e2"
            tier1="$0"
            tier2="$0–$2,000/mo"
            tier3="$15,000–$50,000/mo"
            mrr="1,000 bookings/month × $2,000 avg deposit × 1.5% = $30K MRR. Creates massive stickiness — venues become operationally dependent on the platform."
            nextStep="Do not build until venue dashboard and inquiry system are fully operational. Payments require trust and compliance infrastructure — this is a Tier 4 play."
            pros={[
              "Venues currently process deposits offline (Venmo, checks, wire) — huge friction",
              "Stickiness: once a venue processes payments through you, they don't leave",
              "1.5% on $2K deposits is meaningful revenue at scale with low marginal cost",
            ]}
            cons={[
              "Significant compliance overhead — money transmission, fraud, chargebacks",
              "Stripe Connect setup requires substantial engineering",
              "Venue trust must be established first — don't rush this",
            ]}
          >
            Facilitate venue deposits through the platform using Stripe Connect. Venues currently process deposits offline — cash, checks, Venmo — with no accountability. Bringing it online creates operational stickiness (once a venue uses your payment system, they won&apos;t leave) and a 1–2% transaction fee on every booking deposit flowing through the platform.
          </StreamCard>
        </div>
      </section>

      {/* ── MODEL COMPARISON ── */}
      <Section title="📊 Pay-to-List vs. Free-to-List — Why Our Model Wins">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f0f7f1" }}>
              <th style={th}>Factor</th>
              <th style={{ ...th, color: "#dc2626", background: "#fef2f2" }}>❌ Pay-to-List Model (The Knot)</th>
              <th style={{ ...th, color: "#16a34a", background: "#f0fdf4" }}>✓ Free-to-List + Premium (Green Bowtie)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Directory completeness", "Partial — only venues that pay appear. Thousands missing.", "Complete — every venue in the country is indexed automatically."],
              ["User trust", "Low — couples know paid listings are biased.", "High — couples trust a complete, unbiased index."],
              ["SEO value", "Thin — can't rank for venues that aren't in the directory.", "Strong — every venue page is indexable content Google can rank."],
              ["Venue sentiment", "Adversarial — venues resent paying before seeing any value.", "Positive — venues get free exposure first, pay only if they want more."],
              ["Barrier to scale", "High — every new venue requires a sales close.", "Zero — venues are added automatically from public data."],
              ["Competitive moat", "Weak — another directory can undercut pricing.", "Strong — years of SEO compounding can't be bought overnight."],
              ["Revenue ceiling", "Capped by # of venues willing to pay to list.", "Uncapped — grows with traffic, not with venue sales reps."],
              ["Exit valuation", "Lower — revenue is tied to a sales team.", "Higher — SEO traffic and data assets command premium multiples."],
            ].map(([factor, bad, good]) => (
              <tr key={factor} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ ...td, fontWeight: 600, color: "#374151", width: "22%" }}>{factor}</td>
                <td style={{ ...td, color: "#991b1b", background: "#fef2f2", width: "39%" }}>{bad}</td>
                <td style={{ ...td, color: "#166534", background: "#f0fdf4", width: "39%" }}>{good}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── WHAT NOT TO DO ── */}
      <Section title="🚫 What NOT to Do — Anti-Patterns">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            {
              title: "Don't charge to list",
              body: "See Section 1. In full. This is the single most important strategic decision in this business. If you ever waver, re-read the Yellow Pages / Angie's List examples.",
            },
            {
              title: "Don't paywall search results",
              body: "Some directories require account creation to see full listings. This kills SEO (Googlebot can't crawl), kills casual discovery, and annoys users. Keep it open. Gate premium features, not discovery.",
            },
            {
              title: "Don't over-monetize too early",
              body: "Ads on a site with 1,000 visitors look desperate and hurt credibility with venues. Wait for the Mediavine threshold (50K sessions/mo) before running display ads prominently.",
            },
            {
              title: "Don't charge per-city listing fees",
              body: "Some directories charge venues extra to appear in each city they serve (a Napa venue paying more to appear in SF searches). This is predatory and generates instant bad word-of-mouth in the tight-knit venue community.",
            },
            {
              title: "Don't build the venue dashboard before traffic",
              body: "Building a full self-serve portal is weeks of engineering. Do it when you have 50+ paying venues. Before that, manually toggle DB flags and email venues. Don't optimize the sales machine before you have sales.",
            },
            {
              title: "Don't add display ads before 50K visitors",
              body: "AdSense at 5K visitors earns ~$30/mo and makes the site look cheap to venues evaluating whether to pay for a featured listing. The opportunity cost of credibility is higher than $30.",
            },
          ].map(item => (
            <div key={item.title} style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#dc2626", marginBottom: 6 }}>✗ {item.title}</div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── REVENUE PROJECTIONS ── */}
      <Section title="📊 Blended Revenue Projections">
        <p style={{ marginBottom: 16, color: "#6b7280", fontSize: 14 }}>Conservative/realistic/optimistic at three traffic tiers. Assumes multiple streams running simultaneously.</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f0f7f1" }}>
              <th style={th}>Traffic Tier</th>
              <th style={th}>Conservative</th>
              <th style={th}>Realistic</th>
              <th style={th}>Optimistic</th>
              <th style={th}>Key Revenue Streams Active</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}><strong>10k visitors/mo</strong></td>
              <td style={td}>$800/mo</td>
              <td style={{ ...td, color: "#3b6341", fontWeight: 700 }}>$2,500/mo</td>
              <td style={td}>$5,000/mo</td>
              <td style={{ ...td, color: "#6b7280" }}>Featured listings + affiliates + AdSense</td>
            </tr>
            <tr style={{ background: "#fafafa" }}>
              <td style={td}><strong>50k sessions/mo</strong></td>
              <td style={td}>$3,000/mo</td>
              <td style={{ ...td, color: "#3b6341", fontWeight: 700 }}>$9,000/mo</td>
              <td style={td}>$18,000/mo</td>
              <td style={{ ...td, color: "#6b7280" }}>Mediavine display + featured listings + affiliates + lead gen</td>
            </tr>
            <tr>
              <td style={td}><strong>100k visitors/mo</strong></td>
              <td style={td}>$8,000/mo</td>
              <td style={{ ...td, color: "#3b6341", fontWeight: 700 }}>$22,000/mo</td>
              <td style={td}>$45,000/mo</td>
              <td style={{ ...td, color: "#6b7280" }}>Raptive/Mediavine + lead gen + claimed listings + vendor directory beta + email</td>
            </tr>
            <tr style={{ background: "#fafafa" }}>
              <td style={td}><strong>500k visitors/mo</strong></td>
              <td style={td}>$40,000/mo</td>
              <td style={{ ...td, color: "#3b6341", fontWeight: 700 }}>$110,000/mo</td>
              <td style={td}>$220,000/mo</td>
              <td style={{ ...td, color: "#6b7280" }}>Raptive display + pay-per-lead + vendor SaaS + data licensing + email list + sponsored content</td>
            </tr>
            <tr>
              <td style={td}><strong>1M+ visitors/mo</strong></td>
              <td style={td}>$120,000/mo</td>
              <td style={{ ...td, color: "#3b6341", fontWeight: 700 }}>$300,000/mo</td>
              <td style={td}>$600,000/mo+</td>
              <td style={{ ...td, color: "#6b7280" }}>Full stack + API licensing + transaction fees + acquisition territory</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
          Comparable: The Knot acquired WeddingWire for ~$1B driven by traffic and lead gen revenue. Their traffic was ~20M monthly visitors. Green Bowtie at 1M visitors (5% of their scale) with a leaner model should generate $2M–5M ARR.
        </p>
      </Section>

      {/* ── PRIORITY ACTION PLAN ── */}
      <Section title="🎯 Priority Action Plan">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <PriorityBox
            label="RIGHT NOW (0–6 months)"
            color="#dcfce7"
            border="#86efac"
            items={[
              "1. Stripe billing for featured listings — isFeatured flag is built, just needs billing",
              "2. Cold email 50 premium venues (Napa, LA, SF) — $49–149/mo pitch",
              "3. Add affiliate links (Wedsure, Amazon registry, Booking.com) — zero dev work",
              "4. Email capture on every venue page — future gold",
            ]}
          />
          <PriorityBox
            label="50K+ VISITORS (6–18 months)"
            color="#dbeafe"
            border="#93c5fd"
            items={[
              "1. Apply to Mediavine (50K sessions) — wedding RPM is $15–40",
              "2. Launch pay-per-lead routing — sell leads at $10–25 each",
              "3. Vendor directory beta — photographers first",
              "4. Venue comparison tool — premium feature for venues",
            ]}
          />
          <PriorityBox
            label="SCALE (18+ months)"
            color="#fef3c7"
            border="#fcd34d"
            items={[
              "1. Raptive/AdThrive — $40–60 RPM at 500K visitors",
              "2. Venue self-serve dashboard — $149–199/mo premium profiles",
              "3. Email list sponsorships — sell sponsored sends at scale",
              "4. Data licensing + API to wedding apps and planners",
            ]}
          />
        </div>
      </Section>

      {/* ── PHASE ROADMAP ── */}
      <Section title="🗓️ Phase Roadmap">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            {
              phase: "Phase 1",
              label: "Now — 6 Months",
              goal: "Build traffic. First revenue.",
              color: "#dcfce7",
              border: "#86efac",
              items: [
                "Complete national venue rollout (50 states)",
                "Featured listings soft launch — Stripe billing + isFeatured badge",
                "Inquiry system live on all venue pages",
                "Venue claiming + owner dashboard MVP",
                "Affiliate links on all venue pages",
                "Email capture widget deployed",
              ],
            },
            {
              phase: "Phase 2",
              label: "6–18 Months",
              goal: "Hit 50K sessions/mo. First ad revenue.",
              color: "#dbeafe",
              border: "#93c5fd",
              items: [
                "Apply to Mediavine (50K sessions threshold)",
                "Launch display ads — $15–40 RPM in wedding niche",
                "Activate affiliate programs (insurance, registry, travel)",
                "Pay-per-lead inquiry routing to venues",
                "Vendor directory beta — photographers + caterers",
                "Email list growth push — checklist lead magnet",
              ],
            },
            {
              phase: "Phase 3",
              label: "18–36 Months",
              goal: "100K+ sessions/mo. Multi-stream revenue.",
              color: "#fef3c7",
              border: "#fcd34d",
              items: [
                "Full vendor directory (all 6+ categories)",
                "Email list monetization — sponsored sends + affiliate drips",
                "Venue self-serve dashboard — premium profiles at $149–199/mo",
                "API licensing beta — wedding apps + concierge services",
                "Sponsored editorial content / native advertising",
                "AI venue matchmaking email product",
              ],
            },
            {
              phase: "Phase 4",
              label: "3–5 Years",
              goal: "500K+ sessions/mo. Market leader.",
              color: "#fce7f3",
              border: "#f9a8d4",
              items: [
                "Raptive/AdThrive — $40–60 RPM at 500K+ visitors",
                "Stripe transaction fees on venue deposits",
                "Data licensing contracts — industry publications + real estate",
                "White label API — licensed to hotel concierge apps",
                "Acquisition target or Series A territory",
                "~$3–10M ARR at this scale",
              ],
            },
          ].map(p => (
            <div key={p.phase} style={{ background: p.color, border: `1px solid ${p.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", marginBottom: 2 }}>{p.phase}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "#111827" }}>{p.label}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, fontStyle: "italic" }}>Goal: {p.goal}</div>
              {p.items.map(item => (
                <div key={item} style={{ fontSize: 13, color: "#374151", marginBottom: 6, display: "flex", gap: 8 }}>
                  <span style={{ color: "#3b6341", fontWeight: 700, flexShrink: 0 }}>→</span>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      {/* ── UNCONVENTIONAL ANGLES ── */}
      <Section title="💡 Unconventional Angles (Most Directories Miss These)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Insight title="AI Venue Matchmaking Email">
            Couples enter guest count, style, budget, and date. Email them their top 5 matched venues. Each link is tracked — sell &ldquo;matched couple inquiries&rdquo; to venues at $25–75/lead. Higher quality than a cold click because the couple was pre-matched.
          </Insight>
          <Insight title="Venue Comparison Tool">
            Let couples compare 2–3 venues side by side. Venues pay $50–100/mo to &ldquo;unlock&rdquo; comparison features (show pricing, capacity, amenities). Couples love it. Venues pay to be in the comparison set.
          </Insight>
          <Insight title="Wedding Date SEO Pages">
            &ldquo;Wedding venues available in [month] [year]&rdquo; — high intent, low competition. Capture couples with a specific date and email them matched venues. List-building play that Google rewards with rankings.
          </Insight>
          <Insight title="Photography Rev Share">
            Partner with 1 photographer per major city. They pay 10–15% rev share on bookings originating from your directory. At 100K visitors: 50–100 photographer inquiries/mo → $500–2,000/mo in rev share with zero inventory.
          </Insight>
          <Insight title="Venue Owner &ldquo;Competitor Intel&rdquo; Report">
            Premium paid feature: &ldquo;See how many times your venue page was viewed vs. the top 3 competitors in your city last month.&rdquo; Venue owners are obsessed with this. $29–49/mo, pure software margin.
          </Insight>
          <Insight title="Regional Bridal Show Partnerships">
            Partner with local bridal show organizers. They promote Green Bowtie to attendees; Green Bowtie promotes their show to our email list. Cross-promotional email swap = free list growth + credibility with venue owners who attend shows.
          </Insight>
        </div>
      </Section>

      <div style={{ background: "#f0f7f1", border: "1px solid #c6e0c8", borderRadius: 8, padding: "16px 20px", marginTop: 16, fontSize: 14, color: "#3b6341" }}>
        <strong>Bottom line:</strong> The fastest path to $10K/mo is cold-emailing premium venues for featured listings while building SEO traffic. The path to $100K/mo is Mediavine display ads + lead gen at 100K monthly visitors. The path to $1M ARR is becoming the &ldquo;independent alternative to The Knot&rdquo; — which is achievable with a national footprint and 500K+ monthly visitors. The model that gets us there is the same one that built every dominant marketplace: <strong>free supply, massive inventory, premium monetization on top.</strong>
      </div>

      <p style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", marginTop: 48 }}>
        Green Bowtie Monetization Strategy · March 2026 · <a href="https://greenbowtie.com/data" style={{ color: "#9ca3af" }}>Internal Use Only</a>
      </p>
    </main>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

const th: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: 13, borderBottom: "2px solid #e5e7eb" };
const td: React.CSSProperties = { padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #f3f4f6" };

function StatusBadge({ status }: { status: "built" | "progress" | "planned" | "future" }) {
  const map = {
    built: { label: "Built", bg: "#dcfce7", color: "#166534", dot: "🟢" },
    progress: { label: "In Progress", bg: "#fef3c7", color: "#92400e", dot: "🟡" },
    planned: { label: "Planned", bg: "#dbeafe", color: "#1e40af", dot: "🔵" },
    future: { label: "Future", bg: "#f3f4f6", color: "#6b7280", dot: "⚪" },
  };
  const s = map[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: s.bg, color: s.color, borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
      {s.dot} {s.label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 22, fontWeight: 700, color: "#3b6341", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #e5e7eb" }}>{title}</h2>
      <div style={{ color: "#374151" }}>{children}</div>
    </section>
  );
}

function StreamCard({
  status, number, emoji, name, model, effort, effortColor,
  tier1, tier2, tier3, mrr, nextStep, pros, cons, children,
}: {
  status: "built" | "progress" | "planned" | "future";
  number: string; emoji: string; name: string; model: string;
  effort: string; effortColor: string;
  tier1: string; tier2: string; tier3: string;
  mrr: string; nextStep: string;
  pros: string[]; cons: string[]; children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 32, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ background: "#f9fafb", padding: "12px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", minWidth: 20 }}>#{number}</span>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <h3 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 17, fontWeight: 700, margin: 0, color: "#111827" }}>{name}</h3>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <StatusBadge status={status} />
          <span style={{ background: effortColor, border: "1px solid #d1d5db", borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>Effort: {effort}</span>
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <p style={{ color: "#374151", marginBottom: 10, fontSize: 14 }}>{children}</p>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}><strong>Model:</strong> {model}</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 10 }}>
          <thead>
            <tr style={{ background: "#f0f7f1" }}>
              <th style={th}>10K visitors/mo</th>
              <th style={th}>100K visitors/mo</th>
              <th style={th}>500K visitors/mo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}>{tier1}</td>
              <td style={{ ...td, color: "#3b6341", fontWeight: 600 }}>{tier2}</td>
              <td style={td}>{tier3}</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14, fontStyle: "italic" }}>📐 {mrr}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#16a34a" }}>✓ Pros</div>
            {pros.map(p => <div key={p} style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>• {p}</div>)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#dc2626" }}>✗ Risks</div>
            {cons.map(c => <div key={c} style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>• {c}</div>)}
          </div>
        </div>
        <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
          <strong>→ Next step:</strong> {nextStep}
        </div>
      </div>
    </section>
  );
}

function PriorityBox({ label, color, border, items }: { label: string; color: string; border: string; items: string[] }) {
  return (
    <div style={{ background: color, border: `1px solid ${border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, color: "#374151" }}>{label}</div>
      {items.map(item => <div key={item} style={{ fontSize: 13, color: "#1f2937", marginBottom: 8, lineHeight: 1.5 }}>{item}</div>)}
    </div>
  );
}

function Insight({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#f0f7f1", border: "1px solid #c6e0c8", borderRadius: 10, padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#3b6341", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}
