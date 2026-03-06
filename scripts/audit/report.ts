import fs from "fs";
import path from "path";
import type { AuditRunSummary, VenueAuditResult, AuditFlag } from "./types";

const PUBLIC_AUDIT_DIR = path.resolve(__dirname, "../../public/audit");
const REPORTS_DIR = path.join(PUBLIC_AUDIT_DIR, "reports");

function severityBadge(s: string, fixed = false) {
  if (fixed) return `<span class="badge badge-fixed">✓ AUTO-FIXED</span>`;
  if (s === "critical") return `<span class="badge badge-critical">CRITICAL</span>`;
  if (s === "warning") return `<span class="badge badge-warning">WARNING</span>`;
  return `<span class="badge badge-info">INFO</span>`;
}

function statusBadge(status: string, score: number) {
  if (status === "clean") return `<span class="status-clean">✅ CLEAN (${score})</span>`;
  if (status === "needs_review") return `<span class="status-review">⚠️ NEEDS REVIEW (${score})</span>`;
  return `<span class="status-flagged">🚨 FLAGGED (${score})</span>`;
}

function flagRow(f: AuditFlag) {
  const badge = f.autoFixed ? severityBadge(f.severity, true) : severityBadge(f.severity);
  return `
    <tr class="${f.autoFixed ? "row-fixed" : f.severity === "critical" ? "row-critical" : f.severity === "warning" ? "row-warning" : "row-info"}">
      <td>${badge}</td>
      <td><code>${f.type}</code></td>
      <td><code>${f.field}</code></td>
      <td>${f.detail}${f.fixDetail ? `<br><small class="fix-detail">Fix: ${f.fixDetail}</small>` : ""}</td>
    </tr>`;
}

function venueCard(r: VenueAuditResult) {
  if (r.flags.length === 0) {
    return `
    <div class="venue-card venue-clean">
      <div class="venue-header">
        <span class="venue-name">${r.name}</span>
        <span class="venue-city">${r.city}</span>
        ${statusBadge(r.auditStatus, r.auditScore)}
      </div>
      <p class="no-issues">No issues found.</p>
    </div>`;
  }

  const critCount = r.flags.filter((f) => f.severity === "critical" && !f.autoFixed).length;
  const warnCount = r.flags.filter((f) => f.severity === "warning" && !f.autoFixed).length;
  const fixCount = r.flags.filter((f) => f.autoFixed).length;

  return `
  <div class="venue-card ${r.auditStatus === "flagged" ? "venue-flagged" : r.auditStatus === "needs_review" ? "venue-review" : "venue-clean"}">
    <div class="venue-header">
      <span class="venue-name">${r.name}</span>
      <span class="venue-city">${r.city}</span>
      ${statusBadge(r.auditStatus, r.auditScore)}
      <span class="venue-meta">${critCount > 0 ? `<span class="meta-critical">${critCount} critical</span>` : ""}${warnCount > 0 ? ` <span class="meta-warning">${warnCount} warnings</span>` : ""}${fixCount > 0 ? ` <span class="meta-fixed">${fixCount} auto-fixed</span>` : ""}</span>
    </div>
    <table class="flags-table">
      <thead><tr><th>Severity</th><th>Type</th><th>Field</th><th>Detail</th></tr></thead>
      <tbody>${r.flags.map(flagRow).join("")}</tbody>
    </table>
  </div>`;
}

