import Link from "next/link";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--cream)", color: "var(--text)" }}
    >
      {/* Nav */}
      <nav className="flex-shrink-0 max-w-2xl w-full mx-auto px-8 pt-8 pb-4 flex items-center justify-between">
        <span
          className="font-semibold tracking-tight"
          style={{ color: "var(--text)", fontSize: "18px" }}
        >
          ReachOut
        </span>
        <Link
          href="/auth"
          style={{ color: "var(--teal)", fontSize: "15px" }}
          className="hover:underline transition-all"
        >
          Sign in →
        </Link>
      </nav>

      {/* Main content — flex-1 to fill remaining space */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-8 flex flex-col justify-between pb-8">
        {/* Hero */}
        <div className="pt-6 sm:pt-8">
          {/* Eyebrow tag */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span
              className="text-xs uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{
                borderColor: "var(--accent-dark)",
                color: "var(--accent-dark)",
                background: "var(--accent)",
                letterSpacing: "0.08em",
              }}
            >
              Free while in early access
            </span>
          </div>

          <h1
            className="font-medium leading-tight mb-5"
            style={{
              fontSize: "clamp(32px, 4vw, 44px)",
              letterSpacing: "-0.02em",
              color: "var(--text)",
              maxWidth: "560px",
            }}
          >
            A contact form that goes straight to your inbox.
          </h1>

          <p
            className="mb-8"
            style={{
              fontSize: "18px",
              color: "var(--muted)",
              maxWidth: "480px",
              lineHeight: "1.65",
            }}
          >
            No stored data. No cookies. No tracking. Just a form — and your
            message arrives.
          </p>

          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-full font-medium transition-all hover:opacity-80"
            style={{
              background: "var(--teal)",
              color: "var(--cream)",
              padding: "12px 28px",
              fontSize: "15px",
            }}
          >
            Get your form →
          </Link>
        </div>

        {/* Bottom row: two columns */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 mt-8"
          style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}
        >
          <div>
            <p
              className="text-xs uppercase tracking-widest mb-3"
              style={{ color: "var(--muted)", letterSpacing: "0.08em" }}
            >
              Why it exists
            </p>
            <p
              style={{
                fontSize: "15px",
                color: "var(--muted)",
                lineHeight: "1.65",
              }}
            >
              Most form tools track your visitors and store what they write.
              ReachOut delivers and forgets. Your contact page shouldn't cost
              your visitors their privacy.
            </p>
          </div>

          <div>
            <p
              className="text-xs uppercase tracking-widest mb-3"
              style={{ color: "var(--muted)", letterSpacing: "0.08em" }}
            >
              How it works
            </p>
            <ol className="space-y-2">
              {[
                "Create your form",
                "Share the link or embed it",
                "Messages arrive in your inbox",
              ].map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3"
                  style={{ fontSize: "15px", color: "var(--muted)" }}
                >
                  <span
                    className="flex-shrink-0 rounded-full flex items-center justify-center font-medium"
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "var(--accent)",
                      color: "var(--accent-dark)",
                      fontSize: "11px",
                      marginTop: "3px",
                    }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8" style={{ fontSize: "13px", color: "var(--muted)" }}>
          <p>
            Built by{" "}
            <a
              href="https://apachetastudio.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--teal)" }}
              className="hover:underline"
            >
              Apacheta Studio
            </a>{" "}
            · Independent ethical software with purpose
          </p>
        </footer>
      </main>
    </div>
  );
}
