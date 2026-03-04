"use client";

import { useState } from "react";

export function NotifyForm({ stateName }: { stateName: string }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire to email capture backend
    console.log(`Notify request submitted for ${stateName}`);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="text-lg text-[#3b6341] font-medium">
        Thanks! We'll notify you when {stateName} launches. 🎉
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <label htmlFor="notify-email" className="sr-only">
        Notify me when {stateName} launches
      </label>
      <input
        type="email"
        id="notify-email"
        placeholder="Enter your email..."
        required
        className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3b6341] focus:border-[#3b6341] outline-none transition-shadow text-sm"
      />
      <button
        type="submit"
        className="bg-[#3b6341] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#2f5035] transition-colors text-sm"
      >
        Notify Me
      </button>
    </form>
  );
}
