"use client";

import { useState } from "react";

export function ClaimForm({ venueSlug }: { venueSlug: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueSlug, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📬</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Check your inbox</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          We sent a sign-in link to <strong>{email}</strong>. Click it to access your dashboard. The link expires in 1 hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Your email address
        </label>
        <input
          type="email"
          required
          placeholder="you@yourvenue.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b6341]/30 focus:border-[#3b6341] transition-colors"
        />
        <p className="text-xs text-gray-400 mt-1.5">We'll send you a magic link — no password needed.</p>
      </div>

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-[#3b6341] hover:bg-[#2f5035] disabled:opacity-60 text-white font-semibold py-3.5 rounded-full text-sm transition-colors flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Sending link…
          </>
        ) : (
          "Send Magic Link →"
        )}
      </button>
    </form>
  );
}
