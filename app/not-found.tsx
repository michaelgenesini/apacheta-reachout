import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center px-6" style={{ background: "var(--cream)" }}>
      <div className="text-center">
        <p className="mb-2" style={{ fontSize: "12px", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>404</p>
        <h1 className="font-medium mb-3" style={{ fontSize: "22px", color: "var(--text)" }}>Page not found</h1>
        <Link href="/" style={{ fontSize: "14px", color: "var(--teal)" }} className="hover:underline">
          Go home
        </Link>
      </div>
    </div>
  );
}
