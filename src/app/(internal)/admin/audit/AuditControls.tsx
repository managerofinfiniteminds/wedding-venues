"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Props {
  filters: {
    state?: string;
    issue?: string;
    status?: string;
    search?: string;
  };
  states: Array<{ slug: string; name: string; count: number }>;
}

export function AuditControls({ filters, states }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const clearAll = () => router.push(pathname);

  const hasFilters = filters.state || filters.issue || filters.status !== "all" || filters.search;

  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
      padding: "16px 20px", marginBottom: 20,
      display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
    }}>
      {/* Search */}
      <input
        type="text"
        placeholder="Search venue name, city, slug..."
        defaultValue={filters.search ?? ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") setParam("search", (e.target as HTMLInputElement).value);
        }}
        onBlur={(e) => setParam("search", e.target.value)}
        style={{
          flex: "1 1 200px", padding: "8px 14px", borderRadius: 8,
          border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none",
        }}
      />

      {/* Status */}
      <select
        value={filters.status ?? "all"}
        onChange={(e) => setParam("status", e.target.value === "all" ? "" : e.target.value)}
        style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, background: "#fff" }}
      >
        <option value="all">All statuses</option>
        <option value="published">Published</option>
        <option value="unpublished">Unpublished</option>
        <option value="hidden">Hidden</option>
        <option value="deleted">Deleted</option>
      </select>

      {/* Issue */}
      <select
        value={filters.issue ?? ""}
        onChange={(e) => setParam("issue", e.target.value)}
        style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, background: "#fff" }}
      >
        <option value="">All issues</option>
        <option value="no_photo">No photo</option>
        <option value="no_description">No description</option>
        <option value="no_contact">No contact info</option>
        <option value="no_capacity">No capacity</option>
        <option value="no_pricing">No pricing</option>
        <option value="low_completeness">Score &lt; 50</option>
      </select>

      {/* State */}
      <select
        value={filters.state ?? ""}
        onChange={(e) => setParam("state", e.target.value)}
        style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, background: "#fff" }}
      >
        <option value="">All states</option>
        {states.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name} ({s.count.toLocaleString()})
          </option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          style={{
            padding: "8px 14px", borderRadius: 8, border: "1px solid #e5e7eb",
            background: "#f3f4f6", color: "#6b7280", fontSize: 13, cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Clear filters ×
        </button>
      )}
    </div>
  );
}
