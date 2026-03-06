"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CitySearch } from "./CitySearch";

// SVG map pin icon — used in nav and elsewhere
export function PinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

export function Nav({ q }: { q?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/greenbowtie.svg" alt="Green Bowtie logo" style={{ height: 60, width: "auto" }} />
          <span className="playfair font-bold leading-none" style={{ color: "#3b6341", fontSize: "1.25rem" }}>Green Bowtie</span>
        </Link>

        {/* Search */}
        <CitySearch currentQ={q} />

        {/* Desktop nav */}
        <div className="ml-auto flex items-center gap-1">
          <Link href="/venues" className="hidden md:block text-sm text-gray-600 hover:text-[#3b6341] font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Browse States
          </Link>
          <Link
            href="/map"
            className="hidden md:flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors text-[#3b6341] hover:bg-[#3b6341] hover:text-white border border-[#3b6341]"
            title="Map View"
          >
            <PinIcon className="w-4 h-4" />
            <span>Map</span>
          </Link>

          {/* Hamburger */}
          <button
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div ref={menuRef} className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link href="/venues" onClick={closeMenu} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Browse States
            </Link>
            <Link href="/map" onClick={closeMenu} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#3b6341] hover:bg-green-50 transition-colors">
              <PinIcon className="w-4 h-4" /> Map View
            </Link>
            <Link href="/venues/california" onClick={closeMenu} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Browse California
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
