import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendSubmissionEmail,
  sendLimitWarningEmail,
  sendLimitHitNotification,
  notifyMikeeOnLimitHit,
} from "@/lib/email";
import { MONTHLY_LIMIT, type Profile } from "@/lib/types";
import {
  checkRateLimit,
  validateSubmission,
  extractIp,
  RATE_LIMIT_PER_IP,
  RATE_LIMIT_PER_FORM,
  type RateLimitEntry,
} from "@/lib/spam";

// In-memory rate limit maps (reset on server restart — acceptable for MVP)
const ipLimitMap   = new Map<string, RateLimitEntry>();
const formLimitMap = new Map<string, RateLimitEntry>();

export async function POST(request: NextRequest) {
  const ip = extractIp(request.headers);

  if (!checkRateLimit(ipLimitMap, ip, RATE_LIMIT_PER_IP)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validation = validateSubmission(body);
  if (!validation.ok) {
    // Honeypot: return fake 200 to confuse bots
    if (validation.reason === "honeypot") {
      return NextResponse.json({ ok: true });
    }
    // Spam content: silent 200 (no feedback to spammer)
    if (validation.reason === "spam_content") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const { username, name, email, message } = body as {
    username: string; name: string; email: string; message: string;
  };

  // Per-form rate limit (burst protection)
  if (!checkRateLimit(formLimitMap, username as string, RATE_LIMIT_PER_FORM)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", username)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  const p = profile as Profile;

  if (!p.is_live || !p.privacy_url) {
    return NextResponse.json({ error: "This form is not available." }, { status: 403 });
  }

  if (p.monthly_submission_count >= MONTHLY_LIMIT) {
    return NextResponse.json(
      { error: "This form has reached its monthly limit." },
      { status: 429 }
    );
  }

  const { error: emailError } = await sendSubmissionEmail({
    destinationEmail: p.destination_email,
    senderName: name,
    senderEmail: email,
    message,
    formTitle: p.form_title,
    username: p.username,
  });

  if (emailError) {
    console.error("Failed to send submission email:", emailError);
    return NextResponse.json(
      { error: "Failed to deliver your message. Please try again." },
      { status: 500 }
    );
  }

  await supabase.rpc("increment_submission_count", { profile_id: p.id });

  const { data: updated } = await supabase
    .from("profiles")
    .select("monthly_submission_count, email")
    .eq("id", p.id)
    .single();

  if (updated) {
    const newCount = updated.monthly_submission_count;

    if (
      newCount === Math.floor(MONTHLY_LIMIT * 0.8) ||
      (newCount > Math.floor(MONTHLY_LIMIT * 0.8) &&
        newCount === Math.floor(MONTHLY_LIMIT * 0.8) + 1)
    ) {
      sendLimitWarningEmail({
        userEmail: p.email,
        username: p.username,
        count: newCount,
        limit: MONTHLY_LIMIT,
      }).catch(console.error);
    }

    if (newCount >= MONTHLY_LIMIT) {
      sendLimitHitNotification({ userEmail: p.email, username: p.username }).catch(console.error);
      notifyMikeeOnLimitHit({ userEmail: p.email, username: p.username }).catch(console.error);
    }
  }

  return NextResponse.json({ ok: true });
}
