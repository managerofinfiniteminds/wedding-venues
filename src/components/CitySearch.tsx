"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface CitySuggestion {
  city: string;
  stateSlug: string;
  stateAbbr: string;
  count: number;
}

export function CitySearch({ currentQ }: { currentQ?: string }) {
  const [query, setQuery] = useState(currentQ ?? "");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setOpen(false); return; }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCity = (s: CitySuggestion) => {
    setQuery(`${s.city}, ${s.stateAbbr}`);
    setOpen(false);
    router.push(`/venues/${s.stateSlug}?city=${encodeURIComponent(s.city)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (suggestions.length > 0) {
      selectCity(suggestions[0]);
    } else {
      router.push(`/venues?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div ref={ref} className="relative flex-1 max-w-xl">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-1">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="City or venue name..."
            className="w-full pl-9 pr-8 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 bg-gray-50"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setSuggestions([]); setOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          className="flex-shrink-0 bg-[#3b6341] hover:bg-[#2f5035] text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
        >
          Search
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
          <p className="text-xs text-gray-400 px-4 pt-2 pb-1">Cities</p>
          {suggestions.map((s) => (
            <button
              key={`${s.city}-${s.stateSlug}`}
              onClick={() => selectCity(s)}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700 transition-colors text-left"
            >
              <span>{s.city}, <span className="text-gray-400">{s.stateAbbr}</span></span>
              <span className="text-gray-400 text-xs">{s.count} venues</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
