import { Metadata } from "next";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Venue Audit — Green Bowtie",
  robots: { index: false, follow: false },
};

export default function AuditPage() {
  // Read the latest report from public/audit/index.html
  const reportPath = path.join(process.cwd(), "public/audit/index.html");

  if (!fs.existsSync(reportPath)) {
    return (
      <div style={{ padding: "48px", fontFamily: "monospace" }}>
        <h1>🌿 Audit Report</h1>
        <p style={{ marginTop: "16px", color: "#6b7280" }}>
          No report generated yet. Run the audit engine first:
        </p>
        <pre style={{ marginTop: "16px", background: "#f3f4f6", padding: "16px", borderRadius: "8px" }}>
          {`cd ~/Projects/wedding-venues
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
DATABASE_URL="..." OPENROUTER_API_KEY="..." \\
  npx tsx scripts/audit/run.ts --cities livermore,dublin,pleasanton`}
        </pre>
      </div>
    );
  }

  // Redirect to static file
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.location.href = "/audit/index.html";`,
      }}
    />
  );
}
