"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function CitySearch({ currentQ }: { currentQ?: string }) {
  const [query, setQuery] = useState(currentQ ?? "");
  const [suggestions, setSuggestions] = useState<Array<{ city: string; count: number }>>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
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

  const selectCity = (city: string) => {
    setQuery(city);
    setOpen(false);
    router.push(`/venues/california?city=${encodeURIComponent(city)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    router.push(`/venues/california?q=${encodeURIComponent(query)}`);
  };

  return (
    <div ref={ref} className="relative flex-1 max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search venues, city, style..."
          className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 bg-gray-50"
        />
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
          <p className="text-xs text-gray-400 px-4 pt-2 pb-1">Cities</p>
          {suggestions.map(({ city, count }) => (
            <button
              key={city}
              onClick={() => selectCity(city)}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700 transition-colors text-left"
            >
              <span>{city}</span>
              <span className="text-gray-400 text-xs">{count} venues</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
