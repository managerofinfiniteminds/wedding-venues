"use client";

import { useState } from "react";

interface Props {
  venueId: string;
  venueName: string;
}

const GUEST_OPTIONS = [
  { label: "Under 50", value: 40 },
  { label: "50 – 100", value: 75 },
  { label: "100 – 150", value: 125 },
  { label: "150 – 200", value: 175 },
  { label: "200 – 300", value: 250 },
  { label: "300+", value: 350 },
];

const BUDGET_OPTIONS = [
  { label: "Under $5,000", min: 0, max: 5000 },
  { label: "$5,000 – $10,000", min: 5000, max: 10000 },
  { label: "$10,000 – $20,000", min: 10000, max: 20000 },
  { label: "$20,000 – $30,000", min: 20000, max: 30000 },
  { label: "$30,000 – $50,000", min: 30000, max: 50000 },
  { label: "$50,000+", min: 50000, max: 0 },
  { label: "Not sure yet", min: 0, max: 0 },
];

export function InquiryForm({ venueId, venueName }: Props) {
  const [form, setForm] = useState({
    coupleName: "",
    partnerName: "",
    coupleEmail: "",
    couplePhone: "",
    weddingDate: "",
    weddingDateFlexible: false,
    guestCount: "",
    budget: "",
    message: "",
    preferredContact: "email",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const budgetOption = form.budget ? BUDGET_OPTIONS[parseInt(form.budget)] : null;
    const guestOption = form.guestCount ? GUEST_OPTIONS[parseInt(form.guestCount)] : null;

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId,
          coupleName: form.coupleName,
          partnerName: form.partnerName || null,
          coupleEmail: form.coupleEmail,
          couplePhone: form.couplePhone || null,
          weddingDate: form.weddingDate || null,
          weddingDateFlexible: form.weddingDateFlexible,
          guestCount: guestOption?.value ?? null,
          budgetMin: budgetOption?.min || null,
          budgetMax: budgetOption?.max || null,
          message: form.message,
          preferredContact: form.preferredContact,
          source: "venue-detail",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="playfair text-xl font-semibold text-gray-800 mb-2">Inquiry Sent!</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Your inquiry to <strong>{venueName}</strong> has been sent. Check your email for a confirmation — the venue will reach out to you directly.
        </p>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3b6341]/30 focus:border-[#3b6341] transition-colors placeholder:text-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="playfair text-xl font-semibold text-gray-800 mb-1">Send an Inquiry</h3>
      <p className="text-gray-400 text-xs mb-5">Free · No account required · Hear back directly</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Names */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Your Name *</label>
            <input
              type="text"
              required
              placeholder="Jamie"
              value={form.coupleName}
              onChange={(e) => set("coupleName", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Partner's Name</label>
            <input
              type="text"
              placeholder="Alex"
              value={form.partnerName}
              onChange={(e) => set("partnerName", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Contact */}
        <div>
          <label className={labelCls}>Email Address *</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={form.coupleEmail}
            onChange={(e) => set("coupleEmail", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Phone Number</label>
          <input
            type="tel"
            placeholder="(555) 000-0000"
            value={form.couplePhone}
            onChange={(e) => set("couplePhone", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Wedding date */}
        <div>
          <label className={labelCls}>Wedding Date</label>
          <input
            type="date"
            value={form.weddingDate}
            disabled={form.weddingDateFlexible}
            onChange={(e) => set("weddingDate", e.target.value)}
            className={inputCls + (form.weddingDateFlexible ? " opacity-40 cursor-not-allowed" : "")}
          />
          <label className="flex items-center gap-2 mt-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.weddingDateFlexible}
              onChange={(e) => set("weddingDateFlexible", e.target.checked)}
              className="w-4 h-4 accent-[#3b6341]"
            />
            <span className="text-xs text-gray-500 group-hover:text-gray-700">Our date is flexible</span>
          </label>
        </div>

        {/* Guests + Budget */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Guest Count</label>
            <select
              value={form.guestCount}
              onChange={(e) => set("guestCount", e.target.value)}
              className={inputCls}
            >
              <option value="">Select...</option>
              {GUEST_OPTIONS.map((o, i) => (
                <option key={i} value={i}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Budget Range</label>
            <select
              value={form.budget}
              onChange={(e) => set("budget", e.target.value)}
              className={inputCls}
            >
              <option value="">Select...</option>
              {BUDGET_OPTIONS.map((o, i) => (
                <option key={i} value={i}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className={labelCls}>Tell them about your vision *</label>
          <textarea
            required
            rows={4}
            placeholder={`Hi, we're planning our wedding and love what we've seen about ${venueName}. We'd love to learn more about availability, pricing, and packages...`}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            className={inputCls + " resize-none"}
          />
        </div>

        {/* Preferred contact */}
        <div>
          <label className={labelCls}>Preferred Contact Method</label>
          <div className="flex gap-4">
            {(["email", "phone", "either"] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="preferredContact"
                  value={opt}
                  checked={form.preferredContact === opt}
                  onChange={() => set("preferredContact", opt)}
                  className="accent-[#3b6341]"
                />
                <span className="text-sm text-gray-600 capitalize">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error */}
        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {errorMsg || "Something went wrong. Please try again."}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-[#3b6341] hover:bg-[#2f5035] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-full text-sm transition-colors flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Sending…
            </>
          ) : (
            "Send Inquiry →"
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          By submitting you agree to our{" "}
          <a href="/privacy" className="underline hover:text-gray-600">privacy policy</a>.
          Your info is only shared with this venue.
        </p>
      </form>
    </div>
  );
}
