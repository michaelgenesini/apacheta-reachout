/**
 * Spam and abuse prevention utilities.
 * All functions are pure / side-effect free so they can be unit-tested directly.
 */

// ---------------------------------------------------------------------------
// Rate limiter
// ---------------------------------------------------------------------------

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export const RATE_LIMIT_PER_IP   = 5;   // max submissions per IP per hour
export const RATE_LIMIT_PER_FORM = 20;  // max submissions per form per hour (burst protection)
export const RATE_LIMIT_WINDOW   = 60 * 60 * 1000; // 1 hour in ms

/** Returns true if the request is allowed, false if it should be blocked. */
export function checkRateLimit(
  map: Map<string, RateLimitEntry>,
  key: string,
  limit: number,
  now = Date.now(),
): boolean {
  const entry = map.get(key);

  if (!entry || entry.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

export interface SubmissionBody {
  username?: unknown;
  name?: unknown;
  email?: unknown;
  message?: unknown;
  _hp?: unknown;
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Patterns that strongly indicate spam content
const SPAM_PATTERNS = [
  /\bviagra\b/i,
  /\bcasino\b/i,
  /\bcrypto\b.*\binvest/i,
  /https?:\/\/[^\s]{5,}.*https?:\/\//i,  // multiple URLs in one message
  /\[url=/i,                               // BBCode links
  /<a\s+href/i,                            // HTML links
];

export function validateSubmission(body: SubmissionBody): ValidationResult {
  // Honeypot — bots fill hidden fields
  if (body._hp) return { ok: false, reason: "honeypot" };

  const { username, name, email, message } = body;

  if (!username || !name || !email || !message) {
    return { ok: false, reason: "missing_fields" };
  }

  if (typeof name !== "string" || typeof email !== "string" ||
      typeof message !== "string" || typeof username !== "string") {
    return { ok: false, reason: "invalid_types" };
  }

  if (name.trim().length === 0) return { ok: false, reason: "empty_name" };
  if (message.trim().length === 0) return { ok: false, reason: "empty_message" };

  if (name.length > 100)     return { ok: false, reason: "name_too_long" };
  if (email.length >= 200)   return { ok: false, reason: "email_too_long" };
  if (message.length > 2000) return { ok: false, reason: "message_too_long" };

  if (!EMAIL_RE.test(email)) return { ok: false, reason: "invalid_email" };

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(message) || pattern.test(name)) {
      return { ok: false, reason: "spam_content" };
    }
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// IP extraction
// ---------------------------------------------------------------------------

/**
 * Extract a stable IP key from request headers.
 * Falls back to a random key per-invocation (unknown IPs are NOT pooled together,
 * which was the original bug — pooling all unknowns let any headerless request
 * consume the shared "unknown" bucket and block legitimate users).
 */
export function extractIp(
  headers: { get: (name: string) => string | null },
  fallback = crypto.randomUUID(),
): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return `unknown-${fallback}`;
}