function citySection(city: string, results: VenueAuditResult[]) {
  const cityResults = results.filter((r) => r.city === city);
  const clean = cityResults.filter((r) => r.auditStatus === "clean").length;
  const review = cityResults.filter((r) => r.auditStatus === "needs_review").length;
  const flagged = cityResults.filter((r) => r.auditStatus === "flagged").length;
  const avgScore = Math.round(cityResults.reduce((s, r) => s + r.auditScore, 0) / cityResults.length);

  // Sort: flagged first, then needs_review, then clean
  const sorted = [...cityResults].sort((a, b) => {
    const order = { flagged: 0, needs_review: 1, clean: 2 };
    return (order[a.auditStatus] ?? 3) - (order[b.auditStatus] ?? 3);
  });

  return `
  <section class="city-section">
    <div class="city-header">
      <h2>${city}</h2>
      <div class="city-stats">
        <span>${cityResults.length} venues</span>
        <span class="stat-clean">✅ ${clean} clean</span>
        <span class="stat-review">⚠️ ${review} review</span>
        <span class="stat-flagged">🚨 ${flagged} flagged</span>
        <span class="stat-score">avg score: <strong>${avgScore}</strong></span>
      </div>
    </div>
    ${sorted.map(venueCard).join("")}
  </section>`;
}

