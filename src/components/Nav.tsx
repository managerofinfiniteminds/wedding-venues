import Link from "next/link";
import { CitySearch } from "./CitySearch";

export function Nav({ q }: { q?: string }) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/greenbowtie.svg" alt="Green Bowtie logo" style={{ height: 60, width: "auto" }} />
          <span className="playfair font-bold leading-none" style={{ color: "#3b6341", fontSize: "1.5rem" }}>Green Bowtie</span>
        </Link>
        <CitySearch currentQ={q} />
        <div className="ml-auto flex items-center gap-3">

          <Link href="/venues" className="hidden md:block text-sm text-gray-600 hover:text-pink-700 font-medium">Browse All</Link>
          <Link href="/map" className="hidden md:block text-sm text-gray-600 hover:text-pink-700 font-medium">🗺️ Map</Link>

        </div>
      </div>
    </nav>
  );
}
