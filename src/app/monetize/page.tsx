import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monetization Strategy — Green Bowtie Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function MonetizePage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px", fontFamily: "'Nunito Sans', sans-serif", color: "#1a1a1a", lineHeight: 1.7 }}>

      <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: "12px 16px", marginBottom: 32, fontSize: 13 }}>
        🔒 Internal strategy doc — not indexed. Do not share publicly.
      </div>

      <h1 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 36, fontWeight: 700, marginBottom: 4 }}>💰 Green Bowtie Monetization Strategy</h1>
      <p style={{ color: "#6b7280", marginBottom: 8 }}>Every angle, every number. Built for a solo operator moving fast.</p>
      <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 48 }}>Updated: March 2026 · CA live · National rollout in progress</p>

      {/* ── NORTH STAR ── */}
      <Section title="North Star">
        <p>Wedding content commands premium ad rates ($15–40 RPM vs $3–8 for general content). Couples spend an average of <strong>$33,900</strong> on their wedding. Every venue page is a high-intent landing page visited by someone about to spend $10k+. That intent is the asset — the entire monetization strategy is built around capturing a slice of that spend at each stage of the funnel.</p>
        <p>Priority order: <strong>list venues → build SEO traffic → capture email → monetize intent</strong>. Revenue before 50k visitors/mo is supplemental. The real money starts at scale.</p>
      </Section>

      {/* ── BLENDED REVENUE MODEL ── */}
      <Section title="📊 Blended Revenue Model">
        <p style={{ marginBottom: 16, color: "#6b7280", fontSize: 14 }}>Conservative/realistic/optimistic at three traffic tiers. Assumes multiple streams running simultaneously.</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f0f7f1" }}>
              <th style={th}>Traffic Tier</th>
              <th style={th}>Conservative</th>
              <th style={th}>Realistic</th>
              <th style={th}>Optimistic</th>
              <th style={th}>Primary Drivers</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}><strong>10k visitors/mo</strong></td>
              <td style={td}>$800/mo</td>
              <td style={{...td, color: "#3b6341", fontWeight: 700}}>$2,500/mo</td>
              <td style={td}>$5,000/mo</td>
              <td style={td}>Premium listings + affiliates + AdSense</td>
            </tr>
            <tr style={{ background: "#fafafa" }}>
              <td style={td}><strong>100k visitors/mo</strong></td>
              <td style={td}>$8,000/mo</td>
              <td style={{...td, color: "#3b6341", fontWeight: 700}}>$22,000/mo</td>
              <td style={td}>$45,000/mo</td>
              <td style={td}>Mediavine ads + lead gen + premium listings + vendor directory</td>
            </tr>
            <tr>
              <td style={td}><strong>500k visitors/mo</strong></td>
              <td style={td}>$40,000/mo</td>
              <td style={{...td, color: "#3b6341", fontWeight: 700}}>$110,000/mo</td>
              <td style={td}>$220,000/mo</td>
              <td style={td}>Raptive display + pay-per-lead + vendor SaaS + data licensing</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* ── PRIORITY MOVES ── */}
      <Section title="🎯 Priority Action Plan">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 8 }}>
          <PriorityBox
            label="RIGHT NOW (0-6 months)"
            color="#dcfce7"
            border="#86efac"
            items={[
              "1. Cold email 50 premium venues (Napa, LA, SF) — $49-149/mo listings",
              "2. Add affiliate links to all venue pages today — zero dev work",
              "3. Add email capture to every venue page — future gold",
            ]}
          />
          <PriorityBox
            label="50k+ VISITORS (6-18 months)"
            color="#dbeafe"
            border="#93c5fd"
            items={[
              "1. Apply to Mediavine (50k sessions) — wedding RPM is $15-40",
              "2. Launch pay-per-lead inquiry forms — sell leads at $10-50 each",
              "3. Launch vendor directory — photographers/caterers pay for leads",
            ]}
          />
          <PriorityBox
            label="SCALE (18+ months)"
            color="#fef3c7"
            border="#fcd34d"
            items={[
              "1. Raptive/AdThrive — $40-60 RPM at 500k visitors",
              "2. Booking integration — take 3-5% transaction fee",
              "3. Data licensing to wedding planners, event companies",
            ]}
          />
        </div>
      </Section>

      {/* ── STREAM 1: PREMIUM LISTINGS ── */}
      <StreamSection
        emoji="⭐"
        name="Premium / Featured Venue Listings"
        model="Flat monthly fee ($49–$149/mo per venue)"
        effort="Low"
        effortColor="#dcfce7"
        tier1="$500–$2,500/mo"
        tier2="$5,000–$15,000/mo"
        tier3="$20,000–$60,000/mo"
        nextStep='Cold email 50 top venues in Napa, LA, and SF this week. Pitch: "Top placement in Green Bowtie — the fastest-growing wedding venue directory in California."'
        pros={[
          "Revenue before traffic — you close deals on the phone, not SEO",
          "Recurring monthly — predictable cash flow",
          "Aligned incentives: venues pay more = better placements = they get leads = they stay",
        ]}
        cons={[
          "Cold outreach is manual work — doesn't scale without a sales process",
          "Churns if traffic never builds — venues want ROI",
          "Need to build a simple billing system (Stripe) and a 'featured' flag in the DB",
        ]}
      >
        Venues pay a monthly flat fee for top placement in search results, a featured badge, and priority in city/state listings. Build a <code>isFeatured</code> DB flag + Stripe billing page. No venue portal needed yet — you manually toggle the flag when they pay.
      </StreamSection>

      {/* ── STREAM 2: AFFILIATE LINKS ── */}
      <StreamSection
        emoji="🔗"
        name="Affiliate Links"
        model="CPC / rev share (2–8% per booking or $1–15 per click)"
        effort="Low"
        effortColor="#dcfce7"
        tier1="$200–$800/mo"
        tier2="$2,000–$8,000/mo"
        tier3="$8,000–$30,000/mo"
        nextStep="Sign up for The Knot Pro affiliate, Amazon Associates (registry), and Wedsure (wedding insurance) this week. Add links to every venue detail page."
        pros={[
          "Zero ongoing work after setup — passive income",
          "Wedding insurance converts well — couples are already anxious about deposits",
          "Amazon registry affiliate pays on everything bought after clicking — not just registry items",
        ]}
        cons={[
          "The Knot / WeddingWire affiliate programs are stingy — $1-5 CPC",
          "Low revenue at low traffic",
          "Affiliate links can look spammy — keep them contextual and tasteful",
        ]}
      >
        Contextual affiliate links on venue pages: wedding insurance (Wedsure/WedSafe — $15-50/conversion), registry links (Amazon/Zola — 2-4%), honeymoon travel (Booking.com — 4%), and planning tools. Add a &ldquo;Planning Resources&rdquo; section to venue detail pages.
      </StreamSection>

      {/* ── STREAM 3: DISPLAY ADS ── */}
      <StreamSection
        emoji="📺"
        name="Display Advertising"
        model="CPM — $8–40 RPM depending on network and traffic"
        effort="Low"
        effortColor="#dcfce7"
        tier1="$300–$1,200/mo"
        tier2="$6,000–$20,000/mo"
        tier3="$40,000–$120,000/mo"
        nextStep="Add Google AdSense now (10k+ visitors). Apply to Mediavine at 50k sessions. Apply to Raptive/AdThrive at 100k pageviews."
        pros={[
          "Wedding niche has some of the highest CPMs on the web — $15-40 RPM vs $3-8 average",
          "Fully passive — set and forget",
          "Mediavine/Raptive handle all ad ops — no work after setup",
        ]}
        cons={[
          "Mediavine requires 50k sessions/mo, Raptive requires 100k pageviews — need traffic first",
          "Ads hurt UX — can increase bounce rate if overdone",
          "Google AdSense RPM is low ($3-8) — only worth it as a placeholder until Mediavine",
        ]}
      >
        Wedding content commands premium CPMs because advertisers (rings, dresses, florists, photographers) pay top dollar to reach people actively planning. At 100k visitors with 2.5 pages/session = 250k pageviews → $15 RPM = $3,750/mo. At 500k visitors = $40,000–$80,000/mo with Raptive.
      </StreamSection>

      {/* ── STREAM 4: LEAD GEN ── */}
      <StreamSection
        emoji="📩"
        name="Pay-Per-Lead / Inquiry Forms"
        model="$10–$50 per verified lead sold to venue"
        effort="Medium"
        effortColor="#fef3c7"
        tier1="$0–$500/mo"
        tier2="$3,000–$15,000/mo"
        tier3="$20,000–$80,000/mo"
        nextStep='Add an inquiry form to every venue detail page. Collect: name, email, wedding date, guest count. At 50k visitors this becomes the highest-ROI stream.'
        pros={[
          "Venues already pay The Knot $150-500/mo for leads — you can undercut and win",
          "High-intent leads — someone on a venue page is actively shopping",
          "Can start selling leads manually before building an automated system",
        ]}
        cons={[
          "Need traffic to generate leads — not a day-1 move",
          "Lead quality tracking is complex — venues want proof the lead converted",
          "FTC requires disclosure if selling user data — needs clear terms/privacy policy",
        ]}
      >
        Add an inquiry form to each venue detail page. Collect couple&apos;s name, email, wedding date, guest count. At low traffic, forward leads manually and charge venues $10-25/lead. At scale, build an automated lead routing system. Wedding leads are worth $50-200 to venues — you&apos;re leaving money on the table without this.
      </StreamSection>

      {/* ── STREAM 5: VENDOR DIRECTORY ── */}
      <StreamSection
        emoji="📸"
        name="Vendor Directory"
        model="$99–$299/mo per vendor listing"
        effort="Medium"
        effortColor="#fef3c7"
        tier1="$0–$1,000/mo"
        tier2="$4,000–$20,000/mo"
        tier3="$15,000–$60,000/mo"
        nextStep="Build a simple vendor listing page (/vendors). Start with photographers and caterers — they have the highest willingness to pay for leads."
        pros={[
          "Photographers, caterers, florists, DJs all desperately want wedding leads — high willingness to pay",
          "Multiplies your monetized surface area — venues + vendors = 2x the paying customers",
          "Natural cross-sell: couple finds venue → needs photographer → sees your vendor directory",
        ]}
        cons={[
          "Requires separate sales motion to vendors",
          "Needs meaningful traffic before vendors see ROI",
          "Content for vendor pages adds scope significantly",
        ]}
      >
        A separate directory section (/vendors) where photographers, caterers, florists, DJs, officiants, and coordinators pay for listing placement. Couples on venue pages are the exact audience vendors want. Cross-link venue → vendors in the same city/region.
      </StreamSection>

      {/* ── STREAM 6: PREMIUM PROFILES ── */}
      <StreamSection
        emoji="🎨"
        name="Enhanced Venue Profiles"
        model="$79–$199/mo — venue controls their own listing"
        effort="Medium"
        effortColor="#fef3c7"
        tier1="$500–$3,000/mo"
        tier2="$8,000–$25,000/mo"
        tier3="$30,000–$80,000/mo"
        nextStep="Design what a premium profile looks like (more photos, video embed, custom description, amenities checklist, pricing range, availability calendar). Venues want control — this sells itself."
        pros={[
          "Venues are highly motivated — this is their primary marketing channel",
          "Self-serve once built — no ongoing sales work",
          "Upsell from basic featured listing ($49) → full profile control ($149-199)",
        ]}
        cons={[
          "Requires building a venue portal/dashboard — Medium-High dev effort",
          "Support burden: venues will want to change things, report bugs",
          "Churn risk if venue doesn't see intake from the listing",
        ]}
      >
        Venues pay for a full self-serve profile: upload 10+ photos, edit their description, add amenities, set a pricing range, embed a contact form, and see how many profile views they&apos;re getting. This is the evolution of &ldquo;featured listing&rdquo; once you have traffic — venues go from passive listings to active marketing pages they control.
      </StreamSection>

      {/* ── STREAM 7: EMAIL ── */}
      <StreamSection
        emoji="📧"
        name="Email List & Newsletter Sponsorships"
        model="$500–$5,000 per sponsored send; affiliate commissions on automations"
        effort="Medium"
        effortColor="#fef3c7"
        tier1="$0–$200/mo"
        tier2="$1,500–$8,000/mo"
        tier3="$8,000–$40,000/mo"
        nextStep='Add email capture to every venue page now ("Get our wedding planning checklist"). Even 50 signups/mo compounds into a valuable list.'
        pros={[
          "Wedding list has extremely high LTV — couples are spending $30k+ and will click anything relevant",
          "Sponsored emails to 10k engaged subscribers = $1,000-3,000 per send from dress brands, jewelers, planners",
          "Email list is an owned channel — not dependent on Google rankings",
        ]}
        cons={[
          "Slow to build — takes 12+ months to reach meaningful list size organically",
          "Requires consistent content to keep subscribers engaged",
          "CAN-SPAM compliance required from day one",
        ]}
      >
        Capture emails from couples browsing venue listings with a lead magnet (wedding checklist, budget template, venue comparison worksheet). Build a drip sequence with affiliate links. At 10k subscribers, sell newsletter sponsorships to wedding dress brands, jewelry companies, travel agencies.
      </StreamSection>

      {/* ── STREAM 8: DATA LICENSING ── */}
      <StreamSection
        emoji="🗄️"
        name="Data Licensing"
        model="$500–$5,000/mo per licensee"
        effort="Low"
        effortColor="#dcfce7"
        tier1="$0–$500/mo"
        tier2="$1,000–$5,000/mo"
        tier3="$5,000–$20,000/mo"
        nextStep="Identify 5 potential buyers: wedding planning apps, event rental companies, wedding insurance providers, regional event agencies. Cold email with a sample dataset."
        pros={[
          "Zero marginal cost — data already exists",
          "B2B buyers pay on contract — predictable recurring revenue",
          "7,929 CA venues with AI-enriched descriptions + photos is genuinely valuable",
        ]}
        cons={[
          "Need to check terms of service for scraped data sources",
          "Requires a legal agreement / terms of use for licensees",
          "Market is small — likely a $5-20k/mo ceiling, not a primary stream",
        ]}
      >
        License the venue database (name, address, description, photos, website, venue type, capacity) to wedding planning apps, event companies, insurance providers, or travel agencies. Package as a CSV export or simple API. You have AI-enriched data with quality scores — that&apos;s the differentiator.
      </StreamSection>

      {/* ── STREAM 9: TOOLS ── */}
      <StreamSection
        emoji="🛠️"
        name="Wedding Planning Tools (Freemium)"
        model="Free tools → $9–29/mo for premium features"
        effort="High"
        effortColor="#fee2e2"
        tier1="$0–$200/mo"
        tier2="$500–$5,000/mo"
        tier3="$5,000–$30,000/mo"
        nextStep="Build one free tool first: wedding budget calculator. Gate the 'save and share' feature behind email signup. Measure conversion before building more."
        pros={[
          "Creates stickiness — couple uses your tools AND browses your venues",
          "Freemium SaaS revenue is highly scalable once built",
          "Budget calculator / checklist are heavily searched terms — SEO bonus",
        ]}
        cons={[
          "High build effort — don't build this before traffic exists",
          "Competes with established tools (Zola, WeddingWire) that have years of polish",
          "Support burden is high for SaaS features",
        ]}
      >
        Free wedding planning tools — budget calculator, checklist, seating chart, vendor tracker — that capture couples earlier in the funnel (12-18 months before the wedding). Gate advanced features (sharing, saving, PDF export) behind a paid plan. This is a Tier 3 play — don&apos;t build it until you have traffic.
      </StreamSection>

      {/* ── UNCONVENTIONAL ANGLES ── */}
      <Section title="💡 Unconventional Angles (Most Directories Miss These)">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Insight title="AI Venue Matchmaking Email">
            Couples enter their guest count, style, budget, and date. You email them their top 5 matched venues. Each email link is tracked — sell &ldquo;matched couple inquiries&rdquo; to venues at $25-75/lead. Higher quality than a cold click because the couple was pre-matched.
          </Insight>
          <Insight title="Venue Comparison Tool">
            Let couples compare 2-3 venues side by side. Venues pay $50-100/mo to &ldquo;unlock&rdquo; comparison features (show pricing, capacity, amenities). Couples love it. Venues pay to be in the comparison set.
          </Insight>
          <Insight title="Wedding Date SEO Pages">
            &ldquo;Wedding venues available on [month] [year]&rdquo; — high intent, low competition keyword. Capture couples with a specific date and email them matched venues. This is a list-building play that Google rewards.
          </Insight>
          <Insight title="Photography Rev Share">
            Partner with 1 photographer per major city. They pay you 10-15% rev share on bookings that originate from your directory. At 100k visitors, you&apos;re sending 50-100 photographer inquiries/mo → $500-$2,000/mo in rev share with zero inventory.
          </Insight>
        </div>
      </Section>

      {/* ── IMPLEMENTATION ROADMAP ── */}
      <Section title="🗓️ Implementation Roadmap">
        <Roadmap />
      </Section>

      <div style={{ background: "#f0f7f1", border: "1px solid #c6e0c8", borderRadius: 8, padding: "16px 20px", marginTop: 16, fontSize: 14, color: "#3b6341" }}>
        <strong>Bottom line:</strong> The fastest path to $10k/mo is cold-emailing premium venues for featured listings while building SEO traffic. The path to $100k/mo is Mediavine display ads + lead gen at 100k monthly visitors. The path to $1M ARR is becoming the &ldquo;independent alternative to The Knot&rdquo; — which is achievable with a national footprint and 500k+ monthly visitors.
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 22, fontWeight: 700, color: "#3b6341", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #e5e7eb" }}>{title}</h2>
      <div style={{ color: "#374151" }}>{children}</div>
    </section>
  );
}

