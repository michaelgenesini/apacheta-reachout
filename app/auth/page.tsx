"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Step = "email" | "sent";

function AuthForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(urlError);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });

    if (error) {
      setError(error.message);
    } else {
      setStep("sent");
    }
    setLoading(false);
  }

  if (step === "sent") {
    return (
      <div className="w-full max-w-sm text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "var(--accent)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-dark)" }}>
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>
        <h1 className="font-medium mb-2" style={{ fontSize: "22px", color: "var(--text)" }}>Check your inbox</h1>
        <p className="mb-6" style={{ fontSize: "15px", color: "var(--muted)", lineHeight: "1.65" }}>
          We sent a sign-in link to{" "}
          <span className="font-medium" style={{ color: "var(--text)" }}>{email}</span>.
          Click it to continue.
        </p>
        <button
          onClick={() => { setStep("email"); setError(null); }}
          style={{ fontSize: "14px", color: "var(--muted)" }}
          className="hover:underline transition-all"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <Link href="/" style={{ fontSize: "14px", color: "var(--muted)" }} className="hover:underline transition-all">
          ← ReachOut
        </Link>
      </div>

      <h1 className="font-medium mb-2" style={{ fontSize: "26px", letterSpacing: "-0.01em", color: "var(--text)" }}>
        Get started
      </h1>
      <p className="mb-8" style={{ fontSize: "15px", color: "var(--muted)", lineHeight: "1.65" }}>
        Enter your email — we'll send a link. New? Your account is created automatically.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1.5" style={{ fontSize: "13px", color: "var(--muted)", letterSpacing: "0.03em" }}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            placeholder="you@example.com"
            className="w-full rounded-lg outline-none transition-all"
            style={{
              padding: "11px 14px",
              fontSize: "15px",
              background: "var(--cream-mid)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--teal)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border)"}
          />
        </div>

        {error && (
          <p
            className="rounded-lg px-3 py-2"
            style={{ fontSize: "13px", color: "#7c3b2a", background: "#fdf2ec", border: "1px solid #f0c4a8" }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full font-medium transition-all hover:opacity-85 disabled:opacity-50"
          style={{ background: "var(--teal)", color: "var(--cream)", padding: "12px 20px", fontSize: "15px" }}
        >
          {loading ? "Sending…" : "Continue with email"}
        </button>
      </form>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: "var(--cream)" }}>
      <Suspense>
        <AuthForm />
      </Suspense>
    </div>
  );
}
