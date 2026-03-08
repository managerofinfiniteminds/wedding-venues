"use client";

import { useState } from "react";

interface EmailCaptureProps {
  /** Headline text */
  headline?: string;
  /** Subtext below headline */
  subtext?: string;
  /** Placeholder for email input */
  placeholder?: string;
  /** Button label */
  buttonLabel?: string;
  /** Layout variant */
  variant?: "inline" | "stacked";
  /** Extra CSS classes on the wrapper */
  className?: string;
}

export function EmailCapture({
  headline = "Get the best venues before anyone else",
  subtext = "Join couples who've already found their dream venue on Green Bowtie.",
  placeholder = "your@email.com",
  buttonLabel = "Notify Me",
  variant = "inline",
  className = "",
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="text-2xl mb-2">💚</div>
        <p className="font-semibold text-gray-800">You're on the list!</p>
        <p className="text-sm text-gray-500 mt-1">We'll be in touch when we launch.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {headline && (
        <h3 className="playfair text-xl font-bold text-gray-800 mb-1">{headline}</h3>
      )}
      {subtext && (
        <p className="text-sm text-gray-500 mb-4">{subtext}</p>
      )}

      <form onSubmit={handleSubmit} className={variant === "inline" ? "flex gap-2" : "flex flex-col gap-2"}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          style={{
            flex: 1, padding: "12px 20px", borderRadius: 100,
            border: "none", fontSize: 14,
            background: "rgba(255,255,255,0.95)",
            color: "#1a1a1a", outline: "none",
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            background: "#86efac", color: "#1a2e1d",
            fontWeight: 700, fontSize: 14,
            padding: "12px 24px", borderRadius: 100,
            border: "none", cursor: "pointer",
            whiteSpace: "nowrap", flexShrink: 0,
            opacity: status === "loading" ? 0.6 : 1,
          }}
        >
          {status === "loading" ? "..." : buttonLabel}
        </button>
      </form>

      {status === "error" && (
        <p className="text-red-500 text-xs mt-2">{errorMsg}</p>
      )}
    </div>
  );
}
