"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";
import Link from "next/link";

interface Props {
  profile: Profile;
  monthlyLimit: number;
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
const HEX_RE  = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Shared input style
const inputStyle = {
  padding: "10px 13px",
  fontSize: "15px",
  background: "var(--cream-mid)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  borderRadius: "8px",
  width: "100%",
  outline: "none",
} as const;

const labelStyle = {
  display: "block",
  fontSize: "12px",
  color: "var(--muted)",
  letterSpacing: "0.04em",
  marginBottom: "5px",
  textTransform: "uppercase" as const,
};

export default function DashboardClient({ profile, monthlyLimit }: Props) {
  const [slug, setSlug] = useState(profile.slug);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [formTitle, setFormTitle] = useState(profile.form_title);
  const [introMessage, setIntroMessage] = useState(profile.intro_message ?? "");
  const [submitLabel, setSubmitLabel] = useState(profile.submit_label);
  const [thankyouMessage, setThankyouMessage] = useState(profile.thankyou_message);
  const [destinationEmail, setDestinationEmail] = useState(profile.destination_email);
  const [privacyUrl, setPrivacyUrl] = useState(
    profile.using_default_privacy ? "" : (profile.privacy_url ?? "")
  );
  const [primaryColor, setPrimaryColor] = useState(profile.form_primary_color ?? "#0c7b5f");
  const [bgColor, setBgColor] = useState(profile.form_bg_color ?? "#fffcf1");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [embedCopied, setEmbedCopied] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const slugCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const usagePercent = Math.round((profile.monthly_submission_count / monthlyLimit) * 100);

  const formUrl = typeof window !== "undefined"
    ? `${window.location.origin}/to/${slug}`
    : `/to/${slug}`;

  const embedSnippet = `<iframe\n  src="${formUrl}"\n  width="100%"\n  height="520"\n  style="border:none;border-radius:12px;"\n  title="Contact form"\n></iframe>`;

  function copyEmbed() {
    navigator.clipboard.writeText(embedSnippet);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  }

  function validateSlugFormat(value: string): string | null {
    if (!value) return "URL handle is required.";
    if (!SLUG_RE.test(value)) return "3–40 chars, lowercase letters, numbers, hyphens. Must start and end with a letter or number.";
    return null;
  }

  async function checkSlugAvailability(value: string) {
    if (value === profile.slug) { setSlugError(null); return; }
    if (validateSlugFormat(value)) return;
    setSlugChecking(true);
    const { data } = await supabase.from("profiles").select("id").eq("slug", value).neq("id", profile.id).maybeSingle();
    setSlugChecking(false);
    setSlugError(data ? "That handle is already taken." : null);
  }

  function handleSlugChange(value: string) {
    const lower = value.toLowerCase();
    setSlug(lower);
    setSaved(false);
    const fmt = validateSlugFormat(lower);
    if (fmt) { setSlugError(fmt); return; }
    setSlugError(null);
    if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
    slugCheckTimer.current = setTimeout(() => checkSlugAvailability(lower), 400);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (validateSlugFormat(slug) || slugError) return;
    if (!HEX_RE.test(primaryColor) || !HEX_RE.test(bgColor)) {
      setError("Colors must be valid hex values (e.g. #0c7b5f).");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const customUrl = privacyUrl.trim() || null;
    const finalPrivacyUrl = customUrl ?? `${origin}/privacy/${slug}`;

    const { error } = await supabase
      .from("profiles")
      .update({
        slug,
        form_title: formTitle,
        intro_message: introMessage || null,
        submit_label: submitLabel,
        thankyou_message: thankyouMessage,
        destination_email: destinationEmail,
        privacy_url: finalPrivacyUrl,
        using_default_privacy: !customUrl,
        form_primary_color: primaryColor,
        form_bg_color: bgColor,
        is_live: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      if (error.code === "23505") setSlugError("That handle is already taken.");
      else setError(error.message);
    } else {
      setSaved(true);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--cream)" }}>

      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-8 py-4"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--cream)" }}
      >
        <Link href="/" className="font-semibold" style={{ fontSize: "17px", color: "var(--text)" }}>
          ReachOut
        </Link>
        <button
          onClick={handleSignOut}
          className="hover:underline transition-all"
          style={{ fontSize: "14px", color: "var(--muted)" }}
        >
          Sign out
        </button>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-2xl mx-auto px-8 py-7">

          {/* Top row: link + usage */}
          <div className="grid grid-cols-2 gap-5 mb-7">

            {/* Form link */}
            <div className="rounded-xl p-5" style={{ background: "var(--cream-mid)", border: "1px solid var(--border)" }}>
              <p style={labelStyle}>Your form</p>
              <div className="flex items-center gap-2 mb-2">
                <code
                  className="flex-1 truncate rounded-lg px-3 py-1.5"
                  style={{ fontSize: "13px", background: "var(--cream)", border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  /to/{slug}
                </code>
                <a
                  href={`/to/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex-shrink-0"
                  style={{ fontSize: "13px", color: "var(--teal)" }}
                >
                  Open →
                </a>
              </div>
              <button
                onClick={copyEmbed}
                className="hover:underline transition-all"
                style={{ fontSize: "12px", color: embedCopied ? "var(--accent-dark)" : "var(--muted)" }}
              >
                {embedCopied ? "✓ Copied embed code" : "Copy embed snippet"}
              </button>
            </div>

            {/* Usage */}
            <div className="rounded-xl p-5" style={{ background: "var(--cream-mid)", border: "1px solid var(--border)" }}>
              <p style={labelStyle}>This month</p>
              <div className="flex items-center justify-between mb-2" style={{ fontSize: "14px" }}>
                <span style={{ color: "var(--text)" }}>{profile.monthly_submission_count} / {monthlyLimit}</span>
                <span style={{ color: "var(--muted)" }}>{usagePercent}%</span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: "5px", background: "var(--border)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(usagePercent, 100)}%`,
                    background: usagePercent >= 100 ? "#c0392b" : usagePercent >= 80 ? "#d4852a" : "var(--accent-dark)",
                  }}
                />
              </div>
              <p className="mt-2" style={{ fontSize: "12px", color: "var(--muted)" }}>
                All-time: {profile.submission_count}
              </p>
            </div>
          </div>

          {/* Settings form */}
          <form onSubmit={handleSave} className="space-y-5">
            <h2 className="font-medium" style={{ fontSize: "17px", color: "var(--text)" }}>Form settings</h2>

            {/* URL handle */}
            <div>
              <label style={labelStyle}>URL handle</label>
              <div
                className="flex items-center overflow-hidden"
                style={{ border: "1px solid var(--border)", borderRadius: "8px", background: "var(--cream-mid)" }}
              >
                <span
                  className="flex-shrink-0 select-none"
                  style={{ padding: "10px 12px", fontSize: "14px", color: "var(--muted)", borderRight: "1px solid var(--border)" }}
                >
                  /to/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  required
                  maxLength={40}
                  placeholder="your-name"
                  style={{ flex: 1, padding: "10px 12px", fontSize: "15px", background: "transparent", color: "var(--text)", outline: "none" }}
                />
                {slugChecking && (
                  <span style={{ paddingRight: "12px", fontSize: "12px", color: "var(--muted)" }}>checking…</span>
                )}
              </div>
              <p className="mt-1" style={{ fontSize: "12px", color: slugError ? "#c0392b" : "var(--muted)" }}>
                {slugError ?? "Changing this breaks existing links."}
              </p>
            </div>

            {/* Title + Submit label */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Form title</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required maxLength={100} placeholder="Get in touch with Marco" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Submit button label</label>
                <input type="text" value={submitLabel} onChange={(e) => setSubmitLabel(e.target.value)} required maxLength={50} placeholder="Send message" style={inputStyle} />
              </div>
            </div>

            {/* Intro + Thankyou */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Intro message <span style={{ color: "var(--muted)", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <input type="text" value={introMessage} onChange={(e) => setIntroMessage(e.target.value)} maxLength={200} placeholder="Short welcome line…" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Thank-you message</label>
                <input type="text" value={thankyouMessage} onChange={(e) => setThankyouMessage(e.target.value)} required maxLength={200} placeholder="Thanks! I'll get back to you soon." style={inputStyle} />
              </div>
            </div>

            {/* Destination email + Privacy URL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Destination email</label>
                <input type="email" value={destinationEmail} onChange={(e) => setDestinationEmail(e.target.value)} required placeholder="where@submissions.go" style={inputStyle} />
                <p className="mt-1" style={{ fontSize: "12px", color: "var(--muted)" }}>Can differ from your login email.</p>
              </div>
              <div>
                <label style={labelStyle}>Privacy policy URL <span style={{ color: "var(--muted)", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <input type="url" value={privacyUrl} onChange={(e) => setPrivacyUrl(e.target.value)} placeholder="https://yoursite.com/privacy" style={inputStyle} />
                {!privacyUrl ? (
                  <p className="mt-1" style={{ fontSize: "12px", color: "var(--muted)" }}>
                    Using the{" "}
                    <a href={`/privacy/${profile.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--teal)" }} className="hover:underline">
                      default policy
                    </a>
                    . Replace when you have your own.
                  </p>
                ) : (
                  <p className="mt-1" style={{ fontSize: "12px", color: "var(--muted)" }}>Linked in the visitor consent checkbox.</p>
                )}
              </div>
            </div>

            {/* Form colors */}
            <div>
              <label style={labelStyle}>Form colours</label>
              <div className="flex items-center gap-6">
                {/* Primary color */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      style={{ width: "36px", height: "36px" }}
                    />
                    <div
                      className="rounded-lg border"
                      style={{ width: "36px", height: "36px", background: primaryColor, borderColor: "var(--border)" }}
                    />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--text)" }}>Button &amp; accent</p>
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      maxLength={7}
                      style={{ fontSize: "12px", color: "var(--muted)", background: "transparent", outline: "none", width: "70px" }}
                    />
                  </div>
                </label>

                {/* BG color */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      style={{ width: "36px", height: "36px" }}
                    />
                    <div
                      className="rounded-lg border"
                      style={{ width: "36px", height: "36px", background: bgColor, borderColor: "var(--border)" }}
                    />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--text)" }}>Background</p>
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      maxLength={7}
                      style={{ fontSize: "12px", color: "var(--muted)", background: "transparent", outline: "none", width: "70px" }}
                    />
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <p className="rounded-lg px-3 py-2" style={{ fontSize: "13px", color: "#7c3b2a", background: "#fdf2ec", border: "1px solid #f0c4a8" }}>
                {error}
              </p>
            )}
            {saved && (
              <p className="rounded-lg px-3 py-2" style={{ fontSize: "13px", color: "#2a5c3b", background: "#edf7f0", border: "1px solid #b8d8ba" }}>
                Saved.
              </p>
            )}

            <button
              type="submit"
              disabled={saving || !!slugError || slugChecking}
              className="rounded-full font-medium transition-all hover:opacity-85 disabled:opacity-50"
              style={{ background: "var(--teal)", color: "var(--cream)", padding: "11px 28px", fontSize: "15px" }}
            >
              {saving ? "Saving…" : "Save settings"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
