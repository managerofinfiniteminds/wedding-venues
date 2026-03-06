"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CitySearch } from "./CitySearch";

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

      {/* ── Top row: logo + desktop search + desktop nav ── */}
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/greenbowtie-round.svg" alt="Green Bowtie logo" style={{ height: 68, width: "auto" }} />
          <span className="playfair font-bold leading-none" style={{ color: "#3b6341", fontSize: "1.4rem" }}>Green Bowtie</span>
        </Link>

        {/* Desktop search — hidden on mobile, shown md+ */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <CitySearch currentQ={q} />
        </div>

        {/* Desktop nav links */}
        <div className="ml-auto hidden md:flex items-center gap-1">
          <Link href="/venues" className="text-sm text-gray-600 hover:text-[#3b6341] font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Browse States
          </Link>

        </div>

        {/* Hamburger — mobile only */}
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden ml-auto p-2.5 rounded-xl text-[#3b6341] hover:bg-green-50 transition-colors border border-gray-200"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen
            ? <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            : <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          }
        </button>
      </div>

      {/* ── Mobile search row — full width, below logo ── */}
      <div className="md:hidden px-4 pb-3">
        <CitySearch currentQ={q} />
      </div>

      {/* ── Mobile menu drawer ── */}
      {isMenuOpen && (
        <div ref={menuRef} className="md:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/venues"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold text-gray-800 hover:bg-[#f0f4f0] hover:text-[#3b6341] transition-colors"
            >
              <svg className="w-5 h-5 text-[#3b6341]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" /></svg>
              Browse All States
            </Link>
            <Link
              href="/venues/california"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold text-gray-800 hover:bg-[#f0f4f0] hover:text-[#3b6341] transition-colors"
            >
              <span className="text-lg">🍷</span>
              Browse California
            </Link>
            <Link
              href="/venues/new-york"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold text-gray-800 hover:bg-[#f0f4f0] hover:text-[#3b6341] transition-colors"
            >
              <span className="text-lg">🗽</span>
              Browse New York
            </Link>
            <Link
              href="/venues/texas"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold text-gray-800 hover:bg-[#f0f4f0] hover:text-[#3b6341] transition-colors"
            >
              <span className="text-lg">🤠</span>
              Browse Texas
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
