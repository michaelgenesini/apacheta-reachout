import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  validateSubmission,
  extractIp,
  RATE_LIMIT_PER_IP,
  type RateLimitEntry,
} from "../spam";

// ---------------------------------------------------------------------------
// checkRateLimit
// ---------------------------------------------------------------------------
describe("checkRateLimit", () => {
  let map: Map<string, RateLimitEntry>;
  const now = Date.now();

  beforeEach(() => {
    map = new Map();
  });

  it("allows first request", () => {
    expect(checkRateLimit(map, "1.2.3.4", RATE_LIMIT_PER_IP, now)).toBe(true);
  });

  it("allows requests up to the limit", () => {
    for (let i = 0; i < RATE_LIMIT_PER_IP; i++) {
      expect(checkRateLimit(map, "1.2.3.4", RATE_LIMIT_PER_IP, now)).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit", () => {
    for (let i = 0; i < RATE_LIMIT_PER_IP; i++) {
      checkRateLimit(map, "1.2.3.4", RATE_LIMIT_PER_IP, now);
    }
    expect(checkRateLimit(map, "1.2.3.4", RATE_LIMIT_PER_IP, now)).toBe(false);
  });

  it("does not affect a different key", () => {
    for (let i = 0; i <= RATE_LIMIT_PER_IP; i++) {
      checkRateLimit(map, "1.2.3.4", RATE_LIMIT_PER_IP, now);
    }
    expect(checkRateLimit(map, "5.6.7.8", RATE_LIMIT_PER_IP, now)).toBe(true);
  });

  it("resets after the window expires", () => {
    for (let i = 0; i <= RATE_LIMIT_PER_IP; i++) {
      checkRateLimit(map, "1.2.3.4", RATE_LIMIT_PER_IP, now);
    }
    const afterWindow = now + 61 * 60 * 1000;
    expect(checkRateLimit(map, "1.2.3.4", RATE_LIMIT_PER_IP, afterWindow)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateSubmission
// ---------------------------------------------------------------------------
describe("validateSubmission", () => {
  const valid = {
    username: "testuser",
    name: "Alice",
    email: "alice@example.com",
    message: "Hello there",
  };

  it("accepts a valid submission", () => {
    expect(validateSubmission(valid)).toEqual({ ok: true });
  });

  // --- Honeypot ---
  it("rejects when honeypot field is filled", () => {
    const result = validateSubmission({ ...valid, _hp: "bot-value" });
    expect(result).toEqual({ ok: false, reason: "honeypot" });
  });

  it("accepts when honeypot field is empty string", () => {
    expect(validateSubmission({ ...valid, _hp: "" })).toEqual({ ok: true });
  });

  // --- Missing fields ---
  it.each(["username", "name", "email", "message"] as const)(
    "rejects when %s is missing",
    (field) => {
      const body = { ...valid, [field]: undefined };
      const result = validateSubmission(body);
      expect(result.ok).toBe(false);
    }
  );

  it("rejects empty name (whitespace only)", () => {
    expect(validateSubmission({ ...valid, name: "   " }).ok).toBe(false);
  });

  it("rejects empty message (whitespace only)", () => {
    expect(validateSubmission({ ...valid, message: "   " }).ok).toBe(false);
  });

  // --- Length limits ---
  it("rejects name longer than 100 chars", () => {
    const result = validateSubmission({ ...valid, name: "a".repeat(101) });
    expect(result).toEqual({ ok: false, reason: "name_too_long" });
  });

  it("rejects email longer than 200 chars", () => {
    const result = validateSubmission({ ...valid, email: "a".repeat(195) + "@x.io" });
    expect(result).toEqual({ ok: false, reason: "email_too_long" });
  });

  it("rejects message longer than 2000 chars", () => {
    const result = validateSubmission({ ...valid, message: "a".repeat(2001) });
    expect(result).toEqual({ ok: false, reason: "message_too_long" });
  });

  it("accepts message exactly 2000 chars", () => {
    expect(validateSubmission({ ...valid, message: "a".repeat(2000) })).toEqual({ ok: true });
  });

  // --- Email format ---
  it.each(["notanemail", "missing@", "@nodomain", "two@@at.com", "space in@email.com"])(
    "rejects invalid email: %s",
    (email) => {
      expect(validateSubmission({ ...valid, email }).ok).toBe(false);
    }
  );

  it("accepts a valid email with subdomain", () => {
    expect(validateSubmission({ ...valid, email: "user@mail.example.co.uk" })).toEqual({ ok: true });
  });

  // --- Spam content ---
  it("rejects message containing 'viagra'", () => {
    const result = validateSubmission({ ...valid, message: "Buy cheap Viagra online" });
    expect(result).toEqual({ ok: false, reason: "spam_content" });
  });

  it("rejects message with multiple URLs", () => {
    const result = validateSubmission({
      ...valid,
      message: "Check http://spam.com and also https://spam2.com for deals",
    });
    expect(result).toEqual({ ok: false, reason: "spam_content" });
  });

  it("rejects message with HTML link", () => {
    const result = validateSubmission({
      ...valid,
      message: 'Click <a href="http://spam.com">here</a>',
    });
    expect(result).toEqual({ ok: false, reason: "spam_content" });
  });

  it("rejects name containing 'casino'", () => {
    const result = validateSubmission({ ...valid, name: "Best Casino Online" });
    expect(result).toEqual({ ok: false, reason: "spam_content" });
  });

  it("accepts a single legitimate URL in message", () => {
    expect(
      validateSubmission({ ...valid, message: "Here is my portfolio https://alice.dev" })
    ).toEqual({ ok: true });
  });

  // --- Type safety ---
  it("rejects non-string name", () => {
    expect(validateSubmission({ ...valid, name: 123 }).ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// extractIp
// ---------------------------------------------------------------------------
describe("extractIp", () => {
  function makeHeaders(map: Record<string, string>) {
    return { get: (name: string) => map[name] ?? null };
  }

  it("prefers x-forwarded-for", () => {
    const h = makeHeaders({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(extractIp(h, "fallback")).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const h = makeHeaders({ "x-real-ip": "9.10.11.12" });
    expect(extractIp(h, "fallback")).toBe("9.10.11.12");
  });

  it("uses unknown-<fallback> when no IP header present", () => {
    const h = makeHeaders({});
    expect(extractIp(h, "my-uuid")).toBe("unknown-my-uuid");
  });

  it("two unknown-IP requests get different keys (no shared bucket)", () => {
    const h = makeHeaders({});
    const key1 = extractIp(h, "uuid-1");
    const key2 = extractIp(h, "uuid-2");
    expect(key1).not.toBe(key2);
  });
});
