import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Venue Ownership Feature — Green Bowtie Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 52 }}>
      <h2 style={{
        fontFamily: "'Tenor Sans', serif",
        fontSize: 22, fontWeight: 700, color: "#1a1a1a",
        borderBottom: "2px solid #3b6341", paddingBottom: 8, marginBottom: 20,
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: `1px solid ${accent ?? "#e5e7eb"}`,
      borderLeft: `4px solid ${accent ?? "#3b6341"}`,
      padding: "20px 24px", marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function Step({ n, title, who, children }: { n: number; title: string; who: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%", background: "#3b6341",
        color: "#fff", fontWeight: 700, fontSize: 16,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: who === "Venue Owner" ? "#1d4ed8" : who === "System" ? "#6b7280" : "#3b6341",
            background: who === "Venue Owner" ? "#dbeafe" : who === "System" ? "#f3f4f6" : "#dcfce7",
            padding: "2px 8px", borderRadius: 999,
          }}>{who}</span>
        </div>
        <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{children}</div>
      </div>
    </div>
  );
}

function MoneyCard({ tier, price, features, badge }: { tier: string; price: string; features: string[]; badge?: string }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
      padding: "24px", flex: 1, minWidth: 200, position: "relative",
    }}>
      {badge && (
        <div style={{
          position: "absolute", top: -10, right: 16,
          background: "#3b6341", color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "3px 12px", borderRadius: 999,
        }}>{badge}</div>
      )}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{tier}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>{price}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#374151" }}>
            <span style={{ color: "#3b6341", flexShrink: 0 }}>✓</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VenueOwnershipPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Nunito Sans', sans-serif", color: "#1a1a1a" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: 999 }}>Pre-Launch Priority</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534", padding: "3px 10px", borderRadius: 999 }}>Feature Storyboard</span>
          </div>
          <h1 style={{ fontFamily: "'Tenor Sans', serif", fontSize: 36, fontWeight: 700, margin: 0 }}>
            Venue Ownership & Claim Flow
          </h1>
          <p style={{ color: "#6b7280", marginTop: 8, fontSize: 16, maxWidth: 680 }}>
            How venue owners discover, claim, and manage their listing — and how Green Bowtie monetizes the relationship over time.
          </p>
        </div>

        {/* ── THE PHILOSOPHY ── */}
        <Section title="1. The Philosophy">
          <Card>
            <p style={{ fontSize: 15, lineHeight: 1.8, margin: 0, color: "#374151" }}>
              <strong>Give before you take.</strong> Venue owners get a free, fully-populated listing with real couple inquiries flowing in before we ask for a single dollar. Once they see value — real leads, real couples — upgrading is a no-brainer. We're not selling them advertising. We're selling them a pipeline.
            </p>
          </Card>
          <Card accent="#dbeafe">
            <p style={{ fontSize: 14, lineHeight: 1.8, margin: 0, color: "#374151" }}>
              The Knot charges venues <strong>$3,000–$10,000/year</strong> for a listing. We start free. By the time we ask for money, the venue owner has already received real inquiries, seen their listing performing, and has skin in the game. Conversion from free → paid will be high because we earned it.
            </p>
          </Card>
        </Section>

        {/* ── CLAIM FLOW STORYBOARD ── */}
        <Section title="2. Claim Flow — Step by Step">
          <Step n={1} title="Couple submits inquiry" who="Couple">
            Couple fills out inquiry form on venue detail page. Inquiry saved to DB. Couple gets confirmation email. <strong>No email to venue yet</strong> — we hold it.
          </Step>
          <Step n={2} title="System flags unclaimed venue" who="System">
            If venue has no VenueOwner record, mark the inquiry as "pending claim." Inquiry counter increments on the venue record.
          </Step>
          <Step n={3} title="Venue owner discovers listing" who="Venue Owner">
            Venue owner finds their listing on Google (SEO), through a couple mentioning it, or via outreach. They see "X couples have inquired about your venue this month."
          </Step>
          <Step n={4} title="Venue owner initiates claim" who="Venue Owner">
            Clicks "Claim this listing" on their venue page. Enters their name + business email. System sends a magic link to that email.
          </Step>
          <Step n={5} title="Ownership verification" who="System">
            Magic link expires in 1 hour. On click, system checks: does the email domain match the venue's website domain? If yes → auto-verified. If no → flag for manual review (Wayne sees it on admin dashboard).
          </Step>
          <Step n={6} title="Owner accesses dashboard" who="Venue Owner">
            Logged in via session cookie (7-day). Sees their venue dashboard: pending inquiries, listing preview, edit tools.
          </Step>
          <Step n={7} title="Inquiries released" who="System">
            Once claimed and verified, all held inquiries are released to the venue owner. They get an email: "You have X inquiries waiting." This is the moment of value delivery.
          </Step>
          <Step n={8} title="Owner updates listing" who="Venue Owner">
            Owner can edit: description, photos, pricing, capacity, amenities, contact info. All edits go through AI content gate before publishing.
          </Step>
          <Step n={9} title="AI content moderation" who="System">
            Every edit runs through a moderation pipeline: spam check, inappropriate content check, factual consistency check. Clean → auto-publish. Flagged → Wayne reviews in admin dashboard.
          </Step>
          <Step n={10} title="Upsell moment" who="System">
            After owner has been active 30 days and received 3+ inquiries, system surfaces upgrade prompt: "Upgrade to Featured — get priority placement and analytics."
          </Step>
        </Section>

        {/* ── VERIFICATION METHODS ── */}
        <Section title="3. Ownership Verification">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              {
                method: "Email Domain Match",
                speed: "Instant",
                reliability: "High",
                how: "Claimant email domain matches venue website domain. Example: venue website is rosefarmweddings.com, claimant uses owner@rosefarmweddings.com → auto-approved.",
                badge: "Primary",
                badgeColor: "#3b6341",
                badgeBg: "#dcfce7",
              },
              {
                method: "Google Business Verification",
                speed: "Future",
                reliability: "Very High",
                how: "OAuth via Google Business Profile API — proves they manage the Google listing for this business.",
                badge: "Planned",
                badgeColor: "#1d4ed8",
                badgeBg: "#dbeafe",
              },
              {
                method: "Phone Call / SMS",
                speed: "1-2 min",
                reliability: "High",
                how: "System calls or texts the venue's listed phone number with a 6-digit code. Owner enters it to verify.",
                badge: "Fallback",
                badgeColor: "#92400e",
                badgeBg: "#fef3c7",
              },
              {
                method: "Manual Review",
                speed: "Same day",
                reliability: "100%",
                how: "Wayne reviews claim in admin dashboard. Approve or deny. Used when automated methods fail.",
                badge: "Last Resort",
                badgeColor: "#6b7280",
                badgeBg: "#f3f4f6",
              },
            ].map((v) => (
              <div key={v.method} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{v.method}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: v.badgeColor, background: v.badgeBg, padding: "2px 8px", borderRadius: 999 }}>{v.badge}</span>
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Speed: <strong>{v.speed}</strong></span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Reliability: <strong>{v.reliability}</strong></span>
                </div>
                <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.5 }}>{v.how}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── OWNER DASHBOARD FEATURES ── */}
        <Section title="4. Venue Owner Dashboard — Feature Set">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: "💌", title: "Inquiries Inbox", tier: "Free", desc: "See all couple inquiries — name, email, wedding date, guest count, message. Reply directly via email link." },
              { icon: "📝", title: "Edit Listing", tier: "Free", desc: "Update description, contact info, hours. All edits AI-moderated before publishing." },
              { icon: "📸", title: "Photo Management", tier: "Free", desc: "Upload up to 5 photos. AI scores quality. Bad photos rejected with explanation." },
              { icon: "💰", title: "Pricing & Capacity", tier: "Free", desc: "Set starting price, capacity ranges, pricing model (site fee, per-head, all-inclusive)." },
              { icon: "✅", title: "Amenities Checklist", tier: "Free", desc: "Check/uncheck amenities — bridal suite, outdoor space, catering, bar, AV, etc." },
              { icon: "📊", title: "Basic Analytics", tier: "Free", desc: "Views this month, inquiries this month, favorites count. Simple stats." },
              { icon: "⭐", title: "Featured Placement", tier: "Paid", desc: "Appear at the top of state + city search results. Highlighted badge. Priority in sort order." },
              { icon: "📈", title: "Advanced Analytics", tier: "Paid", desc: "Traffic sources, conversion funnel, competitor comparisons, inquiry response rate." },
              { icon: "🔗", title: "Direct Booking Link", tier: "Paid", desc: "Add a 'Book a Tour' button linked to your calendar (Calendly, etc.)." },
              { icon: "🏷️", title: "Promotional Badges", tier: "Paid", desc: "'New', 'Award Winner', 'Popular This Season' — custom badges that stand out in listings." },
              { icon: "📧", title: "Inquiry Auto-Reply", tier: "Paid", desc: "Auto-send a customizable response to every inquiry immediately. Never miss a lead." },
              { icon: "🤝", title: "Vendor Partnerships", tier: "Future", desc: "List preferred vendors (photographers, caterers, florists) on your page — they pay to be listed." },
            ].map((f) => (
              <div key={f.title} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{f.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{f.title}</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: f.tier === "Free" ? "#16a34a" : f.tier === "Paid" ? "#7c3aed" : "#6b7280",
                    background: f.tier === "Free" ? "#dcfce7" : f.tier === "Paid" ? "#ede9fe" : "#f3f4f6",
                    padding: "2px 8px", borderRadius: 999,
                  }}>{f.tier}</span>
                </div>
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── AI CONTENT MODERATION ── */}
        <Section title="5. AI Content Moderation Gate">
          <Card>
            <p style={{ fontSize: 14, lineHeight: 1.8, margin: "0 0 12px", color: "#374151" }}>
              Every venue owner edit passes through an AI moderation pipeline before going live. This keeps the site clean with minimal human effort.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Spam / promotional language", "Reject — \"Best venue in the world!\" type copy"],
                ["Phone numbers / emails in description", "Strip — contact info belongs in contact fields only"],
                ["Competitor mentions", "Flag for review"],
                ["Inappropriate content", "Reject + notify Wayne"],
                ["Factual inconsistency", "Flag — e.g., capacity of 10,000 for a barn venue"],
                ["Photo quality score < 60", "Reject with reason — blurry, wrong subject, stock photo detected"],
                ["Clean edit", "Auto-publish instantly"],
              ].map(([check, action]) => (
                <div key={check} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                  <span style={{ color: "#9ca3af", width: 280, flexShrink: 0 }}>{check}</span>
                  <span style={{ color: "#374151" }}>→ {action}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card accent="#dbeafe">
            <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>
              <strong>Model:</strong> Flash for routine checks (cheap, fast). Sonnet for borderline cases. Wayne only sees flagged items — estimated &lt;5% of edits need human review.
            </p>
          </Card>
        </Section>

        {/* ── MONETIZATION ── */}
        <Section title="6. Monetization Strategy">
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <MoneyCard
              tier="Free"
              price="$0/mo"
              features={[
                "Claim & verify listing",
                "Inquiries inbox (up to 10/mo)",
                "Edit description + photos",
                "Basic contact info",
                "Basic analytics (views, inquiries)",
              ]}
            />
            <MoneyCard
              tier="Featured"
              price="$99/mo"
              badge="Launch Tier"
              features={[
                "Everything in Free",
                "Priority placement in search",
                "Featured badge on listing",
                "Unlimited inquiries",
                "Advanced analytics",
                "Direct booking link",
                "Inquiry auto-reply",
              ]}
            />
            <MoneyCard
              tier="Pro"
              price="$249/mo"
              features={[
                "Everything in Featured",
                "Multiple venue listings",
                "Promotional badges",
                "Vendor partnership listings",
                "API access",
                "Dedicated account support",
              ]}
            />
          </div>

          <Card accent="#7c3aed">
            <h3 style={{ fontWeight: 700, fontSize: 15, margin: "0 0 12px", color: "#1a1a1a" }}>Revenue Projections</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { milestone: "100 Featured venues", mrr: "$9,900/mo", arr: "$118,800/yr" },
                { milestone: "500 Featured venues", mrr: "$49,500/mo", arr: "$594,000/yr" },
                { milestone: "1,000 Featured venues", mrr: "$99,000/mo", arr: "$1.18M/yr" },
              ].map((r) => (
                <div key={r.milestone} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>{r.milestone}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#7c3aed" }}>{r.mrr}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{r.arr}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "12px 0 0" }}>
              24,599 published venues. Even 1% converting to Featured = 246 venues = $24,354 MRR from day one.
            </p>
          </Card>
        </Section>

        {/* ── ROLLOUT PLAN ── */}
        <Section title="7. Rollout Plan">
          {[
            {
              phase: "Phase 1 — Build (Pre-launch)",
              status: "Now",
              color: "#92400e", bg: "#fef3c7",
              items: [
                "Build admin dashboard on internal — see all claims, inquiries, flags",
                "Add VENUE_NOTIFICATIONS_ENABLED flag — control when emails go to venues",
                "Build venue owner edit interface (description, photos, pricing, amenities)",
                "Build AI moderation pipeline",
                "Build phone/SMS verification fallback",
              ],
            },
            {
              phase: "Phase 2 — Soft Launch (Claim Only)",
              status: "Week 1-2",
              color: "#1d4ed8", bg: "#dbeafe",
              items: [
                "Enable claim flow publicly",
                "Venue owners can claim, verify, view inquiries",
                "No editing yet — just claim + see inquiries",
                "Wayne manually approves all claims",
                "Learn: how do owners find us? What do they do first?",
              ],
            },
            {
              phase: "Phase 3 — Owner Editing",
              status: "Week 3-4",
              color: "#16a34a", bg: "#dcfce7",
              items: [
                "Enable description + photo editing",
                "AI moderation gate live",
                "Collect feedback from early owners",
                "Refine AI moderation based on real edits",
              ],
            },
            {
              phase: "Phase 4 — Monetization",
              status: "Month 2",
              color: "#7c3aed", bg: "#ede9fe",
              items: [
                "Launch Featured tier at $99/mo",
                "Stripe billing live",
                "Upsell triggered at 3+ inquiries received",
                "Target: first 10 paying venues",
              ],
            },
          ].map((p) => (
            <Card key={p.phase} accent={p.color}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{p.phase}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: p.color, background: p.bg, padding: "3px 10px", borderRadius: 999 }}>{p.status}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                {p.items.map((item, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </Section>

        {/* ── ADMIN REQUIREMENTS ── */}
        <Section title="8. Admin Dashboard Requirements (internal.greenbowtie.com)">
          <Card>
            <h3 style={{ fontWeight: 700, fontSize: 15, margin: "0 0 12px" }}>What Wayne needs to see & do:</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Inquiries feed", "All inquiries across all venues — who, when, which venue, full details. Mark as reviewed."],
                ["Claims queue", "New claim requests — approve, deny, or request more info. See email domain match result."],
                ["Content moderation queue", "Flagged edits from venue owners — approve or reject with reason sent to owner."],
                ["Venue owner list", "All claimed venues, owner name/email, plan tier, last active, inquiry count."],
                ["VENUE_NOTIFICATIONS toggle", "One switch to start/stop sending inquiry emails to venue owners."],
                ["Photo health check", "Run health check script output directly in browser — see broken photo count."],
                ["Pipeline status", "Knot scraper progress, R2 migration progress, enrichment stats."],
              ].map(([feature, desc]) => (
                <div key={feature} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, width: 200, flexShrink: 0, color: "#3b6341" }}>{feature}</span>
                  <span style={{ fontSize: 13, color: "#374151" }}>{desc}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <p style={{ textAlign: "center", fontSize: 12, color: "#d1d5db", marginTop: 48 }}>
          Green Bowtie Internal · Venue Ownership Feature Storyboard · Confidential
        </p>
      </div>
    </div>
  );
}