function StreamSection({ emoji, name, model, effort, effortColor, tier1, tier2, tier3, nextStep, pros, cons, children }: {
  emoji: string; name: string; model: string; effort: string; effortColor: string;
  tier1: string; tier2: string; tier3: string; nextStep: string;
  pros: string[]; cons: string[]; children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ background: "#f9fafb", padding: "14px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <h3 style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 18, fontWeight: 700, margin: 0, color: "#111827" }}>{name}</h3>
        <span style={{ marginLeft: "auto", background: effortColor, border: "1px solid #d1d5db", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>Effort: {effort}</span>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <p style={{ color: "#374151", marginBottom: 12 }}>{children}</p>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}><strong>Revenue model:</strong> {model}</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
          <thead>
            <tr style={{ background: "#f0f7f1" }}>
              <th style={th}>10k visitors/mo</th>
              <th style={th}>100k visitors/mo</th>
              <th style={th}>500k visitors/mo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}>{tier1}</td>
              <td style={{...td, color: "#3b6341", fontWeight: 600}}>{tier2}</td>
              <td style={td}>{tier3}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
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

function Roadmap() {
  const phases = [
    {
      phase: "Phase 1",
      label: "Now (Week 1-2)",
      color: "#dcfce7",
      border: "#86efac",
      items: [
        "Add affiliate links to all venue pages (The Knot, Wedsure, Amazon registry)",
        "Install Google AdSense",
        "Add email capture widget to venue detail pages",
        "Cold email 50 premium venues in Napa, LA, and SF — featured listing pitch at $49/mo",
      ],
    },
    {
      phase: "Phase 2",
      label: "0-3 Months",
      color: "#dbeafe",
      border: "#93c5fd",
      items: [
        "Add inquiry/contact form to every venue detail page",
        "Build simple featured listing system: DB flag + Stripe billing + 'Featured' badge",
        "Launch vendor directory (/vendors) — photographers first",
        "Build wedding budget calculator for SEO + email capture",
      ],
    },
    {
      phase: "Phase 3",
      label: "3-12 Months (50k+ visitors)",
      color: "#fef3c7",
      border: "#fcd34d",
      items: [
        "Apply to Mediavine (50k sessions threshold)",
        "Start selling leads directly to venues at $10-25/lead",
        "Launch newsletter — pitch sponsored sends to wedding brands",
        "Venue comparison tool (paid feature for venues to be included)",
      ],
    },
    {
      phase: "Phase 4",
      label: "12+ Months (National Scale)",
      color: "#fce7f3",
      border: "#f9a8d4",
      items: [
        "Apply to Raptive/AdThrive (100k pageviews)",
        "Build venue self-serve dashboard — enhanced profiles at $149-199/mo",
        "AI venue matchmaking email product",
        "Data licensing to wedding apps and planners",
      ],
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {phases.map(p => (
        <div key={p.phase} style={{ background: p.color, border: `1px solid ${p.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", marginBottom: 2 }}>{p.phase}</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "#111827" }}>{p.label}</div>
          {p.items.map(item => (
            <div key={item} style={{ fontSize: 13, color: "#374151", marginBottom: 6, display: "flex", gap: 8 }}>
              <span style={{ color: "#3b6341", fontWeight: 700, flexShrink: 0 }}>→</span>
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
