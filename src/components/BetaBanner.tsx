
"use client";

import { useState, useEffect } from 'react';

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('gb_beta_dismissed');
    if (dismissed !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('gb_beta_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-[#3b6341] to-[#4a7a50] text-white text-center py-2 text-sm">
      <span>✨ Beta · California Venues Now Showing — Full United States Coming Soon 🇺🇸</span>
      <button
        onClick={handleDismiss}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-white hover:text-gray-200 text-xl font-bold"
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  );
}
