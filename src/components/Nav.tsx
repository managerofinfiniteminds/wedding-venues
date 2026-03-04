"use client";

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { CitySearch } from "./CitySearch";

export function Nav({ q }: { q?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const closeMenu = () => setIsMenuOpen(false);

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

          <Link href="/venues" className="hidden md:block text-sm text-gray-600 hover:text-pink-700 font-medium">Browse States</Link>
          <Link href="/map" className="hidden md:block text-sm text-gray-600 hover:text-pink-700 font-medium">🗺️ Map</Link>

          {/* Hamburger Menu Button */}
          <button
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

       {/* Mobile Menu Dropdown */}
       {isMenuOpen && (
        <div ref={menuRef} className="md:hidden bg-white border-t border-gray-200">
           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <Link href="/venues" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Browse States</Link>
             <Link href="/map" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">🗺️ Map</Link>
             <Link href="/venues/california" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Browse California</Link>
           </div>
        </div>
       )}
    </nav>
  );
}
