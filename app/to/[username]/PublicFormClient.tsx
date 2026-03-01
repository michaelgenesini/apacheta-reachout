"use client";

import { useState } from "react";

interface Props {
  username: string;
  formTitle: string;
  introMessage: string | null;
  submitLabel: string;
  thankyouMessage: string;
  privacyUrl: string;
  primaryColor: string;
  bgColor: string;
}

export default function PublicFormClient({
  username,
  formTitle,
  introMessage,
  submitLabel,
  thankyouMessage,
  privacyUrl,
  primaryColor,
  bgColor,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive a readable text color from the bg: simple luminance check
  const bgIsLight = (() => {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.slice(0,2), 16);
    const g = parseInt(hex.slice(2,4), 16);
    const b = parseInt(hex.slice(4,6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  })();

  const textColor    = bgIsLight ? "#2c2416" : "#fffcf1";
  const mutedColor   = bgIsLight ? "#6b5e4f" : "rgba(255,252,241,0.65)";
  const borderColor  = bgIsLight ? "#e5ddd0" : "rgba(255,255,255,0.15)";
  const inputBg      = bgIsLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.08)";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, name, email, message }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
    } else {
      setDone(true);
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ background: bgColor }}>
        <div className="text-center max-w-sm">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: primaryColor }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p style={{ fontSize: "20px", color: textColor, fontFamily: "inherit" }}>{thankyouMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ background: bgColor }}>
      <div className="w-full max-w-md">
        <h1
          className="font-medium mb-1"
          style={{ fontSize: "22px", color: textColor, letterSpacing: "-0.01em" }}
        >
          {formTitle}
        </h1>
        {introMessage && (
          <p className="mb-4" style={{ fontSize: "14px", color: mutedColor, lineHeight: "1.55" }}>{introMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          {/* Honeypot */}
          <input type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ display: "block", fontSize: "11px", color: mutedColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                placeholder="Your name"
                style={{
                  width: "100%", padding: "9px 12px", fontSize: "15px",
                  background: inputBg, border: `1px solid ${borderColor}`,
                  color: textColor, borderRadius: "8px", outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: mutedColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={200}
                placeholder="your@email.com"
                style={{
                  width: "100%", padding: "9px 12px", fontSize: "15px",
                  background: inputBg, border: `1px solid ${borderColor}`,
                  color: textColor, borderRadius: "8px", outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", color: mutedColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={2000}
              rows={4}
              placeholder="Your message…"
              style={{
                width: "100%", padding: "9px 12px", fontSize: "15px",
                background: inputBg, border: `1px solid ${borderColor}`,
                color: textColor, borderRadius: "8px", outline: "none",
                resize: "none", fontFamily: "inherit",
              }}
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              id="consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              style={{ marginTop: "3px", flexShrink: 0, accentColor: primaryColor, width: "15px", height: "15px" }}
            />
            <label htmlFor="consent" style={{ fontSize: "13px", color: mutedColor, lineHeight: "1.55", cursor: "pointer" }}>
              I have read and accept the{" "}
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: primaryColor, textDecoration: "underline" }}>
                privacy policy
              </a>
            </label>
          </div>

          {error && (
            <p style={{ fontSize: "13px", color: "#c0392b", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "8px", padding: "8px 12px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !consent}
            className="w-full rounded-full font-medium transition-all hover:opacity-85 disabled:opacity-40"
            style={{ background: primaryColor, color: "#fff", padding: "11px 20px", fontSize: "15px", fontFamily: "inherit" }}
          >
            {submitting ? "Sending…" : submitLabel}
          </button>
        </form>

        <p className="mt-5 text-center" style={{ fontSize: "11px", color: mutedColor }}>
          Powered by{" "}
          <a href="/" style={{ color: primaryColor }} className="hover:underline">ReachOut</a>
        </p>
      </div>
    </div>
  );
}
