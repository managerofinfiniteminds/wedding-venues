import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Strategy — Green Bowtie Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function DataPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, sans-serif", color: "#1a1a1a", lineHeight: 1.7 }}>

      <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: "12px 16px", marginBottom: 32, fontSize: 13 }}>
        🔒 Internal page — not indexed by search engines. Do not share publicly.
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>🌿 Green Bowtie Data Strategy</h1>
      <p style={{ color: "#6b7280", marginBottom: 48 }}>How venue data is sourced, enriched, quality-gated, and kept stable at scale.</p>

      {/* ── OVERVIEW ── */}
      <Section title="Overview">
        <p>Green Bowtie's venue directory is built on a fully automated data pipeline. Every venue goes through a series of AI-driven steps before being published. The pipeline is designed to run incrementally — only processing what's new or stale — and can scale from 3 cities to all 50 states without changing the workflow.</p>
        <p>All pipeline code lives in <Code>scripts/audit/pipeline.ts</Code>. Run it from the project root.</p>
      </Section>

      {/* ── PIPELINE STEPS ── */}
      <Section title="Pipeline Steps">
        <p>Run the pipeline with:</p>
        <Pre>{`# Specific cities
npx tsx@latest scripts/audit/pipeline.ts --cities livermore,dublin,pleasanton

# All of California (batched automatically)
npx tsx@latest scripts/audit/pipeline.ts --all --limit 200

# Photos only, force re-scan all
npx tsx@latest scripts/audit/pipeline.ts --photos-only --force-photos --cities livermore

# Dry run (no writes)
npx tsx@latest scripts/audit/pipeline.ts --cities livermore --dry-run`}</Pre>

        <Step n="0" title="Skip Gate" color="#e0f2fe">
          Venues processed within the last 30 days are skipped entirely. This is the core cost-control mechanism — running the pipeline twice in a week doesn't double the cost.
          <br /><br />
          Override with <Code>--force</Code> to process everything regardless. Change the window with <Code>--fresh-days 7</Code>.
          <br /><br />
          Tracked by: <Code>pipelineProcessedAt</Code> column on Venue.
        </Step>

        <Step n="1" title="Enrich" color="#dcfce7">
          Model: <strong>Grok 3 Mini :online</strong> (~$0.001/venue)<br />
          Runs web searches for venues missing a description. Returns:
          <ul>
            <li>Wedding-focused description (2–3 sentences)</li>
            <li>Website URL, phone</li>
            <li>Capacity, pricing, amenities</li>
            <li>Best photo URL found on their website</li>
            <li><Code>sourceIsThisVenue</Code> flag — prevents cross-venue data bleed</li>
          </ul>
          If search results are clearly about a different venue, the data is discarded and the venue is left as <Code>uncertain</Code>.
        </Step>

        <Step n="2" title="Clean" color="#fef9c3">
          Model: <strong>Gemini Flash 2.0</strong> (~$0.00005/venue)<br />
          Checks existing descriptions for scraped junk: nav text, HTML fragments, Instagram handles, "&amp;amp;" entities, etc. Rewrites if needed.
        </Step>

        <Step n="3" title="Re-gate" color="#fce7f3">
          Model: <strong>Gemini Flash 2.0</strong> (~$0.00008/venue)<br />
          Judges every published venue on its <em>name first</em>, description second. Explicit NO rules baked into the prompt:
          <ul>
            <li>"Technology Center Workspaces" = office → NO</li>
            <li>"Concerts at X" = concert venue → NO</li>
            <li>"Haunted Park", "Trampoline Park", "Motocross Track" → NO</li>
            <li>"Golfing" (retail/simulator) → NO. "Golf Course" or "Country Club" → YES</li>
            <li>Hotels, wineries, vineyards, event halls, ballrooms, estates, ranches → YES</li>
          </ul>
          If the description mentions a different venue's name, it is ignored and the model judges only on the venue's own name.
        </Step>

        <Step n="4" title="Photo Audit + Swap" color="#ede9fe">
          Model: <strong>Gemini Flash 2.0 Vision</strong> (~$0.002/venue)<br />
          Scores every published venue's photo 0–10. If score &lt; 7 (or <Code>photoSource === "places"</Code>), it tries to find better:
          <br /><br />
          <strong>Priority order:</strong>
          <ol>
            <li>Venue website — og:image, weddings/gallery subpage, img src paths matching "wedding/event/gallery"</li>
            <li>Google Places photo library — all available photos, scored individually</li>
            <li>Flag as <Code>needs-manual</Code> if nothing scores 7+</li>
          </ol>
          Once a good photo is chosen, it is immediately <strong>mirrored to Cloudflare R2</strong> for stable hosting. The <Code>photoSource</Code> column records where the photo came from: <Code>r2 | website | places | manual</Code>.
          <br /><br />
          Photos are re-checked every 30 days, or immediately if <Code>photoSource === "places"</Code> (Places URLs expire).
        </Step>

        <Step n="5" title="Sync to Neon" color="#fff7ed">
          All changed venues are pushed to the Neon production database in a single pass. Uses upsert-style UPDATE — never INSERT or DELETE.
          <br /><br />
          A count verification runs before every sync: if <Code>afterTotal !== beforeTotal</Code>, the sync aborts.
        </Step>

        <Step n="6" title="Report" color="#f0fdf4">
          Regenerates <Code>/audit/</Code> HTML report and writes a JSON run log to <Code>scripts/audit/runs/YYYY-MM-DD-HHmm.json</Code>. Each run log includes every venue touched, what changed, and why.
        </Step>
      </Section>

      {/* ── COST MODEL ── */}
      <Section title="Cost Model">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
              {["Step", "Model", "Cost / venue", "Notes"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Enrich", "Grok 3 Mini :online", "~$0.001", "Only runs on venues with no description"],
              ["Clean", "Gemini Flash 2.0", "~$0.00005", "Only runs on junk descriptions"],
              ["Re-gate", "Gemini Flash 2.0", "~$0.00008", "Skipped if pipelineProcessedAt < 30d"],
              ["Photo scoring", "Gemini Flash Vision", "~$0.002", "Up to 10 images scored; skipped if photoAuditedAt < 30d"],
              ["R2 upload", "Cloudflare R2", "~$0.000015/upload", "One-time per photo; free tier covers 100k/mo"],
              ["Total (new venue)", "—", "~$0.003", "Drops to ~$0.0001 on re-runs (skip logic)"],
            ].map(([step, model, cost, notes]) => (
              <tr key={step} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 12px" }}><Code>{step}</Code></td>
                <td style={{ padding: "8px 12px" }}>{model}</td>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>{cost}</td>
                <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: 13 }}>{notes}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <br />
        <p><strong>Scale estimates (one-time enrichment cost):</strong></p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
              {["Scope", "Venues (est.)", "One-time cost", "Re-run cost"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["3 cities (current)", "70", "~$0.21", "~$0.007"],
              ["All of California", "~2,000", "~$6", "~$0.20"],
              ["One new state (Texas/NY)", "~1,500", "~$4.50", "~$0.15"],
              ["National", "~20,000", "~$60", "~$2"],
            ].map(([scope, venues, onetime, rerun]) => (
              <tr key={scope} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 12px" }}>{scope}</td>
                <td style={{ padding: "8px 12px" }}>{venues}</td>
                <td style={{ padding: "8px 12px", fontWeight: 600, color: "#16a34a" }}>{onetime}</td>
                <td style={{ padding: "8px 12px", color: "#6b7280" }}>{rerun}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── PHOTO STRATEGY ── */}
      <Section title="Photo Strategy">
        <p>Photos are the most visible quality signal. A bad photo (hotel bed, retail storefront, abstract sculpture) destroys trust instantly. The pipeline treats photos as first-class citizens.</p>

        <h3 style={{ fontSize: 17, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Source Priority</h3>
        <ol>
          <li><strong>Venue website</strong> — og:image tag (hero shot the venue chose themselves), then gallery/wedding subpage images. Most reliable — the venue picked these photos to represent themselves.</li>
          <li><strong>Google Places library</strong> — all available photos scored individually. Fallback only. Places URLs expire; any Places photo gets upgraded to R2 on the next pipeline run.</li>
          <li><strong>Manual override</strong> — set <Code>primaryPhotoUrl</Code> directly in DB + <Code>photoSource = "manual"</Code>. Manual photos are never overwritten by the pipeline.</li>
        </ol>

        <h3 style={{ fontSize: 17, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>R2 Hosting</h3>
        <p>Every photo is downloaded and re-hosted on Cloudflare R2 (<Code>photos.greenbowtie.com</Code>). This means:</p>
        <ul>
          <li>URLs never expire (unlike Google Places token-signed URLs)</li>
          <li>Venue website redesigns don't break photos</li>
          <li>You control the asset — can resize, optimize, CDN-cache</li>
          <li>Cost: effectively free at current scale (Cloudflare R2 free tier: 10GB storage, 10M requests/month)</li>
        </ul>

        <h3 style={{ fontSize: 17, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Scoring Rubric</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
              {["Score", "Meaning", "Action"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["9–10", "Stunning ceremony/reception setup, vineyard lawn, ballroom", "Keep"],
              ["7–8", "Good exterior, attractive event space, patio setup", "Keep"],
              ["5–6", "Generic landscape, food, basic room", "Try to replace"],
              ["3–4", "Retail storefront, unrelated object, street scene", "Replace"],
              ["0–2", "Hotel bed, conference room, concert crowd, logo", "Replace immediately"],
            ].map(([score, meaning, action]) => (
              <tr key={score} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>{score}</td>
                <td style={{ padding: "8px 12px" }}>{meaning}</td>
                <td style={{ padding: "8px 12px", color: action === "Keep" ? "#16a34a" : action === "Replace immediately" ? "#dc2626" : "#d97706" }}>{action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── QUALITY GATES ── */}
      <Section title="Quality Gates &amp; Known Issues">
        <h3 style={{ fontSize: 17, fontWeight: 600, marginTop: 0, marginBottom: 8 }}>What the pipeline catches automatically</h3>
        <ul>
          <li><strong>Non-wedding venues</strong> — name-first gate catches offices, concert venues, trampoline parks, etc.</li>
          <li><strong>Cross-venue data bleed</strong> — <Code>sourceIsThisVenue</Code> check in enrichment; description mismatch detector clears wrong-venue text</li>
          <li><strong>Junk descriptions</strong> — scraped nav text, HTML, social handles</li>
          <li><strong>Bad photos</strong> — vision scoring + website-first replacement</li>
          <li><strong>Expired URLs</strong> — Places photos auto-upgraded to R2</li>
        </ul>

        <h3 style={{ fontSize: 17, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>Known limitations</h3>
        <ul>
          <li><strong>React/SPA venue websites</strong> — about 30% of venue websites render client-side (Squarespace, Wix, React). Our scraper gets empty results; these fall back to Places photos. The <Code>photoSource</Code> column flags these.</li>
          <li><strong>Data quality thins outside wine country</strong> — Bay Area venues are well-documented on the web. Smaller markets (Fresno, Bakersfield) return fewer web results per venue, leading to more <Code>uncertain</Code> classifications.</li>
          <li><strong>Re-gate trusts descriptions</strong> — if a description mentions weddings for a venue that doesn't actually host them, the re-gate may pass it. The description mismatch detector helps but isn't perfect.</li>
        </ul>
      </Section>

      {/* ── R2 SETUP ── */}
      <Section title="Cloudflare R2 Setup">
        <p>One-time setup, ~5 minutes:</p>
        <ol>
          <li>Go to <a href="https://dash.cloudflare.com" target="_blank" style={{ color: "#2563eb" }}>dash.cloudflare.com</a> → R2 → Create bucket: <Code>greenbowtie-photos</Code></li>
          <li>Bucket Settings → Public Access → Allow (or connect <Code>photos.greenbowtie.com</Code> subdomain)</li>
          <li>Manage R2 API Tokens → Create Token → Object Read &amp; Write on <Code>greenbowtie-photos</Code></li>
          <li>Add to <Code>.env</Code>:</li>
        </ol>
        <Pre>{`R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET=greenbowtie-photos
R2_PUBLIC_URL=https://photos.greenbowtie.com`}</Pre>
        <ol start={5}>
          <li>Migrate existing photos (one-time):</li>
        </ol>
        <Pre>{`npx tsx@latest scripts/photos/migrate-to-r2.ts --cities livermore,dublin,pleasanton`}</Pre>
        <p>After migration, all future pipeline runs auto-upload to R2. The <Code>photoSource</Code> column will show <Code>r2</Code> for every migrated venue.</p>
      </Section>

      {/* ── ROLLOUT PLAN ── */}
      <Section title="Rollout Plan">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
              {["Phase", "Scope", "Command", "Est. Cost", "Status"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["1 — Pilot", "Livermore, Dublin, Pleasanton", "--cities livermore,dublin,pleasanton", "~$0.21", "✅ Complete"],
              ["2 — Bay Area", "All Bay Area cities", "--cities san-jose,oakland,... (batch 10)", "~$1.50", "⏳ Ready"],
              ["3 — California", "All CA cities (batches of 200)", "--all --limit 200", "~$6", "⏳ Pending"],
              ["4 — Texas / NY", "Validate new state quality", "--all --limit 200", "~$4.50 each", "⏳ Pending"],
              ["5 — National", "All 50 states", "Run state by state", "~$60 total", "⏳ Future"],
            ].map(([phase, scope, cmd, cost, status]) => (
              <tr key={phase} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>{phase}</td>
                <td style={{ padding: "8px 12px" }}>{scope}</td>
                <td style={{ padding: "8px 12px" }}><Code>{cmd}</Code></td>
                <td style={{ padding: "8px 12px", color: "#16a34a", fontWeight: 600 }}>{cost}</td>
                <td style={{ padding: "8px 12px" }}>{status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── KEY FILES ── */}
      <Section title="Key Files">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
              {["File", "Purpose"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["scripts/audit/pipeline.ts", "Main pipeline — enrich, clean, gate, photo, sync, report"],
              ["scripts/audit/photo-check.ts", "Photo scoring + swap logic (website → Places → flag)"],
              ["scripts/photos/migrate-to-r2.ts", "One-shot migration of all venue photos to R2"],
              ["scripts/photos/r2-upload.ts", "Shared R2 upload helper (graceful if R2 not configured)"],
              ["scripts/audit/runs/", "JSON log of every pipeline run"],
              ["prisma/schema.prisma", "DB schema — pipelineProcessedAt, photoSource, photoAuditedAt"],
              ["src/app/audit/", "Internal audit report viewer (/audit/)"],
              ["src/app/data/", "This page (/data/)"],
            ].map(([file, purpose]) => (
              <tr key={file} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 12px" }}><Code>{file}</Code></td>
                <td style={{ padding: "8px 12px", color: "#6b7280" }}>{purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── DB COLUMNS ── */}
      <Section title="Key Database Columns">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
              {["Column", "Type", "Meaning"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["isPublished", "Boolean", "Whether the venue appears on the site"],
              ["auditStatus", "String", "'clean' | 'flagged' | 'needs_review' | 'unaudited'"],
              ["auditFlags", "JSON[]", "Array of flag objects — type, severity, detail, autoFixed"],
              ["pipelineProcessedAt", "DateTime", "Last time pipeline ran on this venue — used for skip logic"],
              ["photoSource", "String", "'r2' | 'website' | 'places' | 'manual'"],
              ["photoAuditedAt", "DateTime", "Last time photo was vision-scored"],
              ["lastAuditedAt", "DateTime", "Last time any audit step touched this venue"],
              ["description", "String", "Wedding-focused 2–3 sentence description"],
            ].map(([col, type, meaning]) => (
              <tr key={col} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 12px" }}><Code>{col}</Code></td>
                <td style={{ padding: "8px 12px", color: "#7c3aed" }}>{type}</td>
                <td style={{ padding: "8px 12px", color: "#6b7280" }}>{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <div style={{ marginTop: 64, paddingTop: 24, borderTop: "1px solid #e5e7eb", color: "#9ca3af", fontSize: 13 }}>
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · Internal use only · <Code>/data</Code> is excluded from robots.txt and search indexing.
      </div>

    </main>
  );
}

// ── Small layout components ───────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: "2px solid #e5e7eb" }}>{title}</h2>
      {children}
    </section>
  );
}

function Step({ n, title, color, children }: { n: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: color, border: "1px solid #e5e7eb", borderRadius: 8, padding: "16px 20px", marginBottom: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Step {n}: {title}</div>
      <div style={{ fontSize: 14, color: "#374151" }}>{children}</div>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ background: "#f3f4f6", padding: "1px 6px", borderRadius: 4, fontSize: "0.875em", fontFamily: "monospace" }}>
      {children}
    </code>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre style={{ background: "#1e1e2e", color: "#cdd6f4", padding: "16px 20px", borderRadius: 8, overflowX: "auto", fontSize: 13, lineHeight: 1.6, margin: "12px 0" }}>
      {children}
    </pre>
  );
}