export async function generateReport(summary: AuditRunSummary): Promise<string> {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const runDate = new Date(summary.runAt);
  const dateStr = runDate.toISOString().split("T")[0];
  const timeStr = runDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

  const allCities = [...new Set(summary.results.map((r) => r.city))].sort();
  const overallScore = summary.totalVenues > 0
    ? Math.round(summary.results.reduce((s, r) => s + r.auditScore, 0) / summary.totalVenues)
    : 0;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Green Bowtie — Venue Audit Report — ${dateStr}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f4f5f7; color: #1a1a2e; line-height: 1.5; }
    header { background: #3b6341; color: white; padding: 24px 32px; }
    header h1 { font-size: 1.6rem; font-weight: 700; }
    header p { opacity: 0.85; font-size: 0.9rem; margin-top: 4px; }
    .noindex-notice { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 16px; font-size: 0.8rem; color: #78350f; }
    .container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }

    /* Summary cards */
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 32px; }
    .summary-card { background: white; border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .summary-card .big { font-size: 2rem; font-weight: 800; }
    .summary-card .label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; margin-top: 4px; }
    .big-clean { color: #15803d; }
    .big-review { color: #d97706; }
    .big-flagged { color: #dc2626; }
    .big-score { color: #3b6341; }

    /* City sections */
    .city-section { margin-bottom: 40px; }
    .city-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .city-header h2 { font-size: 1.3rem; font-weight: 700; color: #3b6341; }
    .city-stats { display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.82rem; }
    .stat-clean { color: #15803d; } .stat-review { color: #d97706; } .stat-flagged { color: #dc2626; }

    /* Venue cards */
    .venue-card { background: white; border-radius: 10px; margin-bottom: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
    .venue-card.venue-flagged { border-left: 4px solid #dc2626; }
    .venue-card.venue-review { border-left: 4px solid #d97706; }
    .venue-card.venue-clean { border-left: 4px solid #15803d; }
    .venue-header { display: flex; align-items: center; gap: 10px; padding: 12px 16px; flex-wrap: wrap; background: #fafafa; border-bottom: 1px solid #f0f0f0; }
    .venue-name { font-weight: 600; font-size: 0.95rem; }
    .venue-city { font-size: 0.8rem; color: #6b7280; background: #f3f4f6; padding: 2px 8px; border-radius: 9999px; }
    .venue-meta { margin-left: auto; display: flex; gap: 8px; font-size: 0.75rem; flex-wrap: wrap; }
    .meta-critical { color: #dc2626; font-weight: 600; }
    .meta-warning { color: #d97706; }
    .meta-fixed { color: #15803d; }
    .no-issues { padding: 10px 16px; font-size: 0.85rem; color: #6b7280; font-style: italic; }

    /* Flags table */
    .flags-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    .flags-table th { padding: 8px 12px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 0.72rem; text-transform: uppercase; color: #6b7280; letter-spacing: .04em; }
    .flags-table td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    .flags-table tr:last-child td { border-bottom: none; }
    .row-critical td { background: #fef2f2; }
    .row-warning td { background: #fffbeb; }
    .row-info td { background: #f0f9ff; }
    .row-fixed td { background: #f0fdf4; }
    code { font-family: ui-monospace, monospace; font-size: 0.8em; background: rgba(0,0,0,.04); padding: 1px 5px; border-radius: 4px; }
    .fix-detail { color: #15803d; }

    /* Badges */
    .badge { font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
    .badge-critical { background: #fee2e2; color: #dc2626; }
    .badge-warning { background: #fef3c7; color: #d97706; }
    .badge-info { background: #dbeafe; color: #2563eb; }
    .badge-fixed { background: #dcfce7; color: #15803d; }

    /* Status */
    .status-clean { color: #15803d; font-weight: 600; font-size: 0.82rem; white-space: nowrap; }
    .status-review { color: #d97706; font-weight: 600; font-size: 0.82rem; white-space: nowrap; }
    .status-flagged { color: #dc2626; font-weight: 600; font-size: 0.82rem; white-space: nowrap; }

    /* Nav */
    .report-nav { background: white; border-radius: 10px; padding: 16px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
    .report-nav h3 { font-size: 0.8rem; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
    .report-nav a { color: #3b6341; text-decoration: none; margin-right: 16px; font-size: 0.85rem; }
    .report-nav a:hover { text-decoration: underline; }

    footer { text-align: center; padding: 24px; font-size: 0.75rem; color: #9ca3af; }
  </style>
</head>
<body>
<header>
  <h1>🌿 Green Bowtie — Venue Audit Report</h1>
  <p>Run: ${dateStr} at ${timeStr} &nbsp;·&nbsp; Cities: ${summary.cities.join(", ") || "All"} &nbsp;·&nbsp; ${summary.totalVenues} venues audited</p>
</header>
<div class="noindex-notice">🔒 This page is excluded from search engine indexing (noindex, nofollow). Internal use only.</div>

<div class="container">

  <!-- Summary -->
  <div class="summary-grid">
    <div class="summary-card">
      <div class="big">${summary.totalVenues}</div>
      <div class="label">Venues Audited</div>
    </div>
    <div class="summary-card">
      <div class="big big-clean">${summary.clean}</div>
      <div class="label">Clean</div>
    </div>
    <div class="summary-card">
      <div class="big big-review">${summary.needsReview}</div>
      <div class="label">Needs Review</div>
    </div>
    <div class="summary-card">
      <div class="big big-flagged">${summary.flagged}</div>
      <div class="label">Flagged</div>
    </div>
    <div class="summary-card">
      <div class="big big-score">${overallScore}</div>
      <div class="label">Avg Score</div>
    </div>
    <div class="summary-card">
      <div class="big" style="color:#dc2626">${summary.criticalFlags}</div>
      <div class="label">Critical Issues</div>
    </div>
    <div class="summary-card">
      <div class="big" style="color:#d97706">${summary.warningFlags}</div>
      <div class="label">Warnings</div>
    </div>
    <div class="summary-card">
      <div class="big" style="color:#15803d">${summary.autoFixesApplied}</div>
      <div class="label">Auto-Fixed</div>
    </div>
  </div>

  <!-- Navigation -->
  <div class="report-nav">
    <h3>Jump to City</h3>
    ${allCities.map((c) => `<a href="#${c.toLowerCase().replace(/\s+/g, "-")}">${c}</a>`).join("")}
  </div>

  <!-- City Sections -->
  ${allCities.map((city) => `<div id="${city.toLowerCase().replace(/\s+/g, "-")}">${citySection(city, summary.results)}</div>`).join("")}

</div>
<footer>
  Green Bowtie Audit Engine &nbsp;·&nbsp; Run ${dateStr} &nbsp;·&nbsp; Internal use only &nbsp;·&nbsp; Not indexed by search engines
</footer>
</body>
</html>`;

  // Write versioned report
  const reportFile = path.join(REPORTS_DIR, `${dateStr}.html`);
  fs.writeFileSync(reportFile, htmlContent, "utf8");

  // Write/overwrite index.html (latest)
  const indexFile = path.join(PUBLIC_AUDIT_DIR, "index.html");
  fs.writeFileSync(indexFile, htmlContent, "utf8");

  return reportFile;
}
