import Link from "next/link";

export function Nav({ q }: { q?: string }) {
    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4">
                <Link href="/" className="playfair text-2xl font-bold text-pink-700 whitespace-nowrap">
                    Venue by Vow
                </Link>
                <form action="/venues" method="get" className="flex-1 relative max-w-xl">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        name="q"
                        defaultValue={q ?? ""}
                        placeholder="Search city or venue name..."
                        className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-pink-400 bg-gray-50"
                    />
                </form>
                <div className="ml-auto">
                    <button className="bg-pink-700 hover:bg-pink-800 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">
                        Sign In
                    </button>
                </div>
            </div>
        </nav>
    );
}