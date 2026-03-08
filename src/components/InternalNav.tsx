import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/internal-home", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/handbook", label: "Handbook" },
  { href: "/data", label: "Data" },
  { href: "/seo", label: "SEO" },
  { href: "/market", label: "Market" },
  { href: "/monetize", label: "Monetize" },
];

export function InternalNav() {
  return (
    <header style={{
      background: "#2d4f33",
      borderBottom: "1px solid #1e3824",
      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>

          {/* Branding */}
          <Link href="/internal-home" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
            <Image
              src="/greenbowtie-logo.svg"
              alt="Green Bowtie"
              width={36}
              height={36}
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{
                fontFamily: "'Tenor Sans', serif",
                color: "#ffffff",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}>
                Green Bowtie
              </span>
              <span style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}>
                Operations Center · Confidential
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  padding: "6px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "all 0.15s",
                  letterSpacing: "0.01em",
                }}
                className="internal-nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
