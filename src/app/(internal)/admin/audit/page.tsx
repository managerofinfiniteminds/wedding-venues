import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import { AuditControls } from "./AuditControls";

export const metadata: Metadata = {
  title: "Venue Audit — Green Bowtie Admin",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export const revalidate = 0;

type Issue =
  | "no_photo"
  | "no_description"
  | "no_contact"
  | "no_capacity"
  | "no_pricing"
  | "low_completeness"
  | "hidden"
  | "deleted";

interface AuditFilters {
  state?: string;
  issue?: Issue;
  status?: "published" | "unpublished" | "hidden" | "deleted" | "all";
  search?: string;
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const filters: AuditFilters = {
    state: params.state || undefined,
    issue: (params.issue as Issue) || undefined,
    status: (params.status as AuditFilters["status"]) || "all",
    search: params.search || undefined,
  };

  // Build where clause
  const where: Record<string, unknown> = {};
  if (filters.state) where.stateSlug = filters.state;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { city: { contains: filters.search, mode: "insensitive" } },
      { slug: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Status filter
  if (filters.status === "published") { where.isPublished = true; where.isHidden = false; where.deletedAt = null; }
  else if (filters.status === "unpublished") { where.isPublished = false; where.isHidden = false; where.deletedAt = null; }
  else if (filters.status === "hidden") { where.isHidden = true; where.deletedAt = null; }
  else if (filters.status === "deleted") { where.deletedAt = { not: null }; }
  else { /* all — no filter */ }

  // Issue filter
  if (filters.issue === "no_photo") where.primaryPhotoUrl = null;
  else if (filters.issue === "no_description") where.description = null;
  else if (filters.issue === "no_contact") { where.AND = [{ phone: null }, { email: null }, { website: null }]; }
  else if (filters.issue === "no_capacity") where.maxGuests = null;
  else if (filters.issue === "no_pricing") { where.AND = [{ baseRentalMin: null }, { priceTier: null }]; }
  else if (filters.issue === "low_completeness") { where.completenessScore = { lt: 50 }; }
  else if (filters.issue === "hidden") where.isHidden = true;
  else if (filters.issue === "deleted") where.deletedAt = { not: null };

  const [venues, totalCount, stats] = await Promise.all([
    prisma.venue.findMany({
      where,
      orderBy: [{ completenessScore: { sort: "asc", nulls: "first" } }, { name: "asc" }],
      take: 200,
      select: {
        id: true, name: true, slug: true, city: true, stateSlug: true, state: true,
        isPublished: true, isHidden: true, deletedAt: true,
        completenessScore: true,
        primaryPhotoUrl: true,
        description: true,
        phone: true, email: true, website: true,
        maxGuests: true, baseRentalMin: true, priceTier: true,
      },
    }),
    prisma.venue.count({ where }),
    prisma.venue.aggregate({
      _count: { id: true },
      where: { deletedAt: null },
    }).then(async (all) => {
      const [published, hidden, deleted, noPhoto, noDesc, lowScore] = await Promise.all([
        prisma.venue.count({ where: { isPublished: true, isHidden: false, deletedAt: null } }),
        prisma.venue.count({ where: { isHidden: true, deletedAt: null } }),
        prisma.venue.count({ where: { deletedAt: { not: null } } }),
        prisma.venue.count({ where: { primaryPhotoUrl: null, deletedAt: null } }),
        prisma.venue.count({ where: { description: null, deletedAt: null } }),
        prisma.venue.count({ where: { completenessScore: { lt: 50 }, deletedAt: null } }),
      ]);
      return { total: all._count.id, published, hidden, deleted, noPhoto, noDesc, lowScore };
    }),
  ]);

  // Get states for filter dropdown
  const stateRows = await prisma.venue.groupBy({
    by: ["stateSlug", "state"],
    where: { deletedAt: null },
    _count: { id: true },
    orderBy: { stateSlug: "asc" },
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Nunito Sans', sans-serif", color: "#1a1a1a" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Link href="/admin" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none" }}>← Admin</Link>
            </div>
            <h1 style={{ fontFamily: "'Tenor Sans', serif", fontSize: 28, fontWeight: 700, margin: 0 }}>Venue Audit</h1>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>
              Showing {venues.length} of {totalCount.toLocaleString()} venues
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginBottom: 32 }}>
          {[
            { label: "Total", value: stats.total.toLocaleString(), color: "#1a1a1a" },
            { label: "Published", value: stats.published.toLocaleString(), color: "#16a34a" },
            { label: "Hidden", value: stats.hidden.toLocaleString(), color: "#92400e" },
            { label: "Deleted", value: stats.deleted.toLocaleString(), color: "#dc2626" },
            { label: "No Photo", value: stats.noPhoto.toLocaleString(), color: "#7c3aed" },
            { label: "No Description", value: stats.noDesc.toLocaleString(), color: "#0369a1" },
            { label: "Score < 50", value: stats.lowScore.toLocaleString(), color: "#d97706" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters — client component wrapped in Suspense (required for useSearchParams) */}
        <Suspense fallback={<div style={{ height: 56, background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", marginBottom: 20 }} />}>
          <AuditControls
            filters={filters}
            states={stateRows.map((r) => ({ slug: r.stateSlug, name: r.state, count: r._count.id }))}
          />
        </Suspense>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f7f4", borderBottom: "1px solid #e5e7eb" }}>
                {["Venue", "City / State", "Score", "Issues", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {venues.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
                    No venues match these filters.
                  </td>
                </tr>
              )}
              {venues.map((v, i) => {
                const issues: string[] = [];
                if (!v.primaryPhotoUrl) issues.push("No photo");
                if (!v.description) issues.push("No description");
                if (!v.phone && !v.email && !v.website) issues.push("No contact");
                if (!v.maxGuests) issues.push("No capacity");
                if (!v.baseRentalMin && !v.priceTier) issues.push("No pricing");

                const isDeleted = !!v.deletedAt;
                const rowBg = isDeleted ? "#fef2f2" : v.isHidden ? "#fefce8" : i % 2 === 1 ? "#fafaf9" : "#fff";

                return (
                  <tr key={v.id} style={{ borderBottom: "1px solid #f3f4f6", background: rowBg }}>
                    {/* Name */}
                    <td style={{ padding: "10px 14px", maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: isDeleted ? "#9ca3af" : "#1a1a1a" }}>
                        {isDeleted ? <s>{v.name}</s> : v.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{v.slug}</div>
                    </td>

                    {/* City/State */}
                    <td style={{ padding: "10px 14px", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {v.city}, {v.state}
                    </td>

                    {/* Score */}
                    <td style={{ padding: "10px 14px" }}>
                      {v.completenessScore !== null ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{
                            width: 48, height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden",
                          }}>
                            <div style={{
                              height: "100%", borderRadius: 99,
                              width: `${v.completenessScore}%`,
                              background: v.completenessScore >= 70 ? "#16a34a" : v.completenessScore >= 40 ? "#f59e0b" : "#dc2626",
                            }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: v.completenessScore >= 70 ? "#16a34a" : v.completenessScore >= 40 ? "#d97706" : "#dc2626" }}>
                            {v.completenessScore}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#d1d5db", fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Issues */}
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {issues.length === 0 ? (
                          <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>✓ Clean</span>
                        ) : issues.map((issue) => (
                          <span key={issue} style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
                            background: "#fef3c7", color: "#92400e",
                          }}>{issue}</span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                      {isDeleted ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "2px 8px", borderRadius: 999 }}>Deleted</span>
                      ) : v.isHidden ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#92400e", background: "#fef3c7", padding: "2px 8px", borderRadius: 999 }}>Hidden</span>
                      ) : v.isPublished ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: 999 }}>Published</span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 999 }}>Draft</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {/* View live */}
                        {!isDeleted && v.isPublished && (
                          <a
                            href={`/venues/${v.stateSlug}/${v.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, background: "#f3f4f6", color: "#374151", textDecoration: "none", whiteSpace: "nowrap" }}
                          >
                            View ↗
                          </a>
                        )}

                        {/* Publish / Unpublish */}
                        {!isDeleted && !v.isHidden && (
                          <AuditActionButton
                            venueId={v.id}
                            action={v.isPublished ? "unpublish" : "publish"}
                            label={v.isPublished ? "Unpublish" : "Publish"}
                            color={v.isPublished ? "#6b7280" : "#16a34a"}
                            bg={v.isPublished ? "#f3f4f6" : "#dcfce7"}
                          />
                        )}

                        {/* Hide / Unhide */}
                        {!isDeleted && (
                          <AuditActionButton
                            venueId={v.id}
                            action={v.isHidden ? "unhide" : "hide"}
                            label={v.isHidden ? "Unhide" : "Hide"}
                            color={v.isHidden ? "#16a34a" : "#92400e"}
                            bg={v.isHidden ? "#dcfce7" : "#fef3c7"}
                          />
                        )}

                        {/* Soft delete / Restore */}
                        <AuditActionButton
                          venueId={v.id}
                          action={isDeleted ? "restore" : "delete"}
                          label={isDeleted ? "↩ Restore" : "Delete"}
                          color={isDeleted ? "#1d4ed8" : "#dc2626"}
                          bg={isDeleted ? "#dbeafe" : "#fef2f2"}
                          confirm={!isDeleted}
                          confirmMsg={`Soft-delete "${v.name}"? It will be hidden from all views but can be restored at any time.`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalCount > 200 && (
          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, marginTop: 16 }}>
            Showing first 200 of {totalCount.toLocaleString()} results. Use filters to narrow down.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Inline action button (server-compatible wrapper) ──────────────────────────
function AuditActionButton({
  venueId, action, label, color, bg, confirm: needsConfirm, confirmMsg,
}: {
  venueId: string; action: string; label: string;
  color: string; bg: string; confirm?: boolean; confirmMsg?: string;
}) {
  return (
    <form action={`/api/admin/venue-action`} method="POST" style={{ display: "inline" }}>
      <input type="hidden" name="venueId" value={venueId} />
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="confirmMsg" value={confirmMsg ?? ""} />
      <button
        type="submit"
        onClick={needsConfirm ? (e) => {
          if (!window.confirm(confirmMsg)) e.preventDefault();
        } : undefined}
        style={{
          fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
          background: bg, color, border: "none", cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        {label}
      </button>
    </form>
  );
}
