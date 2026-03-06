"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export interface CitySuggestion {
  city: string;
  stateSlug: string;
  stateAbbr: string;
  count: number;
}

export function buildSearchUrl(chips: CitySuggestion[]): string {
  if (chips.length === 0) return "/venues";
  const states = [...new Set(chips.map((c) => c.stateSlug))];
  if (states.length === 1) {
    const params = chips
      .map((c) => `city=${encodeURIComponent(c.city)}`)
      .join("&");
    return `/venues/${states[0]}?${params}`;
  }
  // Multi-state fallback
  const q = chips.map((c) => `${c.city}, ${c.stateAbbr}`).join("; ");
  return `/venues?q=${encodeURIComponent(q)}`;
}

export function isDuplicate(chips: CitySuggestion[], newChip: CitySuggestion): boolean {
  return chips.some(
    (c) => c.city === newChip.city && c.stateSlug === newChip.stateSlug
  );
}

export function CitySearch({
  currentQ,
  currentCities,
}: {
  currentQ?: string;
  currentCities?: CitySuggestion[];
}) {
  const [chips, setChips] = useState<CitySuggestion[]>(currentCities ?? []);
  const [query, setQuery] = useState(currentQ ?? "");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const addChip = (s: CitySuggestion) => {
    if (isDuplicate(chips, s)) {
      setQuery("");
      setOpen(false);
      return;
    }
    setChips((prev) => [...prev, s]);
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeChip = (index: number) => {
    setChips((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    if (chips.length > 0) {
      setChips([]);
    }
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);

    if (chips.length > 0) {
      router.push(buildSearchUrl(chips));
      return;
    }

    // No chips — fall back to existing text search behavior
    if (suggestions.length > 0) {
      const s = suggestions[0];
      setQuery(`${s.city}, ${s.stateAbbr}`);
      router.push(`/venues/${s.stateSlug}?city=${encodeURIComponent(s.city)}`);
    } else if (query.trim()) {
      router.push(`/venues?q=${encodeURIComponent(query)}`);
    }
  };

  const hasContent = chips.length > 0 || query.length > 0;
  const placeholder = chips.length > 0 ? "Add another city..." : "City or venue name...";

  return (
    <div ref={ref} className="relative flex-1 max-w-xl">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-1">
        {/* Input wrapper — chips + text field */}
        <div
          className="relative flex-1 flex flex-wrap items-center gap-1 pl-9 pr-8 py-1.5 rounded-full border border-gray-200 bg-gray-50 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100 cursor-text min-h-[42px]"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Search icon */}
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none flex-shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          {/* City chips */}
          {chips.map((chip, i) => (
            <span
              key={`${chip.city}-${chip.stateSlug}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#e8f0e9] text-[#3b6341] border border-[#c0d4c2] flex-shrink-0"
            >
              {chip.city}, {chip.stateAbbr}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeChip(i); }}
                className="hover:text-[#2f5035] transition-colors ml-0.5"
                aria-label={`Remove ${chip.city}`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={placeholder}
            className="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none py-1"
          />

          {/* Clear button */}
          {hasContent && (
            <button
              type="button"
              onClick={handleClear}
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

      {/* Autocomplete dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
          <p className="text-xs text-gray-400 px-4 pt-2 pb-1">Cities</p>
          {suggestions.map((s) => {
            const already = isDuplicate(chips, s);
            return (
              <button
                key={`${s.city}-${s.stateSlug}`}
                onClick={() => addChip(s)}
                disabled={already}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors text-left ${
                  already
                    ? "text-gray-300 cursor-default"
                    : "text-gray-700 hover:bg-pink-50 hover:text-pink-700"
                }`}
              >
                <span>{s.city}, <span className="text-gray-400">{s.stateAbbr}</span></span>
                <span className="text-gray-400 text-xs">
                  {already ? "added" : `${s.count} venues`}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
