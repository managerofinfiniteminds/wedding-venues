"use client";

import { useState } from "react";

export function MobileFilters({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Filter button — inline at top of listing, not floating */}
      <div className="max-w-screen-xl mx-auto px-4 pt-4 pb-2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-[#3b6341] border border-[#3b6341] px-4 py-2 rounded-full hover:bg-green-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters &amp; Regions
        </button>
      </div>

      {/* Slide-in panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-800 text-lg">Filters &amp; Regions</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div>{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
