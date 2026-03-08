import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/internal-home", label: "Home" },
  { href: "/handbook", label: "Handbook" },
  { href: "/data", label: "Data" },
  { href: "/audit", label: "Audit" },
  { href: "/seo", label: "SEO" },
  { href: "/market", label: "Market" },
  { href: "/monetize", label: "Monetize" },
];

export function InternalNav() {
  return (
    <>
      {/* Confidential banner */}
      <div style={{
        background: "#7f1d1d",
        color: "#fecaca",
        textAlign: "center",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "5px 16px",
      }}>
        🔒 Confidential — Internal Use Only · Not for distribution
      </div>

      {/* Nav bar */}
      <header style={{ background: "#1a2e1d", borderBottom: "1px solid #2d4a31" }}>
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/internal-home" className="flex items-center gap-2">
              <Image src="/greenbowtie-logo.svg" alt="Green Bowtie" width={24} height={24} />
              <span style={{ fontWeight: 700, color: "#86efac", fontSize: 14 }}>Green Bowtie</span>
            </Link>
            <span style={{ color: "#2d4a31", fontSize: 14 }}>·</span>
            <span style={{ color: "#6b7280", fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>
              Operations Center
            </span>
          </div>
          <nav className="flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, padding: "5px 10px", borderRadius: 8, transition: "all 0.15s" }}
                className="hover:text-white hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
