import Link from "next/link";
import { CitySearch } from "./CitySearch";

export function Nav({ q }: { q?: string }) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="playfair text-2xl font-bold text-pink-700 whitespace-nowrap flex-shrink-0">
          Venue by Vow
        </Link>
        <CitySearch currentQ={q} />
        <div className="ml-auto flex items-center gap-3">
          <Link href="/venues" className="hidden md:block text-sm text-gray-600 hover:text-pink-700 font-medium">Browse All</Link>
          <button title="Favorites" className="hidden md:flex text-gray-400 hover:text-pink-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
          <button className="bg-pink-700 hover:bg-pink-800 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors">Sign In</button>
        </div>
      </div>
    </nav>
  );
}
