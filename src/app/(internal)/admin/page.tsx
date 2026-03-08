import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard — Green Bowtie Internal",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export const revalidate = 0; // always fresh

async function getData() {
  const [inquiries, totalVenues, publishedVenues, recentInquiries, venueOwners, pendingClaims] =
    await Promise.all([
      prisma.inquiry.count(),
      prisma.venue.count(),
      prisma.venue.count({ where: { isPublished: true } }),
      prisma.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          venue: { select: { name: true, slug: true, stateSlug: true } },
        },
      }),
      prisma.venueOwner.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true,
              stateSlug: true,
              city: true,
              _count: { select: { inquiries: true } },
            },
          },
        },
      }),
      prisma.claimToken.findMany({
        where: { usedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        include: {
          venue: { select: { id: true, name: true, slug: true, stateSlug: true, city: true } },
        },
      }),
    ]);
  return { inquiries, totalVenues, publishedVenues, recentInquiries, venueOwners, pendingClaims };
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        padding: "20px 24px",
      }}
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          margin: "0 0 6px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: color ?? "#1a1a1a",
          margin: "0 0 2px",
        }}
      >
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{sub}</p>
      )}
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, React.CSSProperties> = {
    free: {
      background: "#f3f4f6",
      color: "#6b7280",
      border: "1px solid #e5e7eb",
    },
    featured: {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    pro: {
      background: "#dbeafe",
      color: "#1e40af",
      border: "1px solid #bfdbfe",
    },
  };
  const s = styles[plan] ?? styles.free;
  return (
    <span
      style={{
        ...s,
        display: "inline-block",
        borderRadius: 99,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {plan}
    </span>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: 13,
  verticalAlign: "middle",
};

export default async function AdminPage() {
  const {
    inquiries,
    totalVenues,
    publishedVenues,
    recentInquiries,
    venueOwners,
    pendingClaims,
  } = await getData();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f7f4",
        fontFamily: "'Nunito Sans', sans-serif",
        color: "#1a1a1a",
      }}
    >
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontFamily: "'Tenor Sans', serif",
              fontSize: 32,
              fontWeight: 700,
              margin: "0 0 6px",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
            Green Bowtie Operations — real-time data from Neon
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 14,
            marginBottom: 40,
          }}
        >
          <StatCard
            label="Total Inquiries"
            value={inquiries}
            sub="all time"
            color="#3b6341"
          />
          <StatCard
            label="Claimed Venues"
            value={venueOwners.length}
            sub="verified owners"
          />
          <StatCard
            label="Pending Claims"
            value={pendingClaims.length}
            sub="awaiting link click"
            color={pendingClaims.length > 0 ? "#d97706" : undefined}
          />
          <StatCard
            label="Published Venues"
            value={publishedVenues.toLocaleString()}
            sub={`of ${totalVenues.toLocaleString()} total`}
          />
          <StatCard
            label="Venue Notifications"
            value="OFF"
            sub="enable when ready to launch"
            color="#dc2626"
          />
        </div>

        {/* Quick actions */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 40,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "🔍 Venue Audit", href: "/admin/audit" },
            { label: "📖 Handbook", href: "/handbook" },
            { label: "🗺️ Feature Plans", href: "/features" },
            { label: "📊 Data Pipeline", href: "/data" },
            { label: "📈 Market Intel", href: "/market" },
            { label: "💰 Monetization", href: "/monetize" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Inquiries Table */}
        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontFamily: "'Tenor Sans', serif",
                fontSize: 20,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Recent Inquiries
            </h2>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>
              {inquiries} total
            </span>
          </div>

          {recentInquiries.length === 0 ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                padding: "40px",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 14,
              }}
            >
              No inquiries yet. They&apos;ll appear here when couples submit the
              inquiry form.
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: "#f8f7f4",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {[
                      "Date",
                      "Couple",
                      "Email",
                      "Venue",
                      "Wedding Date",
                      "Guests",
                      "Budget",
                    ].map((h) => (
                      <th key={h} style={thStyle}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentInquiries.map((inq, i) => {
                    const names = [inq.coupleName, inq.partnerName]
                      .filter(Boolean)
                      .join(" & ");
                    const budget =
                      inq.budgetMin && inq.budgetMax
                        ? `$${(inq.budgetMin / 1000).toFixed(0)}k–$${(inq.budgetMax / 1000).toFixed(0)}k`
                        : inq.budgetMin
                          ? `$${(inq.budgetMin / 1000).toFixed(0)}k+`
                          : "—";
                    const weddingDate = inq.weddingDate
                      ? new Date(inq.weddingDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : inq.weddingDateFlexible
                        ? "Flexible"
                        : "—";
                    return (
                      <tr
                        key={inq.id}
                        style={{
                          borderBottom:
                            i < recentInquiries.length - 1
                              ? "1px solid #f3f4f6"
                              : "none",
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            fontSize: 12,
                            color: "#9ca3af",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {new Date(inq.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {names}
                        </td>
                        <td style={tdStyle}>
                          <a
                            href={`mailto:${inq.coupleEmail}`}
                            style={{ color: "#3b6341", textDecoration: "none" }}
                          >
                            {inq.coupleEmail}
                          </a>
                        </td>
                        <td style={tdStyle}>
                          <Link
                            href={`/venues/${inq.venue.stateSlug}/${inq.venue.slug}`}
                            style={{ color: "#374151", textDecoration: "none" }}
                          >
                            {inq.venue.name}
                          </Link>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            fontSize: 12,
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {weddingDate}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            fontSize: 12,
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {inq.guestCount ? `${inq.guestCount}` : "—"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            fontSize: 12,
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {budget}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Claims Queue */}
        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontFamily: "'Tenor Sans', serif",
                fontSize: 20,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Claims Queue
            </h2>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>
              {pendingClaims.length} pending
              {pendingClaims.length > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    background: "#fef3c7",
                    color: "#d97706",
                    borderRadius: 99,
                    padding: "1px 8px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  awaiting action
                </span>
              )}
            </span>
          </div>

          {pendingClaims.length === 0 ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                padding: "40px",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 14,
              }}
            >
              No pending claims.
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: "#f8f7f4",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {["Venue", "Email", "Requested", "Expires", "Listing"].map(
                      (h) => (
                        <th key={h} style={thStyle}>
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {pendingClaims.map((token, i) => (
                    <tr
                      key={token.id}
                      style={{
                        borderBottom:
                          i < pendingClaims.length - 1
                            ? "1px solid #f3f4f6"
                            : "none",
                      }}
                    >
                      <td style={{ ...tdStyle, fontWeight: 600 }}>
                        <Link
                          href={`/venues/${token.venue.stateSlug}/${token.venue.slug}`}
                          style={{ color: "#374151", textDecoration: "none" }}
                        >
                          {token.venue.name}
                        </Link>
                        <span
                          style={{
                            display: "block",
                            fontSize: 11,
                            color: "#9ca3af",
                            fontWeight: 400,
                          }}
                        >
                          {token.venue.city}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <a
                          href={`mailto:${token.email}`}
                          style={{ color: "#3b6341", textDecoration: "none" }}
                        >
                          {token.email}
                        </a>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          fontSize: 12,
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {new Date(token.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          fontSize: 12,
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {new Date(token.expiresAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td style={tdStyle}>
                        <Link
                          href={`/venues/${token.venue.stateSlug}/${token.venue.slug}`}
                          style={{
                            color: "#3b6341",
                            textDecoration: "none",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Venue Owners Table */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontFamily: "'Tenor Sans', serif",
                fontSize: 20,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Venue Owners
            </h2>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>
              {venueOwners.length} total
            </span>
          </div>

          {venueOwners.length === 0 ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                padding: "40px",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 14,
              }}
            >
              No venue owners yet.
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: "#f8f7f4",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {[
                      "Venue",
                      "Owner Email",
                      "Plan",
                      "Verified",
                      "Claimed",
                      "Last Login",
                      "Inquiries",
                    ].map((h) => (
                      <th key={h} style={thStyle}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {venueOwners.map((owner, i) => (
                    <tr
                      key={owner.id}
                      style={{
                        borderBottom:
                          i < venueOwners.length - 1
                            ? "1px solid #f3f4f6"
                            : "none",
                      }}
                    >
                      <td style={{ ...tdStyle, fontWeight: 600 }}>
                        <Link
                          href={`/venues/${owner.venue.stateSlug}/${owner.venue.slug}`}
                          style={{ color: "#374151", textDecoration: "none" }}
                        >
                          {owner.venue.name}
                        </Link>
                        <span
                          style={{
                            display: "block",
                            fontSize: 11,
                            color: "#9ca3af",
                            fontWeight: 400,
                          }}
                        >
                          {owner.venue.city}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <a
                          href={`mailto:${owner.email}`}
                          style={{ color: "#3b6341", textDecoration: "none" }}
                        >
                          {owner.email}
                        </a>
                        {owner.name && (
                          <span
                            style={{
                              display: "block",
                              fontSize: 11,
                              color: "#9ca3af",
                            }}
                          >
                            {owner.name}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <PlanBadge plan={owner.plan} />
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {owner.verified ? "✅" : "⬜"}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          fontSize: 12,
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {new Date(owner.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          fontSize: 12,
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {owner.lastLoginAt
                          ? new Date(owner.lastLoginAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "Never"}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          fontSize: 13,
                          color: "#374151",
                          textAlign: "center",
                        }}
                      >
                        {owner.venue._count.inquiries}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
