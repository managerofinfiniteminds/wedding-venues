"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please email us directly at info@greenbowtie.com");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Nunito Sans', sans-serif" }}>

      {/* Hero */}
      <div style={{ background: "#2d4f33", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 0 0", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/greenbowtie-logo.svg" alt="Green Bowtie" width={32} height={32} style={{ filter: "brightness(0) invert(1)" }} />
            <span style={{ fontFamily: "'Tenor Sans', serif", color: "#fff", fontSize: 18, fontWeight: 700 }}>Green Bowtie</span>
          </Link>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 0 64px" }}>
          <h1 style={{ fontFamily: "'Tenor Sans', serif", color: "#fff", fontSize: 42, fontWeight: 700, margin: "0 0 12px" }}>
            Get in Touch
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, margin: 0, maxWidth: 520 }}>
            Questions about a venue, your listing, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 40,
          marginTop: -32, paddingBottom: 80,
        }}>

          {/* Left — info cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                icon: "💌",
                title: "Couple Inquiries",
                desc: "Looking for a venue? Browse our directory and use the inquiry form on any venue page to reach them directly.",
                cta: "Browse Venues",
                href: "/venues",
              },
              {
                icon: "🏛️",
                title: "Venue Owners",
                desc: "Want to claim or update your listing? Use the Claim button on your venue page, or reach out to us here.",
                cta: null,
                href: null,
              },
              {
                icon: "📧",
                title: "Direct Email",
                desc: "Prefer email? Reach us directly.",
                cta: "info@greenbowtie.com",
                href: "mailto:info@greenbowtie.com",
              },
            ].map((card) => (
              <div key={card.title} style={{
                background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb",
                padding: "24px", marginTop: card.title === "Couple Inquiries" ? 32 : 0,
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 6px", color: "#1a1a1a" }}>{card.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 12px", lineHeight: 1.6 }}>{card.desc}</p>
                {card.cta && card.href && (
                  <a href={card.href} style={{ fontSize: 13, color: "#3b6341", fontWeight: 700, textDecoration: "none" }}>
                    {card.cta} →
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Right — form */}
          <div style={{
            background: "#fff", borderRadius: 20, border: "1px solid #e5e7eb",
            padding: "40px 44px", marginTop: 32,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}>
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 20 }}>💚</div>
                <h2 style={{ fontFamily: "'Tenor Sans', serif", fontSize: 28, fontWeight: 700, margin: "0 0 12px" }}>
                  Message sent!
                </h2>
                <p style={{ color: "#6b7280", fontSize: 16, marginBottom: 32 }}>
                  We'll get back to you within 1 business day.
                </p>
                <button
                  onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  style={{ background: "#3b6341", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 28px", borderRadius: 100, border: "none", cursor: "pointer" }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "'Tenor Sans', serif", fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#1a1a1a" }}>
                  Send us a message
                </h2>
                <p style={{ color: "#9ca3af", fontSize: 14, margin: "0 0 32px" }}>
                  We typically respond within 1 business day.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Jane Smith"
                        style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1a1a1a", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="jane@example.com"
                        style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1a1a1a", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                      Subject *
                    </label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: form.subject ? "#1a1a1a" : "#9ca3af", outline: "none", background: "#fff", boxSizing: "border-box" }}
                    >
                      <option value="" disabled>Select a topic...</option>
                      <option value="General Question">General Question</option>
                      <option value="Venue Owner — Claim or Update Listing">Venue Owner — Claim or Update Listing</option>
                      <option value="Report Incorrect Venue Info">Report Incorrect Venue Info</option>
                      <option value="Partnership Inquiry">Partnership Inquiry</option>
                      <option value="Press / Media">Press / Media</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                      Message *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us how we can help..."
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1a1a1a", outline: "none", resize: "vertical", fontFamily: "'Nunito Sans', sans-serif", boxSizing: "border-box" }}
                    />
                  </div>

                  {status === "error" && (
                    <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    style={{
                      background: "#3b6341", color: "#fff", fontWeight: 700, fontSize: 15,
                      padding: "14px 32px", borderRadius: 100, border: "none",
                      cursor: status === "loading" ? "not-allowed" : "pointer",
                      opacity: status === "loading" ? 0.7 : 1,
                      alignSelf: "flex-start",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {status === "loading" ? "Sending..." : "Send Message →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
