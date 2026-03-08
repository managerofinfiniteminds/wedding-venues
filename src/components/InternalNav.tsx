import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/internal-home", label: "Home" },
  { href: "/data", label: "Data" },
  { href: "/audit", label: "Audit" },
  { href: "/seo", label: "SEO" },
  { href: "/monetize", label: "Monetize" },
  { href: "/stack", label: "Stack" },
  { href: "/market", label: "Market" },
];

export function InternalNav() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/internal-home" className="flex items-center gap-2">
            <Image src="/greenbowtie-logo.svg" alt="Green Bowtie" width={28} height={28} />
            <span className="font-bold text-[#3b6341] text-sm">Green Bowtie</span>
          </Link>
          <span className="text-gray-300 text-sm">·</span>
          <span className="text-gray-500 text-sm font-medium">Operations Center</span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-gray-500 hover:text-[#3b6341] font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
